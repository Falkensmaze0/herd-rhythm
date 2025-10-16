import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    USE_MOCK_AUTH: process.env.USE_MOCK_AUTH,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  webpack: (config, { isServer, webpack }) => {
    // Polyfill Buffer for client-side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // Use string polyfills, not import.meta.resolve
      crypto: 'crypto-browserify',
      buffer: 'buffer/',
    };

    // Ensure Buffer is available globally
    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ];

    if (!isServer) {
      // For client-side, externalize 'jsonwebtoken' as it's a Node.js module
      config.externals = {
        ...config.externals,
        'jsonwebtoken': 'commonjs jsonwebtoken',
      };
      
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

