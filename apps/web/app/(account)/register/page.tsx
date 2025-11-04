'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

// ✅ Gọi trực tiếp backend để tránh đụng /api/auth của NextAuth
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
    <main className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Đăng ký</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Họ tên (tuỳ chọn)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Mật khẩu</label>
          <input
            type="password"
            minLength={6}
            required
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {ok && <p className="text-sm text-green-700">{ok}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={loading} className="w-full bg-black text-white rounded py-2">
          {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="text-sm">
        Đã có tài khoản? <Link className="underline" href="/login">Đăng nhập</Link>
      </p>
    </main>
  );
}
