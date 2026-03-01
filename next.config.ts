import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.prydwen.gg",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "i.namu.wiki",
        pathname: "/i/**",
      },
    ],
  },
};

export default nextConfig;
