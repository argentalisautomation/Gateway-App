const CACHE_NAME = 'gateway-cache-v13';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './service-worker.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Only intercept requests for index.html/manifest.json - do NOT intercept anything else
// This prevents interference with Web Bluetooth's internal operations
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Only serve cached pages, never intercept API/Bluetooth traffic
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('.json') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
  // Let all other requests (including BLE internal requests) pass through untouched
});
