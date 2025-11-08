import { Schema, model, Types } from 'mongoose';

const SkuSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    weight: Number,
    stock: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SkuSchema.index({ productId: 1, sku: 1 }, { unique: true, name: 'uniq_product_sku' });

export const SkuModel = model('Sku', SkuSchema, 'skus');
