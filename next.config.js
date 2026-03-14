/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Disable canvas for react-pdf (not available in browser)
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
