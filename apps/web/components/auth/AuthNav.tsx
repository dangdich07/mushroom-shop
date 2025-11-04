'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function AuthNav() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <span className="text-sm text-gray-500">…</span>;

  return session?.user ? (
    <div className="flex items-center gap-3">
      <Link href="/account" className="text-gray-700 hover:text-gray-900">
        {session.user.email}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm underline text-gray-600 hover:text-gray-900"
      >
        Đăng xuất
      </button>
    </div>
  ) : (
    <Link href="/login" className="text-gray-700 hover:text-gray-900">
      Đăng nhập
    </Link>
  );
}
