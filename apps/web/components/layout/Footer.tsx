export default function Footer() {
  return (
    <footer className="border-t mt-60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Mushroom Shop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/about" className="hover:underline">Giới thiệu</a>
            <a href="/policy" className="hover:underline">Chính sách</a>
            <a href="/contact" className="hover:underline">Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
