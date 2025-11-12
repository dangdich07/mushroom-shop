'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = (process.env.NEXT_PUBLIC_API_ABSOLUTE_URL || 'http://localhost:4000').replace(/\/$/, '');

export default function Client() {
  const search = useSearchParams();
  const router = useRouter();
  const token = search.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const disabled = !token || password.length < 6 || password !== confirm;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setMsg(null); setErr(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error?.message || 'Không thể đặt lại mật khẩu.');
      setMsg('Mật khẩu đã được cập nhật. Bạn có thể đăng nhập.');
      setPassword(''); setConfirm('');
      setTimeout(() => router.replace('/login'), 1800);
    } catch (e: any) {
      setErr(e?.message || 'Liên kết không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-100 text-center space-y-4">
          <h1 className="text-lg font-semibold text-stone-900">Liên kết đặt lại không hợp lệ</h1>
          <p className="text-sm text-stone-500">Vui lòng yêu cầu một liên kết mới.</p>
          <Link href="/forgot-password" className="inline-flex items-center justify-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            Yêu cầu lại
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-100">
        <h1 className="text-2xl font-semibold text-stone-900 text-center">Đặt lại mật khẩu</h1>
        <p className="mt-2 text-center text-sm text-stone-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600">Mật khẩu mới</label>
            <input type="password" minLength={6} required
              className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600">Nhập lại mật khẩu</label>
            <input type="password" minLength={6} required
              className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>

          {msg && <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{msg}</div>}
          {err && <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">{err}</div>}

          <button type="submit" disabled={loading || disabled}
            className="w-full rounded-full bg-stone-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:opacity-50">
            {loading ? 'Đang cập nhật...' : 'Xác nhận mật khẩu mới'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-stone-500">
          <Link href="/login" className="hover:text-stone-800 hover:underline">Quay lại đăng nhập</Link>
        </div>
      </div>
    </main>
  );
}
