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
  const list = Array.isArray(images) ? images : [];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      {/* Ảnh lớn */}
      <div className="relative overflow-hidden rounded-xl border bg-white">
        {/* Giữ tỉ lệ, chặn tràn màn hình */}
        <div className="aspect-[4/3] md:aspect-square max-h-[70vh]">
          {list[active] ? (
            <Image
              src={list[active]}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"   // ⬅️ không che khuất, không tràn
              priority
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-gray-400">
              Chưa có ảnh
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={
                'relative overflow-hidden rounded-lg border ' +
                (i === active
                  ? 'ring-2 ring-black'
                  : 'hover:ring-1 hover:ring-gray-300')
              }
              title={`Ảnh ${i + 1}`}
            >
              <div className="aspect-square">
                <Image
                  src={src}
                  alt={`${name} - ${i + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
