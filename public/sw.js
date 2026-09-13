// Minimal service worker — aycabayramoglu/public/sw.js ile aynı desen. Şu an
// aktif bir önbellekleme stratejisi yok (PWA kurulabilirlik kriteri + push
// bildirimleri için yeterli); ileride çevrimdışı destek eklenecekse buraya bir
// cache stratejisi eklenebilir.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Kasıtlı olarak boş — passthrough.
});

// Web Push (VAPID) — sipariş durum bildirimleri (bkz. src/lib/web-push.ts).
self.addEventListener("push", (event) => {
  let payload = { title: "Apa Expres", body: "" };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { ...payload, body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => "focus" in c);
      if (existing) return existing.focus();
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});
