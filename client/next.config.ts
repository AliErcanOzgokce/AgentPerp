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
};

export default nextConfig;
