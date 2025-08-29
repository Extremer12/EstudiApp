const CACHE_NAME = 'estudiapp-v1.2.0';
const STATIC_CACHE = 'estudiapp-static-v1.2.0';
const DYNAMIC_CACHE = 'estudiapp-dynamic-v1.2.0';

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  // Agregar fuentes y otros recursos estáticos si los hay
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Instalación completa');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error durante instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Eliminar cachés antiguos
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activación completa');
        return self.clients.claim();
      })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', event => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorar peticiones a APIs externas
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si está en caché, devolverlo
        if (cachedResponse) {
          console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return cachedResponse;
        }
        
        // Si no está en caché, hacer petición de red
        return fetch(event.request)
          .then(networkResponse => {
            // Verificar que la respuesta sea válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clonar la respuesta para poder usarla y cachearla
            const responseToCache = networkResponse.clone();
            
            // Cachear la respuesta en caché dinámico
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                console.log('Service Worker: Cacheando dinámicamente:', event.request.url);
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(error => {
            console.log('Service Worker: Error de red, sirviendo página offline:', error);
            
            // Si es una petición de navegación y falla, servir página principal desde caché
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Para otros recursos, intentar servir desde caché dinámico
            return caches.match(event.request);
          });
      })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Sincronización en segundo plano (para futuras funcionalidades)
self.addEventListener('sync', event => {
  console.log('Service Worker: Evento de sincronización:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí se pueden sincronizar datos cuando se recupere la conexión
      console.log('Service Worker: Sincronización en segundo plano')
    );
  }
});

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', event => {
  console.log('Service Worker: Notificación push recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de EstudiApp',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir EstudiApp',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('EstudiApp', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Click en notificación:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});