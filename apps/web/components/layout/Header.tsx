'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../hooks/useCart';
import { useEffect, useState } from 'react';
import { AuthNav } from '../auth/AuthNav';

// const { totalQty } = useCart();
const nav = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/categories', label: 'Danh mục' },
  // { href: '/cart', label: 'Giỏ hàng' }, // bỏ để tránh trùng với link có badge bên dưới
];

export default function Header() {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cart: any = useCart?.() ?? { items: [] };
  const count = Array.isArray(cart.items)
    ? cart.items.reduce((s: number, i: any) => s + (i.qty || 0), 0)
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          🍄 <span className="text-gray-900">Mushroom</span> <span className="text-gray-500">Shop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => {
            const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm transition-colors ${
                  active ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {n.label}
              </Link>
            );
          })}

          <Link href="/cart" className="relative text-sm text-gray-600 hover:text-gray-900">
            🛒 Giỏ hàng
            {mounted && count > 0 && (
              <span className="absolute -top-2 -right-3 text-xs bg-black text-white rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
          </Link>

          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
