const configureClientDevBundles = (config) => {
  config.optimization = {
    ...config.optimization,
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
  };

  return config;
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  env: {
    USE_MOCK_AUTH: process.env.USE_MOCK_AUTH,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob:",
                  "font-src 'self'",
                  "connect-src 'self' ws: wss: http: https:",
                  "frame-src 'self'",
                  "worker-src 'self' blob:",
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob:",
                  "font-src 'self'",
                  "connect-src 'self'",
                  "frame-src 'self'",
                ].join('; '),
          },
        ],
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    if (!isServer && dev) {
      configureClientDevBundles(config);
      // Rely on Next.js default devtool (eval-source-map) to avoid performance regressions.
    }
    return config;
  },
}

export default nextConfig;
