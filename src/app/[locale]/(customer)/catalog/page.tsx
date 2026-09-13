import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/supabase/types";
import ProductRow_ from "@/components/customer/ProductRow";
import CartSummary from "@/components/customer/CartSummary";

// Katalog herkese açık (bkz. 0002_zones_products_plans.sql "herkes aktif urunleri
// gorebilir") — giriş yapmamış ziyaretçi de gözatabiliyor, sadece checkout girişi
// gerektiriyor (bkz. proxy.ts).
//
// Not: burada next-intl'in senkron useTranslations() yerine async getTranslations()
// kullanılıyor — async Server Component içinde başka bir dinamik API'yle (cookies()
// üzerinden createClient()) birlikte useTranslations() kullanmak build sırasında
// "Expected a suspended thenable" hatasına yol açtı (yerel build ile doğrulandı).
export default async function CatalogPage() {
  const t = await getTranslations("catalog");
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, brand, size_liters, unit_price, deposit_price, is_active, created_at")
    .eq("is_active", true)
    .order("unit_price", { ascending: true })
    .returns<ProductRow[]>();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[#0B4F8A]">{t("title")}</h1>
        <p className="text-sm text-[#0A2540]/70">{t("quantityHint")}</p>
      </div>

      {!products || products.length === 0 ? (
        <p className="text-[#0A2540]/70">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <ProductRow_ key={product.id} product={product} />
          ))}
        </ul>
      )}

      <CartSummary />
    </div>
  );
}
