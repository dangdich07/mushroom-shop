// apps/web/app/categories/page.tsx
import Link from 'next/link';
import { getJSON } from '../../../lib/api';

type Category = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
};

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await getJSON<{ items: Category[] }>('/categories');
    return res.items || [];
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="border-b bg-gradient-to-r from-emerald-50 via-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 w-fit">
            <span className="text-lg">🍄</span>
            Khám phá các dòng sản phẩm Mushroom Shop
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                Danh mục sản phẩm
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl">
                Chúng tôi phân loại theo mục đích sử dụng để bạn dễ chọn:
                từ nấm tươi chế biến hằng ngày, nấm dược liệu tốt cho sức khỏe
                đến các sản phẩm nấm khô tiện bảo quản.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1 text-xs text-slate-500">
              <span>API nội bộ chuẩn RESTful</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 text-slate-50 text-[10px] uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                /categories &amp; /products?category=slug
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              😶
            </div>
            <p className="text-slate-700 text-sm">
              Hiện chưa có danh mục nào. Hãy thêm dữ liệu từ trang Admin.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((cat) => (
              <article
                key={cat._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white/80
                           shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                {/* subtle top accent */}
                <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-lime-300 to-amber-300 opacity-70" />

                <div className="p-4 pb-3 flex-1 flex flex-col gap-2">
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    {cat.name}
                    <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      slug: {cat.slug}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 line-clamp-3">
                    {cat.description ||
                      'Các sản phẩm được chọn lọc kỹ, phù hợp nhiều nhu cầu sử dụng khác nhau.'}
                  </p>
                </div>

                <div className="px-4 pb-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex gap-2">
                    <Link
                      href={`/products?category=${encodeURIComponent(cat.slug)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                 bg-slate-900 text-white text-[11px] font-medium
                                 group-hover:bg-emerald-600 transition-colors"
                    >
                      <span>Xem sản phẩm</span>
                      <span className="text-[13px]">↗</span>
                    </Link>
                    <Link
                      href={`/api/products?category=${encodeURIComponent(cat.slug)}`}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                 border border-emerald-100 bg-emerald-50/60 text-emerald-700
                                 hover:bg-emerald-100 text-[10px] font-medium transition-colors"
                    >
                      <span>API endpoint</span>
                    </Link>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Phù hợp cho dev &amp; khách hàng
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Tips / Blog section */}
      <section className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
              Mẹo &amp; bí kíp sử dụng nấm
            </h2>
            <Link
              href="#"
              className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Xem tất cả bài viết
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-emerald-600 font-semibold mb-1">
                Nấm tươi
              </div>
              <p className="text-slate-700">
                Bảo quản nấm tươi trong hộp kín, ngăn mát 0–4°C và dùng trong 24–48h để giữ
                hương vị tốt nhất.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-emerald-600 font-semibold mb-1">
                Nấm dược liệu
              </div>
              <p className="text-slate-700">
                Hãm trà, nấu canh hoặc ngâm rượu đúng liều lượng. Tham khảo tư vấn chuyên môn
                nếu dùng lâu dài cho sức khỏe.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-emerald-600 font-semibold mb-1">
                Nấm khô
              </div>
              <p className="text-slate-700">
                Ngâm nước ấm 15–20 phút trước khi chế biến, giữ lại nước ngâm đã lọc để tăng
                vị ngọt tự nhiên cho món ăn.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
