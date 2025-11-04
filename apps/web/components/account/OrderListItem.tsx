// apps/web/components/account/OrderListItem.tsx
import Link from 'next/link';

function formatVND(n?: number) {
  if (typeof n !== 'number') return '—';
  return n.toLocaleString('vi-VN');
}

export default function OrderListItem({ order }: { order: any }) {
  const id = String(order._id || order.id);
  const qty =
    typeof order.itemsCount === 'number'
      ? order.itemsCount
      : Array.isArray(order.items)
      ? order.items.reduce((s: number, i: any) => s + (i.qty || 0), 0)
      : 0;

  const grand =
    order?.totals?.grand ??
    order?.totalsGrand ??
    (Array.isArray(order.items)
      ? order.items.reduce(
          (s: number, i: any) => s + (Number(i.price) * Number(i.qty || 0) || 0),
          0
        )
      : undefined);

  const created = order.createdAt ? new Date(order.createdAt) : null;

  return (
    <div className="border rounded-xl p-4 flex items-center justify-between">
      <div className="space-y-1">
        <div className="text-sm text-gray-500">Mã đơn</div>
        <div className="font-mono font-semibold break-all">#{id}</div>
      </div>

      <div className="hidden sm:block">
        <div className="text-sm text-gray-500">Ngày tạo</div>
        <div className="font-medium">
          {created ? created.toLocaleString('vi-VN') : '—'}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-500">Số lượng</div>
        <div className="font-medium">{qty || '—'}</div>
      </div>

      <div>
        <div className="text-sm text-gray-500">Tổng tiền</div>
        <div className="font-semibold">{formatVND(grand)}</div>
      </div>

      <div className="flex items-center gap-3">
        {order.status && (
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
            {order.status}
          </span>
        )}
        <Link
          href={`/orders/${id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
}
