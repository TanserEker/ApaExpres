import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import OrderRow from "@/components/admin/OrderRow";

const STATUSES = ["received", "preparing", "on_the_way", "delivered", "cancelled"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const service = createServiceClient();

  let query = service
    .from("orders")
    .select(
      "id, created_at, status, payment_method, total_amount, driver_id, receipt_number, customers(name, phone), delivery_addresses(block, staircase, floor, apartment), drivers(name)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
    query = query.eq("status", status);
  }

  const [{ data: orders }, { data: activeDrivers }] = await Promise.all([
    query,
    service.from("drivers").select("id, name, vehicle_id").eq("is_active", true),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Siparişler</h1>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/siparisler" className={!status ? "font-semibold text-[#0B4F8A]" : "text-[#0A2540]/70"}>
          Hepsi
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/siparisler?status=${s}`}
            className={status === s ? "font-semibold text-[#0B4F8A]" : "text-[#0A2540]/70"}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {(!orders || orders.length === 0) && (
          <p className="text-[#0A2540]/70">Bu filtreye uyan sipariş yok.</p>
        )}
        {(orders ?? []).map((order) => (
          // @ts-expect-error - Supabase join tipleri basitleştirilmiş types.ts'te yok, runtime şekli doğru
          <OrderRow key={order.id} order={order} drivers={activeDrivers ?? []} />
        ))}
      </div>
    </div>
  );
}
