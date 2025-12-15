import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of turbopack for Privy compatibility
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Empty turbopack config to allow webpack config to work
  turbopack: {},
};

export default nextConfig;
