/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async rewrites() {
    return [
      { source: '/api/backend/:path*', destination: 'http://localhost:4000/:path*' },
      { source: '/api/auth/:path*', destination: '/api/auth/:path*' },
      { source: '/api/:path*', destination: 'http://localhost:4000/:path*' },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL: '/api',
  },
};

export default nextConfig;
