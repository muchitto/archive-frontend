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
      'archive.org',
      'ia600803.us.archive.org',
      'ia800803.us.archive.org'
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/search',
        permanent: false,
      }
    ]
  }
}

module.exports = nextConfig
