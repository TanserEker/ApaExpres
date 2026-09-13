"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";

// approve_order/assign_driver (bkz. 0016_admin_siparis_kurye_rpc.sql) kendi
// içlerinde is_admin() kontrolü yapıyor, ama requireAdmin() ile burada da erken
// ve tutarlı bir hata mesajı veriliyor (bkz. require-admin.ts'teki not).

export type AdminActionState = { error?: string };

export async function approveOrder(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const orderId = z.string().uuid().safeParse(formData.get("orderId"));
  if (!orderId.success) return { error: "invalid_order" };

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("approve_order", { p_order_id: orderId.data });
  if (error) return { error: error.message };

  revalidatePath("/admin/siparisler");
  return {};
}

export async function assignDriver(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const orderId = z.string().uuid().safeParse(formData.get("orderId"));
  const driverId = z.string().uuid().safeParse(formData.get("driverId"));
  if (!orderId.success || !driverId.success) return { error: "invalid_form" };

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("assign_driver", {
    p_order_id: orderId.data,
    p_driver_id: driverId.data,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/siparisler");
  return {};
}
