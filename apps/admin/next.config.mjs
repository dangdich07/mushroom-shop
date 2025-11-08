/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Cho phép hiển thị ảnh Cloudinary với <Image/>
  images: {
    domains: ['res.cloudinary.com'],
    // (tuỳ chọn) nếu muốn chặt hơn có thể dùng remotePatterns
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    // ],
    formats: ['image/avif', 'image/webp'],
  },

  // Không đặt bất kỳ redirect nào về 3000 tại đây
  async redirects() {
    return [];
  },

  // Chỉ cấu hình proxy API (Admin -> API:4000)
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_ABSOLUTE_URL || 'http://localhost:4000';
    return [{ source: '/api/:path*', destination: `${apiBase}/:path*` }];
  },
};

export default nextConfig;
