// apps/web/app/(checkout)/checkout/success/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Order = { _id: string; status: string };

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = useMemo(() => sp.get('orderId') || '', [sp]);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!orderId) return;
    let alive = true;

    async function tick() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include', cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Order;
        if (!alive) return;
        setOrder(data);
        // Nếu muốn tự động về trang đơn khi đã paid:
        // if (data.status === 'paid') router.replace(`/orders/${orderId}`);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Fetch error');
      }
    }

    tick();
    const iv = setInterval(tick, 2000);
    const stop = setTimeout(() => clearInterval(iv), 30000);

    return () => { alive = false; clearInterval(iv); clearTimeout(stop); };
  }, [orderId, router]);

  if (!orderId) return <main className="p-6">Thiếu <code>orderId</code> trong URL.</main>;

  return (
    <main className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Thanh toán thành công (đang cập nhật)</h1>
      <p>Đang kiểm tra trạng thái đơn hàng <b>#{orderId}</b>…</p>

      {error && <p className="text-red-600 text-sm">Lỗi: {error}</p>}
      {order && (
        <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(order, null, 2)}
        </pre>
      )}

      <div className="space-x-3">
        <a
          href={`/orders/${orderId}`}
          className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-black text-white hover:opacity-90"
        >
          Xem đơn hàng
        </a>
        <a
          href="/"
          className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50"
        >
          Về trang chủ
        </a>
      </div>
    </main>
  );
}
