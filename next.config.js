/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for production deployment
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

