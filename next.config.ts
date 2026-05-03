import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // If a package-lock.json exists above this folder, Next may pick the wrong root for tracing.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
