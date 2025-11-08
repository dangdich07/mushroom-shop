'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function normalizeReturn(urlStr: string | null | undefined): string {
  const raw = urlStr || '/';
  if (!raw.startsWith('/')) return '/'; // chỉ cho phép internal path
  if (raw === '/login') return '/'; // tránh vòng lặp
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();

  // Ưu tiên callbackUrl (NextAuth), fallback returnTo
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
    if (loading) return;

    setErr(null);
    setLoading(true);

    try {
      // B1: login backend → set cookie `session`
      const r = await fetch('/api/backend/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!r.ok) {
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
        throw new Error('Sai email hoặc mật khẩu.');
      }

      router.replace(returnToSafe);
    } catch (e: any) {
      setErr(e?.message || 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-4 py-10">
      <main className="w-full max-w-md">
        {/* Logo + intro */}
        <div className="mb-6 text-center space-y-1.5">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="text-2xl">🍄</span>
            <span className="text-xl font-semibold tracking-tight">
              Mushroom Shop
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Đăng nhập tài khoản</h1>
          <p className="text-sm text-gray-600">
            Chào mừng bạn quay lại. Đăng nhập để tiếp tục đặt hàng &amp; theo dõi đơn.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white/90 border border-gray-100 shadow-lg shadow-stone-200 px-6 py-6 space-y-4 backdrop-blur-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700 uppercase tracking-wide"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm outline-none transition focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhapemail@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-700 uppercase tracking-wide"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm outline-none transition focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {err}
              </div>
            )}

            <button
              disabled={loading}
              className="mt-3 w-full rounded-full bg-stone-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:opacity-60"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-stone-500">
        <span />
        <Link href="/forgot-password" className="hover:text-stone-800 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
        </div>

        {/* Footer links */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-semibold text-gray-900 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
        <p className="mt-1 text-center text-[11px] text-gray-400">
          Hoặc tiếp tục mua sắm như khách lẻ tại{' '}
          <Link href="/products" className="underline">
            danh sách sản phẩm
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
