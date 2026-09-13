import { createClient } from "@/lib/supabase/server";

// Admin server action'larının service role client'a (RLS'yi tamamen atlar)
// geçmeden önce çağırması gereken kapı. proxy.ts zaten /admin/** için bunu
// kontrol ediyor, ama Next.js'in kendi uyarısı doğru: "Always verify
// authentication and authorization inside each Server Function rather than
// relying on Proxy alone" (bkz. node_modules/next/dist/docs/.../proxy.md).
export class NotAdminError extends Error {
  constructor() {
    super("Bu islem icin admin yetkisi gerekiyor.");
  }
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new NotAdminError();

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin) throw new NotAdminError();

  return { userId: user.id, adminId: admin.id, supabase };
}
