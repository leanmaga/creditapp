/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ["res.cloudinary.com"], // Agregar dominio de Cloudinary
  },

  webpack: (config, { isServer }) => {
    // Tu configuración existente
    config.externals = [
      ...(config.externals || []),
      {
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
      },
    ];

    // Nueva configuración para evitar módulos de Node.js en el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    return config;
  },
};

export default nextConfig;
