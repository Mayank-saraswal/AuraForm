// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/trpc", "@repo/schemas", "@repo/database"],
  serverExternalPackages: ["pg", "bcryptjs", "@node-rs/argon2"],
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
    return [
      {
        source: "/api/trpc/:path*",
        destination: "http://localhost:8000/trpc/:path*",
      },
    ];
  },
};

export default nextConfig;
