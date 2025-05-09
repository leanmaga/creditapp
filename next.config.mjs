/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },

  webpack: (config) => {
    config.externals = [
      ...(config.externals || []),
      {
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
      },
    ];
    return config;
  },
};

export default nextConfig;
