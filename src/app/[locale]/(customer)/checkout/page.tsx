import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type {
  ZoneRow,
  DeliveryAddressRow,
  SubscriptionPlanRow,
} from "@/lib/supabase/types";
import CheckoutForm from "@/components/customer/CheckoutForm";

// proxy.ts zaten girişsiz kullanıcıyı /login'e yönlendiriyor, ama create_order RPC'si
// zaten auth.uid() olmadan çalışmadığı için burada ekstra bir kontrole gerek yok.
// getTranslations (async) kullanılıyor - bkz. catalog/page.tsx'teki not.
export default async function CheckoutPage() {
  const t = await getTranslations("checkout");
  const supabase = await createClient();

  const [{ data: zones }, { data: addresses }, { data: plans }] =
    await Promise.all([
      supabase
        .from("zones")
        .select("id, name, city, is_active, delivery_fee, created_at")
        .eq("is_active", true)
        .returns<ZoneRow[]>(),
      supabase
        .from("delivery_addresses")
        .select(
          "id, customer_id, zone_id, block, staircase, floor, apartment, phone, notes, lat, lng, created_at"
        )
        .order("created_at", { ascending: false })
        .returns<DeliveryAddressRow[]>(),
      supabase
        .from("subscription_plans")
        .select(
          "id, plan_type, frequency, pack_size, unit_price, total_price, is_active, created_at"
        )
        .eq("plan_type", "subscription")
        .eq("is_active", true)
        .returns<SubscriptionPlanRow[]>(),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-[#0B4F8A]">{t("title")}</h1>
      <CheckoutForm
        zones={zones ?? []}
        addresses={addresses ?? []}
        plans={plans ?? []}
      />
    </div>
  );
}
