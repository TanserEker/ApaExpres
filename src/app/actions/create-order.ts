"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Görev 3: müşteri sipariş akışı. Buradaki fonksiyonlar <form action> yerine
// bilerek doğrudan client'tan çağrılan "RPC benzeri" server action'lar olarak
// yazıldı, çünkü sepet (çoklu ürün satırı) ve seçili adres gibi veriler basit bir
// FormData ile taşınamayacak kadar yapılı — bkz. src/components/customer/CheckoutForm.tsx.
// Asıl iş kuralı (kapasite kontrolü, fiyat snapshot) veritabanında SECURITY DEFINER
// RPC olarak duruyor (bkz. 0013_siparis_ve_abonelik_secimi_rpc.sql); burası sadece
// giriş doğrulama + supabase.rpc çağrısı.

const addressSchema = z.object({
  zoneId: z.string().uuid(),
  block: z.string().trim().min(1),
  staircase: z.string().trim().optional(),
  floor: z.string().trim().optional(),
  apartment: z.string().trim().min(1),
  phone: z.string().trim().min(8),
  notes: z.string().trim().optional(),
});

export type SaveAddressResult =
  | { error: string }
  | { addressId: string };

export async function saveDeliveryAddress(
  input: z.infer<typeof addressSchema>
): Promise<SaveAddressResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_form" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "not_authenticated" };
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!customer) {
    return { error: "customer_not_found" };
  }

  const { data: address, error } = await supabase
    .from("delivery_addresses")
    .insert({
      customer_id: customer.id,
      zone_id: parsed.data.zoneId,
      block: parsed.data.block,
      staircase: parsed.data.staircase || null,
      floor: parsed.data.floor || null,
      apartment: parsed.data.apartment,
      phone: parsed.data.phone,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error || !address) {
    return { error: error?.message ?? "unknown_error" };
  }

  return { addressId: address.id };
}

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(["cash", "card"]),
  items: z.array(cartItemSchema).min(1),
});

export type CreateOrderResult =
  | { error: string }
  | { orderId: string; totalAmount: number };

export async function createOrder(
  input: z.infer<typeof createOrderSchema>
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_form" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_order", {
    p_address_id: parsed.data.addressId,
    p_payment_method: parsed.data.paymentMethod,
    p_items: parsed.data.items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
    })),
  });

  if (error) {
    return { error: error.message };
  }

  const result = data as { order_id: string; total_amount: number };
  return { orderId: result.order_id, totalAmount: result.total_amount };
}

export type SelectPlanResult = { error: string } | { subscriptionId: string };

export async function selectSubscriptionPlan(
  planId: string
): Promise<SelectPlanResult> {
  const parsed = z.string().uuid().safeParse(planId);
  if (!parsed.success) {
    return { error: "invalid_plan" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("select_subscription_plan", {
    p_plan_id: parsed.data,
  });

  if (error) {
    return { error: error.message };
  }

  const result = data as { subscription_id: string };
  return { subscriptionId: result.subscription_id };
}
