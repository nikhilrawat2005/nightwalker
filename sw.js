/* Nightwalker Service Worker — Clean, Fast Offline Shell & Instant Page Delivery */
const VERSION = 'nw-v2.0-speed';
const SHELL = [
  './',
  'index.html',
  'poetry.html',
  'novel.html',
  'blog.html',
  'photos.html',
  'offline.html',
  'css/street.css',
  'js/street.js',
  'js/poems.js',
  'js/chapters.js',
  'js/novels_data.js',
  'js/novel_content.js',
  'js/posts.js',
  'js/photos.js',
  'manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((cache) => {
      return Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate for ultrafast instant page switching
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Local assets & pages
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const netFetch = fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const clone = resp.clone();
            caches.open(VERSION).then((c) => c.put(req, clone));
          }
          return resp;
        }).catch(() => null);

        // Return instant cached response if available; otherwise wait for network
        return cached || netFetch || caches.match('offline.html');
      })
    );
    return;
  }

  // Google Fonts caching
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(
      caches.match(req).then((cached) => {
        return cached || fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const clone = resp.clone();
            caches.open(VERSION).then((c) => c.put(req, clone));
          }
          return resp;
        });
      })
    );
  }
});
