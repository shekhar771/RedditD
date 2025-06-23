import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.utfs.io',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
        pathname: '**'
      }
    ]
  }
}

export default nextConfig
