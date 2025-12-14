/* Minimal offline cache for GitHub Pages static hosting.
 * Note: caches cross-origin engine/libs as opaque responses (best-effort).
 */

const CACHE = 'brothers-chess-v1';

const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './stockfish-worker.js',
  // Best-effort external deps (opaque):
  'https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js',
  'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.wasm.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await cache.addAll(PRECACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE ? Promise.resolve() : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;

      try {
        const res = await fetch(req);
        // Cache same-origin + cdn best-effort
        const url = new URL(req.url);
        const isCacheable = url.origin === self.location.origin || url.hostname.includes('cdn.jsdelivr.net');
        if (isCacheable && res && (res.ok || res.type === 'opaque')) {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        // If offline, try fallback to shell
        return caches.match('./index.html');
      }
    })()
  );
});
