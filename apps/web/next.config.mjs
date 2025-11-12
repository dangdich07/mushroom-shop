/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    formats: ['image/avif', 'image/webp'],
  },

  async rewrites() {
    // Prod trên Render: KHÔNG rewrite, dùng route handler /api/backend/[...path]
    if (isProd) return [];

    // Dev local: proxy về API local
    return [
      { source: '/api/backend/:path*', destination: 'http://localhost:4000/:path*' },
      { source: '/api/:path*',        destination: 'http://localhost:4000/:path*' },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL: '/api',
  },
};

export default nextConfig;
