
const CACHE_NAME = 'pass-dec-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  'https://res.cloudinary.com/dfincejqz/image/upload/v1772489336/logo_fec345.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
