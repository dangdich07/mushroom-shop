'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { AuthNav } from '../auth/AuthNav';

const nav = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/categories', label: 'Danh mục' },
];

export default function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const cart = useCart();
  const count = mounted && cart?.items?.length
    ? cart.items.reduce((sum, i) => sum + (i.qty || 0), 0)
    : 0;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-stone-100"
        >
          <span className="text-2xl">🍄</span>
          <div className="leading-tight">
            <div className="text-xs tracking-[0.18em] uppercase text-stone-500">
              Mushroom
            </div>
            <div className="text-sm font-semibold text-stone-900">
              Organic Mushroom Shop
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'relative text-sm transition-colors',
                isActive(item.href)
                  ? 'font-semibold text-stone-900'
                  : 'text-stone-600 hover:text-stone-900',
              ].join(' ')}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute -bottom-1 left-0 h-[2px] w-16 rounded-full bg-stone-900" />
              )}
            </Link>
          ))}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm hover:border-stone-300 hover:shadow"
          >
            <span className="text-base">🛒</span>
            <span>Giỏ hàng</span>
            {count > 0 && (
              <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-stone-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          {/* Auth */}
          <AuthNav />
        </nav>

        {/* Mobile right: cart + menu */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-full border border-stone-200 bg-white p-2 text-stone-800 shadow-sm hover:border-stone-300 hover:shadow"
          >
            <span className="text-lg">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-stone-900 px-1 text-[9px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white p-2 text-stone-800 shadow-sm hover:border-stone-300 hover:shadow"
          >
            <span className="sr-only">Mở menu</span>
            <div className="space-y-0.5">
              <span className="block h-0.5 w-4 rounded-full bg-stone-800" />
              <span className="block h-0.5 w-3 rounded-full bg-stone-800" />
              <span className="block h-0.5 w-4 rounded-full bg-stone-800" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white/98 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-lg px-2 py-2 ${
                  isActive(item.href)
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{item.label}</span>
                {isActive(item.href) && <span className="text-[10px]">●</span>}
              </Link>
            ))}

            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-between rounded-lg px-2 py-2 text-stone-700 hover:bg-stone-100"
            >
              <span>Tài khoản</span>
            </Link>
            <div className="pt-1">
              <AuthNav />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
