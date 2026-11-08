// Clip Review offline support. Bump VERSION whenever any file changes.
const VERSION = "clip-review-v13";
const SHELL = ["./", "index.html", "pack-apex.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // Newest version when online, saved copy when offline.
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req.mode === "navigate" ? "index.html" : req, copy)); }
    return res;
  }).catch(() => caches.match(req.mode === "navigate" ? "index.html" : req)));
});
