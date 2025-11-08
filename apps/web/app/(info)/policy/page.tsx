// apps/web/app/policy/page.tsx

export default function PolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-sm text-stone-700">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Chính sách &amp; bảo mật
        </p>
        <h1 className="text-3xl font-semibold text-stone-900">
          Điều khoản mua hàng tại Mushroom Shop
        </h1>
        <p className="text-stone-500 max-w-3xl">
          Dưới đây là tóm tắt các chính sách cơ bản. Bạn có thể tùy chỉnh nội dung
          cho phù hợp với quy định thực tế của cửa hàng.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-stone-900">
          1. Giao hàng
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Giao nội thành trong ngày với nấm tươi (tuỳ khu vực).</li>
          <li>Nấm khô &amp; dược liệu giao toàn quốc qua đơn vị vận chuyển.</li>
          <li>Phí vận chuyển hiển thị ở bước thanh toán.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-stone-900">
          2. Đổi trả
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Hỗ trợ đổi / hoàn tiền khi sản phẩm hỏng, mốc, sai hàng.</li>
          <li>Liên hệ trong vòng 24 giờ sau khi nhận hàng kèm hình ảnh.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-stone-900">
          3. Thanh toán
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Hỗ trợ thanh toán online qua cổng thanh toán tích hợp (Stripe / ngân hàng).
          </li>
          <li>Mọi giao dịch được mã hóa và xử lý an toàn.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-stone-900">
          4. Bảo mật thông tin
        </h2>
        <p>
          Chúng tôi chỉ sử dụng thông tin của bạn để xử lý đơn hàng, hỗ trợ sau
          bán và gửi thông tin ưu đãi (nếu bạn đồng ý). Không chia sẻ cho bên thứ
          ba ngoài đối tác giao nhận &amp; thanh toán liên quan trực tiếp tới đơn hàng.
        </p>
      </section>

      <section className="space-y-1 text-xs text-stone-500">
        <p>
          *Các thông tin trên mang tính mẫu. Hãy điều chỉnh theo chính sách pháp
          lý thực tế của doanh nghiệp bạn.*
        </p>
      </section>
    </main>
  );
}
