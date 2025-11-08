// apps/web/app/(catalog)/products/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { getJSON } from '../../../../lib/api';
import ProductGallery from '../../../../components/product/ProductGallery';
import SkuBuyBox from '../parts/SkuBuyBox';

type SkuLite = {
  sku: string;
  price: number;
  weight?: number;
  stock?: number;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  priceRange?: { min?: number; max?: number };
  featured?: boolean;
  skus?: SkuLite[];
};

function formatVND(n?: number) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '';
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    return await getJSON<Product>(`/products/slug/${slug}`);
  } catch {
    return null;
  }
}

async function fetchRelated(category?: string, excludeSlug?: string) {
  if (!category) return [];
  try {
    const res = await getJSON<{ items: Product[] }>(
      `/products/category/${category}?limit=8`
    );
    const items = res.items || [];
    return items
      .filter((x) => x.slug !== excludeSlug)
      .slice(0, 8);
  } catch {
    return [];
  }
}

/** 🔎 SEO động */
export async function generateMetadata(
  { params }: { params: { slug: string } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await fetchProduct(params.slug);
  if (!product) return { title: 'Không tìm thấy sản phẩm | Mushroom Shop' };

  const title = `${product.name} | Mushroom Shop`;
  const description =
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    'Sản phẩm từ Mushroom Shop.';
  const url = `/products/${product.slug}`;
  const image = product.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await fetchProduct(params.slug);
  if (!product) return notFound();

  const related = await fetchRelated(product.category, product.slug);

  const skuList: SkuLite[] = Array.isArray(product.skus) ? product.skus : [];

  const hasBuyableSku =
    skuList.length > 0 &&
    skuList.some((s) => s.stock === undefined || s.stock > 0);

  const firstAvailable = skuList.find((s) => (s.stock ?? 1) > 0);
  const defaultSku = firstAvailable?.sku || skuList[0]?.sku || '';
  const defaultPrice =
    firstAvailable?.price ??
    skuList[0]?.price ??
    product.priceRange?.min;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image:
      product.images && product.images.length ? product.images : undefined,
    sku: defaultSku || undefined,
    description:
      product.shortDescription || product.description || undefined,
    brand: { '@type': 'Brand', name: 'Mushroom Shop' },
    offers:
      typeof defaultPrice === 'number'
        ? {
            '@type': 'Offer',
            priceCurrency: 'VND',
            price: String(defaultPrice),
            availability: hasBuyableSku
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url: `/products/${product.slug}`,
          }
        : undefined,
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs sm:text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-gray-800 hover:underline">
              Trang chủ
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link
              href="/products"
              className="hover:text-gray-800 hover:underline"
            >
              Sản phẩm
            </Link>
          </li>
          {product.category && (
            <>
              <li>›</li>
              <li>
                <Link
                  href={`/products?category=${product.category}`}
                  className="hover:text-gray-800 hover:underline capitalize"
                >
                  {product.category.replace(/-/g, ' ')}
                </Link>
              </li>
            </>
          )}
          <li>›</li>
          <li className="text-gray-900 font-medium line-clamp-1">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-8 items-start">
        {/* Gallery */}
        <div className="rounded-2xl border bg-white px-3 py-3 shadow-sm">
          <ProductGallery name={product.name} images={product.images} />
        </div>

        {/* Info + Buy box */}
        <div className="space-y-5">
          <header className="space-y-3">
            <div className="flex items-center gap-2">
              {product.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-semibold uppercase">
                  Nổi bật
                </span>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                  hasBuyableSku
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {hasBuyableSku ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold leading-snug">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-sm text-gray-600">
                {product.shortDescription}
              </p>
            )}

            {/* Price summary */}
            <div className="flex flex-wrap items-baseline gap-3">
              {typeof defaultPrice === 'number' && (
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(defaultPrice)}
                </p>
              )}
              {product.priceRange?.min &&
                product.priceRange?.max &&
                product.priceRange.min !== product.priceRange.max && (
                  <p className="text-xs text-gray-500">
                    Khoảng giá: {formatVND(product.priceRange.min)} –{' '}
                    {formatVND(product.priceRange.max)}
                  </p>
                )}
            </div>
          </header>

          {/* Buy box */}
          <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
            <SkuBuyBox
              skus={skuList}
              fallbackPrice={defaultPrice}
              defaultSku={defaultSku}
              productName={product.name}
              productImage={product.images?.[0]}
              productSlug={product.slug}
            />
          </div>

          {/* Tags */}
          {product.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-[10px] font-medium text-gray-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Description */}
      {product.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
          <article className="prose prose-sm max-w-none text-gray-800">
            {product.description}
          </article>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Có thể bạn cũng thích</h2>
            <Link
              href={
                product.category
                  ? `/products?category=${product.category}`
                  : '/products'
              }
              className="text-xs sm:text-sm text-gray-600 hover:underline"
            >
              Xem thêm →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r._id}
                href={`/products/${r.slug}`}
                className="group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-gray-50">
                  {r.images?.[0] ? (
                    <Image
                      src={r.images[0]}
                      alt={r.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : null}
                </div>
                <div className="px-3 pt-3 pb-3 flex flex-col gap-1">
                  <div className="text-xs text-gray-500">
                    {product.category
                      ? product.category.replace(/-/g, ' ')
                      : 'Mushroom Shop'}
                  </div>
                  <div className="text-sm font-medium line-clamp-2 group-hover:text-gray-900">
                    {r.name}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                    {r.priceRange?.min
                      ? `Từ ${formatVND(r.priceRange.min)}`
                      : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
