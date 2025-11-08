'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getJSON } from '../../../lib/api';
import BackButton from '../../components/BackButton';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategory() {
      try {
        const data = await getJSON<Category>(`/categories/id/${id}`);
        setCategory(data);
      } catch (error) {
        console.error('❌ Lỗi tải danh mục:', error);
        alert('Không thể tải danh mục.');
        router.push('/categories');
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [id, router]);

  if (loading)
    return (
      <div className="p-6 text-sm text-slate-500">
        Đang tải chi tiết danh mục…
      </div>
    );
  if (!category)
    return (
      <div className="p-6 text-sm text-rose-500">
        Không tìm thấy danh mục.
      </div>
    );

  const created =
    category.createdAt &&
    new Date(category.createdAt).toLocaleString('vi-VN');
  const updated =
    category.updatedAt &&
    new Date(category.updatedAt).toLocaleString('vi-VN');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackButton label="Quay lại danh sách" />

      {/* Header */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium text-white">
            <span>📁 Chi tiết danh mục</span>
            <span className="rounded-full bg-white/10 px-2">
              ID: {category._id.slice(-6)}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {category.name}
          </h1>
          <p className="text-sm text-slate-600">
            Slug:{' '}
            <span className="font-mono text-slate-800">
              {category.slug}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              category.active
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                category.active ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            {category.active ? 'Đang hoạt động' : 'Đang tạm dừng'}
          </span>

          <button
            onClick={() =>
              router.push(`/categories/${category._id}/edit`)
            }
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-slate-800"
          >
            ✏ Sửa danh mục
          </button>
        </div>
      </header>

      {/* Card */}
      <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Mô tả
          </h2>
          <p className="text-sm text-slate-800 whitespace-pre-line">
            {category.description || 'Không có mô tả cho danh mục này.'}
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase text-slate-500">
              Thứ tự hiển thị
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {category.sortOrder ?? 0}
            </p>
            <p className="text-[10px] text-slate-500">
              Số nhỏ sẽ được ưu tiên hiển thị trước.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase text-slate-500">
              Ngày tạo
            </h3>
            <p className="mt-1 text-sm text-slate-900">
              {created || '—'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase text-slate-500">
              Cập nhật lần cuối
            </h3>
            <p className="mt-1 text-sm text-slate-900">
              {updated || '—'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
