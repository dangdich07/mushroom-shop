import mongoose from 'mongoose';
import { SkuModel } from '../models/sku.model';
import { OrderModel, OrderDocument } from '../models/order.model';

interface IncomingItem { sku: string; qty: number; }

async function enrichWithCurrentPrice(items: IncomingItem[]) {
  const bySku = new Map(items.map(i => [i.sku, i.qty]));
  const skus = await SkuModel.find({ sku: { $in: items.map(i => i.sku) }, active: true }).lean();
  if (skus.length !== bySku.size) throw new Error('SKU_NOT_FOUND');
  return skus.map(s => ({ sku: s.sku, qty: bySku.get(s.sku)!, price: s.price }));
}

function computeTotals(items: { price: number; qty: number }[]) {
  const sub = items.reduce((a, b) => a + b.price * b.qty, 0);
  const discount = 0; const ship = 0; const tax = 0; // placeholder
  const grand = sub - discount + ship + tax;
  return { sub, discount, ship, tax, grand };
}

export async function reserveStockAndCreateOrder(userId: string | undefined, incomingItems: IncomingItem[], idempotencyKey?: string): Promise<OrderDocument> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const items = await enrichWithCurrentPrice(incomingItems);
    for (const { sku, qty } of items) {
      const res = await SkuModel.updateOne({ sku, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { session });
      if (res.modifiedCount === 0) throw new Error('OUT_OF_STOCK');
    }
    const totals = computeTotals(items);
    const orderDocs = await OrderModel.create([{
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      items,
      totals,
      status: 'pending_payment',
      payment: { provider: 'stripe', id: null, status: 'requires_payment' },
      idempotencyKey
    }], { session });
    await session.commitTransaction();
    return orderDocs[0];
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

export async function markOrderPaidByPaymentIntent(paymentIntentId: string, idemKey?: string) {
  const order = await OrderModel.findOne({ $or: [ { 'payment.id': paymentIntentId }, idemKey ? { idempotencyKey: idemKey } : { _id: null } ] });
  if (!order) return null;
  if (order.status === 'paid') return order;
  order.status = 'paid';
  order.payment.status = 'succeeded';
  await order.save();
  return order;
}





