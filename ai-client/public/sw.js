const CACHE_NAME = 'astra-hr-v3';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/favicon.svg',
        '/manifest.webmanifest'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Do not intercept API requests
  if (event.request.url.includes('/api/')) return;

  // For HTML navigation requests, ALWAYS do Network-First so recruiters always get the latest deployment
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(OFFLINE_URL, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Bypass service worker for hashed JS/CSS assets - let browser and Vercel CDN handle them directly
  if (event.request.url.includes('/assets/')) {
    return;
  }

  // Fallback for static root assets
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
