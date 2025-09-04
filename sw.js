/* Simple app-shell cache for GitHub Pages */
const VERSION = 'v1.0.0';
const CACHE_NAME = `golfscore-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
  // Voeg hier je icon-paths toe zodra je ze hebt:
  // './icons/icon-192.png',
  // './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Network-first for navigations; fallback to cache when offline */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Static assets: cache-first
  if (req.method === 'GET') {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }))
    );
  }
});
