"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";

// Katalog (products) CRUD'unda create_order'daki gibi bir iş kuralı/atomiklik
// gerekmiyor (fiyat/marka/aktiflik düz alanlar) — bu yüzden RPC yerine doğrudan
// service role ile tablo işlemi yapılıyor (bkz. README "İç sistem mantığı").
// requireAdmin() burada ZORUNLU: service role RLS'yi tamamen atlar, bu kontrol
// olmadan herhangi bir giriş yapmış kullanıcı ürün ekleyebilir/silebilirdi.

export type AdminActionState = { error?: string };

const productSchema = z.object({
  name: z.string().trim().min(2),
  brand: z.string().trim().min(1),
  sizeLiters: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  depositPrice: z.coerce.number().nonnegative().default(0),
});

export async function createProduct(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand"),
    sizeLiters: formData.get("sizeLiters"),
    unitPrice: formData.get("unitPrice"),
    depositPrice: formData.get("depositPrice"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid_form" };

  const service = createServiceClient();
  const { error } = await service.from("products").insert({
    name: parsed.data.name,
    brand: parsed.data.brand,
    size_liters: parsed.data.sizeLiters,
    unit_price: parsed.data.unitPrice,
    deposit_price: parsed.data.depositPrice,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/katalog");
  return {};
}

const updateSchema = productSchema.extend({ id: z.string().uuid() });

export async function updateProduct(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    brand: formData.get("brand"),
    sizeLiters: formData.get("sizeLiters"),
    unitPrice: formData.get("unitPrice"),
    depositPrice: formData.get("depositPrice"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid_form" };

  const service = createServiceClient();
  const { error } = await service
    .from("products")
    .update({
      name: parsed.data.name,
      brand: parsed.data.brand,
      size_liters: parsed.data.sizeLiters,
      unit_price: parsed.data.unitPrice,
      deposit_price: parsed.data.depositPrice,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/katalog");
  return {};
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/katalog");
}
