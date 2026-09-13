"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";

// "Kurye ekle": sürücüler self-servis kayıt olmuyor (bkz. 0011_admin_rolu_ve_rls.sql
// yorumu, GOREVLER.md "tek kurye" kararı) — Tanser/admin burada hem Supabase Auth
// hesabını (email + admin'in belirlediği ilk şifre, email_confirm:true ile hemen
// kullanılabilir) hem de drivers satırını tek adımda oluşturuyor.

export type AdminActionState = { error?: string };

const vehicleSchema = z.object({
  zoneId: z.string().uuid(),
  plate: z.string().trim().min(2),
  capacity: z.coerce.number().int().positive(),
});

export async function createVehicle(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = vehicleSchema.safeParse({
    zoneId: formData.get("zoneId"),
    plate: formData.get("plate"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid_form" };

  const service = createServiceClient();
  const { error } = await service.from("vehicles").insert({
    zone_id: parsed.data.zoneId,
    plate: parsed.data.plate,
    capacity: parsed.data.capacity,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/kuryeler");
  return {};
}

const driverSchema = z.object({
  zoneId: z.string().uuid(),
  name: z.string().trim().min(2),
  phone: z.string().trim().min(8),
  email: z.string().trim().email(),
  password: z.string().min(8),
  vehicleId: z.string().uuid().optional(),
});

export async function createDriver(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = driverSchema.safeParse({
    zoneId: formData.get("zoneId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    vehicleId: formData.get("vehicleId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid_form" };

  const service = createServiceClient();

  const { data: authUser, error: authError } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { role: "driver", name: parsed.data.name },
  });
  if (authError || !authUser.user) {
    return { error: authError?.message ?? "auth_user_olusturulamadi" };
  }

  const { error: driverError } = await service.from("drivers").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    zone_id: parsed.data.zoneId,
    vehicle_id: parsed.data.vehicleId ?? null,
    auth_user_id: authUser.user.id,
  });

  if (driverError) {
    // Yarım kalmış (auth kullanıcısı var, drivers satırı yok) bir kayıt bırakmamak
    // için auth kullanıcısı geri alınıyor.
    await service.auth.admin.deleteUser(authUser.user.id);
    return { error: driverError.message };
  }

  revalidatePath("/admin/kuryeler");
  return {};
}

export async function toggleDriverActive(driverId: string, isActive: boolean) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service.from("drivers").update({ is_active: isActive }).eq("id", driverId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/kuryeler");
}
