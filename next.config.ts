import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-mode badge so it doesn't cover the journey footer during
  // demos. Compile and runtime errors still show.
  devIndicators: false,
};

export default nextConfig;
