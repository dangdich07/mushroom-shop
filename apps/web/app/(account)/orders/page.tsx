// apps/web/app/(account)/orders/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { authOptions } from '../../../lib/auth-options';
import { getJSON } from '../../../lib/api';
import OrderListItem from '../../../components/account/OrderListItem';

type Order = {
  _id?: string;
  id?: string;
  createdAt?: string;
  status?: string;
  totals?: { grand?: number };
};

async function fetchOrders(session: any): Promise<Order[]> {
  const tries = ['/orders/my', '/orders?mine=1', '/orders'];

  for (const path of tries) {
    try {
      const data = await getJSON<any>(path, session);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
    } catch {
      // ignore and try next
    }
  }
  return [];
}

function currency(v?: number) {
  if (typeof v !== 'number') return '—';
  try {
    return v.toLocaleString('vi-VN') + ' ₫';
  } catch {
    return `${v} ₫`;
  }
}

function humanStatus(st?: string) {
  switch (st) {
    case 'paid':
      return ['Đã thanh toán', 'bg-emerald-100 text-emerald-700'];
    case 'pending_payment':
      return ['Chờ thanh toán', 'bg-amber-100 text-amber-800'];
    case 'canceled':
      return ['Đã huỷ', 'bg-gray-100 text-gray-500'];
    case 'failed':
      return ['Thanh toán lỗi', 'bg-red-100 text-red-700'];
    case 'refunded':
      return ['Đã hoàn tiền', 'bg-sky-100 text-sky-700'];
    default:
      return [st || 'Không rõ', 'bg-gray-100 text-gray-600'];
  }
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/account/orders');
  }

  const orders = await fetchOrders(session as any);

  const total = orders.length;
  const paid = orders.filter((o) => o.status === 'paid').length;
  const pending = orders.filter((o) => o.status === 'pending_payment').length;

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Đơn hàng của tôi
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Xem lịch sử mua hàng với tài khoản{' '}
          <span className="font-semibold text-gray-900">
            {session.user?.email}
          </span>
          .
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm flex flex-col gap-1">
          <span className="text-xs text-gray-500">Tổng số đơn</span>
          <span className="text-2xl font-semibold">{total}</span>
        </div>
        <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm flex flex-col gap-1">
          <span className="text-xs text-gray-500">Đã thanh toán</span>
          <span className="text-2xl font-semibold text-emerald-600">
            {paid}
          </span>
        </div>
        <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm flex flex-col gap-1">
          <span className="text-xs text-gray-500">Chờ thanh toán</span>
          <span className="text-2xl font-semibold text-amber-600">
            {pending}
          </span>
        </div>
      </section>

      {/* List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Lịch sử đơn hàng</h2>
          {orders.length > 0 && (
            <p className="text-xs text-gray-500">
              Nhấn vào từng đơn để xem chi tiết &amp; thanh toán lại nếu cần.
            </p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-white px-6 py-8 text-center text-gray-500">
            <p className="mb-3">Bạn chưa có đơn hàng nào.</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => {
              const id = String(o._id || o.id);
              const [label, badgeClass] = humanStatus(o.status);
              const created =
                o.createdAt &&
                new Date(o.createdAt).toLocaleString('vi-VN', {
                  hour12: false,
                });

              return (
                <li
                  key={id}
                  className="group rounded-2xl border bg-white px-4 py-3 sm:px-5 sm:py-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        # {id.slice(-8)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeClass}`}
                      >
                        {label}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {created || 'Thời gian không xác định'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Tổng thanh toán</div>
                      <div className="text-sm font-semibold">
                        {currency(o.totals?.grand)}
                      </div>
                    </div>
                    <Link
                      href={`/orders/${id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium text-gray-800 bg-gray-50 group-hover:bg-black group-hover:text-white transition whitespace-nowrap"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
