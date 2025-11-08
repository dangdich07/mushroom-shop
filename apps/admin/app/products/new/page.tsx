'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SkuEditor, { SkuRow } from '../../components/SkuEditor';
import BackButton from '../../components/BackButton';

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
    priceMin: '',
    priceMax: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [imagesText, setImagesText] = useState<string>('');
  const [skuRows, setSkuRows] = useState<SkuRow[]>([]);

  // Prefill từ Upload
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pendingImages');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setImages(prev =>
            Array.from(new Set([...(prev || []), ...arr]))
          );
        }
        localStorage.removeItem('pendingImages');
      }
    } catch {
      // ignore
    }
  }, []);

  const numOrUndefined = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const normalizeTextToUrls = (txt: string) =>
    Array.from(
      new Set(
        txt
          .split(/\n|,/)
          .map(s => s.trim())
          .filter(Boolean)
      )
    );

  const importFromText = () => {
    const urls = normalizeTextToUrls(imagesText);
    if (!urls.length) return;
    setImages(prev =>
      Array.from(new Set([...(prev || []), ...urls]))
    );
    setImagesText('');
  };

  const importFromUpload = () => {
    try {
      const raw = localStorage.getItem('pendingImages');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      if (!arr?.length)
        return alert('Không có ảnh nào trong Upload (pendingImages).');
      setImages(prev =>
        Array.from(new Set([...(prev || []), ...arr]))
      );
      localStorage.removeItem('pendingImages');
    } catch {
      alert('Không thể đọc pendingImages.');
    }
  };

  const removeImage = (url: string) =>
    setImages(prev => prev.filter(u => u !== url));

  async function createSkus(productId: string, items: SkuRow[]) {
    const data = items
      .filter(x => x.sku && Number.isFinite(x.price))
      .map(x => ({
        sku: x.sku,
        price: x.price,
        weight: x.weight,
        stock: x.stock ?? 0,
        active: x.active ?? true,
      }));

    if (!data.length) return;

    const base = process.env.NEXT_PUBLIC_API_URL || '/api';
    const res = await fetch(`${base}/products/${productId}/skus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ items: data }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message ||
          `Tạo SKU thất bại (HTTP ${res.status})`
      );
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        : [];

      const min = numOrUndefined(formData.priceMin);
      const max = numOrUndefined(formData.priceMax);
      if (min !== undefined && max !== undefined && min > max) {
        throw new Error(
          'Giá từ (min) không được lớn hơn Giá đến (max).'
        );
      }

      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        tags: tagsArray,
        featured: formData.featured,
        active: formData.active,
      };

      if (min !== undefined || max !== undefined) {
        payload.priceRange = {
          ...(min !== undefined ? { min } : {}),
          ...(max !== undefined ? { max } : {}),
        };
      }
      if (images.length) payload.images = images;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || '/api'}/products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(
          error?.error?.message || 'Không thể tạo sản phẩm'
        );
      }

      const created = await res.json();
      const newId: string =
        created?.product?._id ??
        created?._id ??
        created?.productId ??
        '';

      if (!newId) {
        throw new Error(
          'Không xác định được ID sản phẩm vừa tạo.'
        );
      }

      try {
        await createSkus(String(newId), skuRows);
      } catch (skuErr: any) {
        alert(
          `⚠️ Sản phẩm đã tạo, nhưng thêm SKU thất bại: ${
            skuErr?.message || ''
          }`
        );
      }

      router.push('/products');
    } catch (e: any) {
      alert(`Lỗi: ${e?.message || 'Không thể tạo sản phẩm'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <BackButton label="Quay lại danh sách sản phẩm" />

      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium text-slate-50">
          <span>🍄 Thêm sản phẩm mới</span>
          <span className="rounded-full bg-white/10 px-2">
            Form thông tin + SKU + hình ảnh
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Tạo sản phẩm mới
        </h1>
        <p className="text-sm text-slate-600">
          Điền đầy đủ thông tin giúp sản phẩm hiển thị chuyên nghiệp và dễ
          tìm kiếm.
        </p>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
      >
        {/* Tên & slug */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Tên sản phẩm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Ví dụ: Nấm linh chi hữu cơ"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
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
              placeholder="vi-du: nam-linh-chi-huu-co"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              URL chi tiết: <span className="font-mono">
                /products/{formData.slug || 'slug-san-pham'}
              </span>
            </p>
          </div>
        </section>

        {/* Mô tả */}
        <section className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Mô tả ngắn
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              rows={2}
              placeholder="Hiển thị ở danh sách sản phẩm..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Thông tin chi tiết, công dụng, hướng dẫn sử dụng..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </section>

        {/* Danh mục + Tags */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Danh mục (slug)
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="ví dụ: nam-duoc-lieu"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Nhập slug danh mục đã tồn tại.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="tươi, sạch, hữu cơ"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Phân cách nhiều tag bằng dấu phẩy.
            </p>
          </div>
        </section>

        {/* Giá */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Giá từ (VND)
            </label>
            <input
              type="number"
              name="priceMin"
              value={formData.priceMin}
              onChange={handleInputChange}
              min={0}
              placeholder="199000"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Giá đến (VND)
            </label>
            <input
              type="number"
              name="priceMax"
              value={formData.priceMax}
              onChange={handleInputChange}
              min={0}
              placeholder="299000"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </section>

        {/* Ảnh */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-800">
              Hình ảnh sản phẩm (URL tuyệt đối)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={importFromUpload}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-slate-800"
              >
                Lấy từ Upload
              </button>
            </div>
          </div>

          <textarea
            value={imagesText}
            onChange={e => setImagesText(e.target.value)}
            rows={2}
            placeholder="Dán URL ảnh, mỗi dòng hoặc ngăn cách bằng dấu phẩy..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />

          <button
            type="button"
            onClick={importFromText}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-medium text-white hover:bg-slate-800"
          >
            Thêm ảnh từ ô trên
          </button>

          {images.length > 0 && (
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
              {images.map(u => (
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
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <span>Đánh dấu là sản phẩm nổi bật</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-800">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Hiển thị sản phẩm trên cửa hàng</span>
          </label>
        </section>

        {/* SKU Editor */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Cấu hình SKU / biến thể
          </h2>
          <p className="text-[10px] text-slate-500">
            Thêm SKU cho từng loại trọng lượng, size, gói bán... (có thể để
            trống, thêm sau).
          </p>
          <SkuEditor value={skuRows} onChange={setSkuRows} />
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang tạo…' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}
