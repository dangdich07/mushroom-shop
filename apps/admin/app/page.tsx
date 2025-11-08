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

interface OrdersListResponse {
  items: Order[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
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
        getJSON<OrdersListResponse>('/admin/orders?page=1&pageSize=1', {
          headers: authHeader,
        }).catch(() => ({
          items: [] as Order[],
          pagination: { total: 0, page: 1, pageSize: 1, pages: 1 },
        })),
      ]);

      const items = productsRes.items ?? [];
      const featured = items.filter((p) => p.featured).length;

      setStats({
        totalProducts: items.length,
        totalCategories: categoriesRes.items?.length ?? 0,
        totalOrders:
          ordersRes.pagination?.total ??
          ordersRes.items?.length ??
          0,
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
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-medium text-white shadow-sm">
            <span className="text-xs">📊</span>
            <span>Dashboard Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Xin chào, {user?.email || 'Admin'}
          </h1>
          <p className="text-sm text-slate-500">
            Tổng quan nhanh sản phẩm, đơn hàng và thao tác quản lý trong Mushroom Shop.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 hover:shadow transition"
          title="Làm mới số liệu"
        >
          <span className={loading ? 'animate-spin' : ''}>↻</span>
          <span>{loading ? 'Đang tải dữ liệu…' : 'Làm mới'}</span>
        </button>
      </header>

      {/* STATS CARDS */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Tổng sản phẩm',
            value: stats.totalProducts,
            icon: '🍄',
            color: 'bg-sky-50 text-sky-700',
            chip: '+ sản phẩm',
            link: '/products',
          },
          {
            label: 'Danh mục',
            value: stats.totalCategories,
            icon: '📁',
            color: 'bg-emerald-50 text-emerald-700',
            chip: 'Nhóm sản phẩm',
            link: '/categories',
          },
          {
            label: 'Sản phẩm nổi bật',
            value: stats.featuredProducts,
            icon: '⭐',
            color: 'bg-amber-50 text-amber-700',
            chip: 'Đang được đẩy mạnh',
            link: '/products?featured=true',
          },
          {
            label: 'Tổng đơn hàng',
            value: stats.totalOrders,
            icon: '📦',
            color: 'bg-violet-50 text-violet-700',
            chip: 'Đếm theo hệ thống',
            link: '/orders',
          },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => router.push(s.link)}
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm ring-0 transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.color}`}
              >
                <span className="text-xl leading-none">{s.icon}</span>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {s.label}
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {loading ? '…' : s.value}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] text-slate-500">
                {s.chip}
              </span>
              <span className="text-[9px] text-slate-400 group-hover:text-slate-700">
                Xem chi tiết →
              </span>
            </div>
          </button>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* RECENT PRODUCTS */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Sản phẩm gần đây
              </h2>
              <p className="text-[11px] text-slate-500">
                5 sản phẩm được tạo hoặc cập nhật gần nhất.
              </p>
            </div>
            <a
              href="/products"
              className="text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Xem tất cả →
            </a>
          </div>

          <div className="px-5 py-3">
            {recentProducts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {product.category || 'Chưa có danh mục'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {product.featured && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-700">
                          Nổi bật
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                          product.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {product.active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                {loading
                  ? 'Đang tải danh sách sản phẩm…'
                  : 'Chưa có sản phẩm nào.'}
              </p>
            )}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-900">
              Thao tác nhanh
            </h2>
            <p className="text-[11px] text-slate-500">
              Tạo mới & quản lý nội dung chỉ với một cú nhấp.
            </p>
          </div>

          <a
            href="/products/new"
            className="flex items-center gap-3 rounded-xl0 border border-slate-100 bg-slate-50/60 px-3 py-3 text-xs text-slate-800 hover:bg-slate-100 hover:shadow-sm transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700 text-lg">
              ➕
            </div>
            <div>
              <div className="font-semibold">Thêm sản phẩm</div>
              <div className="text-[10px] text-slate-500">
                Tạo sản phẩm mới cho cửa hàng.
              </div>
            </div>
          </a>

          <a
            href="/categories/new"
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 text-xs text-slate-800 hover:bg-slate-100 hover:shadow-sm transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-lg">
              📁
            </div>
            <div>
              <div className="font-semibold">Thêm danh mục</div>
              <div className="text-[10px] text-slate-500">
                Sắp xếp sản phẩm rõ ràng hơn.
              </div>
            </div>
          </a>

          <a
            href="/upload"
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 text-xs text-slate-800 hover:bg-slate-100 hover:shadow-sm transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700 text-lg">
              📷
            </div>
            <div>
              <div className="font-semibold">Upload ảnh</div>
              <div className="text-[10px] text-slate-500">
                Quản lý media cho sản phẩm & banner.
              </div>
            </div>
          </a>
        </section>
      </div>
    </div>
  );
}
