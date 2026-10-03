import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'placehold.co' },
      { hostname: '*.supabase.co' },
      { hostname: 'img.youtube.com' },
      { hostname: 'i.ytimg.com' },
    ],
  },
};

export default nextConfig;
