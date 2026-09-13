"use client";

import { useActionState, useTransition } from "react";
import { updateProduct, toggleProductActive, type AdminActionState } from "@/app/actions/admin-catalog";
import type { ProductRow } from "@/lib/supabase/types";

const initialState: AdminActionState = {};

export default function AdminProductRow({ product }: { product: ProductRow }) {
  const [state, formAction, pending] = useActionState(updateProduct, initialState);
  const [isToggling, startTransition] = useTransition();

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 items-center gap-2 rounded-lg border border-[#0B4F8A]/15 bg-white p-4 text-sm sm:grid-cols-6"
    >
      <input type="hidden" name="id" value={product.id} />
      <input name="name" defaultValue={product.name} className="col-span-2 rounded border border-[#0B4F8A]/30 px-2 py-1.5" />
      <input name="brand" defaultValue={product.brand ?? ""} className="rounded border border-[#0B4F8A]/30 px-2 py-1.5" />
      <input type="number" step="0.1" name="sizeLiters" defaultValue={product.size_liters} className="rounded border border-[#0B4F8A]/30 px-2 py-1.5" />
      <input type="number" step="0.01" name="unitPrice" defaultValue={product.unit_price} className="rounded border border-[#0B4F8A]/30 px-2 py-1.5" />
      <input type="hidden" name="depositPrice" value={product.deposit_price} />
      <div className="col-span-2 flex items-center gap-2 sm:col-span-6">
        <button type="submit" disabled={pending} className="rounded bg-[#0B4F8A] px-3 py-1.5 text-white disabled:opacity-60">
          Kaydet
        </button>
        <button
          type="button"
          disabled={isToggling}
          onClick={() => startTransition(() => toggleProductActive(product.id, !product.is_active))}
          className="rounded border border-[#0B4F8A]/30 px-3 py-1.5 text-[#0B4F8A] disabled:opacity-60"
        >
          {product.is_active ? "Pasifleştir" : "Aktifleştir"}
        </button>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
