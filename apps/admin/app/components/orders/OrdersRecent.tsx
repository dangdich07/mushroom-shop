'use client';

import { useEffect, useState } from 'react';
import {
  ADMIN_API_BASE,
  ListResponse,
  Order,
} from './types';
import { OrderRowCompact } from './OrderRowCompact';

const LIMIT = 3; // chỉ 3 đơn gần đây

export function OrdersRecent({
  onSelect,
}: {
  onSelect?: (o: Order) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // dùng page/pageSize của adminListOrders
        const res = await fetch(
          `${ADMIN_API_BASE.replace(
            /\/$/,
            ''
          )}/admin/orders?page=1&pageSize=${LIMIT}`,
          { credentials: 'include' }
        );

        const data: ListResponse | Order[] = await res.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];

        setOrders(items.slice(0, LIMIT));
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Đơn hàng gần đây
        </h2>
        {/* <p className="mt-0.5 text-xs text-slate-500">
          3 đơn mới nhất để bạn kiểm tra nhanh.
        </p> */}
      </div>

      {loading ? (
        <div className="px-4 py-6 text-xs text-slate-500">
          Đang tải đơn gần đây…
        </div>
      ) : !orders.length ? (
        <div className="px-4 py-6 text-xs text-slate-500">
          Chưa có đơn hàng nào.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {orders.map((o) => (
            <OrderRowCompact
              key={o._id}
              order={o}
              onClick={onSelect ? () => onSelect(o) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
