import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XStream21 - Streaming Anime & Drama Jepang',
    short_name: 'XStream21',
    description: 'Streaming anime dan drama Jepang subtitle Indonesia kualitas HD dan 4K.',
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
