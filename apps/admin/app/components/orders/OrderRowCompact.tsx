// apps/admin/app/components/orders/OrderRowCompact.tsx
'use client';

import { Order, formatVND, formatDate } from './types';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrderRowCompact({
  order,
  onClick,
}: {
  order: Order;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
    >
      <div className="space-y-0.5">
        <div className="text-sm font-semibold text-slate-900">
          #{order._id}
        </div>
        <div className="text-[10px] text-slate-500">
          UID: {order.userId || '—'} · {formatDate(order.createdAt)}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="font-semibold text-slate-900">
          {formatVND(order.totals?.grand)}
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
    </button>
  );
}
