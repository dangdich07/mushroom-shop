'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Pagination({
  page,
  pages,
}: {
  page: number;
  pages: number;
}) {
  const pathname = usePathname();
  const qs = useSearchParams();

  const build = (target: number) => {
    const sp = new URLSearchParams(qs.toString());
    sp.set('page', String(target));
    return `${pathname}?${sp.toString()}`;
  };

  if (pages <= 1) return null;

  const around = 1; // số trang hai bên
  const from = Math.max(1, page - around);
  const to = Math.min(pages, page + around);

  const parts: (number | 'gap')[] = [];
  const push = (n: number | 'gap') => parts.push(n);

  // luôn hiển thị 1
  push(1);
  if (from > 2) push('gap');
  for (let i = from; i <= to; i++) if (i !== 1 && i !== pages) push(i);
  if (to < pages - 1) push('gap');
  if (pages > 1) push(pages);

  return (
    <nav className="mt-2 flex items-center justify-center gap-2 text-sm">
      <Link
        className={`rounded-lg border px-3 py-1 ${
          page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-gray-50'
        }`}
        href={page <= 1 ? '#' : build(page - 1)}
      >
        ← Trước
      </Link>

      {parts.map((p, idx) =>
        p === 'gap' ? (
          <span key={`g${idx}`} className="px-2 text-gray-500">…</span>
        ) : (
          <Link
            key={p}
            href={build(p)}
            className={`rounded-lg border px-3 py-1 ${
              p === page ? 'bg-black text-white border-black' : 'hover:bg-gray-50'
            }`}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        className={`rounded-lg border px-3 py-1 ${
          page >= pages ? 'pointer-events-none opacity-40' : 'hover:bg-gray-50'
        }`}
        href={page >= pages ? '#' : build(page + 1)}
      >
        Sau →
      </Link>
    </nav>
  );
}
