/* Service worker mínimo de Biblioteca:
   - precache del shell del lector
   - stale-while-revalidate para datos (/data/*) · cache-first para assets (inmutables por build)
   - network-first para navegaciones, con respaldo offline al lector cacheado */
const CACHE = "biblioteca-v5";
const PRECACHE = ["/es", "/es/lector", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // datos del corpus: stale-while-revalidate (sirve el caché al instante y actualiza en segundo
  // plano — los JSON de datos cambian de contenido sin cambiar de ruta, y así cada visita los
  // renueva sin esperar red). Assets con hash en el nombre: cache-first (son inmutables por build).
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      })
    );
    return;
  }
  if (url.pathname.startsWith("/data/")) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(req);
        const red = fetch(req)
          .then((res) => {
            if (res.ok) c.put(req, res.clone());
            return res;
          })
          .catch(() => undefined);
        return hit || (await red) || Response.error();
      })
    );
    return;
  }

  // navegaciones: red primero, respaldo offline
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/es/lector")))
    );
  }
});
