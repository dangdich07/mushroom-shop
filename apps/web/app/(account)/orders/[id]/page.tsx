import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../../lib/auth-options';
import { getJSON } from '../../../../lib/api';

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?returnTo=/orders/${params.id}`);

  const order = await getJSON<any>(`/orders/${params.id}`, session as any);

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-2">Đơn hàng #{params.id}</h1>
      <div className="text-gray-700">Trạng thái: {order.status}</div>
      <pre className="mt-4 bg-gray-50 p-3 rounded text-sm overflow-auto">
        {JSON.stringify(order, null, 2)}
      </pre>
    </main>
  );
}
