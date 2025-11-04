import { Router } from 'express';
import { createCheckoutSession, getOrder, getMyOrders, listMyOrders  } from '../controllers/order.controller';
import { stripeWebhook } from '../controllers/webhook.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Checkout: bắt buộc đăng nhập để có req.user.id
router.post('/checkout/session', requireAuth, createCheckoutSession);

// Stripe webhook (raw body đã cấu hình ở app.ts)
router.post('/webhooks/stripe', stripeWebhook);

// Đơn của tôi (theo userId)
router.get('/orders/my', requireAuth, getMyOrders);

// Xem chi tiết 1 đơn (chỉ cho chủ sở hữu)
router.get('/orders/:id', requireAuth, getOrder);

// ✨ mới: danh sách đơn của tôi
router.get('/orders/me', requireAuth, listMyOrders);

export default router;
