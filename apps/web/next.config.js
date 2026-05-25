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
};

export default nextConfig;
