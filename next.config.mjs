/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    USE_MOCK_AUTH: process.env.USE_MOCK_AUTH,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore these node-specific modules in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
      };
    }
    return config;
  },
}

export default nextConfig;
