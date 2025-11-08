'use client';

import { useMemo, useState } from 'react';
import AddToCart from './AddToCart';

type SkuLite = { sku: string; price: number; weight?: number; stock?: number };

export default function SkuBuyBox({
  skus,
  fallbackPrice,
  defaultSku,
  // meta để giỏ hiển thị đẹp hơn
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
  // Ưu tiên SKU còn hàng (stock>0); nếu API chưa có field stock, coi như còn hàng
  const firstAvailable = useMemo(
    () => skus.find((s) => (s.stock ?? 1) > 0) || skus[0],
    [skus]
  );

  const [currentSku, setCurrentSku] = useState(
    defaultSku || firstAvailable?.sku || ''
  );
  const [qty, setQty] = useState(1);

  const selected = useMemo(
    () => skus.find((s) => s.sku === currentSku),
    [skus, currentSku]
  );

  const price = useMemo<number>(
    () =>
      typeof selected?.price === 'number'
        ? selected.price
        : (fallbackPrice ?? 0),
    [selected, fallbackPrice]
  );

  const weight = selected?.weight;

  // Disable Add-to-cart nếu không có SKU hoặc stock=0
  const outOfStock =
    !currentSku || (selected && selected.stock === 0);

  return (
    <div className="rounded-xl border p-4 bg-white space-y-3">
      {/* Chọn SKU */}
      {skus.length > 1 && (
        <div className="space-y-1">
          <div className="text-sm font-medium">Chọn loại</div>
          <div className="flex flex-wrap gap-2">
            {skus.map((s) => {
              const disabled = s.stock === 0;
              const isActive = s.sku === currentSku;
              return (
                <button
                  key={s.sku}
                  onClick={() => !disabled && setCurrentSku(s.sku)}
                  disabled={disabled}
                  className={
                    'px-3 py-1.5 rounded-lg border text-sm transition ' +
                    (isActive
                      ? 'border-black bg-black text-white'
                      : 'hover:bg-gray-50') +
                    (disabled ? ' opacity-50 cursor-not-allowed' : '')
                  }
                  title={s.sku}
                  aria-disabled={disabled}
                >
                  {s.weight ? `${s.weight}g` : s.sku}
                </button>
              );
            })}
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
          disabled={outOfStock}
          aria-disabled={outOfStock}
        />

        <AddToCart
          sku={currentSku}
          qty={qty}
          price={price}
          weight={weight}
          name={productName}
          image={productImage}
          productSlug={productSlug}
        >
          {outOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
        </AddToCart>
      </div>

      {/* Gợi ý tồn kho nếu có thông tin stock từ API */}
      {selected?.stock === 0 && (
        <p className="text-xs text-gray-500">Biến thể này đã hết hàng.</p>
      )}
    </div>
  );
}
