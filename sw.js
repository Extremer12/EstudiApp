const CACHE_NAME = 'estudiapp-v1.2.1';
const STATIC_CACHE = 'estudiapp-static-v1.2.1';
const DYNAMIC_CACHE = 'estudiapp-dynamic-v1.2.1';

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/core.js',
  '/pomodoro.js',
  '/streaks.js',
  '/subjects.js',
  '/reminders.js',
  '/calendar.js',
  '/manifest.json',
  '/css/variables.css',
  '/css/themes.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/buttons.css',
  '/css/modals.css',
  '/css/streak-section.css',
  '/css/animations.css',
  '/css/timer-effects.css',
  '/css/calendar.css',
  '/css/events.css',
  '/css/timer.css',
  '/css/subjects.css',
  '/css/forms.css',
  '/css/responsive.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  // Service Worker: Instalando...
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        // Service Worker: Cacheando archivos estáticos
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Service Worker: Instalación completa
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error durante instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  // Service Worker: Activando...
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Eliminar cachés antiguos
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              // Service Worker: Eliminando caché antiguo
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Service Worker: Activación completa
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
          // Service Worker: Sirviendo desde caché
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
                // Service Worker: Cacheando dinámicamente
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(error => {
            // Service Worker: Error de red, sirviendo página offline
            
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
  // Service Worker: Evento de sincronización
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí se pueden sincronizar datos cuando se recupere la conexión
      // Service Worker: Sincronización en segundo plano
    );
  }
});

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', event => {
  // Service Worker: Notificación push recibida
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de EstudiApp',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir EstudiApp',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('EstudiApp', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
  // Service Worker: Click en notificación
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});