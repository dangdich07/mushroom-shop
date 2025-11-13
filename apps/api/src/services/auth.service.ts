import { UserModel } from '../models/user.model';
import { RegisterInput, LoginInput } from '../validators/auth.schema';
import * as argon2 from 'argon2';
import bcrypt from 'bcryptjs';

// helper: nhận hash -> tự nhận diện loại hash và verify
async function verifyHash(hash: string, plain: string): Promise<boolean> {
  // bcrypt: bắt đầu bằng $2a$, $2b$, $2y$
  if (/^\$2[aby]\$/.test(hash)) {
    return bcrypt.compare(plain, hash);
  }
  // default: argon2
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// --- Đăng ký: vẫn dùng argon2 ---
export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const exists = await UserModel.findOne({ email }).lean();
  if (exists) throw new Error('EMAIL_EXISTS');

  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  const user = await UserModel.create({ email, passwordHash, roles: ['customer'] });

  return { id: String(user._id), email: user.email, roles: Array.isArray(user.roles) ? user.roles : [] };
}

// --- Đăng nhập: thử cả bcrypt/argon2 ---
export async function verifyLogin(input: LoginInput) {
  const email = input.email.toLowerCase();
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const ok = await verifyHash(user.passwordHash, input.password);
  if (!ok) throw new Error('INVALID_CREDENTIALS');

  return { id: String(user._id), email: user.email, roles: Array.isArray(user.roles) ? user.roles : [] };
}
