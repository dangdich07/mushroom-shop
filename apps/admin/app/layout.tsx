import './globals.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminContextProvider } from './AdminContext';

const WEB_BASE = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'; // ⚙️ luôn dùng /api khi proxy

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  // 🔒 Nếu chưa có cookie => chuyển sang trang login của web chính
  if (!sessionCookie) {
    redirect(`${WEB_BASE}/login?returnTo=/admin`);
  }

  /**
   * 🧠 Sửa lỗi "Failed to parse URL":
   * Khi chạy server-side, phải build absolute URL (có http://)
   */
  const baseUrl =
    typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_ADMIN_URL
        ? `${process.env.NEXT_PUBLIC_ADMIN_URL}/api`
        : 'http://localhost:3001/api'
      : '/api';

  const res = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${sessionCookie}` },
    cache: 'no-store',
  });

  // ❌ Token sai hoặc hết hạn => chuyển sang login web chính
  if (!res.ok) {
    redirect(`${WEB_BASE}/login?returnTo=/admin`);
  }

  const data = await res.json();
  const user = data.user || null;

  // ❌ Nếu không phải admin => quay lại trang chủ web chính
  if (!user || !user.roles?.includes('admin')) {
    redirect(WEB_BASE);
  }

  // ✅ Cho phép vào: truyền dữ liệu user xuống Context
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50">
        <AdminContextProvider value={{ user }}>
          <main className="p-6">{children}</main>
        </AdminContextProvider>
      </body>
    </html>
  );
}
