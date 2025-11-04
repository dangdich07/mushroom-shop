'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getJSON, putJSON } from '../../../../lib/api';
import BackButton from '../../../components/BackButton';

interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;   // mô tả ngắn
  description?: string;        // mô tả chi tiết
  category?: string;           // slug danh mục
  tags?: string[] | string;    // chuỗi "a, b" hoặc mảng
  active?: boolean;
  featured?: boolean;
  [key: string]: any;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Chuỗi tags để người dùng nhập
  const tagsInput = useMemo(() => {
    if (!product?.tags) return '';
    return Array.isArray(product.tags)
      ? product.tags.join(', ')
      : String(product.tags);
  }, [product?.tags]);

  // 🧠 Tải thông tin sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // ✅ đúng route backend (GET /products/id/:id)
        const data = await getJSON<Product>(`/products/id/${id}`);
        setProduct(data);
      } catch (err) {
        console.error('❌ Lỗi tải sản phẩm:', err);
        alert('Không thể tải sản phẩm!');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  // 💾 Lưu cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    try {
      // Chuyển chuỗi tags -> mảng (nếu đang là chuỗi)
      const normalized: Product = {
        ...product,
        tags: Array.isArray(product.tags)
          ? product.tags
          : (product.tags || '')
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean),
      };

      // ✅ backend update: PUT /products/:id
      await putJSON(`/products/${product._id}`, normalized);
      alert('✅ Cập nhật sản phẩm thành công!');
      router.push('/products');
    } catch (err) {
      console.error('❌ Lỗi lưu sản phẩm:', err);
      alert('❌ Không thể lưu sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Đang tải sản phẩm...</p>;
  if (!product) return <p className="p-6 text-red-500">Không tìm thấy sản phẩm.</p>;

  return (
    <div className="space-y-6">
      <BackButton label="Quay lại danh sách" />

      <h1 className="text-2xl font-bold text-gray-900">✏️ Chỉnh sửa sản phẩm</h1>
      <p className="text-gray-600">Cập nhật thông tin sản phẩm trong cửa hàng.</p>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6 max-w-3xl">
        {/* Tên + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên sản phẩm *</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              type="text"
              value={product.slug}
              onChange={(e) => setProduct({ ...product, slug: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">URL sẽ là: /products/{product.slug || ''}</p>
          </div>
        </div>

        {/* Mô tả ngắn */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả ngắn</label>
          <input
            type="text"
            value={product.shortDescription || ''}
            onChange={(e) => setProduct({ ...product, shortDescription: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả ngắn về sản phẩm..."
          />
        </div>

        {/* Mô tả chi tiết */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
          <textarea
            value={product.description || ''}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả chi tiết về sản phẩm..."
          />
        </div>

        {/* Danh mục + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Danh mục</label>
            <input
              type="text"
              value={product.category || ''}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: nam-tuoi"
            />
            <p className="text-xs text-gray-500 mt-1">Slug của danh mục</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setProduct({ ...product, tags: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="tươi, ngon, dinh dưỡng"
            />
            <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
          </div>
        </div>

        {/* Trạng thái */}
        <div className="flex flex-wrap items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              id="featured"
              type="checkbox"
              checked={product.featured ?? false}
              onChange={(e) => setProduct({ ...product, featured: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Sản phẩm nổi bật</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={product.active ?? false}
              onChange={(e) => setProduct({ ...product, active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Hoạt động</span>
          </label>
        </div>

        {/* Nút lưu */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
