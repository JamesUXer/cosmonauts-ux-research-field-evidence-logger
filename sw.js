// Bump this on every deploy that changes any cached file, so returning
// visitors pick up the update instead of being stuck on a stale cache.
const CACHE_VERSION = 'curfel-v4';
const CACHE_PREFIX = 'curfel-';

const PRECACHE_URLS = [
  './',
  './index.html',
  './paper-fallback.html',
  './manifest.json',
  './css/styles.css?v=4',
  './js/constants.js?v=4',
  './js/db.js?v=4',
  './js/export.js?v=4',
  './js/app.js?v=4',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache-first: this app must work with zero connectivity, so we never wait
// on the network before answering. If a file is in the cache, use it; only
// fall back to the network for something we did not precache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'Offline and not cached' });
      });
    })
  );
});
