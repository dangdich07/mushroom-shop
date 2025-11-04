import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ProductDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  priceRange?: { min: number; max: number };
  seo?: { title?: string; description?: string; keywords?: string[] };
  active: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true }, // unique + index
    description: { type: String },
    shortDescription: { type: String },
    category: { type: String, index: true },
    tags: { type: [String], default: [], index: true },
    images: { type: [String], default: [] },
    priceRange: {
      min: { type: Number },
      max: { type: Number },
    },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: [String], default: [] },
    },
    active: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

/* ------------ 🔎 Indexes gợi ý (thực dụng) ------------ */

// 1) Tìm theo slug (đã unique ở trên). Khai báo rõ ràng tên index.
ProductSchema.index({ slug: 1 }, { unique: true, name: 'uniq_slug' });

// 2) Danh sách theo danh mục cho client (lọc active, sắp xếp mới nhất)
ProductSchema.index(
  { active: 1, category: 1, createdAt: -1 },
  { name: 'active_category_createdAt' }
);

// 3) Lấy sản phẩm nổi bật (featured) cho trang chủ
ProductSchema.index(
  { active: 1, featured: 1, createdAt: -1 },
  { name: 'active_featured_createdAt' }
);

// 4) Lọc theo khoảng giá (min/max) thường kết hợp với active
ProductSchema.index(
  { active: 1, 'priceRange.min': 1 },
  { name: 'active_price_min' }
);
ProductSchema.index(
  { active: 1, 'priceRange.max': 1 },
  { name: 'active_price_max' }
);

// 5) Text index phục vụ search tự do (ưu tiên name > tags > shortDescription > description)
ProductSchema.index(
  {
    name: 'text',
    tags: 'text',
    shortDescription: 'text',
    description: 'text',
  },
  {
    weights: { name: 10, tags: 5, shortDescription: 3, description: 1 },
    name: 'product_text',
    default_language: 'none', // tránh stemming tiếng Anh; bạn có thể đổi
  }
);

export const ProductModel: Model<ProductDocument> =
  mongoose.models.Product ||
  mongoose.model<ProductDocument>('Product', ProductSchema);
