import { createServiceClient } from "@/lib/supabase/service";
import CapacitySlotForm from "@/components/admin/CapacitySlotForm";

// create_order (bkz. 0013/0014) bir slot yoksa varsayılan kapasiteyle (8) otomatik
// oluşturuyor — burası sadece admin'in bu varsayılanı elle görüp değiştirebilmesi için.
export default async function AdminCapacityPage() {
  const service = createServiceClient();

  const { data: zone } = await service.from("zones").select("id, name").eq("name", "Cosmopolis").maybeSingle();
  const zoneId = zone?.id ?? "";

  const today = new Date().toISOString().slice(0, 10);
  const { data: slots } = await service
    .from("capacity_slots")
    .select("id, date, slot_start, slot_end, max_orders, current_orders")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("slot_start", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Kapasite</h1>
      <CapacitySlotForm zoneId={zoneId} />
      <div className="flex flex-col gap-2">
        {(!slots || slots.length === 0) && (
          <p className="text-[#0A2540]/70">Henüz oluşturulmuş bir slot yok (ilk sipariş geldiğinde otomatik oluşur).</p>
        )}
        {(slots ?? []).map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-[#0B4F8A]/15 bg-white p-3 text-sm">
            <span>
              {s.date} · {s.slot_start}–{s.slot_end}
            </span>
            <span className="font-medium text-[#0B4F8A]">
              {s.current_orders}/{s.max_orders}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
