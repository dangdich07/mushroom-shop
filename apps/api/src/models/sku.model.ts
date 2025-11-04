import mongoose, { Schema, Model, Document } from 'mongoose';
import { ProductModel } from './product.model';

interface SkuDoc extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  price: number;
  weight?: number;
  stock?: number;
  active: boolean;
}
const SkuSchema = new Schema<SkuDoc>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', index: true, required: true },
  sku: { type: String, unique: true, index: true, required: true },
  price: { type: Number, required: true, min: 0 },
  weight: Number,
  stock: { type: Number, default: 0 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

// helper
async function recomputePriceRange(productId: mongoose.Types.ObjectId) {
  const skus = await mongoose.connection
    .collection('skus')
    .find({ productId, active: true })
    .project({ price: 1 })
    .toArray();

  if (!skus.length) {
    await ProductModel.updateOne({ _id: productId }, { $unset: { priceRange: '' } });
    return;
  }
  const prices = skus.map(s => s.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  await ProductModel.updateOne({ _id: productId }, { $set: { priceRange: { min, max } } });
}

// post hooks
SkuSchema.post('save', async function () {
  await recomputePriceRange(this.productId);
});
SkuSchema.post('findOneAndUpdate', async function (doc: any) {
  if (doc?.productId) await recomputePriceRange(doc.productId);
});
SkuSchema.post('deleteOne', { document: true, query: false }, async function () {
  if (this.productId) await recomputePriceRange(this.productId as any);
});

export const SkuModel: Model<SkuDoc> = mongoose.models.Sku || mongoose.model<SkuDoc>('Sku', SkuSchema);
