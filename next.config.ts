import type { NextConfig } from "next";

// Sent with every page: stops other sites framing this one, stops browsers
// guessing file types, trims what is shared when a visitor follows a link out,
// and switches off the camera, microphone and location, which the site never uses.
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'placehold.co' },
      { hostname: '*.supabase.co' },
      { hostname: 'img.youtube.com' },
      { hostname: 'i.ytimg.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
