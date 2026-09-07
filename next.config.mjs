// Content-Security-Policy, one directive per key. Third-party hosts the tool
// pages talk to directly must be listed here or the browser blocks the request
// (shows up as "Failed to fetch"):
//   api.exchangerate-api.com - Currency Converter
//   ndt.amitgaru.com.np      - Nepali Date Converter
//   docs.opencv.org          - Photo Stretcher (loads opencv.js + its wasm)
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'", "'unsafe-inline'", "'unsafe-eval'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://pagead2.googlesyndication.com',
    'https://www.google.com',
    'https://ep1.adtrafficquality.google',
    'https://ep2.adtrafficquality.google',
    'https://docs.opencv.org',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'", 'blob:',
    'https://api.everestkit.com',
    'https://www.google.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://ep1.adtrafficquality.google',
    'https://ep2.adtrafficquality.google',
    'https://pagead2.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://api.exchangerate-api.com',
    'https://ndt.amitgaru.com.np',
    'https://docs.opencv.org',
  ],
  'frame-src': [
    "'self'",
    'https://www.google.com',
    'https://googleads.g.doubleclick.net',
    'https://ep1.adtrafficquality.google',
    'https://ep2.adtrafficquality.google',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
}

const CONTENT_SECURITY_POLICY = Object.entries(CSP_DIRECTIVES)
  .map(([directive, values]) => `${directive} ${values.join(' ')}`)
  .join('; ')

import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this folder. A stray package-lock.json in the
  // home directory was making Next guess the wrong root for file tracing.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  eslint: {
    // `next build`'s own lint pass crashes on this project's flat ESLint config
    // ("Cannot serialize key \"parse\" in \"parser\"", a known Next 15.5 issue)
    // and silently continues without linting. Run `npm run lint` (plain eslint,
    // which works and is green) in CI / pre-commit instead.
    ignoreDuringBuilds: true,
  },
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
  async redirects() {
    return [
      // The Video Downloader tool was removed; send old links/bookmarks to the
      // tools index instead of a 404.
      {
        source: '/tools/video-downloader',
        destination: '/tools',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    // Where the frontend proxies /api and /uploads to. Override with
    // API_PROXY_TARGET (e.g. http://localhost:5000) for local backend testing.
    const apiTarget = (process.env.API_PROXY_TARGET || 'https://api.everestkit.com').replace(/\/$/, '')
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiTarget}/uploads/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: CONTENT_SECURITY_POLICY,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig