const CACHE_NAME = "scooterrent-cache-v1";

const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (
    request.url.includes("localhost:5000") ||
    request.url.includes("127.0.0.1:5000")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );

    return;
  }

  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.url.includes("/manifest.webmanifest")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});