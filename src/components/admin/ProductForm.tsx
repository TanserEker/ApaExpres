"use client";

import { useActionState } from "react";
import { createProduct, type AdminActionState } from "@/app/actions/admin-catalog";

const initialState: AdminActionState = {};

export default function ProductForm() {
  const [state, formAction, pending] = useActionState(createProduct, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 rounded-lg border border-[#0B4F8A]/15 bg-white p-4 sm:grid-cols-4">
      <input name="name" required placeholder="Ürün adı" className="col-span-2 rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <input name="brand" required placeholder="Marka" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <input type="number" step="0.1" name="sizeLiters" required defaultValue={5} placeholder="Litre" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <input type="number" step="0.01" name="unitPrice" required placeholder="Fiyat (RON)" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <input type="number" step="0.01" name="depositPrice" defaultValue={0} placeholder="Depozito" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      {state.error && <p className="col-span-full text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="col-span-full rounded bg-[#0B4F8A] px-4 py-2 font-medium text-white disabled:opacity-60 sm:col-span-1"
      >
        Ürün ekle
      </button>
    </form>
  );
}
