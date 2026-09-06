import type { MetadataRoute } from 'next';
import { site, DEFAULT_LOCALE } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'erasmusbrug',
    name: `${site.fullName} (${site.city}) - Visitor Guide`,
    short_name: site.fullName,
    description: `Visitor guide to ${site.fullName} in ${site.city}, ${site.state}, ${site.country}.`,
    start_url: `/${DEFAULT_LOCALE}`,
    scope: '/',
    display: 'standalone',
    background_color: '#faf8f4',
    theme_color: site.themeColor,
    categories: ['travel', 'tourism'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
