const CACHE_NAME = 'astra-hr-v6';
const STATIC_ASSETS = ['/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .catch(() => undefined)
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  // Only handle same-origin static icon/manifest requests.
  // Let the browser and Vercel CDN handle all HTML navigations (/dashboard, /career, /auth),
  // hashed /assets/* bundles, and /api/* requests directly so FetchEvent never rejects.
  if (url.origin !== self.location.origin) return;
  if (!STATIC_ASSETS.includes(url.pathname)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse instanceof Response) {
        return cachedResponse;
      }
      return fetch(event.request).catch(
        () => new Response('', { status: 200, statusText: 'OK' })
      );
    })
  );
});
