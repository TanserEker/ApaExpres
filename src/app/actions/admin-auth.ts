"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Admin da sürücü gibi self-servis kayıt olmuyor (bkz. 0011_admin_rolu_ve_rls.sql
// yorumu) — hesap Supabase Auth'ta oluşturulup admins tablosuna elle/service role ile
// eklenir. /admin, locale segmentinin dışında olduğu için burada next-intl'in
// redirect()'i değil, düz next/navigation redirect() kullanılıyor.
export type AdminAuthState = { error?: string };

const loginSchema = z.object({
  email: z.string().trim().email("invalid_email"),
  password: z.string().min(1, "invalid_password"),
});

export async function loginAdmin(
  _prevState: AdminAuthState,
  formData: FormData
): Promise<AdminAuthState> {
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

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "invalid_credentials" };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
