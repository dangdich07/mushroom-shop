import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import { PasswordResetTokenModel } from '../models/password-reset-token.model';

const RESET_EXPIRES_MIN = 30;

const FRONTEND_BASE = (
  process.env.RESET_PASSWORD_URL_BASE ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * POST /auth/forgot-password
 * body: { email }
 *
 * - Luôn trả 200 để tránh lộ email tồn tại hay không.
 * - Nếu user tồn tại:
 *    + Xoá token cũ
 *    + Tạo token mới
 *    + Log URL reset ra console (dev)
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({
        error: { code: 'INVALID_EMAIL', message: 'Email không hợp lệ' },
      });
    }

    const user = await UserModel.findOne({ email }).select('_id email').lean();

    if (user) {
      const userId = (user as any)._id; // ép kiểu để TS không phàn nàn

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_EXPIRES_MIN * 60 * 1000);

      // Xoá token cũ
      await PasswordResetTokenModel.deleteMany({ userId });

      // Tạo token mới
      await PasswordResetTokenModel.create({
        userId,
        tokenHash,
        expiresAt,
      });

      const resetUrl = `${FRONTEND_BASE}/reset-password?token=${rawToken}`;

      // TODO: gửi email thật ở môi trường production.
      // Hiện tại: log ra console cho bạn tự copy dùng thử.
      // KHÔNG trả rawToken về response.
      // eslint-disable-next-line no-console
      console.log('[PasswordReset] Reset link for', email, ':', resetUrl);
    }

    return res.json({
      success: true,
      message:
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
    });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /auth/reset-password
 * body: { token, password }
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = String(req.body?.token || '');
    const password = String(req.body?.password || '');

    if (!rawToken || password.length < 6) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Token hoặc mật khẩu không hợp lệ',
        },
      });
    }

    const tokenHash = hashToken(rawToken);
    const now = new Date();

    const tokenDoc = await PasswordResetTokenModel.findOne({
      tokenHash,
      expiresAt: { $gt: now },
      usedAt: { $exists: false },
    });

    if (!tokenDoc) {
      return res.status(400).json({
        error: {
          code: 'TOKEN_INVALID',
          message: 'Liên kết đặt lại đã hết hạn hoặc không hợp lệ',
        },
      });
    }

    const user = await UserModel.findById(tokenDoc.userId);
    if (!user) {
      return res.status(400).json({
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng' },
      });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    (user as any).password = hash; // đảm bảo đúng field schema User của bạn
    await user.save();

    tokenDoc.usedAt = now;
    await tokenDoc.save();

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.',
    });
  } catch (e) {
    next(e);
  }
}
