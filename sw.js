
const CACHE_NAME = "pink-checkmate-v1";

const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon.svg"
];

const EXTERNAL_FILES = [
  "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js",
  "https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    await cache.addAll(FILES);

    await Promise.all(EXTERNAL_FILES.map(async url => {
      try {
        const response = await fetch(url, { mode: "cors" });
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.log("Could not cache external library:", url);
      }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cache-first for local files and external libraries.
  event.respondWith((async () => {
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(request);

      if (response.ok && (
        url.origin === self.location.origin ||
        EXTERNAL_FILES.includes(request.url)
      )) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }

      return response;

    } catch (error) {
      if (request.mode === "navigate") {
        return caches.match("./index.html");
      }

      return new Response("Offline resource unavailable.", {
        status: 503,
        headers: { "Content-Type": "text/plain" }
      });
    }
  })());
});

