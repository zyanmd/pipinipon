import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // WAJIB untuk deployment di cPanel
  
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
        hostname: 'api.pipinipon.site',
        pathname: '/uploads/**',
      },
    ],
  },
  
  compress: true,
}

export default nextConfig