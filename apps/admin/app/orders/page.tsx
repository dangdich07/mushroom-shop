'use client';

import { useState } from 'react';
import { OrdersRecent } from '../components/orders/OrdersRecent';
import { OrdersTableFull } from '../components/orders/OrdersTableFull';
import {
  ADMIN_API_BASE,
  Order,
  formatDate,
  formatVND,
} from '../components/orders/types';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import BackButton from '../components/BackButton';
export default function AdminOrdersPage() {
  const [recentDetail, setRecentDetail] = useState<Order | null>(null);

  // Khi chọn 1 đơn trong "Đơn hàng gần đây"
  async function handleSelectRecent(order: Order) {
    try {
      const res = await fetch(
        `${ADMIN_API_BASE.replace(
          /\/$/,
          ''
        )}/admin/orders/${order._id}`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const full = (await res.json()) as Order;
        setRecentDetail({ ...order, ...full });
      } else {
        setRecentDetail(order);
      }
    } catch {
      setRecentDetail(order);
    }
  }

  return (
    <div className="space-y-6">
      <BackButton label="Quay lại trang chính" />
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-slate-600">
            Xem nhanh đơn gần đây và quản lý toàn bộ đơn hàng, trạng
            thái &amp; vận chuyển.
          </p>
        </div>
      </header>

      {/* Đơn gần đây (3 đơn) */}
      <OrdersRecent onSelect={handleSelectRecent} />

      {/* Tất cả đơn hàng (luôn hiển thị, UI compact) */}
      <OrdersTableFull show />

      {/* Drawer chi tiết cho đơn gần đây */}
      {recentDetail && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div>
                <div className="text-[9px] text-slate-500">
                  Chi tiết đơn hàng gần đây
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  #{recentDetail._id}
                </div>
              </div>
              <button
                onClick={() => setRecentDetail(null)}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-700 hover:bg-slate-200"
              >
                Đóng ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-[10px] text-slate-700">
              <div className="space-y-1">
                <div>UID: {recentDetail.userId || '—'}</div>
                <div>
                  Tạo lúc: {formatDate(recentDetail.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <span>Trạng thái:</span>
                  <OrderStatusBadge status={recentDetail.status} />
                </div>
                {recentDetail.payment?.id && (
                  <div>Payment ID: {recentDetail.payment.id}</div>
                )}
                {recentDetail.payment?.status && (
                  <div>
                    Payment status: {recentDetail.payment.status}
                  </div>
                )}
              </div>

              <div className="border-t pt-2">
                <div className="mb-1 font-semibold">
                  Sản phẩm
                </div>
                {recentDetail.items?.length ? (
                  <div className="space-y-1">
                    {recentDetail.items.map((it, i) => (
                      <div
                        key={i}
                        className="flex justify-between gap-2"
                      >
                        <div>
                          <div className="font-medium">
                            {it.sku}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {it.qty} × {formatVND(it.price)}
                          </div>
                        </div>
                        <div className="text-[9px] font-semibold">
                          {formatVND(it.qty * it.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-400">
                    Không có chi tiết sản phẩm.
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Tổng cộng</span>
                <span>{formatVND(recentDetail.totals?.grand)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end border-t px-4 py-2 text-[9px]">
              <button
                onClick={() => setRecentDetail(null)}
                className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-medium text-white hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
