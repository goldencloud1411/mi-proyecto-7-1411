const CACHE_NAME = 'army-schedule-v2';
const assets = ['./', './index.html', './script.js', './icon.png', './arirang logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});