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

    // chỉ lấy item hợp lệ
    const payload = items
      .filter(it => it.sku && it.qty > 0)
      .map(it => ({ sku: it.sku, qty: it.qty }));

    if (!payload.length) {
      setErr('Không có mặt hàng hợp lệ để thanh toán.');
      return;
    }

    try {
      setLoading(true);
      const { url, orderId } = await createCheckoutSession(payload);
      try { localStorage.setItem('lastOrderId', String(orderId)); } catch {}
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

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Giỏ hàng</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center space-y-3">
          <p className="text-gray-600">Giỏ hàng của bạn đang trống.</p>
          <Link href="/products" className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-white">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-3">
            {items.map((it) => (
              <CartItemRow
                key={`${it.sku}`}
                item={it}
                onChangeQty={(q) => setQty(it.sku, q)}
                onRemove={() => removeItem(it.sku)}
              />
            ))}
            <button onClick={clear} className="text-sm text-gray-600 hover:underline">
              Xoá tất cả
            </button>
          </section>

          <aside className="rounded-xl border bg-white p-6 space-y-4 h-fit">
            <div className="flex justify-between text-sm">
              <span>Tổng số lượng</span>
              <span className="font-medium">{totalQty}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Tạm tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>

            {err && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            <button
              type="button"
              onClick={onCheckout}
              disabled={loading || items.length === 0}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-black text-white disabled:opacity-50 hover:opacity-90"
            >
              {loading ? 'Đang tạo phiên thanh toán…' : 'Tiến hành thanh toán'}
            </button>

            <p className="text-xs text-gray-500">Phí vận chuyển tính ở bước sau.</p>
          </aside>
        </div>
      )}
    </main>
  );
}
