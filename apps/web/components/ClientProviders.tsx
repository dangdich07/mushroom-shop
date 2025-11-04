// apps/web/components/ClientProviders.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import CartProvider from './cart/CartProvider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
