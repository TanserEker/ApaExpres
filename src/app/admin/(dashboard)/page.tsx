import { createServiceClient } from "@/lib/supabase/service";
import { logoutAdmin } from "@/app/actions/admin-auth";

// Admin panelinin genel bakış sayfası. Okuma işlemleri service role ile yapılıyor
// (bkz. README "İç sistem mantığı" — admin RLS ile değil service role ile
// çalışacak şekilde tasarlandı); erişim kontrolü zaten üstteki (dashboard)/
// layout.tsx'te yapılıyor, burada tekrar etmeye gerek yok.
export default async function AdminOverviewPage() {
  const service = createServiceClient();

  const [{ count: pendingCount }, { count: todayCount }, { count: customerCount }, { count: driverCount }] =
    await Promise.all([
      service.from("orders").select("*", { count: "exact", head: true }).eq("status", "received"),
      service
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      service.from("customers").select("*", { count: "exact", head: true }),
      service.from("drivers").select("*", { count: "exact", head: true }).eq("is_active", true),
    ]);

  const stats = [
    { label: "Onay bekleyen sipariş", value: pendingCount ?? 0 },
    { label: "Bugünkü sipariş", value: todayCount ?? 0 },
    { label: "Toplam müşteri", value: customerCount ?? 0 },
    { label: "Aktif kurye", value: driverCount ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Genel Bakış</h1>
        <form action={logoutAdmin}>
          <button type="submit" className="text-sm text-[#0A2540]/60 underline">
            Çıkış yap
          </button>
        </form>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-[#0B4F8A]/15 bg-white p-4">
            <p className="text-2xl font-semibold text-[#0B4F8A]">{s.value}</p>
            <p className="text-sm text-[#0A2540]/60">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
