import { Request, Response, NextFunction } from 'express';

export function requireRole(role: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user as { id: string; roles?: string[] } | undefined;
    const roles = user?.roles || [];
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions' });
    }
    next();
  };
}



