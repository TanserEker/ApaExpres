"use client";

import { useActionState } from "react";
import { createDriver, type AdminActionState } from "@/app/actions/admin-drivers";

const initialState: AdminActionState = {};

export default function DriverForm({
  zoneId,
  vehicles,
}: {
  zoneId: string;
  vehicles: { id: string; plate: string }[];
}) {
  const [state, formAction, pending] = useActionState(createDriver, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 rounded-lg border border-[#0B4F8A]/15 bg-white p-4">
      <input type="hidden" name="zoneId" value={zoneId} />
      <input name="name" required placeholder="Ad soyad" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <input name="phone" required placeholder="Telefon" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <input type="email" name="email" required placeholder="E-posta (giriş için)" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <input type="password" name="password" required minLength={8} placeholder="İlk şifre (min. 8)" className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
      <select name="vehicleId" className="col-span-2 rounded border border-[#0B4F8A]/30 px-3 py-2">
        <option value="">Araç seç (opsiyonel, sonra da atanabilir)</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.plate}
          </option>
        ))}
      </select>
      {state.error && <p className="col-span-2 text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="col-span-2 rounded bg-[#0B4F8A] px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        Kurye ekle
      </button>
    </form>
  );
}
