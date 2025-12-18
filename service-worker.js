const CACHE = "prepone-v3";
const CACHE_FILES = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/manifest.json",
  "/icon-144.png",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(CACHE_FILES))
  );
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r || fetch(e.request))
  );
});
