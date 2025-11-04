// apps/web/components/auth/SignOutButton.tsx
'use client';
import { signOut } from 'next-auth/react';

export default function SignOutButton({ className = '' }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className={className}
    >
      Đăng xuất
    </button>
  );
}
