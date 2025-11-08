// apps/api/src/app.ts
import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { stripeWebhook } from './controllers/webhook.controller';
import { mongoStateLabel } from './utils/mongo-state';

import authRoutes from './routes/auth.route';
import orderRoutes from './routes/orders.route';
import productsRoutes from './routes/products.route';
import categoriesRoutes from './routes/categories.route';

// Security libs
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();

/**
 * Stripe webhook:
 *  - PHẢI đọc raw body trước mọi body-parser
 *  - Không dùng express.json() cho route này
 */
app.post(
  '/webhooks/stripe',
  express.raw({ type: '*/*' }),
  (req: any, _res, next) => {
    // Lưu raw body để stripeWebhook verify signature
    req.rawBody = req.body;
    next();
  },
  stripeWebhook,
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

/* ================================
 * Security middlewares (global)
 * ==============================*/

// Ẩn "X-Powered-By: Express"
app.disable('x-powered-by');

// Helmet: header bảo mật cơ bản
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Nén response
app.use(compression());

// CORS: chỉ cho phép origin tin cậy
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:3000,http://localhost:3001'
)
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Cho request không có Origin (curl, health check)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// Rate limit chung (chống spam)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // mỗi IP tối đa 1000 request / 15 phút
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Rate limit chặt hơn cho auth (nếu có)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
});
app.use('/auth', authLimiter);

/* ================================
 * Parsers
 * ==============================*/

app.use(cookieParser());

/**
 * JSON parser CHO MỌI ROUTE TRỪ /webhooks/stripe
 * (tránh làm hỏng raw body mà Stripe cần)
 */
app.use((req, res, next) => {
  if (req.originalUrl === '/webhooks/stripe') {
    return next();
  }
  return express.json()(req, res, next);
});

/* ================================
 * Application routes
 * ==============================*/

app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/', orderRoutes);

/* ================================
 * Error handler chung (ẩn stack)
 * ==============================*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);

  const status = err.status || 500;

  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message:
        status === 500
          ? 'Có lỗi xảy ra, vui lòng thử lại sau.'
          : err.message || 'Request không hợp lệ.',
      traceId: (res.locals && res.locals.traceId) || undefined,
    },
  });
});

export default app;
