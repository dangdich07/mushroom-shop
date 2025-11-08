// apps/web/app/(catalog)/products/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getJSON } from '../../../lib/api';
import AddToCart from './parts/AddToCart';
import SearchFilters from './parts/SearchFilters';
import ProductCard from '../../../components/product/ProductCard';
import Pagination from '../../../components/product/Pagination';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const cat = typeof searchParams.category === 'string' ? searchParams.category : '';
  const q = typeof searchParams.search === 'string' ? searchParams.search : '';
  const featured = String(searchParams.featured || '') === 'true';

  const bits = ['Sản phẩm'];
  if (cat) bits.push(`Danh mục: ${cat}`);
  if (q) bits.push(`Tìm: "${q}"`);
  if (featured) bits.push('Nổi bật');

  const title = bits.join(' · ') + ' | Mushroom Shop';
  const desc =
    q || cat
      ? `Khám phá các sản phẩm ${cat ? `thuộc ${cat} ` : ''}${
          q ? `khớp “${q}” ` : ''
        }tại Mushroom Shop`
      : 'Khám phá các sản phẩm nấm: tươi, khô, dược liệu… tại Mushroom Shop';

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, url: '/products', type: 'website' },
  };
}

// Giữ helper để build link khi cần
function buildUrl(
  current: Record<string, string | string[] | undefined>,
  overrides: Record<string, string | undefined>
) {
  const sp = new URLSearchParams();
  const keepKeys = ['search', 'category', 'featured', 'sort', 'page'];
  for (const k of keepKeys) {
    const v = current[k];
    if (typeof v === 'string' && v) sp.set(k, v);
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (!v) sp.delete(k);
    else sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/products?${qs}` : `/products`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Build query cho API search
  const sp = new URLSearchParams();
  if (searchParams.category) sp.set('category', String(searchParams.category));
  if (searchParams.search) sp.set('search', String(searchParams.search));
  if (searchParams.featured) sp.set('featured', String(searchParams.featured));
  if (searchParams.sort) sp.set('sort', String(searchParams.sort));

  const page = Math.max(1, Number(searchParams.page || '1'));
  if (page > 1) sp.set('page', String(page));

  // luôn yêu cầu BE trả kèm skus + flags
  sp.set('includeSkus', '1');

  const searchUrl = sp.toString()
    ? `/products/search?${sp.toString()}`
    : '/products';

  const [productsData, categoriesData] = await Promise.all([
    getJSON<{ items: any[]; pagination?: any }>(searchUrl),
    getJSON<{ items: any[] }>('/categories'),
  ]);

  const catMap = new Map(
    (categoriesData.items || []).map((c: any) => [c.slug, c.name])
  );
  const items = productsData.items || [];
  const pg = productsData.pagination as
    | { page: number; pages: number }
    | undefined;

  const currentCategory =
    typeof searchParams.category === 'string'
      ? searchParams.category
      : '';
  const currentSearch =
    typeof searchParams.search === 'string' ? searchParams.search : '';
  const currentFeatured =
    String(searchParams.featured || '') === 'true';
  const currentSort =
    typeof searchParams.sort === 'string' ? searchParams.sort : '';

  const activeFilters =
    currentCategory || currentSearch || currentFeatured || currentSort;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700">
              <span className="text-base">🍄</span>
              Danh sách sản phẩm nấm tại Mushroom Shop
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              Sản phẩm
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl">
              Lọc theo danh mục, từ khóa, nổi bật hoặc giá để tìm loại nấm phù hợp
              cho gia đình, nhà hàng hoặc dự án của bạn.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 text-[11px] text-slate-500">
            <div>
              Đang hiển thị{' '}
              <span className="font-semibold text-slate-900">
                {items.length}
              </span>{' '}
              sản phẩm
              {pg ? (
                <>
                  {' '}
                  · Trang{' '}
                  <span className="font-semibold text-slate-900">
                    {pg.page}
                  </span>
                  /
                  <span className="font-semibold text-slate-900">
                    {pg.pages}
                  </span>
                </>
              ) : null}
            </div>
            <Link
              href="/"
              className="text-[10px] text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>

        {/* Thanh filter */}
        <div className="sticky top-16 z-30">
          <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur px-3 py-2 shadow-sm">
            <SearchFilters
              categories={categoriesData.items || []}
              currentSearch={currentSearch}
              currentCategory={currentCategory}
              currentFeatured={currentFeatured}
              currentSort={currentSort}
              compact
            />

            {/* Chips hiển thị filter đang áp dụng */}
            {activeFilters && (
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
                {currentSearch && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                    Từ khóa: <b>{currentSearch}</b>
                  </span>
                )}
                {currentCategory && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                    Danh mục:{' '}
                    <b>{catMap.get(currentCategory) || currentCategory}</b>
                  </span>
                )}
                {currentFeatured && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                    Sản phẩm nổi bật
                  </span>
                )}
                {currentSort && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                    Sắp xếp: <b>{currentSort}</b>
                  </span>
                )}
                <Link
                  href="/products"
                  className="px-2 py-0.5 rounded-full bg-transparent border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                >
                  Xoá bộ lọc
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lưới sản phẩm */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {items.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p: any) => {
                const skus: any[] = Array.isArray(p.skus) ? p.skus : [];

                const hasStock =
                  typeof p.hasStock === 'boolean'
                    ? p.hasStock
                    : skus.some((s) => (s.stock ?? 1) > 0);

                const sel =
                  (p.firstSku as any) ??
                  skus.find((s) => (s.stock ?? 1) > 0) ??
                  skus[0];

                const sku = sel?.sku || '';
                const price =
                  typeof sel?.price === 'number'
                    ? sel.price
                    : typeof p?.priceRange?.min === 'number'
                    ? p.priceRange.min
                    : 0;
                const weight = sel?.weight;

                return (
                  <ProductCard
                    key={p.slug}
                    p={p}
                    categoryName={
                      p.category ? catMap.get(p.category) : undefined
                    }
                    cta={
                      hasStock && sku ? (
                        <AddToCart
                          sku={sku}
                          name={p.name}
                          image={p.images?.[0]}
                          price={price}
                          productSlug={p.slug}
                          weight={weight}
                        />
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-9 items-center justify-center w-full rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-400 cursor-not-allowed"
                          title={
                            skus.length
                              ? 'Các biến thể hiện đã hết hàng'
                              : 'Sản phẩm chưa có SKU khả dụng'
                          }
                        >
                          Hết hàng
                        </button>
                      )
                    }
                  />
                );
              })}
            </div>

            {pg && pg.pages > 1 && (
              <div className="pt-4">
                <Pagination page={pg.page} pages={pg.pages} />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 px-6 text-center text-slate-500 text-sm">
            <div className="text-2xl mb-2">🍄</div>
            Không tìm thấy sản phẩm nào với bộ lọc hiện tại.
            <div className="mt-2 text-[11px]">
              Hãy thử xoá bớt bộ lọc, đổi từ khóa hoặc chọn danh mục khác.
            </div>
            <div className="mt-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] hover:bg-emerald-700 transition-colors"
              >
                Đặt lại bộ lọc
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
