const CACHE_NAME = 'finanzas-cache-v1';
self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('fetch', (e) => {
  // Passthrough simple para no interferir en peticiones de API
  e.respondWith(fetch(e.request));
});
