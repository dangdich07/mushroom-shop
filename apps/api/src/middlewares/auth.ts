import { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../utils/session';

/**
 * Middleware xác thực dựa trên session HMAC
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.session ||
      req.cookies?.['next-auth.session-token'] ||
      req.cookies?.['__Secure-next-auth.session-token'] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined);

    if (!token) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing session token' });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired session' });
    }

    (req as any).user = session;
    next();
  } catch (err) {
    console.error('requireAuth error:', err);
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Session verification failed' });
  }
}
