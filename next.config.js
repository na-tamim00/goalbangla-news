/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_VERCEL_URL;
    if (!backendUrl || !/^https?:\/\//i.test(backendUrl)) return [];
    const cleanUrl = backendUrl.replace(/\/$/, '');
    return [{ source: '/api/:path*', destination: `${cleanUrl}/api/:path*` }];
  },
}

module.exports = nextConfig
