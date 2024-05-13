self.addEventListener("install", function (event) {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open("v1");
        await cache.addAll([
          "/index.html",
          './sw.js',
          './manifest.json',
          "./style.css",
          "/firebase.js",
          "./router.js",
          "./store.js",
          "./indexedDB.js",
          "./public/listener-sw.js",
          "./pages/landing.js",
          "./pages/login.js",
          "./pages/event.js",
          "./pages/whoAreYou.js",
          "./pages/transaction.js",
          "./icons/icon-72x72.png",
          "./icons/icon-96x96.png",
          "./icons/icon-128x128.png",
          "./icons/icon-144x144.png",
          "./icons/icon-192x192.png",
          "./icons/icon-256x256.png",
          "./icons/icon-512x512.png",
        ]);
      } catch (error) {
        console.error("Failed to install the service worker:", error);
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response("Not found", { status: 404, statusText: "Not found" });
      });
    })
  );
});


// // Función para manejar solicitudes POST cuando offline
// async function handlePostRequest(request) {
//   let cloneRequest = request.clone(); // Clonar la solicitud para reutilización
//   try {
//     let response = await fetch(cloneRequest); // Intentar enviar la solicitud
//     return response; // Si tiene éxito, retorna la respuesta del servidor
//   } catch (error) {
//     // Si la red falla, guardar la solicitud en IndexedDB
//     let requestData = await cloneRequest.json(); // Extraer el cuerpo de la solicitud como JSON
//     await saveEvent(requestData); // Asumimos que 'saveEvent' guarda en IndexedDB
//     return new Response(JSON.stringify({ status: "stored_offline" }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
