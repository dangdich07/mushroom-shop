import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../../lib/auth-options';
import { getJSON } from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import PayButton from '../PayButton';


// -----------------------
// Types + helpers
// -----------------------
type OrderItem = { sku: string; qty: number; price: number };
type Order = {
  _id: string;
  userId?: string;
  items: OrderItem[];
  totals: { sub: number; discount?: number; ship?: number; tax?: number; grand: number };
  status: 'pending_payment' | 'paid' | 'failed' | 'canceled' | 'refunded';
  payment: { provider: 'stripe'; id: string | null; status: string };
  createdAt?: string;
  updatedAt?: string;
};

function formatVND(n: number) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  } catch {
    return `${n.toLocaleString('vi-VN')} ₫`;
  }
}

function StatusPill({ status }: { status: Order['status'] }) {
  const map: Record<Order['status'], string> = {
    pending_payment:
      'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
    paid:
      'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    failed:
      'bg-red-100 text-red-800 ring-1 ring-red-200',
    canceled:
      'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
    refunded:
      'bg-purple-100 text-purple-800 ring-1 ring-purple-200',
  };
  const label: Record<Order['status'], string> = {
    pending_payment: 'pending_payment',
    paid: 'paid',
    failed: 'failed',
    canceled: 'canceled',
    refunded: 'refunded',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

// -----------------------
// Client button: Pay
// -----------------------
// function PayButton({ orderId, disabled }: { orderId: string; disabled?: boolean }) {
//   'use client';
//   const [loading, setLoading] = require('react').useState(false);

//   const onPay = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/orders/${orderId}/checkout`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//       });
//       if (!res.ok) {
//         const text = await res.text().catch(() => '');
//         alert(`Không tạo được phiên thanh toán.\n${text}`);
//         return;
//       }
//       const data = await res.json();
//       if (data?.url) window.location.href = data.url;
//       else alert('Không nhận được URL thanh toán từ máy chủ.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Button
//       onClick={onPay}
//       disabled={disabled || loading}
//       className="h-9 px-4 rounded-lg bg-black text-white hover:opacity-90"
//     >
//       {loading ? 'Đang chuyển...' : 'Thanh toán'}
//     </Button>
//   );
// }

// -----------------------
// Page (Server Component)
// -----------------------
export default async function OrderDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?returnTo=/orders/${params.id}`);

  const order = await getJSON<Order>(`/orders/${params.id}`, session as any);

  const shortId = `#${String(order._id).slice(0, 12)}`;
  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString('vi-VN')
    : undefined;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Đơn hàng {shortId}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <span>Trạng thái:</span>
            <StatusPill status={order.status} />
            {createdAt && <span className="ml-2 text-gray-400">• Tạo lúc {createdAt}</span>}
          </div>
        </div>

        {/* {order.status === 'pending_payment' && (
          <PayButton orderId={order._id} />
        )} */}
      </div>

      {/* Content */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm ring-1 ring-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Sản phẩm</h2>
          </div>
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Số lượng</th>
                  <th className="py-2">Đơn giá</th>
                  <th className="py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((it) => (
                  <tr key={`${it.sku}-${it.price}`}>
                    <td className="py-2 font-medium text-gray-900">{it.sku}</td>
                    <td className="py-2">{it.qty}</td>
                    <td className="py-2">{formatVND(it.price)}</td>
                    <td className="py-2 text-right font-medium">
                      {formatVND(it.price * it.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary */}
        <aside className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 h-fit">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Tổng kết thanh toán</h2>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium">{formatVND(order.totals.sub)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giảm giá</span>
              <span className="font-medium">{formatVND(order.totals.discount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vận chuyển</span>
              <span className="font-medium">{formatVND(order.totals.ship || 0)}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-600">Thuế</span>
              <span className="font-medium">{formatVND(order.totals.tax || 0)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-900 font-semibold">Tổng cộng</span>
              <span className="text-lg font-semibold">{formatVND(order.totals.grand)}</span>
            </div>

            {order.status === 'pending_payment' && (
              <div className="pt-3">
                <PayButton orderId={order._id} />
                <p className="mt-2 text-xs text-gray-500">
                  Bạn sẽ được chuyển sang cổng thanh toán an toàn.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Debug collapsible (tùy chọn) */}
      {/* <details className="mt-8 bg-gray-50 rounded-lg p-4 text-xs text-gray-700">
        <summary className="cursor-pointer font-medium">Xem JSON chi tiết (debug)</summary>
        <pre className="mt-3 overflow-auto">{JSON.stringify(order, null, 2)}</pre>
      </details> */}
    </main>
  );
}
