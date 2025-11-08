'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJSON, deleteJSON } from '../../lib/api';
import BackButton from '../components/BackButton';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [fading, setFading] = useState<string | null>(null);

  // Load danh mục
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getJSON<{ items: Category[] }>('/categories');
        setCategories(data.items || []);
      } catch (error) {
        console.error('❌ Lỗi tải danh mục:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Xóa danh mục với hiệu ứng fade
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xoá danh mục "${name}" không?`)) return;

    setDeleting(id);
    try {
      await deleteJSON(`/categories/${id}`);

      // đánh dấu để fade-out
      setFading(id);

      // delay cho animation
      setTimeout(() => {
        setCategories(prev => prev.filter(c => c._id !== id));
        setFading(null);
      }, 350);

      alert('✅ Đã xoá danh mục thành công!');
    } catch (error) {
      console.error('❌ Lỗi xoá danh mục:', error);
      alert('❌ Không thể xoá danh mục. Kiểm tra lại API server.');
    } finally {
      setDeleting(null);
    }
  };

  const total = categories.length;
  const activeCount = categories.filter(c => c.active !== false).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <BackButton label="Quay lại trang chính" />
        <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-40 rounded-xl bg-white shadow-sm">
          <div className="h-full animate-pulse rounded-xl bg-slate-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quay lại */}
      <BackButton label="Quay lại trang chính" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý danh mục
          </h1>
          <p className="text-sm text-slate-600">
            Thêm, sửa hoặc xoá danh mục sản phẩm. Giữ mọi thứ gọn gàng và dễ tìm.
          </p>
        </div>

        <Link
          href="/categories/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 hover:shadow transition"
        >
          <span className="text-base">＋</span>
          <span>Thêm danh mục</span>
        </Link>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white">
          <span>📁 Tổng danh mục</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {total}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Đang hoạt động: </span>
          <span className="font-semibold text-emerald-700">{activeCount}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span>Tạm dừng / ẩn: </span>
          <span className="font-semibold text-slate-700">
            {total - activeCount}
          </span>
        </div>
      </div>

      {/* Bảng danh mục */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        {categories.length > 0 ? (
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">
                  Tên danh mục
                </th>
                <th className="px-5 py-3 text-left font-semibold">
                  Slug
                </th>
                <th className="px-5 py-3 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="px-5 py-3 text-right font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {categories.map(c => (
                <tr
                  key={c._id}
                  className={`transition-all duration-300 ${
                    fading === c._id
                      ? 'opacity-0 -translate-y-1'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Tên + mô tả nhỏ nếu sau này có */}
                  <td className="px-5 py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {c.name}
                      </span>
                      {c.description && (
                        <span className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                          {c.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-5 py-3 align-middle text-slate-600">
                    <code className="rounded bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">
                      {c.slug}
                    </code>
                  </td>

                  {/* Status pill */}
                  <td className="px-5 py-3 align-middle text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        c.active ?? true
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          c.active ?? true
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      {c.active ?? true ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 align-middle text-right text-[11px] font-medium">
                    <div className="inline-flex items-center gap-3">
                      <Link
                        href={`/categories/${c._id}`}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                      >
                        <span>👁</span>
                        <span>Xem</span>
                      </Link>

                      <Link
                        href={`/categories/${c._id}/edit`}
                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800"
                      >
                        <span>✏</span>
                        <span>Sửa</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(c._id, c.name)}
                        disabled={deleting === c._id}
                        className={`inline-flex items-center gap-1 ${
                          deleting === c._id
                            ? 'cursor-not-allowed text-slate-300'
                            : 'text-rose-600 hover:text-rose-800'
                        }`}
                      >
                        <span>🗑</span>
                        <span>{deleting === c._id ? 'Đang xoá…' : 'Xoá'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            📁 Chưa có danh mục nào. Hãy bắt đầu bằng nút
            <span className="mx-1 font-semibold text-emerald-600">
              “Thêm danh mục”
            </span>
            ở phía trên.
          </div>
        )}
      </div>
    </div>
  );
}
