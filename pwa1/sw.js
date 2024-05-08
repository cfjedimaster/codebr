console.log('this is sw.js');

const addResourcesToCache = async (resources) => {
	console.log('adding stuff to cache');
  const cache = await caches.open("v2");
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/",
	  "/manifest.json",
      "/index.html",
      "/app.css",
      "/app.js"
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request));
});
