const CACHE_NAME = 'army-schedule-v3';
const assets = [
  './',
  './index.html',
  './script.js',
  './icon.png',
  './arirang album.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});