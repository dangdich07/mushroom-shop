// apps/web/app/contact/page.tsx

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Liên hệ
        </p>
        <h1 className="text-3xl font-semibold text-stone-900">
          Kết nối với Mushroom Shop
        </h1>
        <p className="text-sm text-stone-600 max-w-3xl">
          Có câu hỏi về sản phẩm, cách dùng nấm dược liệu hay đơn hàng của bạn?
          Hãy để lại thông tin, chúng tôi sẽ phản hồi sớm nhất.
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-[1.4fr,1fr]">
        {/* Form demo UI (chưa gắn backend) */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/70"
                placeholder="Nhập tên của bạn"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/70"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Nội dung
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/70"
              placeholder="Mô tả ngắn gọn câu hỏi hoặc nhu cầu của bạn..."
            />
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-95"
          >
            Gửi liên hệ (demo)
          </button>

          <p className="text-[10px] text-stone-500">
            Nút gửi hiện tại chỉ là giao diện minh họa. Bạn có thể kết nối với API
            hoặc dịch vụ gửi email sau.
          </p>
        </div>

        {/* Info */}
        <div className="space-y-4 text-sm text-stone-600">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-1.5">
            <h2 className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
              Thông tin liên hệ
            </h2>
            <p>Hotline: <span className="font-semibold">0123 456 789</span></p>
            <p>Email: support@mushroomshop.vn</p>
            <p>Thời gian: 8:30 – 21:00 (T2–CN)</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-1.5">
            <h2 className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
              Địa chỉ (nếu có)
            </h2>
            <p>Thêm địa chỉ cửa hàng / kho của bạn tại đây.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
