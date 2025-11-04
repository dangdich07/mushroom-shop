import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { reserveStockAndCreateOrder } from '../services/order.service';
import { OrderModel } from '../models/order.model';
import { getStripe } from '../utils/stripe';

const zCheckout = z.object({
  items: z.array(z.object({ sku: z.string().min(1), qty: z.number().int().min(1) })).min(1)
});

export async function createCheckoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = zCheckout.parse(req.body);
    const idemKey = (req.headers['idempotency-key'] as string) || crypto.randomUUID();
    const userId = (req as any).user?.id as string | undefined; // requireAuth đảm bảo có user

    const order = await reserveStockAndCreateOrder(userId, items, idemKey);

    const stripe = getStripe();

    const line_items = order.items.map(i => ({
      quantity: i.qty,
      price_data: {
        currency: 'vnd',
        unit_amount: Math.round(i.price), // VND zero-decimal
        product_data: { name: i.sku }
      }
    }));

    const successUrlBase = new URL(process.env.CHECKOUT_SUCCESS_URL!);
    successUrlBase.searchParams.set('orderId', String(order._id));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: successUrlBase.toString(),
      cancel_url: process.env.CHECKOUT_CANCEL_URL!,
      metadata: { orderId: String(order._id), idemKey }
    });

    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { 'payment.id': session.payment_intent ?? null } }
    );

    res.json({ id: session.id, url: session.url, orderId: String(order._id) });
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', traceId: res.locals.traceId || '' } });
    if (err?.message === 'OUT_OF_STOCK') return res.status(409).json({ error: { code: 'OUT_OF_STOCK', message: 'Some items are out of stock', traceId: res.locals.traceId || '' } });
    if (err?.message === 'STRIPE_MISCONFIGURED') return res.status(500).json({ error: { code: 'CONFIG_ERROR', message: 'Stripe not configured', traceId: res.locals.traceId || '' } });
    next(err);
  }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing user' } });

    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ items: orders });
  } catch (e) { next(e); }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).user?.id;

    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found', traceId: res.locals.traceId || '' } });
    }

    // chỉ cho chủ sở hữu xem (có thể nới lỏng nếu có role admin)
    if (order.userId && userId && String(order.userId) !== String(userId)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your order', traceId: res.locals.traceId || '' } });
    }

    res.json(order);
  } catch (e) { next(e); }
}
export async function listMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Login required', traceId: res.locals.traceId || '' } });

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));

    const q = { userId };
    const [items, total] = await Promise.all([
      OrderModel.find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      OrderModel.countDocuments(q),
    ]);

    res.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (e) { next(e); }
}