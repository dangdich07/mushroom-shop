import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.schema';
import { registerUser, verifyLogin } from '../services/auth.service';
import { UserModel } from '../models/user.model';
import { attachSessionCookie, clearSessionCookie, sessionConfig } from '../utils/session';

function errorResponse(res: Response, code: string, message: string, status = 400) {
  return res.status(status).json({ error: { code, message, traceId: res.locals.traceId || '' } });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);

    // Gắn cookie phiên (HMAC) duy nhất 1 lần
    const token = attachSessionCookie(res, { id: user.id, roles: user.roles });
    const metadata = sessionConfig.clientMetadata;

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        roles: Array.isArray(user.roles) ? user.roles : [],
      },
      session: {
        token,
        cookie: {
          name: metadata.name,
          path: metadata.path,
          sameSite: metadata.sameSite,
          secure: metadata.secure,
          httpOnly: metadata.httpOnly,
          maxAgeMs: metadata.maxAgeMs,
          maxAgeSeconds: metadata.maxAgeSeconds,
        },
      },
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') return errorResponse(res, 'VALIDATION_ERROR', 'Invalid payload', 422);
    if (err?.message === 'EMAIL_EXISTS') return errorResponse(res, 'EMAIL_EXISTS', 'Email already registered', 409);
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const user = await verifyLogin(input);

    const token = attachSessionCookie(res, { id: user.id, roles: user.roles });
    const metadata = sessionConfig.clientMetadata;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        roles: Array.isArray(user.roles) ? user.roles : [],
      },
      session: {
        token,
        cookie: {
          name: metadata.name,
          path: metadata.path,
          sameSite: metadata.sameSite,
          secure: metadata.secure,
          httpOnly: metadata.httpOnly,
          maxAgeMs: metadata.maxAgeMs,
          maxAgeSeconds: metadata.maxAgeSeconds,
        },
      },
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') return errorResponse(res, 'VALIDATION_ERROR', 'Invalid payload', 422);
    if (err?.message === 'INVALID_CREDENTIALS') return errorResponse(res, 'UNAUTHORIZED', 'Invalid credentials', 401);
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  clearSessionCookie(res);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user as { id: string } | undefined;
    if (!user?.id) return errorResponse(res, 'UNAUTHORIZED', 'Authentication required', 401);

    const doc = await UserModel.findById(user.id).lean();
    if (!doc || Array.isArray(doc)) return errorResponse(res, 'NOT_FOUND', 'User not found', 404);

    const leanDoc = doc as { _id: unknown; email?: unknown; roles?: unknown };
    const roles = Array.isArray(leanDoc.roles) ? leanDoc.roles.filter((r): r is string => typeof r === 'string') : [];

    res.json({
      user: {
        id: String(leanDoc._id),
        email: typeof leanDoc.email === 'string' ? leanDoc.email : '',
        roles,
      },
    });
  } catch (err) {
    next(err);
  }
}
