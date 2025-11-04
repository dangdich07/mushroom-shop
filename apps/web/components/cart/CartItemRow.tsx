'use client';

import Image from 'next/image';
import { CartItem } from '../../hooks/useCart';

export default function CartItemRow({
  item,
  onChangeQty,
  onRemove,
}: {
  item: CartItem;
  onChangeQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const { name, image, price, qty, sku, productSlug, weight } = item;

  return (
    <div className="flex gap-4 rounded-xl border bg-white p-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image src={image} alt={name || sku} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-gray-400">🍄</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium line-clamp-1">{name || sku}</div>
        <div className="text-xs text-gray-500">
          {productSlug ? `/products/${productSlug}` : ''} {weight ? `• ${weight}g` : ''} • SKU: {sku}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => onChangeQty(Math.max(1, Number(e.target.value || 1)))}
            className="h-9 w-20 rounded-lg border px-3"
          />
          <button onClick={onRemove} className="text-sm text-red-600 hover:underline">
            Xoá
          </button>
        </div>
      </div>

      <div className="text-right">
        <div className="font-semibold">
          {new Intl.NumberFormat('vi-VN').format(price * qty)}₫
        </div>
        <div className="text-xs text-gray-500">
          {new Intl.NumberFormat('vi-VN').format(price)}₫ / chiếc
        </div>
      </div>
    </div>
  );
}
