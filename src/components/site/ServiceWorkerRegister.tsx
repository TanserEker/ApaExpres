"use client";

import { useEffect } from "react";

// PWA kurulabilirlik (Add to Home Screen) ve push bildirimleri için service
// worker'ı kaydeder. Sayfa her yüklendiğinde çalışır ama register() zaten
// idempotent (aynı script zaten kayıtlıysa no-op).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Tarayıcı desteklemiyor veya reddetti - PWA olmadan da site çalışmaya devam eder.
      });
    }
  }, []);

  return null;
}
