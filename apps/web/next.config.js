// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/trpc", "@repo/schemas", "@repo/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/f/:slug*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  async rewrites() {
    // In development, proxy /auth/* to avoid CORS on auth endpoints
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source:      "/auth/:path*",
          destination: `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc").replace("/trpc", "")}/auth/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
