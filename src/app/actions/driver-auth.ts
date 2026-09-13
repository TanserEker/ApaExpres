"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { AuthState } from "@/app/actions/auth";

// Sürücü hesapları self-servis DEĞİL — "tek kurye" gerçeğiyle (bkz. GOREVLER.md
// "Kesin kararlar") admin/Tanser tarafından Supabase'de elle oluşturulup drivers
// tablosuna auth_user_id ile bağlanıyor (bkz. 0005_fleet.sql). Bu yüzden burada
// sadece giriş var, kayıt yok — Görev 5 (admin paneli) provizyon akışını,
// Görev 6 (kurye arayüzü) asıl dashboard'u ekleyecek.
const loginSchema = z.object({
  email: z.string().trim().email("invalid_email"),
  password: z.string().min(1, "invalid_password"),
});

export async function loginDriver(
  locale: AppLocale,
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_form" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: "invalid_credentials" };
  }

  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!driver) {
    await supabase.auth.signOut();
    return { error: "invalid_credentials" };
  }

  return redirect({ href: "/kurye", locale });
}

export async function logoutDriver(locale: AppLocale) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/kurye/giris", locale });
}
