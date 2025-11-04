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

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getJSON<{ items: Category[] }>('/categories');
        setCategories(data.items);
      } catch (error) {
        console.error('❌ Lỗi tải danh mục:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const [fading, setFading] = useState<string | null>(null);

const handleDelete = async (id: string, name: string) => {
  if (!confirm(`Bạn có chắc chắn muốn xoá danh mục "${name}" không?`)) return;
  setDeleting(id);

  try {
    await deleteJSON(`/categories/${id}`);

    // 🟢 Hiệu ứng fade-out: đánh dấu item đang xoá
    setFading(id);

    // 🕒 Delay 400ms trước khi xoá hẳn khỏi state để CSS animation kịp chạy
    setTimeout(() => {
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setFading(null);
    }, 400);

    alert('✅ Đã xoá danh mục thành công!');
  } catch (error) {
    console.error('❌ Lỗi xoá danh mục:', error);
    alert('❌ Không thể xoá danh mục. Kiểm tra lại API server.');
  } finally {
    setDeleting(null);
  }
};

  if (loading)
    return <p className="p-6 text-gray-500">Đang tải danh mục...</p>;

  return (
    <div className="space-y-6">
      {/* 🔹 Nút quay lại */}
      <BackButton label="Quay lại trang chính" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600">Thêm, sửa hoặc xoá danh mục sản phẩm</p>
        </div>
        <Link
          href="/categories/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          ➕ Thêm danh mục
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {categories.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((c) => (
                <tr
                  key={c._id}
                  className={`transition-all duration-300 ease-in-out ${
                    fading === c._id ? 'opacity-0 scale-95' : 'hover:bg-gray-50'
                  }`}
                >

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        c.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {c.active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link href={`/categories/${c._id}`} className="text-green-600 hover:underline">
                        👁️ Xem
                      </Link>
                      
                      <Link
                        href={`/categories/${c._id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️ Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(c._id, c.name)}
                        disabled={deleting === c._id}
                        className={`${
                          deleting === c._id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        🗑 Xoá
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">
            📁 Chưa có danh mục nào
          </div>
        )}
      </div>
    </div>
  );
}
