'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchFilters({
  categories,
  currentSearch = '',
  currentCategory = '',
  currentFeatured = false,
  currentSort = '',
  compact = true,
}: {
  categories: { _id: string; name: string; slug: string }[];
  currentSearch?: string;
  currentCategory?: string;
  currentFeatured?: boolean;
  currentSort?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const qs = useSearchParams();

  const [search, setSearch] = useState(currentSearch);
  const [category, setCategory] = useState(currentCategory);
  const [featured, setFeatured] = useState(currentFeatured);
  const [sort, setSort] = useState(currentSort || '');

  /** Debounce CHỈ cho ô tìm kiếm */
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(qs.toString());
      search ? sp.set('search', search) : sp.delete('search');
      sp.set('page', '1');

      const next = `${pathname}?${sp.toString()}`;
      const curr = `${pathname}?${qs.toString()}`;
      if (next !== curr) router.replace(next);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /** 🔁 Auto-apply khi đổi Danh mục / Sắp xếp / Nổi bật */
  useEffect(() => {
    const sp = new URLSearchParams(qs.toString());
    // mang theo search hiện tại
    search ? sp.set('search', search) : sp.delete('search');
    // 3 tham số auto-apply
    category ? sp.set('category', category) : sp.delete('category');
    featured ? sp.set('featured', 'true') : sp.delete('featured');
    sort ? sp.set('sort', sort) : sp.delete('sort');
    // luôn reset về trang 1
    sp.set('page', '1');

    const next = `${pathname}?${sp.toString()}`;
    const curr = `${pathname}?${qs.toString()}`;
    if (next !== curr) router.replace(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, featured, sort]);

  /** Fallback: nút Lọc (vẫn giữ, phòng khi muốn bắn tay) */
  const apply = () => {
    const sp = new URLSearchParams(qs.toString());
    search ? sp.set('search', search) : sp.delete('search');
    category ? sp.set('category', category) : sp.delete('category');
    featured ? sp.set('featured', 'true') : sp.delete('featured');
    sort ? sp.set('sort', sort) : sp.delete('sort');
    sp.set('page', '1');
    router.push(`${pathname}?${sp.toString()}`);
  };

  const reset = () => router.push(`${pathname}`);

  // style ngắn gọn
  const ctlBase =
    'h-9 text-sm w-full rounded-lg border border-gray-300 px-3 ' +
    'bg-white focus:outline-none focus:ring-2 focus:ring-black/20';
  const wrap =
    'rounded-xl ring-1 ring-gray-200 bg-white/80 backdrop-blur shadow-sm px-3 py-3';

  return (
    <div className={wrap}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* search */}
        <div className="md:col-span-4">
          <label className="block text-[10px] text-gray-600 mb-1">Tìm kiếm</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tên sản phẩm…"
            className={ctlBase}
          />
        </div>

        {/* category */}
        <div className="md:col-span-3">
          <label className="block text-[12px] text-gray-600 mb-1">Danh mục</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={ctlBase}
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* sort */}
        <div className="md:col-span-2">
          <label className="block text-[12px] text-gray-600 mb-1">Sắp xếp</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={ctlBase}
          >
            <option value="">Mặc định</option>
            <option value="price_asc">Giá ↑</option>
            <option value="price_desc">Giá ↓</option>
            <option value="newest">Mới nhất</option>
            <option value="featured">Nổi bật</option>
          </select>
        </div>

        {/* featured + buttons */}
        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black/30"
            />
            <span>Sản phẩm nổi bật</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={apply}
              className="h-9 px-4 rounded-lg text-sm font-medium bg-black text-white hover:opacity-90"
              title="Áp dụng bộ lọc"
            >
              Lọc
            </button>
            <button
              onClick={reset}
              className="h-9 px-3 rounded-lg text-sm border border-gray-300 hover:bg-white"
              title="Xóa bộ lọc"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
