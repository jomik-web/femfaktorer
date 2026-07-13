import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Kjøres separat i CI/Netlify-bygg; ikke bloker lokal dev-server på lint-feil.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
