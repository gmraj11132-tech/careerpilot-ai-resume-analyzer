import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security: disable x-powered-by header
  poweredByHeader: false,

  // TypeScript strict mode
  typescript: {
    // Build will fail on type errors in production
    ignoreBuildErrors: false,
  },


  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Server external packages
  serverExternalPackages: ['mammoth'],
};

export default nextConfig;
