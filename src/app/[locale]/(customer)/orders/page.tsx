import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { OrderRow, OrderStatus } from "@/lib/supabase/types";

// RLS zaten "musteri kendi siparislerini gorebilir" (bkz. 0007_orders.sql) ile
// scoped, ekstra bir where customer_id=... eklemeye gerek yok.
// getTranslations (async) kullanılıyor - bkz. catalog/page.tsx'teki not.
export default async function OrdersPage() {
  const t = await getTranslations("orders");
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, customer_id, zone_id, address_id, status, payment_method, total_amount, capacity_slot_id, driver_id, vehicle_id, created_at, delivered_at"
    )
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold text-[#0B4F8A]">{t("title")}</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-[#0A2540]/70">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between rounded border border-[#0B4F8A]/15 p-4 text-sm"
            >
              <div>
                <p className="font-medium text-[#0A2540]">
                  {new Date(order.created_at).toLocaleString("ro-RO")}
                </p>
                <p className="text-[#0A2540]/70">
                  {t(`status.${order.status as OrderStatus}`)}
                </p>
              </div>
              <span className="font-medium text-[#0B4F8A]">
                {order.total_amount.toFixed(2)} RON
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
