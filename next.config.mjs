/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.everestkit.com',
        port: '',
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
