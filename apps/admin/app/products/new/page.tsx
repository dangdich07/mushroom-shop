'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: '',
    featured: false,
    active: true,
    priceMin: '',   // 👈 thêm
    priceMax: '',   // 👈 thêm
  });

  const numOrUndefined = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];

      const min = numOrUndefined(formData.priceMin);
      const max = numOrUndefined(formData.priceMax);

      if (min !== undefined && max !== undefined && min > max) {
        alert('Giá từ (min) không được lớn hơn Giá đến (max).');
        setLoading(false);
        return;
      }

      const body: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        tags: tagsArray,
        featured: formData.featured,
        active: formData.active,
      };

      // Chỉ gắn priceRange khi có giá trị số
      if (min !== undefined || max !== undefined) {
        body.priceRange = {
          ...(min !== undefined ? { min } : {}),
          ...(max !== undefined ? { max } : {}),
        };
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        router.push('/products');
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Lỗi: ${error?.error?.message || 'Không thể tạo sản phẩm'}`);
      }
    } catch {
      alert('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
        <p className="text-gray-600">Tạo sản phẩm mới cho cửa hàng</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: Nấm linh chi"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: nam-linh-chi"
            />
            <p className="text-xs text-gray-500 mt-1">URL sẽ là: /products/{formData.slug}</p>
          </div>
        </div>

        {/* Mô tả ngắn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả ngắn về sản phẩm..."
          />
        </div>

        {/* Mô tả chi tiết */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả chi tiết về sản phẩm..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: nam-duoc-lieu"
            />
            <p className="text-xs text-gray-500 mt-1">Nhập slug danh mục</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="tươi, ngon, dinh dưỡng"
            />
            <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
          </div>
        </div>

        {/* Giá */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ (VND)</label>
            <input
              type="number"
              name="priceMin"
              value={formData.priceMin}
              onChange={handleInputChange}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: 199000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến (VND)</label>
            <input
              type="number"
              name="priceMax"
              value={formData.priceMax}
              onChange={handleInputChange}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: 299000"
            />
          </div>
        </div>

        {/* Trạng thái */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Hoạt động</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}
