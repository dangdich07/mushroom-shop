'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getJSON, putJSON } from '../../../../lib/api';
import BackButton from '../../../components/BackButton';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
  [key: string]: any;
}

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchCategory() {
      try {
        const data = await getJSON<Category>(`/categories/id/${id}`);
        setCategory(data);
      } catch (error) {
        console.error('❌ Lỗi tải danh mục:', error);
        alert('Không thể tải danh mục!');
        router.push('/categories');
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setSaving(true);
    try {
      await putJSON(`/categories/${category._id}`, category);
      alert('✅ Cập nhật danh mục thành công!');
      router.push('/categories');
    } catch (error) {
      console.error('❌ Lỗi khi lưu danh mục:', error);
      alert('❌ Không thể lưu danh mục!');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-sm text-slate-500">
        Đang tải dữ liệu…
      </div>
    );
  if (!category)
    return (
      <div className="p-6 text-sm text-rose-500">
        Không tìm thấy danh mục.
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackButton label="Quay lại danh sách" />

      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-medium text-sky-700">
          <span>✏ Đang chỉnh sửa danh mục</span>
          <span className="rounded-full bg-sky-100 px-2">
            ID: {category._id.slice(-6)}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Chỉnh sửa: {category.name}
        </h1>
        <p className="text-sm text-slate-600">
          Cập nhật tên, slug, mô tả và trạng thái hiển thị danh mục.
        </p>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
      >
        {/* Tên + Slug */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Tên danh mục *
            </label>
            <input
              type="text"
              value={category.name}
              onChange={e =>
                setCategory({ ...category, name: e.target.value })
              }
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Slug URL *
            </label>
            <input
              type="text"
              value={category.slug}
              onChange={e =>
                setCategory({ ...category, slug: e.target.value })
              }
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              URL: <span className="font-mono">
                /categories/{category.slug || ''}
              </span>
            </p>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">
            Mô tả
          </label>
          <textarea
            value={category.description || ''}
            onChange={e =>
              setCategory({
                ...category,
                description: e.target.value,
              })
            }
            rows={3}
            placeholder="Mô tả ngắn để team hiểu danh mục dùng cho sản phẩm gì..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Sort + Active */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              value={category.sortOrder ?? 0}
              onChange={e =>
                setCategory({
                  ...category,
                  sortOrder: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Số nhỏ sẽ hiển thị trước trong danh sách.
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Trạng thái
            </label>
            <label className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs text-slate-800">
              <input
                id="active"
                type="checkbox"
                checked={category.active ?? false}
                onChange={e =>
                  setCategory({
                    ...category,
                    active: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Hiển thị danh mục này trên hệ thống</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-500">
          <div>
            Mọi thay đổi sẽ áp dụng cho các trang dùng danh mục này.
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white ${
                saving
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-sm'
              }`}
            >
              {saving ? 'Đang lưu…' : '💾 Lưu thay đổi'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
