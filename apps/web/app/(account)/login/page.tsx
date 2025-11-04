'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function normalizeReturn(urlStr: string | null | undefined): string {
  const raw = urlStr || '/';
  if (!raw.startsWith('/')) return '/';   // chỉ cho phép internal path
  if (raw === '/login') return '/';       // tránh vòng lặp
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();

  // Ưu tiên callbackUrl (middleware/NextAuth chuẩn), fallback returnTo
  const callbackUrl = search.get('callbackUrl');
  const returnTo = search.get('returnTo');
  const returnToSafe = useMemo(
    () => normalizeReturn(callbackUrl ?? returnTo ?? '/'),
    [callbackUrl, returnTo]
  );

  const { status } = useSession();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace(returnToSafe);
    }
  }, [status, returnToSafe, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
  e.preventDefault();
  setErr(null);
  setLoading(true);

  try {
    // B1: gọi backend để set cookie `session` vào browser
    const r = await fetch('/api/backend/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',           // <-- quan trọng để nhận Set-Cookie
    });

    if (!r.ok) {
      // backend có thể trả text thuần, tránh JSON.parse lỗi
      const txt = await r.text().catch(() => '');
      throw new Error(
        txt || `Đăng nhập backend thất bại (HTTP ${r.status})`
      );
    }

    // B2: tạo phiên NextAuth để useSession() dùng trong FE
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (!res || res.error) {
      throw new Error('Sai email hoặc mật khẩu (NextAuth).');
    }

    router.replace(returnToSafe);
  } catch (e: any) {
    setErr(e?.message || 'Không thể đăng nhập.');
  } finally {
    setLoading(false);
  }
}
  
  return (
    <main className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Đăng nhập</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm">Mật khẩu</label>
          <input
            type="password"
            required
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={loading} className="w-full bg-black text-white rounded py-2">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="text-sm">
        Chưa có tài khoản? <Link className="underline" href="/register">Đăng ký</Link>
      </p>
    </main>
  );
}
