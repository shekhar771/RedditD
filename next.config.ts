import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
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
