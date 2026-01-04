import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Add this
  },
  typescript: {
    ignoreBuildErrors: true,  // Add this
  },
};

export default nextConfig;
