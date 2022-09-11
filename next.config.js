/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    images: { 
      allowFutureImage: true 
    } 
  },
  images: {
    domains: [
      'archive.org'
    ],
  },
}

module.exports = nextConfig
