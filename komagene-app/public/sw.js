const CACHE_NAME = "gunkasa-v1";

const ASSETS_TO_CACHE = [
    "/",
    "/manifest.json",
    "/favicon.ico",
    "/icon.svg"
];

// Install Event: Cache core assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("📦 Service Worker: Caching App Shell");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
});

// Fetch Event: Optimized for reliability
self.addEventListener("fetch", (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Only handle HTTP/HTTPS protocols
    if (!event.request.url.startsWith("http")) return;

    // Bypass for Supabase/API calls to avoid "Failed to convert value to Response"
    if (event.request.url.includes("supabase.co") || event.request.url.includes("/api/")) {
        return;
    }

    // Strategy: Network First, Fallback to Cache
    event.respondWith(
        fetch(event.request)
            .catch(async () => {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;

                // Final fallback: If everything fails, return a simple offline message or blank response
                // instead of throwing "Failed to convert value to Response"
                return new Response("Bağlantı yok. Lütfen internetinizi kontrol edin.", {
                    status: 503,
                    statusText: "Service Unavailable",
                    headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" }),
                });
            })
    );
});
