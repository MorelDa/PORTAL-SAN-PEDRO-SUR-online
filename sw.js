// Sitio cerrado: el aviso "WEB CERRADA" se muestra en TODAS las navegaciones.
// Asi las apps instaladas y las visitas con cache vieja tambien ven el cierre.
const CACHE = "pps-cerrado-v1";
const AVISO = "/index.html";
const PAGINAS = [AVISO, "/noticias.html", "/noticia.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PAGINAS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(caches.match(AVISO).then((r) => r || fetch(AVISO)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
      const copia = resp.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copia));
      return resp;
    }).catch(() => caches.match(AVISO)))
  );
});
