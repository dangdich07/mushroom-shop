'use client';

import { PropsWithChildren, useState } from 'react';
import { useCart } from '../../../../hooks/useCart';

type Props = PropsWithChildren<{
  sku: string;
  qty?: number;
  className?: string;
  name?: string;
  image?: string;
  price?: number;
  productSlug?: string;
  weight?: number;
}>;

export default function AddToCart({
  sku,
  qty = 1,
  className = '',
  children,
  ...meta
}: Props) {
  const cart = useCart();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const onAdd = async () => {
    if (!sku) {
      console.warn('AddToCart: missing sku, ignore');
      return;
    }
    try {
      setAdding(true);

      cart.addItem({
        sku,
        qty,
        price: Number.isFinite(meta.price!) ? Number(meta.price) : 0,
        name: meta.name,
        image: meta.image,
        productSlug: meta.productSlug,
        weight: meta.weight,
      });

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1000);
      try { navigator.vibrate?.(8); } catch {}
    } finally {
      setAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={adding || !sku}
      aria-disabled={adding || !sku}
      className={
        'inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white ' +
        'hover:opacity-90 disabled:opacity-50 transition ' +
        className
      }
      style={{ pointerEvents: adding ? 'none' : 'auto' }}
    >
      {children ?? (justAdded ? 'Đã thêm ✓' : adding ? 'Đang thêm…' : 'Thêm vào giỏ')}
    </button>
  );
}
