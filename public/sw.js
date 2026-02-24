// Aldeias Games - Service Worker v2
const CACHE_NAME = 'aldeias-games-v2';
const STATIC_CACHE = 'aldeias-static-v2';

// Apenas assets estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/logo.svg',
  '/robots.txt'
];

// Instalar e cachear apenas assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] A cachear assets estáticos...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativar e limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map((name) => {
            console.log('[SW] A remover cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia: Network-First para API, Cache-First para estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NUNCA cachear chamadas de API - dados dinâmicos sempre frescos
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Sem ligação à internet' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Cache-First para assets estáticos (imagens, fontes, etc.)
  if (
    url.pathname.startsWith('/uploads/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Network-First para navegação de páginas
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/'))
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Aldeias Games';
  const options = {
    body: data.body || 'Tens uma nova notificação!',
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: data.url || '/',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});
