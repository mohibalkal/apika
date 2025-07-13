/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  images: {
    domains: ['image.tmdb.org', 'cdn.myanimelist.net'],
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 