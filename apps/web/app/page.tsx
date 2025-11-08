// apps/web/app/page.tsx
import Link from 'next/link';
import { getJSON } from '../lib/api';

type Category = {
  _id: string;
  slug: string;
  name: string;
};

type Product = {
  _id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  priceRange?: { min?: number; max?: number };
  images?: string[];
};

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await getJSON<{ items: Category[] }>('/categories');
    return res.items || [];
  } catch {
    return [];
  }
}

async function fetchFeatured(): Promise<Product[]> {
  try {
    const res = await getJSON<{ items: Product[] }>('/products/featured?limit=4');
    return res.items || [];
  } catch {
    return [];
  }
}

function formatVnd(v?: number) {
  if (!v || v <= 0) return 'Liên hệ';
  return `${v.toLocaleString('vi-VN')} ₫`;
}

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    fetchCategories(),
    fetchFeatured(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="border-b bg-gradient-to-br from-emerald-50 via-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-700">
              <span className="text-lg">🍄</span>
              Nền tảng bán nấm sạch &amp; nấm dược liệu cho người Việt
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-slate-900 tracking-tight">
              Mushroom Shop
              <span className="block text-lg md:text-2xl font-normal text-slate-600 mt-1">
                Tinh chọn từng cây nấm, giao tận bếp &amp; chăm từng giấc khỏe.
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-600 max-w-xl">
              Đặt nấm tươi, nấm khô, nấm dược liệu chính ngạch. Thanh toán an toàn,
              theo dõi đơn hàng rõ ràng, API thân thiện nếu bạn muốn tích hợp.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Mua sắm ngay
                <span className="text-base">→</span>
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-sm text-slate-800 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
              >
                Xem danh mục
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Nguồn nấm được chọn lọc
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Hỗ trợ thanh toán Stripe sandbox
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                API riêng cho tích hợp hệ thống
              </div>
            </div>
          </div>

          {/* Hero side card (không dùng next/image để tránh lỗi host) */}
          <div className="w-full md:w-72">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-slate-50 px-4 py-4 shadow-lg">
              <div className="text-xs text-emerald-300 mb-1">Trạng thái hệ thống</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">Online</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                MongoDB, API, thanh toán thử Stripe đang hoạt động.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-[9px]">
                <div className="bg-white/5 rounded-2xl px-2 py-1.5">
                  <div className="text-slate-300">Danh mục</div>
                  <div className="text-xs font-semibold">
                    {categories.length || 3}+
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl px-2 py-1.5">
                  <div className="text-slate-300">Sản phẩm</div>
                  <div className="text-xs font-semibold">
                    {featured.length ? `${featured.length}+ nổi bật` : 'Đang cập nhật'}
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl px-2 py-1.5">
                  <div className="text-slate-300">Đơn hàng</div>
                  <div className="text-xs font-semibold">Demo sandbox</div>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-400/30" />
            </div>
          </div>
        </div>
      </section>

      {/* USP / Lợi ích */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3 text-xs">
          <div className="rounded-2xl bg-white border border-slate-100 p-4 flex flex-col gap-1">
            <div className="text-base">🛒</div>
            <div className="font-semibold text-slate-900">Mua sắm đơn giản</div>
            <p className="text-slate-600">
              Chọn SKU rõ ràng, giỏ hàng gọn, theo dõi từng đơn với trạng thái thực tế.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-4 flex flex-col gap-1">
            <div className="text-base">🧾</div>
            <div className="font-semibold text-slate-900">Giá minh bạch</div>
            <p className="text-slate-600">
              Mỗi sản phẩm có khoảng giá và SKU cụ thể, dễ tra cứu, dễ tích hợp.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-4 flex flex-col gap-1">
            <div className="text-base">👨‍💻</div>
            <div className="font-semibold text-slate-900">Thân thiện với dev</div>
            <p className="text-slate-600">
              API RESTful, có endpoint /products, /orders, webhooks Stripe để mở rộng.
            </p>
          </div>
        </div>
      </section>

      {/* Danh mục nổi bật */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
              Danh mục phổ biến
            </h2>
            <Link
              href="/categories"
              className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="group rounded-2xl bg-white border border-slate-100 px-4 py-3 flex flex-col gap-1 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-sm transition-all"
              >
                <div className="text-[11px] text-emerald-600 font-medium">
                  {cat.slug}
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-500 group-hover:text-slate-600">
                  Xem sản phẩm trong danh mục này →
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sản phẩm nổi bật */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
              Sản phẩm nổi bật
            </h2>
            <Link
              href="/products"
              className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {featured.map((p) => (
              <Link
                key={p._id}
                href={`/products/${p.slug}`}
                className="group flex flex-col rounded-2xl bg-white border border-slate-100 hover:border-emerald-300 hover:shadow-sm transition-all overflow-hidden"
              >
                {/* Ảnh: chỉ hiển thị 1 màu nền + text để tránh lỗi host hình */}
                <div className="h-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 text-[10px] text-slate-100 flex items-end px-3 pb-2">
                  <span className="truncate opacity-90">
                    {p.name}
                  </span>
                </div>
                <div className="flex-1 px-3 py-2 flex flex-col gap-1">
                  <div className="text-xs font-semibold text-slate-900 line-clamp-2">
                    {p.name}
                  </div>
                  {p.shortDescription && (
                    <div className="text-[10px] text-slate-500 line-clamp-2">
                      {p.shortDescription}
                    </div>
                  )}
                  <div className="mt-auto pt-1 text-[11px] font-semibold text-emerald-700">
                    {p.priceRange
                      ? formatVnd(p.priceRange.min || p.priceRange.max)
                      : 'Xem chi tiết'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* BLOG / TIPS DÙNG NẤM */}
      <section className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
              Mẹo dùng nấm ngon &amp; an toàn
            </h2>
            <span className="text-[10px] text-slate-400">
              Nội dung demo — bạn có thể nối vào CMS sau
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-emerald-600 font-semibold mb-1">
                Rửa &amp; sơ chế
              </div>
              <p className="text-slate-700">
                Không ngâm nấm tươi quá lâu, chỉ rửa nhanh dưới vòi nước, thấm khô trước khi nấu để giữ vị ngọt tự nhiên.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-emerald-600 font-semibold mb-1">
                Kết hợp dinh dưỡng
              </div>
              <p className="text-slate-700">
                Nấm đi rất hợp với gừng, tỏi, tiêu và xương hầm. Tránh chiên cháy quá kỹ để không làm mất hoạt chất tốt.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-emerald-600 font-semibold mb-1">
                Bảo quản đúng cách
              </div>
              <p className="text-slate-700">
                Nấm tươi để ngăn mát, nấm khô để nơi thoáng mát, kín. Nấm dược liệu nên dùng theo liệu trình rõ ràng.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
