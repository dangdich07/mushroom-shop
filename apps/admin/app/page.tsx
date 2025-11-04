'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJSON } from './../lib/api';
import { useAdmin } from './AdminContext';

interface Product {
  _id: string;
  name: string;
  category?: string;
  featured?: boolean;
  active?: boolean;
  createdAt?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Order {
  _id: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    featuredProducts: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);

  // ✅ sửa: dùng number thay vì NodeJS.Timer
  const refreshTimer = useRef<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const sessionToken =
        document.cookie
          .split('; ')
          .find((r) => r.startsWith('session='))?.split('=')[1] || '';

      const authHeader = sessionToken
        ? { Authorization: `Bearer ${sessionToken}` }
        : undefined;

      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        getJSON<{ items: Product[] }>('/products', { headers: authHeader }),
        getJSON<{ items: Category[] }>('/categories', { headers: authHeader }),
        getJSON<{ items: Order[] }>('/orders', { headers: authHeader }).catch(
          () => ({ items: [] as Order[] })
        ),
      ]);

      const items = productsRes.items ?? [];
      const featured = items.filter((p) => p.featured).length;

      setStats({
        totalProducts: items.length,
        totalCategories: categoriesRes.items?.length ?? 0,
        totalOrders: ordersRes.items?.length ?? 0,
        featuredProducts: featured,
      });

      setProducts(items);
    } catch (err) {
      console.error('❌ Lỗi tải dữ liệu dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // ✅ sửa: dùng window.setInterval và window.clearInterval
    refreshTimer.current = window.setInterval(fetchData, 30_000);
    return () => {
      if (refreshTimer.current !== null) {
        window.clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, []);

  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 5);
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600">
            Xin chào, <span className="font-medium">{user?.email || 'Admin'}</span>
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          title="Làm mới số liệu"
        >
          {loading ? 'Đang tải…' : '↻ Làm mới'}
        </button>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Tổng sản phẩm',
            value: stats.totalProducts,
            icon: '🍄',
            color: 'bg-blue-100',
            link: '/products',
          },
          {
            label: 'Danh mục',
            value: stats.totalCategories,
            icon: '📁',
            color: 'bg-green-100',
            link: '/categories',
          },
          {
            label: 'Sản phẩm nổi bật',
            value: stats.featuredProducts,
            icon: '⭐',
            color: 'bg-yellow-100',
            link: '/products?featured=true',
          },
          {
            label: 'Tổng đơn hàng',
            value: stats.totalOrders,
            icon: '📦',
            color: 'bg-purple-100',
            link: '/orders',
          },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => router.push(stat.link)}
            className="group bg-white p-6 rounded-lg shadow flex items-center hover:shadow-lg hover:-translate-y-0.5 transition"
          >
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="ml-4 text-left">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '…' : stat.value}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Sản phẩm gần đây */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Sản phẩm gần đây</h2>
          <a href="/products" className="text-sm text-blue-600 hover:underline">
            Xem tất cả →
          </a>
        </div>
        <div className="p-6">
          {recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.category || '—'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {product.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Nổi bật
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        product.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              {loading ? 'Đang tải…' : 'Chưa có sản phẩm nào'}
            </p>
          )}
        </div>
      </div>

      {/* Thao tác nhanh */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/products/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">➕</div>
            <div>
              <p className="font-medium text-gray-900">Thêm sản phẩm</p>
              <p className="text-sm text-gray-600">Tạo sản phẩm mới</p>
            </div>
          </a>

          <a
            href="/categories/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">📁</div>
            <div>
              <p className="font-medium text-gray-900">Thêm danh mục</p>
              <p className="text-sm text-gray-600">Tạo danh mục mới</p>
            </div>
          </a>

          <a
            href="/upload"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">📷</div>
            <div>
              <p className="font-medium text-gray-900">Upload ảnh</p>
              <p className="text-sm text-gray-600">Quản lý hình ảnh</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
