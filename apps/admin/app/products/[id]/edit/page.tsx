'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getJSON } from '../../../../lib/api';
import BackButton from '../../../components/BackButton';

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
  images?: string[];
  skus?: SkuItem[];
  [key: string]: any;
}

type SkuItem = {
  _id: string;
  sku: string;
  price: number;
  weight?: number;
  stock?: number;
  active: boolean;
};

type NewSkuRow = {
  sku: string;
  price: string;
  weight?: string;
  stock?: string;
  active: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [imagesText, setImagesText] = useState<string>('');

  // NEW: thêm SKU mới
  const [rows, setRows] = useState<NewSkuRow[]>([
    { sku: '', price: '', weight: '', stock: '', active: true },
  ]);

  const tagsInput = useMemo(() => {
    if (!product?.tags) return '';
    return Array.isArray(product.tags)
      ? product.tags.join(', ')
      : String(product.tags);
  }, [product?.tags]);

  async function reload() {
    const data = await getJSON<Product>(`/products/id/${id}`);
    setProduct(data);
    setImages(Array.isArray(data.images) ? data.images : []);
  }

  useEffect(() => {
    (async () => {
      try {
        await reload();
      } catch (err) {
        console.error('❌ Lỗi tải sản phẩm:', err);
        alert('Không thể tải sản phẩm!');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const normalizeTextToUrls = (txt: string) =>
    Array.from(
      new Set(
        txt
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    );

  const importFromText = () => {
    const urls = normalizeTextToUrls(imagesText);
    if (!urls.length) return;
    setImages((prev) =>
      Array.from(new Set([...(prev || []), ...urls])),
    );
    setImagesText('');
  };

  const importFromUpload = () => {
    try {
      const raw = localStorage.getItem('pendingImages');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      if (!arr?.length)
        return alert(
          'Không có ảnh nào trong Upload (pendingImages).',
        );
      setImages((prev) =>
        Array.from(new Set([...(prev || []), ...arr])),
      );
      localStorage.removeItem('pendingImages');
    } catch {
      alert('Không thể đọc pendingImages.');
    }
  };

  const removeImage = (url: string) =>
    setImages((prev) => prev.filter((u) => u !== url));

  // Helpers SKU rows
  const addRow = () =>
    setRows((rs) => [
      ...rs,
      { sku: '', price: '', weight: '', stock: '', active: true },
    ]);
  const removeRow = (idx: number) =>
    setRows((rs) => rs.filter((_, i) => i !== idx));
  const setRow = (idx: number, patch: Partial<NewSkuRow>) =>
    setRows((rs) =>
      rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );

  const parseNum = (s?: string) => {
    const n = Number((s || '').trim());
    return Number.isFinite(n) ? n : undefined;
  };

  // Toggle active SKU
  const handleToggleSku = async (skuId: string, next: boolean) => {
    if (!product) return;
    const res = await fetch(
      `${API_BASE}/products/${product._id}/skus/${skuId}/active`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active: next }),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(
        err?.error?.message ||
          'Không thể cập nhật trạng thái SKU',
      );
      return;
    }
    await reload();
  };

  // Delete SKU
  const handleDeleteSku = async (skuId: string) => {
    if (!product) return;
    if (!confirm('Xoá SKU này?')) return;
    const res = await fetch(
      `${API_BASE}/products/${product._id}/skus/${skuId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error?.message || 'Không thể xoá SKU');
      return;
    }
    await reload();
  };

  // SAVE (update product + thêm SKU mới)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    try {
      // 1) Update product
      const normalized: Product = {
        ...product,
        tags: Array.isArray(product.tags)
          ? product.tags
          : (product.tags || '')
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean),
        images,
      };

      const putRes = await fetch(
        `${API_BASE}/products/${product._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(normalized),
        },
      );

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => null);
        throw new Error(
          err?.error?.message || `HTTP ${putRes.status}`,
        );
      }

      // 2) Thêm hàng loạt SKU hợp lệ (nếu có)
      const validRows = rows
        .map((r) => ({
          sku: r.sku.trim(),
          price: parseNum(r.price),
          weight: parseNum(r.weight),
          stock: parseNum(r.stock),
          active: r.active,
        }))
        .filter(
          (r) => r.sku && typeof r.price === 'number',
        );

      if (validRows.length) {
        const postRes = await fetch(
          `${API_BASE}/products/${product._id}/skus`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ items: validRows }),
          },
        );
        if (!postRes.ok) {
          const err = await postRes.json().catch(() => null);
          throw new Error(
            err?.error?.message ||
              `Tạo SKU thất bại (HTTP ${postRes.status})`,
          );
        }
      }

      alert('✅ Đã lưu sản phẩm');
      router.push('/products');
    } catch (err: any) {
      console.error('❌ Lưu thất bại:', err);
      alert(
        `❌ Không thể lưu sản phẩm.\n${
          err?.message || ''
        }`,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-sm text-slate-500">
        Đang tải sản phẩm...
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

      {/* Header */}
      <header className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[9px] font-medium text-slate-50">
          <span>✏️ Chỉnh sửa sản phẩm</span>
          <span className="rounded-full bg-white/10 px-2">
            #{product._id.slice(-6)}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {product.name}
        </h1>
        <p className="text-sm text-slate-600">
          Cập nhật nội dung, hình ảnh, SKU và trạng thái hiển thị.
        </p>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
      >
        {/* Tên + Slug */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-800">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) =>
                setProduct({ ...product, name: e.target.value })
              }
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800">
              Slug *
            </label>
            <input
              type="text"
              value={product.slug}
              onChange={(e) =>
                setProduct({ ...product, slug: e.target.value })
              }
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              URL: /products/{product.slug || ''}
            </p>
          </div>
        </section>

        {/* Mô tả ngắn */}
        <section>
          <label className="block text-sm font-medium text-slate-800">
            Mô tả ngắn
          </label>
          <input
            type="text"
            value={product.shortDescription || ''}
            onChange={(e) =>
              setProduct({
                ...product,
                shortDescription: e.target.value,
              })
            }
            placeholder="Hiển thị ở danh sách sản phẩm..."
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </section>

        {/* Mô tả chi tiết */}
        <section>
          <label className="block text-sm font-medium text-slate-800">
            Mô tả chi tiết
          </label>
          <textarea
            value={product.description || ''}
            onChange={(e) =>
              setProduct({
                ...product,
                description: e.target.value,
              })
            }
            rows={4}
            placeholder="Thông tin chi tiết, công dụng, hướng dẫn sử dụng..."
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </section>

        {/* Danh mục + Tags */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-800">
              Danh mục (slug)
            </label>
            <input
              type="text"
              value={product.category || ''}
              onChange={(e) =>
                setProduct({
                  ...product,
                  category: e.target.value,
                })
              }
              placeholder="ví dụ: nam-tuoi"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Phải trùng slug danh mục đang có.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) =>
                setProduct({
                  ...product,
                  tags: e.target.value,
                })
              }
              placeholder="tươi, sạch, hữu cơ"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Phân cách bằng dấu phẩy.
            </p>
          </div>
        </section>

        {/* Hình ảnh */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-800">
              Hình ảnh sản phẩm (URL)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={importFromUpload}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-slate-800"
              >
                Nhập từ Upload
              </button>
            </div>
          </div>

          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={2}
            placeholder="Dán URL ảnh, mỗi dòng hoặc ngăn cách bằng dấu phẩy…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={importFromText}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-medium text-white hover:bg-slate-800"
          >
            Thêm từ ô văn bản
          </button>

          {images.length > 0 && (
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
              {images.map((u) => (
                <div
                  key={u}
                  className="group relative rounded-xl border border-slate-100 bg-slate-50 p-1"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-1 truncate text-[9px] text-slate-500">
                    {u}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(u)}
                    className="absolute right-1 top-1 hidden rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] text-white shadow-sm group-hover:inline-flex"
                  >
                    Xoá
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trạng thái */}
        <section className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
            <input
              id="featured"
              type="checkbox"
              checked={product.featured ?? false}
              onChange={(e) =>
                setProduct({
                  ...product,
                  featured: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <span>Sản phẩm nổi bật</span>
          </label>

          <label className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-800">
            <input
              id="active"
              type="checkbox"
              checked={product.active ?? false}
              onChange={(e) =>
                setProduct({
                  ...product,
                  active: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Hiển thị trên cửa hàng</span>
          </label>
        </section>

        {/* SKU hiện có */}
        <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            SKU hiện có
          </h3>
          {!product.skus?.length ? (
            <p className="text-xs text-slate-500">
              Chưa có SKU nào cho sản phẩm này.
            </p>
          ) : (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-1.5">SKU</th>
                  <th className="py-1.5">Giá</th>
                  <th className="py-1.5">Khối lượng (g)</th>
                  <th className="py-1.5">Tồn</th>
                  <th className="py-1.5">Trạng thái</th>
                  <th className="py-1.5 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {product.skus!.map((s) => (
                  <tr
                    key={s._id}
                    className="border-t border-slate-100"
                  >
                    <td className="py-1.5 font-mono text-slate-800">
                      {s.sku}
                    </td>
                    <td className="py-1.5">
                      {s.price.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-1.5">
                      {s.weight ?? '—'}
                    </td>
                    <td className="py-1.5">
                      {s.stock ?? 0}
                    </td>
                    <td className="py-1.5">
                      <label className="inline-flex items-center gap-1.5 text-[10px] text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!s.active}
                          onChange={(e) =>
                            handleToggleSku(
                              s._id,
                              e.target.checked,
                            )
                          }
                          className="h-3 w-3"
                        />
                        <span>
                          {s.active ? 'Đang bán' : 'Ẩn'}
                        </span>
                      </label>
                    </td>
                    <td className="py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSku(s._id)}
                        className="text-[10px] text-rose-600 hover:underline"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Thêm SKU mới */}
        <section className="space-y-3 rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Thêm SKU mới
            </h3>
            <button
              type="button"
              onClick={addRow}
              className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-slate-800"
            >
              + Thêm dòng
            </button>
          </div>

          <div className="space-y-2">
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center gap-2"
              >
                <div className="col-span-3">
                  <input
                    value={r.sku}
                    onChange={(e) =>
                      setRow(i, { sku: e.target.value })
                    }
                    placeholder="SKU *"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    value={r.price}
                    onChange={(e) =>
                      setRow(i, { price: e.target.value })
                    }
                    placeholder="Giá (VND) *"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    value={r.weight}
                    onChange={(e) =>
                      setRow(i, { weight: e.target.value })
                    }
                    placeholder="Khối lượng (g)"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    value={r.stock}
                    onChange={(e) =>
                      setRow(i, { stock: e.target.value })
                    }
                    placeholder="Tồn"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]"
                  />
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <label className="inline-flex items-center gap-1.5 text-[10px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={r.active}
                      onChange={(e) =>
                        setRow(i, {
                          active: e.target.checked,
                        })
                      }
                      className="h-3 w-3"
                    />
                    <span>Hoạt động</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-[10px] text-rose-600"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[9px] text-slate-500">
            * Dòng hợp lệ: có SKU và Giá. Các dòng khác sẽ bị bỏ
            qua, không lỗi.
          </p>
        </section>

        {/* Nút lưu */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2 text-xs font-semibold text-white ${
              saving
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
