export default function ProductPrice({
  priceRange,
  price,
}: {
  priceRange?: { min?: number; max?: number };
  price?: number;
}) {
  const fmt = (v?: number) =>
    typeof v === 'number'
      ? v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
      : '';

  if (typeof price === 'number') {
    return <div className="text-2xl font-semibold">{fmt(price)}</div>;
  }

  const min = priceRange?.min;
  const max = priceRange?.max;

  if (typeof min === 'number' && typeof max === 'number' && min !== max) {
    return (
      <div className="text-2xl font-semibold">
        {fmt(min)} – {fmt(max)}
      </div>
    );
  }
  if (typeof min === 'number') return <div className="text-2xl font-semibold">{fmt(min)}</div>;
  return <div className="text-2xl font-semibold text-gray-500">Liên hệ</div>;
}
