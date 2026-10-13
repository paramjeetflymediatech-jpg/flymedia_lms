import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['sequelize'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/sitemap.xml',
          destination: '/sitemap/0.xml',
        },
      ],
      fallback: [
        {
          source: '/uploads/:path*',
          destination: '/api/uploads/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
