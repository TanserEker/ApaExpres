import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";

// Web Push (VAPID) — aycabayramoglu/src/lib/web-push.ts ile aynı desen.
// Anahtarlar `npx web-push generate-vapid-keys` ile üretilir (ücretsiz, Hakan
// canlı ortamda Vercel env değişkeni olarak eklemeli — bkz. .env.example).
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT ?? "mailto:info@deef-tech.com";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

type PushRow = { id: string; endpoint: string; p256dh: string; auth_key: string };

async function sendToSubscriptions(subs: PushRow[], title: string, body: string) {
  if (!publicKey || !privateKey || subs.length === 0) return;

  const service = createServiceClient();
  const expiredIds: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          JSON.stringify({ title, body })
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        // 404/410: tarayıcı aboneliği artık geçersiz - temizle.
        if (statusCode === 404 || statusCode === 410) expiredIds.push(sub.id);
      }
    })
  );

  if (expiredIds.length > 0) {
    await service.from("push_subscriptions").delete().in("id", expiredIds);
  }
}

// Sipariş durum bildirimleri (Görev 7 kapsamı) - opsiyonel: VAPID anahtarları
// tanımlı değilse (env yoksa) sessizce hiçbir şey yapmaz, ana akışı bloklamaz.
export async function notifyCustomer(customerId: string, title: string, body: string) {
  const service = createServiceClient();
  const { data } = await service
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("customer_id", customerId);
  await sendToSubscriptions(data ?? [], title, body);
}

export async function notifyDriver(driverId: string, title: string, body: string) {
  const service = createServiceClient();
  const { data } = await service
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("driver_id", driverId);
  await sendToSubscriptions(data ?? [], title, body);
}
