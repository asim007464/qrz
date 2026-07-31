/* Network-first PWA helper — never cache HTML/RSC so Next.js pages do not reload-loop. */
const CACHE = "qrz-pwa-v2";
const PRECACHE = ["/qrz-app-icon.png", "/qrz-app-icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept navigations or Next.js data — prevents refresh loops.
  if (request.mode === "navigate" || request.destination === "document") return;
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) return;
  if (url.pathname === "/" || url.pathname.startsWith("/feed") || url.pathname.startsWith("/profile")) {
    return;
  }

  // Cache only static assets.
  const isAsset =
    url.pathname.startsWith("/downloads/") ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|webmanifest|js|css|woff2?)$/i.test(url.pathname);

  if (!isAsset) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const network = await fetch(request);
        if (network.ok) cache.put(request, network.clone());
        return network;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw new Error("Offline and not cached");
      }
    }),
  );
});
