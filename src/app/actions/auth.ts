"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export type AuthState = {
  error?: string;
  checkEmail?: boolean;
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "invalid_name"),
  phone: z.string().trim().min(8, "invalid_phone"),
  email: z.string().trim().email("invalid_email"),
  password: z.string().min(8, "invalid_password"),
});

// Müşteri self sign-up. auth_user_id -> customers bağlantısı 0003_customers.sql'deki
// "kullanici kendi musteri kaydini olusturabilir" insert policy'sine dayanıyor.
//
// ÖNEMLİ: Supabase projesinde "Confirm email" açıksa signUp() bir oturum DÖNDÜRMEZ
// (kullanıcı e-postasını onaylayana kadar). Bu yüzden customers satırını burada hemen
// oluşturmaya çalışmak yerine iki yola ayrılıyoruz: oturum hemen geldiyse (confirm email
// kapalı) satırı hemen oluşturup yönlendiriyoruz; gelmediyse ad/telefonu
// auth.users.raw_user_meta_data içinde saklayıp ilk girişte (bkz. loginCustomer)
// oluşturuyoruz.
export async function registerCustomer(
  locale: AppLocale,
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_form" };
  }

  const { name, phone, email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session && data.user) {
    const { error: customerError } = await supabase
      .from("customers")
      .insert({ auth_user_id: data.user.id, name, phone });

    if (customerError) {
      return { error: customerError.message };
    }

    return redirect({ href: "/catalog", locale });
  }

  return { checkEmail: true };
}

const loginSchema = z.object({
  email: z.string().trim().email("invalid_email"),
  password: z.string().min(1, "invalid_password"),
  next: z.string().optional(),
});

export async function loginCustomer(
  locale: AppLocale,
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_form" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: "invalid_credentials" };
  }

  // İlk kez giriş (kayıt sırasında e-posta onayı bekleniyordu) -> customers satırı
  // henüz yok, signUp'ta metadata'ya konan ad/telefonla şimdi oluşturuluyor.
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!existingCustomer) {
    const metadata = data.user.user_metadata as {
      name?: string;
      phone?: string;
    } | null;

    await supabase.from("customers").insert({
      auth_user_id: data.user.id,
      name: metadata?.name ?? data.user.email ?? "Müşteri",
      phone: metadata?.phone ?? "",
    });
  }

  const next = parsed.data.next && parsed.data.next.startsWith("/")
    ? parsed.data.next
    : "/catalog";
  return redirect({ href: next, locale });
}

export async function logoutCustomer(locale: AppLocale) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/", locale });
}
