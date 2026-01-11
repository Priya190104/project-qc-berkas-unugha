import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Skip environment validation during build
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },
};

export default nextConfig;
