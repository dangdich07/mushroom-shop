import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ProductModel } from '../models/product.model';
import { ProductService } from '../services/product.service';

/** 📦 Danh sách sản phẩm (admin / internal) */
export async function listProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await ProductModel.find().sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (e) {
    console.error('❌ Lỗi khi lấy danh sách sản phẩm:', e);
    next(e);
  }
}

/** 📄 Lấy chi tiết theo slug (client) */
export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params as { slug: string };
    const product = await ProductModel.findOne({ slug, active: true }).lean();
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const skus = await mongoose.connection
      .collection('skus')
      .find({ productId: product._id, active: true })
      .project({ sku: 1, price: 1, weight: 1, _id: 0 })
      .toArray();

    (product as any).skus = skus;
    res.json(product);
  } catch (e) {
    next(e);
  }
}

/** 📘 Lấy theo ID (admin / internal) – kèm full SKUs */
export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID sản phẩm không hợp lệ' } });
    }

    const doc = await ProductModel.findById(id).lean();
    if (!doc) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm' } });
    }

    const skus = await ProductService.listSkus(id);
    (doc as any).skus = skus;

    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/** 🆕 Tạo mới (admin) – hỗ trợ kèm SKUs */
export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { skus, initialSkus, ...rest } = req.body || {};

    if (Array.isArray(skus) && skus.length) {
      const created = await ProductService.createProductWithSkus(rest as any, skus);
      return res.status(201).json(created.product); // trả thẳng product cho FE dễ dùng
    }
    if (Array.isArray(initialSkus) && initialSkus.length) {
      const created = await ProductService.createProductWithSkus(rest as any, initialSkus);
      return res.status(201).json(created.product);
    }

    const product = await ProductService.createProduct(rest as any);
    return res.status(201).json(product);
  } catch (error: any) {
    const code = error?.code || error?.message;

    if (code === 'INVALID_CATEGORY') {
      return res.status(400).json({ error: { code: 'INVALID_CATEGORY', message: 'Category not found' } });
    }
    if (code === 'DUPLICATE_SLUG') {
      return res.status(409).json({ error: { code: 'DUPLICATE_SLUG', message: 'Slug đã tồn tại' } });
    }
    if (code === 'SKU_DUPLICATE' || code === 'SKU_DUPLICATE_IN_PAYLOAD') {
      return res.status(409).json({ error: { code: 'SKU_DUPLICATE', message: 'SKU bị trùng' } });
    }
    if (code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' } });
    }

    next(error);
  }
}

/** ✏️ Cập nhật (admin) */
export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const product = await ProductService.updateProduct(id, req.body);
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }
    res.json(product);
  } catch (error: any) {
    const code = error?.code || error?.message;
    if (code === 'INVALID_CATEGORY') {
      return res.status(400).json({ error: { code: 'INVALID_CATEGORY', message: 'Category not found' } });
    }
    if (code === 'DUPLICATE_SLUG') {
      return res.status(409).json({ error: { code: 'DUPLICATE_SLUG', message: 'Slug đã tồn tại' } });
    }
    next(error);
  }
}

/** ❌ Xóa (admin) */
export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await ProductService.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('❌ Lỗi khi xóa sản phẩm:', error);
    next(error);
  }
}

/** 🔍 Tìm kiếm + phân trang (client) */
export async function searchProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      category: req.query.category as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      featured:
        req.query.featured === 'true'
          ? true
          : req.query.featured === 'false'
          ? false
          : undefined,
      active:
        req.query.active === 'true'
          ? true
          : req.query.active === 'false'
          ? false
          : undefined,
      search: req.query.search as string,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
    };

    const token = String(req.query.sort || '').trim();
    let sort: string = 'createdAt';
    let order: 'asc' | 'desc' = 'desc';
    switch (token) {
      case 'price_asc': sort = 'priceRange.min'; order = 'asc'; break;
      case 'price_desc': sort = 'priceRange.min'; order = 'desc'; break;
      case 'featured': sort = 'featured'; order = 'desc'; break;
      case 'newest':
      default: sort = 'createdAt'; order = 'desc'; break;
    }

    const pageRaw = Number(req.query.page ?? 1);
    const limitRaw = Number(req.query.limit ?? 12);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 5000) : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 12;

    const result = await ProductService.listProducts(filters, { page, limit, sort, order });

    // Gắn 1 SKU nhẹ và cờ hasStock
    if (result.items?.length) {
      const ids = result.items.map((p: any) => new mongoose.Types.ObjectId(String(p._id)));
      const skuAgg = await mongoose.connection.collection('skus').aggregate([
        { $match: { productId: { $in: ids }, active: true } },
        { $sort: { stock: -1, price: 1, _id: 1 } },
        {
          $group: {
            _id: '$productId',
            first: { $first: { sku: '$sku', price: '$price', weight: '$weight', stock: '$stock' } },
            anyInStock: { $max: { $gt: ['$stock', 0] } },
          },
        },
      ]).toArray();

      const byId = new Map<string, any>(skuAgg.map(x => [String(x._id), x]));
      result.items = result.items.map((p: any) => {
        const hit = byId.get(String(p._id));
        return {
          ...p,
          skus: hit?.first ? [hit.first] : [],
          hasStock: Boolean(hit?.anyInStock ?? false),
        };
      });
    }

    res.json({ items: result.items, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
}

/** 🌟 Sản phẩm nổi bật (client) */
export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const products = await ProductService.getFeaturedProducts(limit);
    res.json({ items: products });
  } catch (error) {
    next(error);
  }
}

/** 📂 Theo danh mục (client) */
export async function getProductsByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { categorySlug } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const products = await ProductService.getProductsByCategory(categorySlug, limit);
    res.json({ items: products });
  } catch (error) {
    next(error);
  }
}

/* =======================
 *  Nested SKU endpoints
 *  (map trong router: POST/PATCH/DELETE /products/:id/skus[/:skuId])
 * ======================= */

/** POST /products/:id/skus  (bulk) */


