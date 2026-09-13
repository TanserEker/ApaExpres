import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

// proxy.ts zaten /admin/** için giriş+admin kontrolü yapıyor, ama Next.js'in kendi
// önerisi (bkz. node_modules/next/dist/docs/.../proxy.md) doğrultusunda burada da
// tekrar doğrulanıyor — aycabayramoglu/src/app/admin/(dashboard)/layout.tsx ile
// aynı desen. (dashboard) bir route group olduğu için (bkz. (customer)/layout.tsx'
// teki aynı not) LayoutProps<'/...'> yerine düz ReactNode kullanıldı.
export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id, name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
