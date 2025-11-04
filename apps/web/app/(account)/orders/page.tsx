// apps/web/app/(account)/orders/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth-options';
import { getJSON } from '../../../lib/api';
import OrderListItem from '../../../components/account/OrderListItem';

type Order = any;

async function fetchOrders(session: any): Promise<Order[]> {
  // Thử lần lượt để tương thích nhiều backend:
  // 1) /orders/my      2) /orders?mine=1      3) /orders
  // Mỗi endpoint kỳ vọng trả { items: [...] } hoặc mảng trực tiếp
  const tries = ['/orders/my', '/orders?mine=1', '/orders'];

  for (const path of tries) {
    try {
      const data = await getJSON<any>(path, session);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
    } catch {
      // thử endpoint tiếp theo
    }
  }
  return [];
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // bảo vệ trang danh sách đơn hàng
    redirect('/login?callbackUrl=/account/orders');
  }

  const orders = await fetchOrders(session as any);

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
        <p className="text-gray-600">Xem các đơn hàng đã đặt bằng tài khoản: <span className="font-medium">{session.user?.email}</span></p>
      </div>

      {orders.length === 0 ? (
        <div className="text-gray-500 border rounded-lg p-6">
          Chưa có đơn hàng nào.
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o: any) => (
            <li key={o._id || o.id}>
              <OrderListItem order={o} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
