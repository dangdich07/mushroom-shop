// apps/api/src/app.ts
import { stripeWebhook } from './controllers/webhook.controller';
import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { mongoStateLabel } from './utils/mongo-state';
import { applySecurity } from './middlewares/security';

import authRoutes from './routes/auth.route';
import orderRoutes from './routes/orders.route';
import productsRoutes from './routes/products.route';
import categoriesRoutes from './routes/categories.route';



const app = express();

/**
 * Stripe webhook:
 *  - PHẢI đọc raw body trước mọi body-parser
 *  - Không dùng express.json() cho route này
 */
app.post(
  '/webhooks/stripe',
  express.raw({ type: '*/*' }), // giữ nguyên Buffer, không parse JSON
  (req: any, _res, next) => {
    req.rawBody = req.body;     // Buffer này dùng trong stripeWebhook
    next();
  },
  stripeWebhook                    // ⬅️ gọi thẳng controller ở đây
);

/**
 * Health / readiness endpoints (no auth).
 */
app.get('/live', (_req, res) => {
  res.json({
    ok: true,
    now: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/ready', (_req, res) => {
  const stateNum = mongoose.connection.readyState; // 0..3
  const stateLbl = mongoStateLabel(stateNum);
  const ready = stateNum === 1; // 1 = connected

  res.status(ready ? 200 : 503).json({
    ok: ready,
    now: new Date().toISOString(),
    mongo: { state: stateLbl, code: stateNum },
  });
});

app.get('/health', async (_req, res) => {
  const stateNum = mongoose.connection.readyState;
  const stateLbl = mongoStateLabel(stateNum);

  let mongoOk = false;
  try {
    if (stateNum === 1 && mongoose.connection.db) {
      const r = await mongoose.connection.db.admin().ping();
      mongoOk = r?.ok === 1;
    }
  } catch {
    mongoOk = false;
  }

  const ok = mongoOk;
  res.status(ok ? 200 : 503).json({
    ok,
    now: new Date().toISOString(),
    uptime: process.uptime(),
    mongo: { state: stateLbl, code: stateNum, ok: mongoOk },
  });
});

/**
 * Security middlewares (helmet / cors / rate-limit / v.v.).
 * Có thể chứa express.json, nhưng ta sẽ chặn cho /webhooks/stripe bên dưới.
 */
applySecurity(app);

app.use(cookieParser());

/**
 * JSON parser CHO MỌI ROUTE TRỪ /webhooks/stripe
 * → tránh phá rawBody mà Stripe cần.
 */
app.use((req, res, next) => {
  if (req.originalUrl === '/webhooks/stripe') {
    return next();
  }
  return express.json()(req, res, next);
});

/**
 * Application routes
 */
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/', orderRoutes);

export default app;
