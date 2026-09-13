"use client";

import { useTransition } from "react";
import { toggleDriverActive } from "@/app/actions/admin-drivers";

export default function DriverRow({
  driver,
}: {
  driver: { id: string; name: string; phone: string; is_active: boolean; vehicles: { plate: string } | null };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-lg border border-[#0B4F8A]/15 bg-white p-4 text-sm">
      <div>
        <p className="font-medium text-[#0A2540]">{driver.name}</p>
        <p className="text-[#0A2540]/60">
          {driver.phone} · {driver.vehicles?.plate ?? "araç atanmadı"} · {driver.is_active ? "aktif" : "pasif"}
        </p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleDriverActive(driver.id, !driver.is_active))}
        className="rounded border border-[#0B4F8A]/30 px-3 py-1.5 text-[#0B4F8A] disabled:opacity-60"
      >
        {driver.is_active ? "Pasifleştir" : "Aktifleştir"}
      </button>
    </div>
  );
}
