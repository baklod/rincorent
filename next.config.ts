import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mysql2 uses Node.js APIs, so it stays out of the server bundle.
  serverExternalPackages: ["mysql2"],
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
