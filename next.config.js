/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [ 'archive.org', 'ia600803.us.archive.org', 'ia800803.us.archive.org', 'ia800204.us.archive.org', 'ia600904.us.archive.org', ]
  },
};

module.exports = nextConfig;
