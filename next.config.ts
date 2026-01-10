import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Optimize for Vercel
  swcMinify: true,
  // Skip environment validation during build
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },
};

export default nextConfig;
