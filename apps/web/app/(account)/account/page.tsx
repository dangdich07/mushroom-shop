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

function StatusBadge({ status }: { status?: string }) {
  const s = (status || '').toLowerCase();
  let text = status || '—';
  let cls =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700';

  if (s === 'paid') {
    text = 'Đã thanh toán';
    cls =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100';
  } else if (s === 'pending_payment') {
    text = 'Chờ thanh toán';
    cls =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100';
  } else if (s === 'canceled') {
    text = 'Đã huỷ';
    cls =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-100';
  }

  return <span className={cls}>{text}</span>;
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/account');

  const email = session.user?.email || '—';
  const name = session.user?.name || email.split('@')[0] || 'Khách hàng';
  const initial = (name || email || 'U').charAt(0).toUpperCase();

  const recent = await fetchMyRecentOrders(session as any);

  const totalOrders = recent.length;
  const pending = recent.filter((o) => o.status === 'pending_payment').length;
  const paid = recent.filter((o) => o.status === 'paid').length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 text-white px-5 py-5 shadow-sm">
          <div className="absolute right-6 top-4 text-[10px] text-emerald-200/70">
            Mushroom Member
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 grid place-items-center text-xl font-semibold">
              {initial}
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                Xin chào, {name}
              </h1>
              <p className="text-[11px] text-slate-100/80">
                Đang đăng nhập với email:{' '}
                <span className="font-medium text-emerald-200">{email}</span>
              </p>
              <p className="text-[10px] text-slate-200/70">
                Theo dõi đơn hàng, cập nhật thông tin và tiếp tục khám phá các
                sản phẩm nấm chất lượng.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-xs">
            <div className="text-[10px] text-slate-500">Đơn gần đây</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-slate-900">
                {totalOrders}
              </span>
              <span className="text-[10px] text-slate-400">đơn</span>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-50 bg-emerald-50/80 px-4 py-3 shadow-xs">
            <div className="text-[10px] text-emerald-700">Đã thanh toán</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-emerald-800">
                {paid}
              </span>
              <span className="text-[10px] text-emerald-600">đơn</span>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-50 bg-amber-50/80 px-4 py-3 shadow-xs">
            <div className="text-[10px] text-amber-700">Chờ thanh toán</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-amber-800">
                {pending}
              </span>
              <span className="text-[10px] text-amber-600">đơn</span>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/orders"
            className="group rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Đơn hàng của tôi
                <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition">
                  →
                </span>
              </h3>
              <p className="mt-1 text-[11px] text-slate-600">
                Xem lịch sử đặt hàng, trạng thái và chi tiết từng đơn.
              </p>
            </div>
          </Link>

          <Link
            href="/products"
            className="group rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Tiếp tục mua sắm
                <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition">
                  →
                </span>
              </h3>
              <p className="mt-1 text-[11px] text-slate-600">
                Khám phá thêm các sản phẩm nấm tươi, khô và dược liệu.
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="group rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Trang chủ
                <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition">
                  →
                </span>
              </h3>
              <p className="mt-1 text-[11px] text-slate-600">
                Về trang chủ Mushroom Shop và các chương trình nổi bật.
              </p>
            </div>
          </Link>

          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Đăng xuất an toàn
              </h3>
              <p className="mt-1 mb-3 text-[11px] text-slate-600">
                Kết thúc phiên đăng nhập hiện tại trên trình duyệt này.
              </p>
            </div>
            <SignOutButton className="inline-flex items-center rounded-xl px-46 py-2 text-[11px] font-medium bg-slate-900 text-white hover:bg-emerald-700 transition-colors" />
          </div>
        </section>

        {/* Recent orders */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Đơn hàng gần đây
            </h2>
            <Link
              href="/orders"
              className="text-[11px] text-emerald-700 hover:underline"
            >
              Xem tất cả đơn →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-4 text-[11px] text-slate-500">
              Bạn chưa có đơn hàng nào. Hãy đặt thử một đơn để trải nghiệm quy
              trình thanh toán.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 space-y-1.5">
              {recent.map((o) => {
                const id = String(o._id || o.id);
                const created =
                  o.createdAt &&
                  new Date(o.createdAt).toLocaleString('vi-VN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                return (
                  <Link
                    key={id}
                    href={`/orders/${id}`}
                    className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-medium text-slate-900">
                        Đơn #{id}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{created || '—'}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-900">
                        {currency(o.totals?.grand)}
                      </div>
                      <div className="text-[10px] text-emerald-600">
                        Xem chi tiết →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
