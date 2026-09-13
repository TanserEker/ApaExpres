import { createClient } from "@/lib/supabase/server";
import AssignmentCard, { type Assignment } from "@/components/kurye/AssignmentCard";
import NotificationOptIn from "@/components/site/NotificationOptIn";

// types.ts'teki Database = any olduğu için supabase-js, join edilen tabloları
// (customers/delivery_addresses/orders) varsayılan olarak dizi türünde çıkarıyor
// (gerçek şemadaki tekil ilişkiyi bilemiyor). Sorgu sonucu burada "any" olarak
// alınıp Assignment şekline elle (ve güvenli şekilde) normalize ediliyor.
function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAssignment(raw: any): Assignment {
  const order = first(raw.orders);
  return {
    id: raw.id,
    status: raw.status,
    delivery_photo_path: raw.delivery_photo_path,
    orders: order
      ? {
          id: order.id,
          status: order.status,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          customers: first(order.customers),
          delivery_addresses: first(order.delivery_addresses),
        }
      : null,
  };
}

// Kurye panelinin ana sayfası (Görev 6). Authenticated client + RLS kullanılıyor
// (service role değil) — sürücü zaten sadece kendi atamalarını görebiliyor
// (is_own_driver(), bkz. 0008/0011), müşteri/adres erişimi de dar kapsamlı
// (bkz. 0018_kurye_musteri_adres_erisimi.sql).
export default async function DriverDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // proxy.ts zaten /kurye/giris'e yönlendiriyor, burası sadece güvenlik
  }

  const { data: driver } = await supabase
    .from("drivers")
    .select("id, name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!driver) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center">
        <p className="text-[#0A2540]/70">Bu hesap bir kurye kaydına bağlı değil.</p>
      </div>
    );
  }

  const { data: rawAssignments } = await supabase
    .from("driver_assignments")
    .select(
      "id, status, delivery_photo_path, orders(id, status, total_amount, payment_method, customers(name, phone), delivery_addresses(block, staircase, floor, apartment, phone, notes))"
    )
    .order("assigned_at", { ascending: false });

  const assignments = (rawAssignments ?? []).map(normalizeAssignment);
  const active = assignments.filter((a) => a.status === "assigned" || a.status === "picked_up");
  const past = assignments.filter((a) => a.status === "delivered" || a.status === "cancelled");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-[#0B4F8A]">Merhaba, {driver.name}</h1>

      <NotificationOptIn />

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-[#0A2540]">Atanan siparişler</h2>
        {active.length === 0 && <p className="text-[#0A2540]/70">Şu an atanmış aktif sipariş yok.</p>}
        {active.map((a) => (
          <AssignmentCard key={a.id} assignment={a} driverId={driver.id} />
        ))}
      </section>

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-[#0A2540]">Geçmiş</h2>
          {past.map((a) => (
            <AssignmentCard key={a.id} assignment={a} driverId={driver.id} />
          ))}
        </section>
      )}
    </div>
  );
}
