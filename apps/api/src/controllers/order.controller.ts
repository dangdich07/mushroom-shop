// apps/api/src/controllers/order.controller.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { reserveStockAndCreateOrder } from '../services/order.service';
import { OrderModel } from '../models/order.model';
import { getStripe } from '../utils/stripe';

const zCheckout = z.object({
  items: z
    .array(z.object({ sku: z.string().min(1), qty: z.number().int().min(1) }))
    .min(1),
});

// Cho phép full các trạng thái dùng ở FE
const zUpdateStatus = z.object({
  status: z.enum([
    'pending_payment',
    'paid',
    'shipping',
    'completed',
    'failed',
    'canceled',
    'refunded',
  ]),
});

function isAdmin(req: Request): boolean {
  const u: any = (req as any).user;
  if (!u) return false;
  if (Array.isArray(u.roles) && u.roles.includes('admin')) return true;
  if (u.isAdmin) return true;
  return false;
}

/* =========================
 *  CHECKOUT (KHÁCH HÀNG)
 * =======================*/

export async function createCheckoutSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { items } = zCheckout.parse(req.body);
    const idemKey =
      (req.headers['idempotency-key'] as string) || crypto.randomUUID();
    const userId = (req as any).user?.id as string | undefined;

    const order = await reserveStockAndCreateOrder(userId, items, idemKey);
    const stripe = getStripe();

    const line_items = order.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: 'vnd',
        unit_amount: Math.round(i.price),
        product_data: { name: i.sku },
      },
    }));

    const successUrlBase = new URL(process.env.CHECKOUT_SUCCESS_URL!);
    successUrlBase.searchParams.set('orderId', String(order._id));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: successUrlBase.toString(),
      cancel_url: process.env.CHECKOUT_CANCEL_URL!,
      metadata: { orderId: String(order._id), idemKey },
    });

    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { 'payment.id': session.payment_intent ?? null } },
    );

    res.json({ id: session.id, url: session.url, orderId: String(order._id) });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payload',
          traceId: res.locals.traceId || '',
        },
      });
    }
    if (err?.message === 'OUT_OF_STOCK') {
      return res.status(409).json({
        error: {
          code: 'OUT_OF_STOCK',
          message: 'Some items are out of stock',
          traceId: res.locals.traceId || '',
        },
      });
    }
    if (err?.message === 'STRIPE_MISCONFIGURED') {
      return res.status(500).json({
        error: {
          code: 'CONFIG_ERROR',
          message: 'Stripe not configured',
          traceId: res.locals.traceId || '',
        },
      });
    }
    next(err);
  }
}

export async function getMyOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Missing user' },
      });
    }

    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items: orders });
  } catch (e) {
    next(e);
  }
}

export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).user?.id;

    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
          traceId: res.locals.traceId || '',
        },
      });
    }

    // chỉ cho chủ sở hữu xem (admin xem qua route admin riêng)
    if (order.userId && userId && String(order.userId) !== String(userId)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Not your order',
          traceId: res.locals.traceId || '',
        },
      });
    }

    res.json(order);
  } catch (e) {
    next(e);
  }
}

export async function listMyOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Login required',
          traceId: res.locals.traceId || '',
        },
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(req.query.pageSize) || 10),
    );

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
  } catch (e) {
    next(e);
  }
}

/**
 * Tạo session thanh toán lại cho chính order hiện tại
 * (không tạo order mới, không trừ stock thêm).
 */
export async function createCheckoutForOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).user?.id as string | undefined;
    const idemKey =
      (req.headers['idempotency-key'] as string) || crypto.randomUUID();

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Order not found', traceId: res.locals.traceId || '' },
      });
    }

    if (order.userId && userId && String(order.userId) !== String(userId)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Not your order', traceId: res.locals.traceId || '' },
      });
    }

    if (order.status === 'paid') {
      return res.status(409).json({
        error: {
          code: 'ALREADY_PAID',
          message: 'Order already paid',
          traceId: res.locals.traceId || '',
        },
      });
    }

    const stripe = getStripe();
    const line_items = order.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: 'vnd',
        unit_amount: Math.round(i.price),
        product_data: { name: i.sku },
      },
    }));

    const successUrlBase = new URL(process.env.CHECKOUT_SUCCESS_URL!);
    successUrlBase.searchParams.set('orderId', String(order._id));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: successUrlBase.toString(),
      cancel_url: process.env.CHECKOUT_CANCEL_URL!,
      metadata: { orderId: String(order._id), idemKey },
    });

    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { 'payment.id': session.payment_intent ?? null } },
    );

    res.json({ id: session.id, url: session.url, orderId: String(order._id) });
  } catch (e) {
    next(e);
  }
}

/**
 * Tạo session thanh toán cho 1 order pending_payment đã tồn tại.
 */
export async function checkoutExistingOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).user?.id as string | undefined;

    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }
    if (order.userId && userId && String(order.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'Not your order' } });
    }
    if (order.status !== 'pending_payment') {
      return res.status(409).json({
        error: {
          code: 'INVALID_STATE',
          message: 'Order not pending payment',
        },
      });
    }

    const stripe = getStripe();
    const line_items = order.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: 'vnd',
        unit_amount: Math.round(i.price),
        product_data: { name: i.sku },
      },
    }));

    const idemKey =
      (req.headers['idempotency-key'] as string) ||
      order.idempotencyKey ||
      undefined;

    const successUrl = new URL(process.env.CHECKOUT_SUCCESS_URL!);
    successUrl.searchParams.set('orderId', String(order._id));

    const meta: Record<string, string> = { orderId: String(order._id) };
    if (idemKey) meta.idemKey = idemKey;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: successUrl.toString(),
      cancel_url: process.env.CHECKOUT_CANCEL_URL!,
      metadata: meta,
    });

    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { 'payment.id': (session as any).payment_intent ?? null } },
    );

    res.json({ id: session.id, url: session.url, orderId: String(order._id) });
  } catch (e) {
    next(e);
  }
}

/* =========================
 *  ADMIN: QUẢN LÝ ĐƠN HÀNG
 * =======================*/

export async function adminListOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!isAdmin(req)) {
      return res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'Admin only' } });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(req.query.pageSize) || 20),
    );
    const status = req.query.status
      ? String(req.query.status)
      : undefined;
    const q = (req.query.q as string | undefined)?.trim();

    const filter: any = {};
    if (status) filter.status = status;

    if (q) {
      const or: any[] = [];
      if (/^[0-9a-fA-F]{24}$/.test(q)) or.push({ _id: q });
      or.push({ 'payment.id': q });
      or.push({ idempotencyKey: q });
      if (or.length) filter.$or = or;
    }

    const [items, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      OrderModel.countDocuments(filter),
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
  } catch (e) {
    next(e);
  }
}

export async function adminGetOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!isAdmin(req)) {
      return res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'Admin only' } });
    }

    const { id } = req.params as { id: string };
    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    res.json(order);
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!isAdmin(req)) {
      return res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'Admin only' } });
    }

    const { id } = req.params as { id: string };
    const { status } = zUpdateStatus.parse(req.body);

    const order: any = await OrderModel.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    order.status = status;
    if (!order.payment) order.payment = {};

    if (status === 'paid') {
      order.payment.status = 'succeeded';
    } else if (status === 'pending_payment') {
      order.payment.status = 'requires_payment';
    } else if (status === 'shipping') {
      order.payment.status = 'shipping';
    } else if (status === 'completed') {
      order.payment.status = 'completed';
    } else if (status === 'failed') {
      order.payment.status = 'failed';
    } else if (status === 'canceled') {
      order.payment.status = 'canceled';
    } else if (status === 'refunded') {
      order.payment.status = 'refunded';
    }

    await order.save();

    res.json({ success: true, order });
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status',
        },
      });
    }
    next(e);
  }
}
