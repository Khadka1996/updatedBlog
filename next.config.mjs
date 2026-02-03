/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.everestkit.com',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.everestkit.com/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'https://api.everestkit.com/uploads/:path*',
      },
    ]
  },
}

export default nextConfig
