import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ProductService } from '../services/product.service';

type SkuItem = {
  sku: string;
  price: number | string;
  weight?: number | string;
  stock?: number | string;
  active?: boolean;
};

type AddSkusBody = { items: SkuItem[] };
type ToggleBody = { active: boolean };

export async function addSkusForProduct(
  req: Request<{ id: string }, unknown, AddSkusBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID không hợp lệ' } });
    }

    const items: SkuItem[] = Array.isArray(req.body?.items) ? req.body.items : [];
    const pid = new mongoose.Types.ObjectId(id);

    const docs = items
      .map((x: SkuItem) => ({
        productId: pid,
        sku: String(x.sku ?? '').trim(),
        price: Number(x.price),
        weight: x.weight == null ? undefined : Number(x.weight),
        stock: x.stock == null ? 0 : Number(x.stock),
        active: x.active === false ? false : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      .filter((x) => x.sku && Number.isFinite(x.price));

    if (!docs.length) {
      return res.status(400).json({ error: { code: 'EMPTY', message: 'Không có SKU hợp lệ' } });
    }

    const result = await mongoose.connection.collection('skus').insertMany(docs, { ordered: false });

    // cập nhật lại priceRange
    await ProductService.updatePriceRange(id);

    return res.status(201).json({
      insertedCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds),
    });
  } catch (err: any) {
    // map lỗi duplicate key
    if (err?.code === 11000) {
      return res.status(409).json({ error: { code: 'SKU_DUPLICATE', message: 'SKU trùng' } });
    }
    next(err);
  }
}

export async function toggleSkuActive(
  req: Request<{ id: string; skuId: string }, unknown, ToggleBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, skuId } = req.params;
    const { active } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(skuId)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID không hợp lệ' } });
    }

    const r = await mongoose.connection.collection('skus').updateOne(
      { _id: new mongoose.Types.ObjectId(skuId), productId: new mongoose.Types.ObjectId(id) },
      { $set: { active: !!active, updatedAt: new Date() } }
    );
    if (!r.matchedCount) return res.status(404).json({ error: { code: 'NOT_FOUND' } });

    await ProductService.updatePriceRange(id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function deleteSku(
  req: Request<{ id: string; skuId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, skuId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(skuId)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID không hợp lệ' } });
    }

    const r = await mongoose.connection.collection('skus').deleteOne({
      _id: new mongoose.Types.ObjectId(skuId),
      productId: new mongoose.Types.ObjectId(id),
    });
    if (!r.deletedCount) return res.status(404).json({ error: { code: 'NOT_FOUND' } });

    await ProductService.updatePriceRange(id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
