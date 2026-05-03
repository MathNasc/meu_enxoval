/**
 * Service Worker — Meu Enxoval PWA
 * Estratégia: Network First + Cache + offline.html fallback
 */

const CACHE_VERSION = "v2";
const CACHE_STATIC  = `enxoval-static-${CACHE_VERSION}`;
const CACHE_PAGES   = `enxoval-pages-${CACHE_VERSION}`;
const OFFLINE_URL   = "/offline.html";

const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ── Install ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k.startsWith("enxoval-") && !k.endsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept: Supabase, auth, API routes, non-GET
  if (
    url.hostname.includes("supabase") ||
    url.pathname.startsWith("/api/") ||
    request.method !== "GET"
  ) return;

  // Static assets → Cache First
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|ttf|css)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_STATIC).then((c) => c.put(request, clone));
          return res;
        }).catch(() => caches.match("/icons/icon-192x192.png"));
      })
    );
    return;
  }

  // HTML pages → Network First, fallback offline.html
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_PAGES).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Everything else → Network First with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ── Push notifications (future) ──────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Meu Enxoval", {
      body:    data.body    || "Nova atualização no enxoval",
      icon:    "/icons/icon-192x192.png",
      badge:   "/icons/icon-72x72.png",
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
