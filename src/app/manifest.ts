import type { MetadataRoute } from 'next';

// PWA manifest — cumpre o requisito de instalabilidade (App Manifest)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aldeias Games',
    short_name: 'AldeiasGames',
    description: 'Plataforma SaaS multi-tenant para angariação de fundos através de jogos tradicionais portugueses.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    lang: 'pt',
    categories: ['games', 'social'],
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    screenshots: [
      { src: '/screenshots/12-aldeia-admin-dashboard.png', sizes: '1280x720', type: 'image/png', label: 'Dashboard' },
    ],
  };
}
