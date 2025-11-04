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
    const fetchCategory = async () => {
      try {
        const data = await getJSON<Category>(`/categories/id/${id}`); // ✅ đúng route
        setCategory(data);
      } catch (error) {
        console.error('❌ Lỗi tải danh mục:', error);
        alert('Không thể tải danh mục!');
        router.push('/categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setSaving(true);
    try {
      await putJSON(`/categories/${category._id}`, category); // ✅ PUT /categories/:id
      alert('✅ Cập nhật danh mục thành công!');
      router.push('/categories');
    } catch (error) {
      console.error('❌ Lỗi khi lưu danh mục:', error);
      alert('❌ Không thể lưu danh mục!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Đang tải...</p>;
  if (!category) return <p className="p-6 text-red-500">Không tìm thấy danh mục.</p>;

  return (
    <div className="space-y-6">
      <BackButton label="Quay lại danh sách" />

      <h1 className="text-2xl font-bold text-gray-900">✏️ Chỉnh sửa danh mục</h1>
      <p className="text-gray-600">Cập nhật thông tin danh mục sản phẩm.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-6 max-w-3xl"
      >
        {/* Tên + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên danh mục *
            </label>
            <input
              type="text"
              value={category.name}
              onChange={(e) => setCategory({ ...category, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-600 focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              type="text"
              value={category.slug}
              onChange={(e) => setCategory({ ...category, slug: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-600 focus:border-green-600"
              required
            />
            <p className="text-xs text-gray-500 mt-1">URL sẽ là: /categories/{category.slug || ''}</p>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            value={category.description || ''}
            onChange={(e) =>
              setCategory({ ...category, description: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-600 focus:border-green-600"
            placeholder="Mô tả về danh mục này..."
          />
        </div>

        {/* Thứ tự + Trạng thái */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thứ tự sắp xếp
            </label>
            <input
              type="number"
              value={category.sortOrder ?? 0}
              onChange={(e) =>
                setCategory({ ...category, sortOrder: Number(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-600 focus:border-green-600"
            />
            <p className="text-xs text-gray-500 mt-1">Số càng nhỏ hiển thị càng trước</p>
          </div>

          <div className="flex items-center gap-2 pt-6 md:pt-0">
            <input
              id="active"
              type="checkbox"
              checked={category.active ?? false}
              onChange={(e) =>
                setCategory({ ...category, active: e.target.checked })
              }
              className="h-4 w-4 text-green-600 focus:ring-green-600 border-gray-300 rounded"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Hoạt động
            </label>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
