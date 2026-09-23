/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  },
  async rewrites() {
    const backendTarget = process.env.NEXT_PUBLIC_API_URL || "https://backend-growth-540e.vercel.app/api/v1";
    const backendClean = backendTarget.replace(/\/+$/, "");
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/api/v1/:path*",
          destination: `${backendClean}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
