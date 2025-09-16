/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '116.203.117.20',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://116.203.117.20:5000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://116.203.117.20:5000/uploads/:path*',
      },
    ]
  },
}

export default nextConfig
