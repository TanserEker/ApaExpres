import { createServiceClient } from "@/lib/supabase/service";
import type { ProductRow } from "@/lib/supabase/types";
import ProductForm from "@/components/admin/ProductForm";
import AdminProductRow from "@/components/admin/AdminProductRow";

export default async function AdminCatalogPage() {
  const service = createServiceClient();
  const { data: products } = await service
    .from("products")
    .select("id, name, brand, size_liters, unit_price, deposit_price, is_active, created_at")
    .order("created_at", { ascending: false })
    .returns<ProductRow[]>();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Katalog</h1>
      <ProductForm />
      <div className="flex flex-col gap-2">
        {(products ?? []).map((p) => (
          <AdminProductRow key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
