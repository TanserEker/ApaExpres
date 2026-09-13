"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Tarayıcıdan gelen PushSubscriptionJSON'u push_subscriptions'a kaydeder (bkz.
// 0019_push_subscriptions.sql). Kullanıcı customer mı driver mı önce kontrol
// edilip ona göre satır oluşturuluyor - admin şu an push almıyor.
const schema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  authKey: z.string().min(1),
});

export type PushActionState = { error?: string; success?: boolean };

export async function savePushSubscription(input: z.infer<typeof schema>): Promise<PushActionState> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "invalid_subscription" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const [{ data: customer }, { data: driver }] = await Promise.all([
    supabase.from("customers").select("id").eq("auth_user_id", user.id).maybeSingle(),
    supabase.from("drivers").select("id").eq("auth_user_id", user.id).maybeSingle(),
  ]);

  if (!customer && !driver) return { error: "profile_not_found" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      customer_id: customer?.id ?? null,
      driver_id: driver?.id ?? null,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth_key: parsed.data.authKey,
    },
    { onConflict: "endpoint" }
  );
  if (error) return { error: error.message };

  return { success: true };
}
