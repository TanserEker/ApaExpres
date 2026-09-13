import { createServiceClient } from "@/lib/supabase/service";
import DriverForm from "@/components/admin/DriverForm";
import VehicleForm from "@/components/admin/VehicleForm";
import DriverRow from "@/components/admin/DriverRow";

export default async function AdminDriversPage() {
  const service = createServiceClient();

  const { data: zone } = await service.from("zones").select("id, name").eq("name", "Cosmopolis").maybeSingle();
  const zoneId = zone?.id ?? "";

  const [{ data: drivers }, { data: vehicles }] = await Promise.all([
    service
      .from("drivers")
      .select("id, name, phone, is_active, vehicles(plate)")
      .order("created_at", { ascending: false }),
    service.from("vehicles").select("id, plate").eq("is_active", true),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Kuryeler</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-[#0B4F8A]">Araçlar</h2>
        <VehicleForm zoneId={zoneId} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-[#0B4F8A]">Yeni kurye ekle</h2>
        <DriverForm zoneId={zoneId} vehicles={vehicles ?? []} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-[#0B4F8A]">Mevcut kuryeler</h2>
        {(!drivers || drivers.length === 0) && <p className="text-[#0A2540]/60">Henüz kurye yok.</p>}
        <div className="flex flex-col gap-2">
          {(drivers ?? []).map((d) => (
            // @ts-expect-error - Supabase join tipi types.ts'te basitleştirilmiş değil, runtime şekli doğru
            <DriverRow key={d.id} driver={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
