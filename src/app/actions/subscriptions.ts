"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Görev 4: müşteri tarafında abonelik/kredi yönetimi. RPC'ler (bkz.
// 0014_abonelik_kredi_rpc.sql) zaten auth.uid() üzerinden müşteriyi buluyor ve
// sahiplik kontrolü yapıyor, burası sadece doğrulama + supabase.rpc çağrısı
// (aynı desen: create-order.ts).

export type SubscriptionActionState = { error?: string; success?: boolean };

export async function purchaseCreditPack(
  _prev: SubscriptionActionState,
  formData: FormData
): Promise<SubscriptionActionState> {
  const planId = z.string().uuid().safeParse(formData.get("planId"));
  if (!planId.success) return { error: "invalid_plan" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("purchase_credit_pack", { p_plan_id: planId.data });
  if (error) return { error: error.message };

  revalidatePath("/[locale]/account", "page");
  return { success: true };
}

export async function updateSubscriptionStatus(
  _prev: SubscriptionActionState,
  formData: FormData
): Promise<SubscriptionActionState> {
  const parsed = z
    .object({
      subscriptionId: z.string().uuid(),
      status: z.enum(["active", "paused", "cancelled"]),
    })
    .safeParse({
      subscriptionId: formData.get("subscriptionId"),
      status: formData.get("status"),
    });
  if (!parsed.success) return { error: "invalid_form" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_subscription_status", {
    p_subscription_id: parsed.data.subscriptionId,
    p_status: parsed.data.status,
  });
  if (error) return { error: error.message };

  revalidatePath("/[locale]/account", "page");
  return { success: true };
}
