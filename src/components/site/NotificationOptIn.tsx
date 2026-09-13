"use client";

import { useState } from "react";
import { subscribeToWebPush } from "@/lib/webPushClient";
import { savePushSubscription } from "@/app/actions/push";

// Müşteri/sürücü hesap sayfalarında "bildirimleri aç" butonu (bkz. Görev 7
// kapsamı: "sipariş durum bildirimleri için web push"). Opsiyonel - VAPID
// env değişkenleri tanımlı değilse subscribeToWebPush zaten null döner.
export default function NotificationOptIn() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleClick() {
    setStatus("loading");
    const subscription = await subscribeToWebPush();
    if (!subscription?.endpoint || !subscription.keys) {
      setStatus("error");
      return;
    }
    const result = await savePushSubscription({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      authKey: subscription.keys.auth,
    });
    setStatus(result.success ? "done" : "error");
  }

  if (status === "done") {
    return <p className="text-sm text-green-700">Bildirimler açık.</p>;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      className="rounded border border-[#0B4F8A]/30 px-3 py-1.5 text-sm text-[#0B4F8A] disabled:opacity-60"
    >
      {status === "error" ? "Bildirimler açılamadı, tekrar dene" : "Sipariş bildirimlerini aç"}
    </button>
  );
}
