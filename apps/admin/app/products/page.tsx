'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getJSON, deleteJSON } from '../../lib/api';
import BackButton from '../components/BackButton';

interface Product {
  _id: string;
  name: string;
  slug?: string;
  category?: string;
  active?: boolean;
  featured?: boolean;
  createdAt?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getJSON<{ items: Product[] }>('/products');
        setProducts(data.items);
      } catch (err) {
        console.error('❌ Lỗi tải danh sách sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}" không?`)) return;
    setDeleting(id);

    try {
      await deleteJSON(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      alert('✅ Đã xóa sản phẩm thành công!');
    } catch (err) {
      console.error('❌ Lỗi khi xóa sản phẩm:', err);
      alert('❌ Xóa thất bại. Kiểm tra lại server hoặc quyền truy cập.');
    } finally {
      setDeleting(null);
    }
  };

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.active).length;
    const featured = products.filter(p => p.featured).length;
    return { total, active, featured };
  }, [products]);

  if (loading)
    return (
      <p className="p-6 text-sm text-slate-500">
        Đang tải dữ liệu sản phẩm...
      </p>
    );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Back */}
      <BackButton label="Quay lại trang chính" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium text-slate-50">
            <span>🍄 Quản lý sản phẩm</span>
            <span className="rounded-full bg-white/10 px-2">
              Tổng: {stats.total}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Danh sách sản phẩm
          </h1>
          <p className="text-sm text-slate-600">
            Quản lý trạng thái, danh mục và nội dung hiển thị của toàn bộ sản
            phẩm trong cửa hàng.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex gap-2 text-[10px] text-slate-500">
            <span className="rounded-full bg-slate-50 px-3 py-1">
              Đang hoạt động: <b>{stats.active}</b>
            </span>
            <span className="rounded-full bg-yellow-50 px-3 py-1">
              Nổi bật: <b>{stats.featured}</b>
            </span>
          </div>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 hover:shadow"
          >
            <span>➕ Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Tất cả sản phẩm
            </h2>
            <p className="text-[11px] text-slate-500">
              Nhấn vào Sửa để cập nhật chi tiết, hoặc Xem để mở trang riêng.
            </p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Sản phẩm
                  </th>
                  <th className="px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Danh mục
                  </th>
                  <th className="px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Ngày tạo
                  </th>
                  <th className="px-5 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {products.map(product => (
                  <tr
                    key={product._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Tên + slug */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 text-white text-lg">
                          🍄
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-slate-900">
                            {product.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {product.slug || '—'}
                          </div>
                          {product.featured && (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-700">
                              ★ Nổi bật
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Danh mục */}
                    <td className="px-5 py-3 align-top text-xs text-slate-700">
                      {product.category || (
                        <span className="text-slate-400">
                          Chưa phân loại
                        </span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-5 py-3 align-top">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          product.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.active
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {product.active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>

                    {/* Ngày tạo */}
                    <td className="px-5 py-3 align-top text-xs text-slate-500">
                      {product.createdAt
                        ? new Date(
                            product.createdAt
                          ).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 align-top text-right text-[11px]">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/products/${product._id}`}
                          target="_blank"
                          className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-700 hover:bg-slate-100"
                        >
                          👁️ Xem
                        </Link>
                        <Link
                          href={`/products/${product._id}/edit`}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 hover:bg-emerald-100"
                        >
                          ✏️ Sửa
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.name)
                          }
                          disabled={deleting === product._id}
                          className={`rounded-full px-2.5 py-1 ${
                            deleting === product._id
                              ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          {deleting === product._id
                            ? 'Đang xoá...'
                            : '🗑 Xoá'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Chưa có sản phẩm nào trong hệ thống.
          </div>
        )}
      </div>
    </div>
  );
}
