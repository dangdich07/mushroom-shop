'use client';

import { useMemo, useState } from 'react';
import AddToCart from './AddToCart';

type SkuLite = { sku: string; price: number; weight?: number };

export default function SkuBuyBox({
  skus,
  fallbackPrice,
  defaultSku,
  // các meta sau là tùy chọn – nếu truyền sẽ giúp giỏ hàng hiển thị đẹp hơn
  productName,
  productImage,
  productSlug,
}: {
  skus: SkuLite[];
  fallbackPrice?: number;
  defaultSku?: string;
  productName?: string;
  productImage?: string;
  productSlug?: string;
}) {
  const [currentSku, setCurrentSku] = useState(
    defaultSku || (skus[0]?.sku ?? '')
  );
  const [qty, setQty] = useState(1);

  const selected = useMemo(
    () => skus.find((s) => s.sku === currentSku),
    [skus, currentSku]
  );

  const price = useMemo<number>(
    () => (typeof selected?.price === 'number' ? selected!.price : (fallbackPrice ?? 0)),
    [selected, fallbackPrice]
  );

  const weight = selected?.weight; // <-- dòng bạn hỏi: OK với optional chaining

  return (
    <div className="rounded-xl border p-4 bg-white space-y-3">
      {/* Chọn SKU */}
      {skus.length > 1 && (
        <div className="space-y-1">
          <div className="text-sm font-medium">Chọn loại</div>
          <div className="flex flex-wrap gap-2">
            {skus.map((s) => (
              <button
                key={s.sku}
                onClick={() => setCurrentSku(s.sku)}
                className={
                  'px-3 py-1.5 rounded-lg border text-sm ' +
                  (s.sku === currentSku
                    ? 'border-black bg-black text-white'
                    : 'hover:bg-gray-50')
                }
                title={s.sku}
              >
                {s.weight ? `${s.weight}g` : s.sku}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Giá */}
      <div className="text-2xl font-semibold">
        {new Intl.NumberFormat('vi-VN').format(price)}₫
      </div>

      {/* Số lượng + Thêm vào giỏ */}
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
          className="h-10 w-20 rounded-lg border px-3"
        />

        <AddToCart
          sku={currentSku}
          qty={qty}
          price={price}
          weight={skus.find(s => s.sku === currentSku)?.weight}
          name={productName}
          image={productImage}
          productSlug={productSlug}
        />
      </div>
    </div>
  );
}
