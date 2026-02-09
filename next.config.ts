import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export static site suitable for GitHub Pages
  output: "export",
  // Serve the app from /chess path on GitHub Pages
  basePath: "/chess",
  assetPrefix: "/chess",
  // Ensure exported pages create folder per route
  trailingSlash: true,
};

export default nextConfig;
