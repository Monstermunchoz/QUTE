/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "qute.fr",
        "www.qute.fr",
        "qute-olive.vercel.app",
        "jomdujtmvwikjflscnmc.supabase.co",
      ],
    },
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "geolocation=(), camera=(), microphone=()",
        },
      ],
    },
  ],
  async rewrites() {
    return [];
  },
};

export default nextConfig;
