// apps/api/src/routes/orders.route.ts
import { Router } from 'express';
import {
  createCheckoutSession,
  getOrder,
  getMyOrders,
  listMyOrders,
  createCheckoutForOrder,
  checkoutExistingOrder,
  adminListOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
} from '../controllers/order.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

/**
 * PUBLIC / USER ROUTES (cần đăng nhập)
 */

// Checkout từ giỏ hàng → tạo order + stripe session
router.post('/checkout/session', requireAuth, createCheckoutSession);

// Đơn của chính user
router.get('/orders/my', requireAuth, getMyOrders);
router.get('/orders/me', requireAuth, listMyOrders);

// Xem chi tiết đơn (chỉ chủ đơn)
router.get('/orders/:id', requireAuth, getOrder);

// Thanh toán lại cho chính order (không tạo order mới)
router.post('/orders/:id/checkout', requireAuth, createCheckoutForOrder);

// Sử dụng nếu cần cho flow cũ
router.post(
  '/orders/:id/checkout-existing',
  requireAuth,
  checkoutExistingOrder,
);

/**
 * ADMIN ROUTES
 * prefix: /admin/orders...
 */
router.get('/admin/orders', requireAuth, adminListOrders);
router.get('/admin/orders/:id', requireAuth, adminGetOrder);
router.patch(
  '/admin/orders/:id/status',
  requireAuth,
  adminUpdateOrderStatus,
);

export default router;
