import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      { source: "/klyperix.html", destination: "/" },
      {
        source: "/pages/video-editing.html",
        destination: "/services/video-editing",
      },
      { source: "/pages/motion.html", destination: "/services/motion" },
      {
        source: "/pages/3d-animation-graphics.html",
        destination: "/services/3d-animation-graphics",
      },
      {
        source: "/pages/2d-animation.html",
        destination: "/services/2d-animation",
      },
      {
        source: "/pages/graphic-design.html",
        destination: "/services/graphic-design",
      },
      {
        source: "/pages/logo-design.html",
        destination: "/services/logo-design",
      },
      { source: "/pages/toolkit.html", destination: "/toolkit" },
      {
        source: "/pages/focus-fix-preview.html",
        destination: "/labs/focus-fix-preview",
      },
      {
        source: "/pages/luxury-service.html",
        destination: "/labs/luxury-service",
      },
    ];
  },
};

export default nextConfig;
