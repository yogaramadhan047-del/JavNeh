import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  async redirects() {
    return [
      {
        source: '/articles',
        destination: '/artikel',
        permanent: true,
      },
      {
        source: '/articles/:slug',
        destination: '/artikel/:slug',
        permanent: true,
      },
      {
        source: '/global-news',
        destination: '/artikel',
        permanent: true,
      },
      {
        source: '/global-news/:slug',
        destination: '/artikel/:slug',
        permanent: true,
      },
      {
        source: '/anime',
        destination: '/movies',
        permanent: true,
      },
      {
        source: '/anime/:slug',
        destination: '/movies/:slug',
        permanent: true,
      },
      {
        source: '/drama-jepang',
        destination: '/movies',
        permanent: true,
      },
      {
        source: '/drama-jepang/:slug',
        destination: '/movies/:slug',
        permanent: true,
      },
      {
        source: '/series',
        destination: '/movies',
        permanent: true,
      },
      {
        source: '/series/:slug',
        destination: '/movies/:slug',
        permanent: true,
      },
    ];
  },
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
