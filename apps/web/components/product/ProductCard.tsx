import Link from 'next/link';
import Badge from '../ui/Badge';

export default function ProductCard({
  p,
  categoryName,
  cta,
}: {
  p: any;
  categoryName?: string;
  cta?: React.ReactNode;
}) {
  // CHỈNH: Ưu tiên giá từ firstSku.price (do BE đã chọn biến thể hợp lệ/in-stock),
  // sau đó mới tới priceRange.min, rồi mới fallback skus[0]?.price
  const displayPrice: number | undefined =
    (typeof p?.firstSku?.price === 'number' ? p.firstSku.price : undefined) ??
    (typeof p?.priceRange?.min === 'number' ? p.priceRange.min : undefined) ??
    (Array.isArray(p?.skus) && typeof p.skus[0]?.price === 'number'
      ? p.skus[0].price
      : undefined);

  return (
    <div className="group h-full rounded-2xl border bg-white p-4 hover:shadow-sm transition flex flex-col">
      {/* image */}
      <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 overflow-hidden">
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400 text-sm">
            Chưa có ảnh
          </div>
        )}
      </div>

      {/* content */}
      <div className="mt-3 space-y-1 flex-1">
        <Link
          href={`/products/${p.slug}`}
          className="block font-semibold leading-snug hover:underline"
        >
          {p.name}
        </Link>
        <p className="text-sm text-gray-500">{categoryName || '—'}</p>

        <div className="flex items-center gap-2 pt-1">
          {p.featured && <Badge>⭐ Nổi bật</Badge>}
          {typeof displayPrice === 'number' && (
            <span className="text-sm font-medium text-gray-900">
              {displayPrice.toLocaleString('vi-VN')} ₫
            </span>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="mt-3 flex items-center justify-between">
        <Link
          href={`/products/${p.slug}`}
          className="text-sm text-blue-600 hover:underline"
        >
          Chi tiết
        </Link>
        {cta}
      </div>
    </div>
  );
}
