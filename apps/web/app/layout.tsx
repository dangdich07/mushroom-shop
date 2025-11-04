// apps/web/app/layout.tsx
import '../styles/globals.css';
import type { Metadata } from 'next';

import ClientProviders from '../components/ClientProviders';
import CartProvider from '../components/cart/CartProvider';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'Mushroom Shop',
  description: 'Cửa hàng nấm – Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      {/* Tailwind v4: không cần className trên html */}
      <body className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        {/* NextAuth SessionProvider + (nếu có) ThemeProvider… đặt trong ClientProviders */}
        <ClientProviders>
          {/* Toàn bộ giỏ hàng (context + localStorage) */}
          <CartProvider>
            {/* Header luôn ở trên */}
            <Header />
            {/* Nội dung trang sẽ giãn ra để đẩy Footer xuống đáy */}
            <main className="flex-1">{children}</main>
            {/* 👇 Bạn đã import nhưng quên render — giờ hiển thị footer ở mọi trang */}
            <Footer />
          </CartProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
