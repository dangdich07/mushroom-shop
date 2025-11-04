import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';

export function applySecurity(app: any) {
  app.disable('x-powered-by');
  app.use(helmet());

  const allowlist = (process.env.CORS_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean);
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error('CORS_NOT_ALLOWED'));
    },
    credentials: true
  }));

  // Body parsers (note: webhook route phải dùng raw)
  app.use(urlencoded({ extended: false, limit: '1mb' }));
  app.use(json({ limit: '1mb' }));

  // Rate-limit login
  const windowMs = 15 * 60 * 1000;
  const max = Number(process.env.RATE_LIMIT_LOGIN || 10);
  app.use('/auth/login', rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false }));
}





