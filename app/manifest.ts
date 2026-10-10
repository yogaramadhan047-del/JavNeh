import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JavNeh - Streaming Film JAV Subtitle Indonesia',
    short_name: 'JavNeh',
    description: 'Platform streaming film JAV subtitle Indonesia terlengkap kualitas HD dan 4K.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1d24',
    theme_color: '#0d1017',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
