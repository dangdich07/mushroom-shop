'use client';
import { useEffect, useState } from 'react';
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

  // ✅ Dùng useEffect (thay vì useState) để load sản phẩm khi mount
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

  // ✅ Hàm xóa sản phẩm
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}" không?`)) return;
    setDeleting(id);

    try {
      // 🧠 Dùng endpoint /api/products/:id (đã proxy qua middleware)
      await deleteJSON(`/products/${id}`);

      // ✅ Cập nhật lại danh sách mà không reload
      setProducts((prev) => prev.filter((p) => p._id !== id));

      alert('✅ Đã xóa sản phẩm thành công!');
    } catch (err) {
      console.error('❌ Lỗi khi xóa sản phẩm:', err);
      alert('❌ Xóa thất bại. Kiểm tra lại server hoặc quyền truy cập.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Đang tải dữ liệu...</p>;

  return (
    <div className="space-y-6">
      {/* 🔹 Nút quay lại */}
      <BackButton label="Quay lại trang chính" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600">Quản lý tất cả sản phẩm trong cửa hàng</p>
        </div>
        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách sản phẩm ({products.length})
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🍄</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category || 'Chưa phân loại'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString('vi-VN')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/products/${product._id}`}
                        className="text-green-600 hover:text-green-900"
                        target="_blank"
                      >
                        👁️ Xem
                      </Link>
                      <Link
                        href={`/products/${product._id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Sửa
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        disabled={deleting === product._id}
                        className={`${
                          deleting === product._id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        {deleting === product._id ? 'Đang xóa...' : '🗑 Xoá'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">Chưa có sản phẩm nào</div>
        )}
      </div>
    </div>
  );
}
