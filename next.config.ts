import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.jake-reddy.com',
      },
    ],
  },
};

export default nextConfig;
