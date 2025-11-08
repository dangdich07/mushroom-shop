'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

const API_BASE =
  (process.env.NEXT_PUBLIC_API_ABSOLUTE_URL || 'http://localhost:4000').replace(/\/$/, '');

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data?.error?.message || 'Không gửi được yêu cầu đặt lại mật khẩu.');
      }

      setMsg(
        'Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.'
      );
      setEmail('');
    } catch (e: any) {
      setErr(e?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-100">
        <h1 className="text-2xl font-semibold text-stone-900 text-center">
          Quên mật khẩu
        </h1>
        <p className="mt-2 text-center text-sm text-stone-500">
          Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2.5 text-sm outline-none transition
                         focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5"
              placeholder="nhapemail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {msg && (
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {msg}
            </div>
          )}
          {err && (
            <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-full bg-stone-900 py-2.5 text-sm font-semibold text-white shadow-sm
                       transition hover:bg-black disabled:opacity-60"
          >
            {loading ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại mật khẩu'}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-xs text-stone-500">
          <Link href="/login" className="hover:text-stone-800 hover:underline">
            ← Quay lại đăng nhập
          </Link>
          <Link href="/products" className="hover:text-stone-800 hover:underline">
            Tiếp tục xem sản phẩm
          </Link>
        </div>
      </div>
    </main>
  );
}
