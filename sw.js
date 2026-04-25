/* ═══════════════════════════════════════════════════════════════
   GO PLUS EXPRESS — Service Worker v20260425h
   Cache-first pour assets statiques, Network-first pour HTML
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME   = 'gpe-v20260425h';
const STATIC_CACHE = 'gpe-static-v20260425h';

/* Assets à pré-cacher à l'installation */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/espace-client.html',
  '/css/style.css',
  '/css/espace-client.css',
  '/js/espace-client.js',
  '/assets/logo.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/manifest.json',
  '/offline.html'
];

/* ── INSTALL : pré-cache ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS.filter(url => !url.includes('offline'))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

/* ── ACTIVATE : purge anciens caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH : stratégie hybride ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Ignore les requêtes non-HTTP (chrome-extension, etc.) */
  if (!url.protocol.startsWith('http')) return;

  /* Ignore les requêtes cross-origin non statiques */
  const isOwn = url.hostname === self.location.hostname || url.hostname === 'localhost';

  /* ── Fonts & CDN : cache-first avec fallback ── */
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('unpkg.com')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  /* ── Assets statiques propres (images, css, js) : cache-first ── */
  if (isOwn && (
    request.url.match(/\.(png|jpg|jpeg|webp|svg|ico|gif|woff2?|ttf)(\?.*)?$/) ||
    request.url.match(/\.(css|js)(\?v=\w+)?$/)
  )) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          }
          return response;
        }).catch(() => caches.match('/assets/logo.png'));
      })
    );
    return;
  }

  /* ── Pages HTML : network-first avec fallback offline ── */
  if (isOwn && request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  /* ── Reste : network avec fallback cache ── */
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

/* ── MESSAGE : force update depuis la page ── */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
