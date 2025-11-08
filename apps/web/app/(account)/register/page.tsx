'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

// Gọi trực tiếp backend để tránh đụng /api/auth của NextAuth
const API_BASE = (process.env.NEXT_PUBLIC_API_ABSOLUTE_URL || 'http://localhost:4000').replace(
  /\/$/,
  ''
);

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setOk(null);
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Đăng ký thất bại');
      }

      setOk('Đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.');
      setEmail('');
      setPassword('');
      setName('');
    } catch (e: any) {
      setErr(e?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo + intro */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍄</span>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-[0.18em] text-amber-500">
                Mushroom Shop
              </div>
              <div className="text-sm text-gray-500">
                Tài khoản thành viên
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-[0_18px_60px_rgba(15,23,42,0.08)] rounded-2xl px-6 py-7 space-y-5">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Tạo tài khoản mới
            </h1>
            <p className="text-sm text-gray-500">
              Đăng ký để lưu địa chỉ, theo dõi đơn hàng và nhận ưu đãi cho tín đồ nấm.
            </p>
          </header>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600">
                Họ tên <span className="text-gray-400">(không bắt buộc)</span>
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm outline-none transition
                           focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Nấm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm outline-none transition
                           focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                minLength={6}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm outline-none transition
                           focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
              />
              <p className="text-[10px] text-gray-400">
                Mẹo nhỏ: dùng mật khẩu riêng cho shop để an toàn hơn.
              </p>
            </div>

            {ok && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {ok}
              </div>
            )}

            {err && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                {err}
              </div>
            )}

            <button
              disabled={loading}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5
                         text-sm font-medium text-white shadow-sm transition
                         hover:bg-black hover:shadow-md disabled:opacity-60 disabled:shadow-none"
            >
              {loading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="pt-1 text-[11px] text-gray-500">
            Bằng việc đăng ký, bạn đồng ý với các{' '}
            <Link href="/policy" className="text-amber-600 hover:text-amber-500 underline-offset-2 hover:underline">
              điều khoản & chính sách bảo mật
            </Link>{' '}
            của Mushroom Shop.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Đã có tài khoản?{' '}
          <Link
            className="font-medium text-amber-600 hover:text-amber-500 underline-offset-2 hover:underline"
            href="/login"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
