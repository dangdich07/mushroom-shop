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

export async function markOrderPaidByPaymentIntent(
  paymentIntentId: string,
  idemKey?: string,
  orderIdFromMeta?: string | null
) {
  if (!paymentIntentId && !idemKey && !orderIdFromMeta) {
    // Không đủ dữ liệu, bỏ qua nhẹ nhàng
    return null;
  }

  const or: any[] = [];

  if (paymentIntentId) {
    or.push({ 'payment.id': paymentIntentId });
  }

  if (idemKey) {
    or.push({ idempotencyKey: idemKey });
  }

  if (orderIdFromMeta) {
    try {
      or.push({ _id: new mongoose.Types.ObjectId(orderIdFromMeta) });
    } catch {
      // orderIdFromMeta không hợp lệ, bỏ qua
    }
  }

  if (!or.length) return null;

  const order = await OrderModel.findOne({ $or: or });

  if (!order) {
    // Đổi sang log nhẹ cho debug, không phải lỗi hệ thống
    console.log('[markOrderPaidByPaymentIntent] No matching order for', {
      paymentIntentId,
      idemKey,
      orderIdFromMeta,
    });
    return null;
  }

  if (order.status === 'paid') {
    // Đã xử lý trước đó (idempotent)
    return order;
  }

  order.status = 'paid';
  order.payment = {
    ...(order.payment || { provider: 'stripe' }),
    id: paymentIntentId || order.payment?.id || null,
    status: 'succeeded',
  };

  await order.save();
  return order;
}





