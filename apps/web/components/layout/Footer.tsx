export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-1 text-sm text-stone-600">
        {/* Top */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Brand */}
          <div className="space-y-2 max-w-sm">
            <div className="inline-flex items-center gap-2">
              <span className="text-xl">🍄</span>
              <span className="text-sm font-semibold tracking-tight text-stone-900">
                Mushroom Shop
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Nguồn nấm sạch &amp; dược liệu được tuyển chọn kỹ, giao hàng nhanh,
              thông tin minh bạch để bạn yên tâm sử dụng mỗi ngày.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                Điều hướng
              </div>
              <a href="/products" className="block hover:text-stone-900">
                Sản phẩm
              </a>
              <a href="/categories" className="block hover:text-stone-900">
                Danh mục
              </a>
              <a href="/cart" className="block hover:text-stone-900">
                Giỏ hàng
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                Cửa hàng
              </div>
              <a href="/about" className="block hover:text-stone-900">
                Giới thiệu
              </a>
              <a href="/policy" className="block hover:text-stone-900">
                Chính sách &amp; bảo mật
              </a>
              <a href="/contact" className="block hover:text-stone-900">
                Liên hệ
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                Hỗ trợ
              </div>
              <p className="text-stone-600">Hotline: <span className="font-medium">0123 456 789</span></p>
              <p className="text-stone-600">Email: support@mushroomshop.vn</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100 pt-5 text-[11px] text-stone-500">
          <p>© {year} Mushroom Shop. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Theo dõi chúng tôi:</span>
            <a
              href="#"
              className="rounded-full border border-stone-200 px-2 py-0.5 hover:border-stone-400 hover:text-stone-900 transition"
            >
              Facebook
            </a>
            <a
              href="#"
              className="rounded-full border border-stone-200 px-2 py-0.5 hover:border-stone-400 hover:text-stone-900 transition"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
