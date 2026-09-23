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
    const backendTarget = process.env.NEXT_PUBLIC_API_URL || "https://backend-sigma-six-79.vercel.app/api/v1";
    const backendOrigin = backendTarget.replace(/\/api\/v1\/?$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      {
        source: "/webhooks/:path*",
        destination: `${backendOrigin}/api/v1/webhooks/:path*`,
      },
    ];
  },
};

export default nextConfig;
