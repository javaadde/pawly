import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard/pets/new',
        destination: '/pets-create',
        permanent: false,
      },
      {
        source: '/dashboard/pets/:path*',
        destination: '/pets/:path*',
        permanent: false,
      },
      {
        source: '/dashboard/marketplace',
        destination: '/marketplace',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
