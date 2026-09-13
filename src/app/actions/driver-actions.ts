"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyCustomer } from "@/lib/web-push";

const STATUS_MESSAGES: Record<string, string> = {
  picked_up: "Kuryeniz yola çıktı.",
  delivered: "Siparişiniz teslim edildi.",
  cancelled: "Siparişiniz iptal edildi.",
};

// update_delivery_status (bkz. 0011/0017) kendi içinde is_own_driver kontrolü
// yapıyor (SECURITY DEFINER) — authenticated client üzerinden çağırmak yeterli,
// service role gerekmiyor.
export type DriverActionState = { error?: string };

const schema = z.object({
  assignmentId: z.string().uuid(),
  newStatus: z.enum(["picked_up", "delivered", "cancelled"]),
  note: z.string().trim().optional(),
  photoPath: z.string().trim().optional(),
});

export async function updateDeliveryStatus(
  _prev: DriverActionState,
  formData: FormData
): Promise<DriverActionState> {
  const parsed = schema.safeParse({
    assignmentId: formData.get("assignmentId"),
    newStatus: formData.get("newStatus"),
    note: formData.get("note") || undefined,
    photoPath: formData.get("photoPath") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid_form" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_delivery_status", {
    p_assignment_id: parsed.data.assignmentId,
    p_new_status: parsed.data.newStatus,
    p_note: parsed.data.note ?? null,
    p_photo_path: parsed.data.photoPath ?? null,
  });
  if (error) return { error: error.message };

  // Bildirim (Görev 7, opsiyonel) - sürücünün kendi RLS kapsamı zaten
  // "kendine atanan siparişi" içerdiği için (is_own_driver), service role
  // gerekmeden okunabiliyor.
  const { data: assignment } = await supabase
    .from("driver_assignments")
    .select("orders(customer_id)")
    .eq("id", parsed.data.assignmentId)
    .maybeSingle();
  const order = Array.isArray(assignment?.orders) ? assignment.orders[0] : assignment?.orders;
  if (order?.customer_id) {
    await notifyCustomer(order.customer_id, "Apa Expres", STATUS_MESSAGES[parsed.data.newStatus]);
  }

  revalidatePath("/[locale]/kurye", "page");
  return {};
}
