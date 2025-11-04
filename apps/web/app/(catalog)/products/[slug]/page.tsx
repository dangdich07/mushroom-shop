import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJSON } from '../../../../lib/api';
import ProductGallery from '../../../../components/product/ProductGallery';
import SkuBuyBox from '../parts/SkuBuyBox';

type SkuLite = { sku: string; price: number; weight?: number };
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
  if (typeof n !== 'number' || !isFinite(n)) return '';
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
    return items.filter((x) => x.slug !== excludeSlug).slice(0, 8);
  } catch {
    return [];
  }
}

/** 🔎 SEO động cho trang sản phẩm */
export async function generateMetadata(
  { params }: { params: { slug: string } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await fetchProduct(params.slug);
  if (!product) return { title: 'Không tìm thấy sản phẩm' };

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
      // ⚠️ Next.js không hỗ trợ "product" ⇒ dùng "website"
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

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug);
  if (!product) return notFound();

  const related = await fetchRelated(product.category, product.slug);
  const skuList = Array.isArray(product.skus) ? product.skus : [];
  const defaultSku = skuList[0]?.sku || '';
  const defaultPrice = skuList[0]?.price ?? product.priceRange?.min;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images && product.images.length ? product.images : undefined,
    sku: defaultSku || undefined,
    description: product.shortDescription || product.description || undefined,
    brand: { '@type': 'Brand', name: 'Mushroom Shop' },
    offers: defaultPrice
      ? {
          '@type': 'Offer',
          priceCurrency: 'VND',
          price: String(defaultPrice),
          availability: 'https://schema.org/InStock',
          url: `/products/${product.slug}`,
        }
      : undefined,
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:underline">Trang chủ</Link></li>
          <li>›</li>
          <li><Link href="/products" className="hover:underline">Sản phẩm</Link></li>
          {product.category && (
            <>
              <li>›</li>
              <li>
                <Link href={`/products?category=${product.category}`} className="hover:underline">
                  {product.category}
                </Link>
              </li>
            </>
          )}
          <li>›</li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border p-3">
          <ProductGallery name={product.name} images={product.images} />
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-gray-700 mt-2">{product.shortDescription}</p>
            )}
          </div>

          <SkuBuyBox
  skus={skuList}
  fallbackPrice={defaultPrice}
  defaultSku={defaultSku}
  productName={product.name}
  productImage={product.images?.[0]}
  productSlug={product.slug}
/>

          {product.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-gray-700">
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {product.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Mô tả</h2>
          <article className="prose prose-sm max-w-none text-gray-800">
            {product.description}
          </article>
        </section>
      )}

      {related.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-semibold">Sản phẩm liên quan</h2>
            <Link
              href={product.category ? `/products?category=${product.category}` : '/products'}
              className="text-sm text-gray-600 hover:underline"
            >
              Xem thêm →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((r) => (
              <Link
                key={r._id}
                href={`/products/${r.slug}`}
                className="rounded-xl border bg-white hover:shadow-sm transition overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-3">
                  <div className="text-sm font-medium line-clamp-2">{r.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {r.priceRange?.min ? `Từ ${formatVND(r.priceRange.min)}` : '—'}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
