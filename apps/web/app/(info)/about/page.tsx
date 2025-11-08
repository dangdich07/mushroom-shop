// apps/web/app/about/page.tsx

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Giới thiệu
        </p>
        <h1 className="text-3xl font-semibold text-stone-900">
          Về Mushroom Shop
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
          Mushroom Shop là cửa hàng chuyên về nấm tươi, nấm khô và nấm dược liệu,
          tập trung vào nguồn hàng sạch, rõ ràng nguồn gốc, bảo quản đúng chuẩn
          và tư vấn sử dụng minh bạch. Chúng tôi muốn việc mua nấm online trở nên
          dễ, an toàn và đáng tin.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3 text-sm">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-1.5">
          <div className="text-xs font-semibold text-stone-500 uppercase">
            Chọn lọc nguồn nấm
          </div>
          <p className="text-stone-600">
            Hợp tác với nhà trồng uy tín, ưu tiên nông trại sử dụng quy trình sạch
            &amp; kiểm soát chất lượng định kỳ.
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-1.5">
          <div className="text-xs font-semibold text-stone-500 uppercase">
            Đóng gói &amp; bảo quản
          </div>
          <p className="text-stone-600">
            Đóng gói lạnh, hút chân không (với nấm khô) và hướng dẫn bảo quản rõ
            ràng ngay trên sản phẩm.
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-1.5">
          <div className="text-xs font-semibold text-stone-500 uppercase">
            Tư vấn tận tâm
          </div>
          <p className="text-stone-600">
            Gợi ý món, liều dùng với nấm dược liệu, hỗ trợ qua chat / email /
            hotline trước &amp; sau khi mua.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 text-sm text-stone-600">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            Sứ mệnh
          </h2>
          <p>
            Mang nấm sạch và nấm dược liệu chất lượng đến gần hơn với mọi gia
            đình, giúp bạn chăm sóc sức khoẻ hàng ngày bằng những nguyên liệu
            tự nhiên, dễ sử dụng, dễ mua.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            Cam kết
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Thông tin rõ ràng về nguồn gốc &amp; hạn sử dụng.</li>
            <li>Không bán sản phẩm mốc, kém chất lượng.</li>
            <li>Hỗ trợ đổi trả nếu sản phẩm lỗi do vận chuyển / bảo quản.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
