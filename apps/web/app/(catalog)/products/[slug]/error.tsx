'use client';

export default function ErrorProductPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-xl border bg-white p-6 text-center">
        <h2 className="text-lg font-semibold">Có lỗi xảy ra</h2>
        <p className="text-gray-600 mt-2 break-all">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
