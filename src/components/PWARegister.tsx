'use client';

import { useEffect } from 'react';

/**
 * Regista o Service Worker (/sw.js) para suporte PWA/offline.
 * Renderizado no RootLayout; não produz markup.
 */
export default function PWARegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'development') return; // evitar cache agressiva em dev

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[PWA] Service Worker registado, scope:', reg.scope))
      .catch((err) => console.error('[PWA] Falha ao registar Service Worker:', err));
  }, []);

  return null;
}
