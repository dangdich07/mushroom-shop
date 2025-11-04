// apps/web/app/(account)/account/page.tsx
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth-options';
import { getJSON } from '../../../lib/api';
import SignOutButton from '../../../components/auth/SignOutButton';

type Order = {
  _id?: string;
  id?: string;
  createdAt?: string;
  totals?: { grand?: number };
  status?: string;
};

async function fetchMyRecentOrders(session: any): Promise<Order[]> {
  const candidates = ['/orders/my?limit=5', '/orders?mine=1&limit=5', '/orders?limit=5'];
  for (const path of candidates) {
    try {
      const data = await getJSON<any>(path, session);
      if (Array.isArray(data)) return data.slice(0, 5);
      if (Array.isArray(data?.items)) return data.items.slice(0, 5);
    } catch {}
  }
  return [];
}

function currency(v?: number) {
  if (typeof v !== 'number') return '—';
  try { return v.toLocaleString('vi-VN') + ' ₫'; } catch { return `${v} ₫`; }
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/account');

  const email = session.user?.email || '—';
  const recent = await fetchMyRecentOrders(session as any);

  const totalOrders = recent.length;
  const pending = recent.filter(o => o.status === 'pending_payment').length;
  const paid = recent.filter(o => o.status === 'paid').length;

  const initial = email ? email[0]!.toUpperCase() : 'U';

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      {/* Header */}
      <section className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-gray-100 grid place-items-center text-lg font-semibold">
          {initial}
        </div>
        <div>
          <h1 className="text-2xl font-bold">Tài khoản</h1>
          <p className="text-gray-600">Đang đăng nhập: <span className="font-medium">{email}</span></p>
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-500">Đơn gần đây</div>
          <div className="mt-1 text-2xl font-bold">{totalOrders}</div>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-500">Đã thanh toán</div>
          <div className="mt-1 text-2xl font-bold">{paid}</div>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-500">Chờ thanh toán</div>
          <div className="mt-1 text-2xl font-bold">{pending}</div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/orders"
          className="rounded-xl border p-6 hover:shadow-sm transition bg-white"
        >
          <h3 className="text-lg font-semibold">Đơn hàng của tôi</h3>
          <p className="text-gray-600 mt-1">Xem lịch sử đặt hàng và trạng thái.</p>
        </Link>

        <Link
          href="/products"
          className="rounded-xl border p-6 hover:shadow-sm transition bg-white"
        >
          <h3 className="text-lg font-semibold">Tiếp tục mua sắm</h3>
          <p className="text-gray-600 mt-1">Quay lại danh sách sản phẩm.</p>
        </Link>

        <Link
          href="/"
          className="rounded-xl border p-6 hover:shadow-sm transition bg-white"
        >
          <h3 className="text-lg font-semibold">Trang chủ</h3>
          <p className="text-gray-600 mt-1">Về trang chủ cửa hàng.</p>
        </Link>

        <div className="rounded-xl border p-6 bg-white">
          <h3 className="text-lg font-semibold">Đăng xuất</h3>
          <p className="text-gray-600 mt-1 mb-3">Kết thúc phiên đăng nhập hiện tại.</p>
          <SignOutButton className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-black text-white hover:opacity-90" />
        </div>
      </section>

      {/* Recent orders */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
          <Link href="/orders" className="text-sm text-blue-600 hover:underline">Xem tất cả →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-xl border p-6 text-gray-500 bg-white">Chưa có đơn nào.</div>
        ) : (
          <ul className="space-y-3">
            {recent.map((o) => {
              const id = String(o._id || o.id);
              return (
                <li key={id} className="rounded-xl border bg-white p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">#{id}</div>
                    <div className="text-sm text-gray-500">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '—'}
                      {' • '}
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs">
                        {o.status || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{currency(o.totals?.grand)}</div>
                    <Link href={`/orders/${id}`} className="text-sm text-blue-600 hover:underline">
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
