const CACHE_NAME = "prepone-cache-v1";

const CACHE_FILES = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/manifest.json",

  // App icons (root level)
  "/icon-144.png",
  "/icon-192.png",
  "/icon-512.png",

  // Policies page
  "/policies.html"
];

// Install event – cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate event – clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event – serve from cache first
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
