/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export" đã bỏ → dùng Next.js server mode để hỗ trợ rewrites
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Proxy /ai-api/* → http://localhost:8000/* (chỉ cần 1 cổng Cloudflare)
  async rewrites() {
    return [
      {
        source: "/ai-api/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
  experimental: {
    appDir: false, // Keep this false for pages directory
    esmExternals: "loose", // This helps with ESM/CommonJS compatibility
  },
  transpilePackages: [
    "@vanilla-extract/sprinkles",
    "@rainbow-me/rainbowkit",
    "@reown/appkit",
    "@walletconnect/ethereum-provider",
    "@walletconnect/universal-provider",
  ],
  webpack: (config, { isServer }) => {
    // Handle module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };

    // Fix for ESM/CommonJS compatibility
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });

    // Fix for vanilla-extract and other CommonJS modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    // Handle .mjs files
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};

module.exports = nextConfig;
