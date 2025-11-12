'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '../../hooks/useCart';
import { createCheckoutSession } from '../../lib/api';

export default function CheckoutButton() {
  const { items } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  // Map đúng payload backend cần: [{ sku, qty }]
  const lineItems = useMemo(
    () => items.map(i => ({ sku: i.sku, qty: i.qty })),
    [items]
  );

  const canCheckout = lineItems.length > 0 && !loading;

  const onCheckout = async () => {
    if (!canCheckout) return;
    setLoading(true);
    try {
      // Gọi endpoint thật. Backend trả { id, url, orderId? }
      const { url, orderId } = await createCheckoutSession(lineItems, undefined,);

      // Lưu lại orderId (để trang success dùng khi cổng thanh toán không trả query)
      if (orderId) {
        try { localStorage.setItem('lastOrderId', orderId); } catch {}
      }

      // Điều hướng sang trang thanh toán do backend/cổng trả về
      if (url && /^https?:\/\//i.test(url)) {
        window.location.href = url;
      } else {
        // Fallback an toàn: nếu backend trả URL tương đối hoặc thiếu,
        // đẩy về success để không kẹt UX.
        router.replace('/checkout/success');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      // Fallback UX: đưa về /checkout/success để user thấy thông báo & đơn (nếu đã tạo)
      router.replace('/checkout/success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onCheckout}
      disabled={!canCheckout}
      className="w-full inline-flex items-center justify-center rounded-lg bg-black px-4 py-3 text-white
                 hover:opacity-90 disabled:opacity-50"
      title={canCheckout ? 'Tiến hành thanh toán' : 'Giỏ hàng trống'}
    >
      {loading ? 'Đang tạo phiên…' : 'Tiến hành thanh toán'}
    </button>
  );
}
