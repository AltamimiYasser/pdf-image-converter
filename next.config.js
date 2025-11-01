/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for production deployment
  basePath: '/pdf-image-converter', // Required for GitHub Pages subdirectory
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

