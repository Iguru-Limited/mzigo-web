const CACHE_NAME = "mzigo-v1";
const STATIC_CACHE_NAME = "mzigo-static-v1";
const API_CACHE_NAME = "mzigo-api-v1";

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/mzigo/create",
  "/mzigo/browse",
  "/mzigo/search",
  "/dispatch",
  "/delivery",
  "/collections",
  "/load",
  "/notifications",
  "/report",
  "/manifest.json",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
];

// API endpoints to cache
const API_PATTERNS = [
  /\/api\//,
  /destinations/,
  /routes/,
  /vehicles/,
  /sizes/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('undefined')));
    }).catch((error) => {
      console.error("[SW] Failed to cache static assets:", error);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name !== CACHE_NAME &&
              name !== STATIC_CACHE_NAME &&
              name !== API_CACHE_NAME
            );
          })
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Strategy: Network first for API calls, Cache first for static assets
  if (isApiRequest(url)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
  } else {
    // Stale-while-revalidate for page navigations
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
  }
});

// Check if request is an API call
function isApiRequest(url) {
  return API_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

// Check if request is a static asset
function isStaticAsset(url) {
  return (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/manifest.json"
  );
}

// Network first strategy - try network, fall back to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/");
    }
    
    throw error;
  }
}

// Cache first strategy - try cache, fall back to network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log("[SW] Cache and network failed:", request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, but we might have a cached response
      return cachedResponse;
    });
  
  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for offline mutations
self.addEventListener("sync", (event) => {
  if (event.tag === "mzigo-sync") {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  // This will be handled by the sync manager in the main thread
  // Just notify the client that sync should happen
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_REQUIRED" });
  });
}

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  if (event.data.type === "CACHE_URLS") {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(event.data.urls);
    });
  }
});

// Push notification handling (for future use)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || "Mzigo", {
        body: data.body,
        icon: "/assets/icons/icon-192x192.png",
        badge: "/assets/icons/icon-192x192.png",
        data: data.url,
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(self.clients.openWindow(event.notification.data));
  }
});
