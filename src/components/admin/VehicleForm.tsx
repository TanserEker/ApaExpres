"use client";

import { useActionState } from "react";
import { createVehicle, type AdminActionState } from "@/app/actions/admin-drivers";

const initialState: AdminActionState = {};

export default function VehicleForm({ zoneId }: { zoneId: string }) {
  const [state, formAction, pending] = useActionState(createVehicle, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-[#0B4F8A]/15 bg-white p-4">
      <input type="hidden" name="zoneId" value={zoneId} />
      <input name="plate" required placeholder="Plaka" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <input type="number" name="capacity" required min={1} placeholder="Kapasite (bidon)" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#0B4F8A] px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        Araç ekle
      </button>
    </form>
  );
}
