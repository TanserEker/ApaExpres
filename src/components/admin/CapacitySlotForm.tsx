"use client";

import { useActionState } from "react";
import { upsertCapacitySlot, type AdminActionState } from "@/app/actions/admin-capacity";

const initialState: AdminActionState = {};

export default function CapacitySlotForm({ zoneId }: { zoneId: string }) {
  const [state, formAction, pending] = useActionState(upsertCapacitySlot, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-[#0B4F8A]/15 bg-white p-4 text-sm">
      <input type="hidden" name="zoneId" value={zoneId} />
      <label className="flex flex-col gap-1">
        Tarih
        <input type="date" name="date" required className="rounded border border-[#0B4F8A]/30 px-2 py-1.5" />
      </label>
      <label className="flex flex-col gap-1">
        Başlangıç
        <input type="time" name="slotStart" required className="rounded border border-[#0B4F8A]/30 px-2 py-1.5" />
      </label>
      <label className="flex flex-col gap-1">
        Bitiş
        <input type="time" name="slotEnd" required className="rounded border border-[#0B4F8A]/30 px-2 py-1.5" />
      </label>
      <label className="flex flex-col gap-1">
        Maks. sipariş
        <input type="number" name="maxOrders" min={1} required defaultValue={8} className="rounded border border-[#0B4F8A]/30 px-2 py-1.5" />
      </label>
      {state.error && <p className="text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded bg-[#0B4F8A] px-4 py-2 font-medium text-white disabled:opacity-60">
        Kaydet
      </button>
    </form>
  );
}
