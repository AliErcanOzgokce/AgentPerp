import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['hardhat'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      hardhat: '/Users/aliercanozgokce/Desktop/AgentPerp/hardhat',
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/private/**',
      },
    ],
  },
};

export default nextConfig;
