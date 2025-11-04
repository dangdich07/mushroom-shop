'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../../../hooks/useCart';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { clear } = useCart(); // <-- thêm

  const [orderId, setOrderId] = useState<string | null>(null);
  const [sec, setSec] = useState(3);
  const redirected = useRef(false);
  const cleared = useRef(false); // <-- tránh clear nhiều lần

  // Lấy orderId từ query hoặc localStorage
  useEffect(() => {
    const q = search.get('orderId');
    const local = typeof window !== 'undefined' ? localStorage.getItem('lastOrderId') : null;
    const id = q || local;
    if (id) {
      setOrderId(id);
      if (local) localStorage.removeItem('lastOrderId');
    }
  }, [search]);

  // Khi đã có orderId => xoá giỏ (một lần)
  useEffect(() => {
    if (!orderId || cleared.current) return;
    cleared.current = true;
    clear(); // <-- xoá giỏ hàng để header badge cập nhật ngay
  }, [orderId, clear]);

  // Đếm ngược hiển thị
  useEffect(() => {
    if (!orderId) return;
    setSec(3);
    const iv = setInterval(() => setSec(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [orderId]);

  // Redirect sau 3s
  useEffect(() => {
    if (!orderId || redirected.current) return;
    redirected.current = true;
    const to = setTimeout(() => { router.replace(`/orders/${orderId}`); }, 3000);
    return () => clearTimeout(to);
  }, [orderId, router]);

  return (
    <main className="max-w-xl mx-auto p-6 text-center space-y-6">
      <div className="text-5xl">✅</div>
      <h1 className="text-2xl font-bold">Thanh toán thành công</h1>

      {orderId ? (
        <>
          <p className="text-gray-700">
            Cảm ơn bạn! Đơn hàng <span className="font-mono font-semibold">#{orderId}</span> đã được tạo.
          </p>
          <p className="text-gray-500">Tự động chuyển tới chi tiết đơn hàng sau <b>{sec}</b>s…</p>
          <div className="flex items-center justify-center gap-3">
            <Link href={`/orders/${orderId}`} className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-black text-white hover:opacity-90">
              Xem đơn hàng ngay
            </Link>
            <Link href="/products" className="inline-flex items-center rounded-lg px-4 py-2 text-sm border hover:bg-white">
              Tiếp tục mua sắm
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-600">Không tìm thấy <span className="font-mono">orderId</span>.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/" className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-black text-white hover:opacity-90">
              Về trang chủ
            </Link>
            <Link href="/account/orders" className="inline-flex items-center rounded-lg px-4 py-2 text-sm border hover:bg-white">
              Đơn hàng của tôi
            </Link>
          </div>
        </>
      )}

      <p className="text-xs text-gray-400">
        Nếu cần hỗ trợ, vui lòng liên hệ <a className="underline" href="/contact">chăm sóc khách hàng</a>.
      </p>
    </main>
  );
}
