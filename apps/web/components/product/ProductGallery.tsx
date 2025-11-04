'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProductGallery({
  name,
  images,
}: {
  name: string;
  images?: string[];
}) {
  const pics = (images ?? []).filter(Boolean);
  const [active, setActive] = useState(0);
  const has = pics.length > 0;

  return (
    <div className="space-y-3">
      {/* Main */}
      <div className="aspect-square w-full overflow-hidden rounded-xl border bg-white">
        {has ? (
          <Image
            src={pics[active]!}
            alt={name}
            fill
            sizes="(min-width: 1024px) 512px, 100vw"
            className="object-contain"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl">🍄</div>
              <div className="mt-2 text-sm">Chưa có ảnh</div>
            </div>
          </div>
        )}
      </div>

      {/* Thumbs */}
      <div className="grid grid-cols-5 gap-2">
        {(has ? pics : [null, null, null]).map((src, idx) => (
          <button
            key={idx}
            onClick={() => has && setActive(idx)}
            className={`relative aspect-square overflow-hidden rounded-lg border ${
              active === idx ? 'ring-2 ring-black' : ''
            }`}
            aria-label={`Ảnh ${idx + 1}`}
          >
            {src ? (
              <Image
                src={src}
                alt={`${name} - ${idx + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300 text-xs">
                No image
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
