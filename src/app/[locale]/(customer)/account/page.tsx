import { createClient } from "@/lib/supabase/server";
import type {
  CustomerCreditRow,
  CustomerSubscriptionRow,
  CreditTransactionRow,
  SubscriptionPlanRow,
} from "@/lib/supabase/types";
import SubscriptionRow from "@/components/customer/SubscriptionRow";
import CreditPackCard from "@/components/customer/CreditPackCard";

// Görev 4: müşteri panelinde plan seçme/kredi bakiyesi. Abonelik SEÇİMİ (yeni plana
// kaydolma) checkout'ta kalıyor (bkz. Görev 3) — burası mevcut abonelik(ler)i
// yönetmek (duraklat/iptal) ve kredi paketi satın almak/bakiyeyi görmek için.
export default async function AccountPage() {
  const supabase = await createClient();

  const [creditResult, { data: subscriptions }, { data: transactions }, { data: creditPacks }] =
    await Promise.all([
      supabase.from("customer_credits").select("*").maybeSingle(),
      supabase
        .from("customer_subscriptions")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<CustomerSubscriptionRow[]>(),
      supabase
        .from("credit_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<CreditTransactionRow[]>(),
      supabase
        .from("subscription_plans")
        .select("*")
        .eq("plan_type", "credit_pack")
        .eq("is_active", true)
        .returns<SubscriptionPlanRow[]>(),
    ]);
  const credit = creditResult.data as CustomerCreditRow | null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10">
      <h1 className="text-2xl font-semibold text-[#0B4F8A]">Hesabım</h1>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-[#0A2540]">Kredi bakiyesi</h2>
        <p className="text-3xl font-semibold text-[#0B4F8A]">{credit?.credit_balance ?? 0} bidon</p>
        {(transactions ?? []).length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#0A2540]/60">
            {(transactions ?? []).map((t) => (
              <li key={t.id}>
                {new Date(t.created_at).toLocaleDateString("ro-RO")} · {t.type} · {t.quantity > 0 ? "+" : ""}
                {t.quantity}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-[#0A2540]">Kredi paketi satın al</h2>
        {(!creditPacks || creditPacks.length === 0) ? (
          <p className="text-[#0A2540]/60">Şu an aktif kredi paketi yok.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {creditPacks.map((plan) => (
              <CreditPackCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-[#0A2540]">Aboneliklerim</h2>
        {(!subscriptions || subscriptions.length === 0) ? (
          <p className="text-[#0A2540]/60">Aktif bir aboneliğiniz yok. Checkout&apos;tan abone olabilirsiniz.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {subscriptions.map((s) => (
              <SubscriptionRow key={s.id} subscription={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
