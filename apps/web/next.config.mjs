/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      // Alias riêng cho backend, bỏ prefix /backend khi proxy
      { source: '/api/backend/:path*', destination: 'http://localhost:4000/:path*' },

      // Để NextAuth tự xử lý, không proxy
      { source: '/api/auth/:path*', destination: '/api/auth/:path*' },

      // Các API khác mới proxy sang backend (giữ nguyên)
      { source: '/api/:path*', destination: 'http://localhost:4000/:path*' },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL: '/api',
  },
};

export default nextConfig;
