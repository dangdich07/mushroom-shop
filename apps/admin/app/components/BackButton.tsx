'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Quay lại trang chính' }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/')}
      className="mb-4 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <span className="mr-2">⬅</span>
      {label}
    </button>
  );
}
