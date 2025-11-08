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
        },
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
    <div className="grid items-end gap-3 md:grid-cols-[1fr_1fr_auto]">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Giá từ (VND)
        </label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Giá đến (VND)
        </label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
        className="mt-1 h-[42px] rounded-full bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
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

  if (loading)
    return (
      <p className="p-6 text-sm text-slate-500">
        Đang tải...
      </p>
    );
  if (!product)
    return (
      <p className="p-6 text-sm text-rose-500">
        Không tìm thấy sản phẩm.
      </p>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <BackButton label="Quay lại danh sách sản phẩm" />

      {/* Header card */}
      <section className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-6">
        {/* Tiêu đề + trạng thái */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[9px] font-medium text-slate-50">
              <span>🍄 Chi tiết sản phẩm</span>
              <span className="rounded-full bg-white/10 px-2">
                #{product._id.slice(-6)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {product.name}
            </h1>
            <p className="text-[11px] text-slate-500">
              Slug:{' '}
              <span className="font-mono text-slate-700">
                {product.slug}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold ${
                product.active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  product.active ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {product.active ? 'Đang hoạt động' : 'Tạm dừng'}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold ${
                product.featured
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-50 text-slate-600'
              }`}
            >
              ★ {product.featured ? 'Sản phẩm nổi bật' : 'Không nổi bật'}
            </span>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Thông tin & mô tả */}
          <div className="md:col-span-2 space-y-5">
            {/* Mô tả ngắn */}
            <section className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mô tả ngắn
              </h2>
              <p className="text-sm text-slate-800 whitespace-pre-line">
                {product.shortDescription || '—'}
              </p>
            </section>

            {/* Mô tả chi tiết */}
            <section className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mô tả chi tiết
              </h2>
              <p className="text-sm text-slate-800 whitespace-pre-line">
                {product.description || '—'}
              </p>
            </section>

            {/* Danh mục & Tags */}
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Danh mục
                </h3>
                <p className="text-sm font-mono text-slate-800">
                  {product.category || 'Chưa phân loại'}
                </p>
                <p className="text-[9px] text-slate-400">
                  Giá trị này là slug danh mục.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tags
                </h3>
                {tags.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-800">—</p>
                )}
                <p className="text-[9px] text-slate-400">
                  Nhập dạng danh sách, phân cách bằng dấu phẩy.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar: giá & thời gian */}
          <aside className="space-y-5 rounded-2xl bg-slate-50 p-4">
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Giá bán
              </h2>
              <PriceEditor
                productId={product._id}
                defaultMin={product.priceRange?.min}
                defaultMax={product.priceRange?.max}
              />
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mốc thời gian
              </h2>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between gap-3">
                  <span>Ngày tạo</span>
                  <span className="font-medium text-slate-900">
                    {product.createdAt
                      ? new Date(
                          product.createdAt,
                        ).toLocaleString('vi-VN')
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Cập nhật lần cuối</span>
                  <span className="font-medium text-slate-900">
                    {product.updatedAt
                      ? new Date(
                          product.updatedAt,
                        ).toLocaleString('vi-VN')
                      : '—'}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
