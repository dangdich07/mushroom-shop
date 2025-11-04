import { UserModel } from '../models/user.model';
import { RegisterInput, LoginInput } from '../validators/auth.schema';
import * as argon2 from 'argon2';

// --- Đăng ký người dùng ---
export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const exists = await UserModel.findOne({ email }).lean();
  if (exists) {
    throw new Error('EMAIL_EXISTS');
  }

  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  const user = await UserModel.create({ email, passwordHash, roles: ['customer'] });

  return {
    id: String(user._id),
    email: user.email,
    roles: Array.isArray(user.roles) ? user.roles : [],
  };
}

// --- Xác minh đăng nhập ---
export async function verifyLogin(input: LoginInput) {
  const email = input.email.toLowerCase();
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const ok = await argon2.verify(user.passwordHash, input.password);
  if (!ok) throw new Error('INVALID_CREDENTIALS');

  return {
    id: String(user._id),
    email: user.email,
    roles: Array.isArray(user.roles) ? user.roles : [],
  };
}
