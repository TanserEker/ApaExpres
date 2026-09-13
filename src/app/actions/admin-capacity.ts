"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";

// capacity_slots yönetimi: create_order RPC'si (bkz. 0013/0014) bir slot yoksa
// otomatik olarak varsayılan kapasiteyle (8) oluşturuyor — bu action admin'in o
// varsayılanı elle değiştirebilmesi (örn. yoğun saatte kapasiteyi artırmak) için.

export type AdminActionState = { error?: string };

const slotSchema = z.object({
  zoneId: z.string().uuid(),
  date: z.string().date(),
  slotStart: z.string().regex(/^\d{2}:\d{2}$/),
  slotEnd: z.string().regex(/^\d{2}:\d{2}$/),
  maxOrders: z.coerce.number().int().positive(),
});

export async function upsertCapacitySlot(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = slotSchema.safeParse({
    zoneId: formData.get("zoneId"),
    date: formData.get("date"),
    slotStart: formData.get("slotStart"),
    slotEnd: formData.get("slotEnd"),
    maxOrders: formData.get("maxOrders"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid_form" };

  const service = createServiceClient();
  const { error } = await service
    .from("capacity_slots")
    .upsert(
      {
        zone_id: parsed.data.zoneId,
        date: parsed.data.date,
        slot_start: parsed.data.slotStart,
        slot_end: parsed.data.slotEnd,
        max_orders: parsed.data.maxOrders,
      },
      { onConflict: "zone_id,date,slot_start,slot_end" }
    );
  if (error) return { error: error.message };

  revalidatePath("/admin/kapasite");
  return {};
}
