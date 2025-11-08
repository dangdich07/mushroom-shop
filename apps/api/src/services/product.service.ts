import mongoose from 'mongoose';
import type { ClientSession } from 'mongoose';
import { ProductModel, ProductDocument } from '../models/product.model';
import { CategoryModel } from '../models/category.model';

export interface CreateProductData {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  featured?: boolean;
  active?: boolean;
  // optional khi admin nhập tay
  priceRange?: { min?: number; max?: number };
}

export interface UpdateProductData extends Partial<CreateProductData> {
  active?: boolean;
}

export interface ProductFilters {
  category?: string;
  tags?: string[];
  featured?: boolean;
  active?: boolean;
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface ProductListOptions {
  page?: number;
  limit?: number;
  sort?: string;          // ví dụ: 'createdAt' | 'priceRange.min' | 'featured'
  order?: 'asc' | 'desc';
}

/** Input SKU khi tạo/cập nhật qua admin */
export interface SkuInput {
  sku: string;
  price: number;
  stock?: number;
  weight?: number;
  active?: boolean;
}

export class ProductService {
  /** Validate danh mục nếu có */
  private static async assertCategory(slug?: string) {
    if (!slug) return;
    const category = await CategoryModel.findOne({ slug, active: true });
    if (!category) {
      const err = new Error('Category not found');
      (err as any).code = 'INVALID_CATEGORY';
      throw err;
    }
  }

  /** Tạo product (không kèm SKU) – giữ để tương thích */
  static async createProduct(data: CreateProductData): Promise<ProductDocument> {
    await this.assertCategory(data.category);
    const product = new ProductModel(data);
    await product.save();
    return product;
  }

  /** Tạo product + nhiều SKU trong 1 transaction */
  static async createProductWithSkus(
    data: CreateProductData,
    skus?: SkuInput[]
  ): Promise<{ product: any; skus: any[] }> {
    await this.assertCategory(data.category);

    const toInsert = this.prepareSkuPayload(skus);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [created] = await ProductModel.create([data], { session });
      const productId = created._id;

      let insertedSkus: any[] = [];
      if (toInsert.length) {
        const payload = toInsert.map((x) => ({ ...x, productId }));
        const res = await mongoose.connection
          .collection('skus')
          .insertMany(payload, { session });
        insertedSkus = Object.values(res.insertedIds).map((_, i) => payload[i]);
        await this.updatePriceRange(String(productId), session);
      }

      await session.commitTransaction();

      const productLean = await ProductModel.findById(productId).lean();
      return { product: productLean, skus: insertedSkus };
    } catch (err: any) {
      await session.abortTransaction();

      if (err?.code === 11000) {
        if (err?.keyPattern?.slug) {
          const e = new Error('Duplicate slug');
          (e as any).code = 'DUPLICATE_SLUG';
          throw e;
        }
        if (err?.keyPattern?.sku) {
          const e = new Error('SKU duplicate');
          (e as any).code = 'SKU_DUPLICATE';
          throw e;
        }
      }
      throw err;
    } finally {
      session.endSession();
    }
  }

  /** Chèn nhiều SKU cho 1 product (dùng khi edit/new) */
  static async insertSkus(productId: string, items: SkuInput[], session?: ClientSession) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const e = new Error('Invalid productId');
      (e as any).code = 'INVALID_ID';
      throw e;
    }
    const prepared = this.prepareSkuPayload(items);
    if (!prepared.length) return { inserted: 0 };

    const pid = new mongoose.Types.ObjectId(productId);
    const payload = prepared.map((x) => ({ ...x, productId: pid }));
    await mongoose.connection.collection('skus').insertMany(payload, { session });
    await this.updatePriceRange(productId, session);
    return { inserted: payload.length };
  }

  /** Danh sách SKU (admin) */
  static async listSkus(productId: string) {
    if (!mongoose.Types.ObjectId.isValid(productId)) return [];
    const pid = new mongoose.Types.ObjectId(productId);
    return mongoose.connection
      .collection('skus')
      .find({ productId: pid })
      .project({ _id: 1, sku: 1, price: 1, weight: 1, stock: 1, active: 1, createdAt: 1 })
      .sort({ createdAt: -1, _id: -1 })
      .toArray();
  }

  /** Toggle active 1 SKU */
  static async toggleSkuActive(productId: string, skuId: string, active: boolean) {
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(skuId)) {
      const e = new Error('Invalid id');
      (e as any).code = 'INVALID_ID';
      throw e;
    }
    const pid = new mongoose.Types.ObjectId(productId);
    const sid = new mongoose.Types.ObjectId(skuId);
    const r = await mongoose.connection
      .collection('skus')
      .updateOne({ _id: sid, productId: pid }, { $set: { active } });
    await this.updatePriceRange(productId);
    return r.modifiedCount > 0;
  }

  /** Xoá 1 SKU */
  static async deleteSku(productId: string, skuId: string) {
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(skuId)) {
      const e = new Error('Invalid id');
      (e as any).code = 'INVALID_ID';
      throw e;
    }
    const pid = new mongoose.Types.ObjectId(productId);
    const sid = new mongoose.Types.ObjectId(skuId);
    const r = await mongoose.connection
      .collection('skus')
      .deleteOne({ _id: sid, productId: pid });
    await this.updatePriceRange(productId);
    return r.deletedCount > 0;
  }

  static async getProductById(id: string): Promise<ProductDocument | null> {
    return ProductModel.findById(id);
  }

  static async getProductBySlug(slug: string): Promise<ProductDocument | null> {
    return ProductModel.findOne({ slug, active: true });
  }

  static async updateProduct(id: string, data: UpdateProductData): Promise<ProductDocument | null> {
    await this.assertCategory(data.category);
    return ProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  static async listProducts(filters: ProductFilters = {}, options: ProductListOptions = {}) {
    const {
      page = 1,
      limit = 12,
      sort = 'createdAt',
      order = 'desc',
    } = options;

    const match: Record<string, any> = {};
    if (typeof filters.active === 'boolean') match.active = filters.active;
    else match.active = true;

    if (filters.category) match.category = filters.category;
    if (filters.tags?.length) match.tags = { $in: filters.tags };
    if (typeof filters.featured === 'boolean') match.featured = filters.featured;

    if (filters.search) {
      const safe = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      match.$or = [
        { name: { $regex: safe, $options: 'i' } },
        { slug: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
        { shortDescription: { $regex: safe, $options: 'i' } },
        { tags: { $in: [new RegExp(safe, 'i')] } },
      ];
    }

    if (typeof filters.priceMin === 'number') {
      match['priceRange.min'] = { ...(match['priceRange.min'] || {}), $gte: filters.priceMin };
    }
    if (typeof filters.priceMax === 'number') {
      match['priceRange.max'] = { ...(match['priceRange.max'] || {}), $lte: filters.priceMax };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortStage: Record<string, 1 | -1> = { [sort]: sortOrder };

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'skus',
          let: { pid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$productId', '$$pid'] },
                    { $eq: ['$active', true] },
                    { $gt: ['$stock', 0] },
                  ],
                },
              },
            },
            { $sort: { price: 1 } },
            { $project: { _id: 0, sku: 1, price: 1, weight: 1, stock: 1 } },
          ],
          as: 'skusAvail',
        },
      },
      {
        $addFields: {
          hasStock: { $gt: [{ $size: '$skusAvail' }, 0] },
          firstSku: { $first: '$skusAvail' },
        },
      },
      {
        $project: {
          name: 1, slug: 1, shortDescription: 1, description: 1,
          category: 1, tags: 1, images: 1, priceRange: 1,
          featured: 1, active: 1, createdAt: 1, updatedAt: 1,
          hasStock: 1, firstSku: 1,
        },
      },
      { $sort: sortStage },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ] as any[];

    const [items, total] = await Promise.all([
      ProductModel.aggregate(pipeline).exec(),
      ProductModel.countDocuments(match).exec(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getFeaturedProducts(limit = 8) {
    return ProductModel.find({ featured: true, active: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getProductsByCategory(categorySlug: string, limit = 20) {
    return ProductModel.find({ category: categorySlug, active: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async updatePriceRange(productId: string, session?: ClientSession) {
    const skus = await mongoose.connection
      .collection('skus')
      .find({ productId: new mongoose.Types.ObjectId(productId), active: true })
      .project({ price: 1 })
      .toArray();

    if (!skus.length) {
      // không có SKU active → bỏ priceRange
      await ProductModel.findByIdAndUpdate(
        productId,
        { $unset: { priceRange: 1 } },
        { new: true, session }
      );
      return null;
    }

    const prices = skus.map((s) => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return ProductModel.findByIdAndUpdate(
      productId,
      { priceRange: { min: minPrice, max: maxPrice } },
      { new: true, session },
    );
  }

  /** Chuẩn hoá + validate mảng SKU */
  private static prepareSkuPayload(skus?: SkuInput[]) {
    const out: any[] = [];
    if (!Array.isArray(skus) || !skus.length) return out;

    const seen = new Set<string>();
    for (const s of skus) {
      if (!s || !s.sku?.trim()) {
        const e = new Error('SKU missing');
        (e as any).code = 'VALIDATION_ERROR';
        throw e;
      }
      if (seen.has(s.sku)) {
        const e = new Error('Duplicate SKU in payload');
        (e as any).code = 'SKU_DUPLICATE_IN_PAYLOAD';
        throw e;
      }
      seen.add(s.sku);

      const price = Number(s.price);
      const stock = s.stock == null ? 0 : Number(s.stock);
      const weight = s.weight == null ? undefined : Number(s.weight);

      if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
        const e = new Error('Invalid price/stock');
        (e as any).code = 'VALIDATION_ERROR';
        throw e;
      }
      out.push({
        sku: s.sku.trim(),
        price,
        stock,
        weight,
        active: s.active === false ? false : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return out;
  }
}
