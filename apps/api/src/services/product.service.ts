import mongoose from 'mongoose';
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

export class ProductService {
  static async createProduct(data: CreateProductData): Promise<ProductDocument> {
    if (data.category) {
      const category = await CategoryModel.findOne({ slug: data.category, active: true });
      if (!category) throw new Error('Category not found');
    }
    const product = new ProductModel(data);
    await product.save();
    return product;
  }

  static async getProductById(id: string): Promise<ProductDocument | null> {
    return ProductModel.findById(id);
  }

  static async getProductBySlug(slug: string): Promise<ProductDocument | null> {
    return ProductModel.findOne({ slug, active: true });
  }

  static async updateProduct(id: string, data: UpdateProductData): Promise<ProductDocument | null> {
    if (data.category) {
      const category = await CategoryModel.findOne({ slug: data.category, active: true });
      if (!category) throw new Error('Category not found');
    }
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

    const query: Record<string, any> = {};

    // Mặc định chỉ trả active=true nếu không truyền active
    if (typeof filters.active === 'boolean') query.active = filters.active;
    else query.active = true;

    if (filters.category) query.category = filters.category;

    if (filters.tags?.length) query.tags = { $in: filters.tags };

    if (typeof filters.featured === 'boolean') query.featured = filters.featured;

    if (filters.search) {
      // escape regex an toàn
      const safe = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safe, $options: 'i' } },
        { slug: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
        { shortDescription: { $regex: safe, $options: 'i' } },
        { tags: { $in: [new RegExp(safe, 'i')] } },
      ];
    }

    // Lọc theo giá: min >= priceMin, max <= priceMax
    if (typeof filters.priceMin === 'number') {
      query['priceRange.min'] = {
        ...(query['priceRange.min'] || {}),
        $gte: filters.priceMin,
      };
    }
    if (typeof filters.priceMax === 'number') {
      query['priceRange.max'] = {
        ...(query['priceRange.max'] || {}),
        $lte: filters.priceMax,
      };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sort]: sortOrder };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ProductModel.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(query),
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

  static async updatePriceRange(productId: string) {
    const skus = await mongoose.connection
      .collection('skus')
      .find({ productId: new mongoose.Types.ObjectId(productId), active: true })
      .project({ price: 1 })
      .toArray();

    if (!skus.length) return null;

    const prices = skus.map((s) => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return ProductModel.findByIdAndUpdate(
      productId,
      { priceRange: { min: minPrice, max: maxPrice } },
      { new: true },
    );
  }
}
