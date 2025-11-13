/** @type {import('next').NextConfig} */

// Ưu tiên lấy URL backend từ env; default là http://localhost:4000 để chạy local
const backend =
  process.env.NEXT_PUBLIC_API_ABSOLUTE_URL ||
  process.env.API_ABSOLUTE_URL ||
  'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      // ⛑️ GIỮ NextAuth ở FE, KHÔNG proxy sang backend
      { source: '/api/auth/:path*', destination: '/api/auth/:path*' },

      // Mọi route API còn lại proxy sang backend local
      { source: '/api/:path*', destination: `${backend}/:path*` },
    ];
  },
  // FE gọi nội bộ qua /api → đi qua rewrite ở trên
  env: { NEXT_PUBLIC_API_URL: '/api' },
};

export default nextConfig;
