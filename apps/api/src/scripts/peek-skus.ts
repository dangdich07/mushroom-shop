// src/scripts/peek-skus.ts (tạo file tạm nếu muốn)
import mongoose from 'mongoose';
import { SkuModel } from '../models/sku.model';

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const rows = await SkuModel.find({}, { sku: 1, price: 1, weight: 1, active: 1 }).limit(50).lean();
  console.log(rows);
  process.exit(0);
})();
