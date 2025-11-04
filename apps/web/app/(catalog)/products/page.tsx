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
      ? `Khám phá các sản phẩm ${cat ? `thuộc ${cat} ` : ''}${q ? `khớp “${q}” ` : ''}tại Mushroom Shop`
      : 'Khám phá các sản phẩm nấm: tươi, khô, dược liệu… tại Mushroom Shop';

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, url: '/products', type: 'website' },
  };
}

// giữ filter
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
  const sp = new URLSearchParams();
  if (searchParams.category) sp.set('category', String(searchParams.category));
  if (searchParams.search) sp.set('search', String(searchParams.search));
  if (searchParams.featured) sp.set('featured', String(searchParams.featured));
  if (searchParams.sort) sp.set('sort', String(searchParams.sort));

  const page = Math.max(1, Number(searchParams.page || '1'));
  if (page > 1) sp.set('page', String(page));

  const searchUrl = sp.toString() ? `/products/search?${sp.toString()}` : '/products';

  const [productsData, categoriesData] = await Promise.all([
    getJSON<{ items: any[]; pagination?: any }>(searchUrl),
    getJSON<{ items: any[] }>('/categories'),
  ]);

  const catMap = new Map((categoriesData.items || []).map((c: any) => [c.slug, c.name]));
  const items = productsData.items || [];
  const pg = productsData.pagination as { page: number; pages: number } | undefined;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
          <p className="text-gray-600">Tìm và mua những loại nấm phù hợp.</p>
        </div>
        <div className="text-sm text-gray-600">
          Tìm thấy <strong>{items.length}</strong> sản phẩm
          {pg ? ` (trang ${pg.page}/${pg.pages})` : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30">
        <div className="rounded-lg border bg-white/700 backdrop-blur p-1 md:p-2 shadow-sm">
          <div className="mx-auto max-w-11xl">
            <SearchFilters
              categories={categoriesData.items || []}
              currentSearch={String(searchParams.search || '')}
              currentCategory={String(searchParams.category || '')}
              currentFeatured={String(searchParams.featured || '') === 'true'}
              currentSort={String(searchParams.sort || '')}
              compact
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {items.length ? (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {items.map((p: any) => {
      const skus: any[] = Array.isArray(p.skus) ? p.skus : [];
      const first = skus[0];
      const sku = (p.defaultSku as string) || first?.sku || '';

      const price =
        typeof first?.price === 'number'
          ? first.price
          : typeof p.priceRange?.min === 'number'
          ? p.priceRange.min
          : 0;

      const weight = first?.weight;

      return (
        <ProductCard
          key={p.slug}
          p={p}
          categoryName={p.category ? catMap.get(p.category) : undefined}
          cta={
            sku ? (
              <AddToCart
            sku={p.skus?.[0]?.sku ?? p.defaultSku ?? `SKU-${p._id}`}   // ✅ không còn fallback cứng "LC-100-DRY"
            name={p.name}
            image={p.images?.[0]}
            price={p.skus?.[0]?.price ?? p.priceRange?.min ?? 0}
            productSlug={p.slug}
            weight={p.skus?.[0]?.weight}
          />
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-gray-400 bg-gray-50 cursor-not-allowed"
                title="Sản phẩm chưa có SKU khả dụng"
              >
                Hết hàng
              </button>
            )
          }
        />
      );
    })}
  </div>
) : (
  <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
    Không tìm thấy sản phẩm nào. Thử thay đổi bộ lọc ở trên nhé.
  </div>
)}

{pg && pg.pages > 1 && <Pagination page={pg.page} pages={pg.pages} />}
    </section>
  );
}
