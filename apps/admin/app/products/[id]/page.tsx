'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';
import { getJSON } from '../../../lib/api';

interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  tags?: string[] | string;
  active?: boolean;
  featured?: boolean;
  priceRange?: { min?: number; max?: number } | null;
  createdAt?: string;
  updatedAt?: string;
}

/* --------------------------- Price Editor (number | '') --------------------------- */
function PriceEditor({
  productId,
  defaultMin,
  defaultMax,
}: {
  productId: string;
  defaultMin?: number;
  defaultMax?: number;
}) {
  // state là số hoặc chuỗi rỗng → hợp với <input type="number">
  const [min, setMin] = useState<number | ''>(defaultMin ?? '');
  const [max, setMax] = useState<number | ''>(defaultMax ?? '');
  const [saving, setSaving] = useState(false);

  const toNum = (v: number | '') => (v === '' ? undefined : v);

  const save = async () => {
    const minN = toNum(min);
    const maxN = toNum(max);

    if (minN !== undefined && maxN !== undefined && minN > maxN) {
      alert('Giá từ (min) không được lớn hơn Giá đến (max).');
      return;
    }

    setSaving(true);
    try {
      const body: any = {};
      if (minN !== undefined || maxN !== undefined) {
        body.priceRange = {
          ...(minN !== undefined ? { min: minN } : {}),
          ...(maxN !== undefined ? { max: maxN } : {}),
        };
      } else {
        // cho phép xoá priceRange (để null)
        body.priceRange = null;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      alert('Đã lưu giá.');
    } catch (e: any) {
      alert(`Lỗi lưu giá: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Giá từ (VND)</label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={min}
          onChange={(e) => {
            const v = e.target.value;
            setMin(v === '' ? '' : Number(v));
          }}
          min={0}
          placeholder="199000"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Giá đến (VND)</label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={max}
          onChange={(e) => {
            const v = e.target.value;
            setMax(v === '' ? '' : Number(v));
          }}
          min={0}
          placeholder="299000"
        />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="h-[42px] px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Đang lưu…' : 'Lưu giá'}
      </button>
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
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

  const tags: string[] = useMemo(() => {
    if (!product?.tags) return [];
    return Array.isArray(product.tags)
      ? product.tags
      : product.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
  }, [product]);

  if (loading) return <p className="p-6 text-gray-500">Đang tải...</p>;
  if (!product) return <p className="p-6 text-red-500">Không tìm thấy sản phẩm.</p>;

  return (
    <div className="space-y-6">
      <BackButton label="Quay lại danh sách" />

      <div className="bg-white shadow rounded-lg p-6 max-w-4xl space-y-6">
        {/* Tiêu đề + trạng thái */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-600">
              Slug: <span className="font-mono">{product.slug}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {product.active ? 'Hoạt động' : 'Tạm dừng'}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                product.featured ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {product.featured ? 'Sản phẩm nổi bật' : 'Không nổi bật'}
            </span>
          </div>
        </div>

        {/* Mô tả ngắn */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Mô tả ngắn</h2>
          <p className="text-gray-800 whitespace-pre-line">
            {product.shortDescription || '—'}
          </p>
        </section>

        {/* Mô tả chi tiết */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Mô tả chi tiết</h2>
          <p className="text-gray-800 whitespace-pre-line">
            {product.description || '—'}
          </p>
        </section>

        {/* Danh mục + Tags */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Danh mục</h3>
            <p className="text-gray-800 font-mono">
              {product.category || 'Chưa phân loại'}
            </p>
            <p className="text-xs text-gray-500">Slug của danh mục</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
            {tags.length ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-800">—</p>
            )}
            <p className="text-xs text-gray-500">Phân cách bằng dấu phẩy khi nhập</p>
          </div>
        </section>

        {/* Giá (min/max) */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Giá</h2>
          <PriceEditor
            productId={product._id}
            defaultMin={product.priceRange?.min}
            defaultMax={product.priceRange?.max}
          />
        </section>

        {/* Thời gian */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Ngày tạo</h3>
            <p className="text-gray-800">
              {product.createdAt
                ? new Date(product.createdAt).toLocaleString('vi-VN')
                : '—'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Cập nhật lần cuối</h3>
            <p className="text-gray-800">
              {product.updatedAt
                ? new Date(product.updatedAt).toLocaleString('vi-VN')
                : '—'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
