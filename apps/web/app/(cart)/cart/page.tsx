'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { useCart } from '../../../hooks/useCart';
import CartItemRow from '../../../components/cart/CartItemRow';
import { createCheckoutSession } from '../../../lib/api';

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

export default function CartPage() {
  const { items, subtotal, totalQty, setQty, removeItem, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onCheckout = useCallback(async () => {
    setErr(null);
    if (!items.length) return;

    const payload = items
      .filter((it) => it.sku && it.qty > 0)
      .map((it) => ({ sku: it.sku, qty: it.qty }));

    if (!payload.length) {
      setErr('Không có mặt hàng hợp lệ để thanh toán.');
      return;
    }

    try {
      setLoading(true);
      const { url, orderId } = await createCheckoutSession(payload);
      try {
        localStorage.setItem('lastOrderId', String(orderId));
      } catch {}
      window.location.assign(url);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('HTTP 401')) {
        window.location.assign(`/login?returnTo=/cart`);
        return;
      }
      if (msg.includes('SKU_NOT_FOUND')) {
        setErr('Một số sản phẩm không còn khả dụng. Vui lòng xoá và thêm lại.');
      } else {
        setErr('Không tạo được phiên thanh toán. Vui lòng thử lại.');
      }
      console.error('checkout error:', e);
    } finally {
      setLoading(false);
    }
  }, [items]);

  const isEmpty = items.length === 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Heading */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700">
            <span className="text-base">🧺</span>
            Giỏ hàng Mushroom Shop
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Giỏ hàng
              </h1>
              <p className="text-xs md:text-sm text-slate-600">
                Kiểm tra lại sản phẩm & số lượng trước khi thanh toán.
              </p>
            </div>
            {!isEmpty && (
              <div className="text-right text-[11px] text-slate-500">
                Đang có{' '}
                <span className="font-semibold text-slate-900">
                  {totalQty}
                </span>{' '}
                sản phẩm · Tạm tính{' '}
                <span className="font-semibold text-slate-900">
                  {formatVND(subtotal)}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Empty state */}
        {isEmpty ? (
          <section className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 px-6 text-center space-y-3">
            <div className="text-4xl">🍄</div>
            <p className="text-sm text-slate-600">
              Giỏ hàng của bạn đang trống.
            </p>
            <p className="text-[11px] text-slate-500">
              Khám phá các loại nấm tươi, khô, dược liệu với nguồn gốc rõ ràng
              và giao hàng nhanh chóng.
            </p>
            <div className="mt-2 flex justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-5 text-[12px] font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Mua sắm ngay
              </Link>
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                Về trang chủ
              </Link>
            </div>
          </section>
        ) : (
          // Cart content
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left: items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((it) => (
                <div
                  key={it.sku}
                  className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur px-4 py-3 shadow-sm flex flex-col"
                >
                  <CartItemRow
                    item={it}
                    onChangeQty={(q) => setQty(it.sku, q)}
                    onRemove={() => removeItem(it.sku)}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-500 hover:underline"
              >
                ✕ Xoá tất cả
              </button>
            </div>

            {/* Right: summary */}
            <aside className="rounded-2xl border border-slate-100 bg-white/90 backdrop-blur px-5 py-5 shadow-sm space-y-4 h-fit">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-slate-500">Tổng số lượng</div>
                <div className="text-sm font-semibold text-slate-900">
                  {totalQty}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="font-semibold text-slate-900">
                    {formatVND(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Giảm giá</span>
                  <span>0₫</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Vận chuyển (ước tính)</span>
                  <span>Tính ở bước sau</span>
                </div>
              </div>

              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {err}
                </div>
              )}

              <button
                type="button"
                onClick={onCheckout}
                disabled={loading || isEmpty}
                className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 text-[13px] font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? 'Đang tạo phiên thanh toán…'
                  : 'Tiến hành thanh toán'}
              </button>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Phí vận chuyển và thông tin nhận hàng sẽ được xác nhận ở bước tiếp
                theo. Thanh toán an toàn qua Stripe Sandbox.
              </p>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
