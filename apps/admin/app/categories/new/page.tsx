'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        router.push('/categories');
      } else {
        const error = await res.json().catch(() => ({}));
        alert(
          `Lỗi: ${error?.error?.message || 'Không thể tạo danh mục'}`
        );
      }
    } catch {
      alert('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackButton label="Quay lại danh sách" />

      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] text-emerald-700">
          <span className="text-xs">📁</span>
          <span>Tạo danh mục mới cho sản phẩm</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Thêm danh mục mới
        </h1>
        <p className="text-sm text-slate-600">
          Điền thông tin rõ ràng để giúp khách hàng duyệt sản phẩm dễ hơn.
        </p>
      </header>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tên */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Tên danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Ví dụ: Nấm tươi"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Slug URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              placeholder="Ví dụ: nam-tuoi"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              URL xem danh mục sẽ là:
              <span className="font-mono">
                {' '}
                /categories/{formData.slug || 'ten-danh-muc'}
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
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Mô tả ngắn để team & khách hiểu danh mục này dùng cho gì..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
              name="sortOrder"
              min={0}
              value={formData.sortOrder}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Số càng nhỏ, danh mục càng xuất hiện ở trên.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Trạng thái
            </label>
            <label className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Hoạt động ngay sau khi tạo</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Xem trước hiển thị
          </h3>
          <div className="flex flex-col gap-1 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm">
            <div className="font-semibold text-slate-900">
              {formData.name || 'Tên danh mục'}
            </div>
            {formData.description && (
              <div className="text-xs text-slate-600">
                {formData.description}
              </div>
            )}
            <div className="text-[10px] text-slate-400">
              Slug: {formData.slug || 'slug-danh-muc'} · Thứ tự:{' '}
              {formData.sortOrder}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang tạo…' : 'Tạo danh mục'}
          </button>
        </div>
      </form>
    </div>
  );
}
