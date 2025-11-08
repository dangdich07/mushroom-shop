// apps/admin/app/components/orders/OrderStatusBadge.tsx
'use client';

import { statusBadgeClass } from './types';

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] ' +
        statusBadgeClass(status)
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
