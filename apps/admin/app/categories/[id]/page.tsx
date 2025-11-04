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
    const fetchCategory = async () => {
      try {
        const data = await getJSON<Category>(`/categories/id/${id}`); // giữ nguyên API
        setCategory(data);
      } catch (error) {
        console.error('❌ Lỗi tải danh mục:', error);
        alert('Không thể tải danh mục.');
        router.push('/categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, router]);

  if (loading) return <p className="p-6 text-gray-500">Đang tải...</p>;
  if (!category) return <p className="p-6 text-red-500">Không tìm thấy danh mục</p>;

  return (
    <div className="space-y-6">
      <BackButton label="Quay lại danh sách" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết danh mục</h1>
        <p className="text-gray-600">Xem thông tin đầy đủ về danh mục</p>
      </div>

      <div className="bg-white shadow rounded-xl p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{category.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Slug: <span className="font-mono">{category.slug}</span>
            </p>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
              ${category.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}
          >
            {category.active ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </div>

        {/* Body */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thông tin chính */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mô tả */}
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Mô tả</h3>
              <p className="text-gray-800 whitespace-pre-line">
                {category.description || '—'}
              </p>
            </section>

            {/* Thứ tự sắp xếp */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Thứ tự sắp xếp</h4>
                <p className="mt-1 text-gray-900">{category.sortOrder ?? 0}</p>
                <p className="text-xs text-gray-500">Số nhỏ sẽ hiển thị trước</p>
              </div>
            </section>
          </div>

          {/* Thời gian */}
          <aside className="rounded-lg border bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Mốc thời gian</h4>
            <dl className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-sm text-gray-600">Ngày tạo</dt>
                <dd className="text-sm font-medium text-gray-900 text-right">
                  {category.createdAt
                    ? new Date(category.createdAt).toLocaleString('vi-VN')
                    : '—'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-sm text-gray-600">Cập nhật lần cuối</dt>
                <dd className="text-sm font-medium text-gray-900 text-right">
                  {category.updatedAt
                    ? new Date(category.updatedAt).toLocaleString('vi-VN')
                    : '—'}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
