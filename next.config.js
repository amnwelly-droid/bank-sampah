/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Semua halaman harus dynamic, tidak boleh di-prerender saat build
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
