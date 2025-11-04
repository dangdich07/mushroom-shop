import Link from 'next/link';

export default function NotFoundProduct() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        <p className="text-gray-600 mt-2">Có thể sản phẩm đã bị ẩn hoặc không tồn tại.</p>
        <Link href="/products" className="inline-block mt-4 rounded-lg border px-4 py-2 hover:bg-gray-50">
          Về trang sản phẩm
        </Link>
      </div>
    </div>
  );
}
