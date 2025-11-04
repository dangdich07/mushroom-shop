// apps/api/src/app.ts
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
 * Stripe webhook needs the raw body BEFORE any JSON parser.
 */
app.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  (req: any, _res, next) => {
    req.rawBody = req.body;
    next();
  }
);

/**
 * Health / readiness endpoints (no auth).
 * - /live   : process is alive
 * - /ready  : service is ready to receive traffic (Mongo connected)
 * - /health : deep health with Mongo ping when connected
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
 * Security middlewares (helmet/cors/json-rate-limit...), then cookies.
 * NOTE: applySecurity should include express.json() for non-webhook routes.
 */
applySecurity(app);
app.use(cookieParser());

/**
 * Application routes
 */
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/', orderRoutes);

export default app;
