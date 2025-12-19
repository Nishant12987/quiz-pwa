const CACHE = "prepone-v6"; // 🔥 VERSION BUMP (IMPORTANT)
const CACHE_FILES = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/firebase.js",
  "/manifest.json"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CACHE_FILES))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
