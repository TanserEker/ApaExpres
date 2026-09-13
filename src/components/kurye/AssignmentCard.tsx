"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateDeliveryStatus, type DriverActionState } from "@/app/actions/driver-actions";

export type Assignment = {
  id: string;
  status: "assigned" | "picked_up" | "delivered" | "cancelled";
  delivery_photo_path: string | null;
  orders: {
    id: string;
    status: string;
    total_amount: number;
    payment_method: string;
    customers: { name: string; phone: string } | null;
    delivery_addresses: {
      block: string | null;
      staircase: string | null;
      floor: string | null;
      apartment: string | null;
      phone: string | null;
      notes: string | null;
    } | null;
  } | null;
};

const initialState: DriverActionState = {};

export default function AssignmentCard({ assignment, driverId }: { assignment: Assignment; driverId: string }) {
  const [state, formAction, pending] = useActionState(updateDeliveryStatus, initialState);
  const [photoPath, setPhotoPath] = useState<string | null>(assignment.delivery_photo_path);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const order = assignment.orders;
  const address = order?.delivery_addresses;

  // Fotoğraf yükleme, seçilir seçilmez tarayıcıdan doğrudan Storage'a gidiyor
  // (bkz. 0017_teslimat_fotografi.sql RLS policy'si — path her zaman
  // "{driver_id}/..." ile başlamalı, aksi halde policy reddeder). Yüklenen path
  // sonra "Teslim edildi" formunda gizli alan olarak gönderiliyor.
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const objectPath = `${driverId}/${assignment.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("teslimat-fotograflari").upload(objectPath, file);
    setUploading(false);
    if (error) {
      setUploadError(error.message);
      return;
    }
    setPhotoPath(objectPath);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#0B4F8A]/15 bg-white p-4 text-sm">
      <div>
        <p className="font-medium text-[#0A2540]">{order?.customers?.name ?? "?"}</p>
        <p className="text-[#0A2540]/70">{order?.customers?.phone}</p>
        <p className="text-[#0A2540]/70">
          {address
            ? `Blok ${address.block}${address.staircase ? `, Scară ${address.staircase}` : ""}, Kat ${address.floor ?? "-"}, Daire ${address.apartment}`
            : "adres yok"}
        </p>
        {address?.phone && <p className="text-[#0A2540]/70">Teslimat tel: {address.phone}</p>}
        {address?.notes && <p className="text-[#0A2540]/50 italic">{address.notes}</p>}
        <p className="mt-1 font-medium text-[#0B4F8A]">
          {order?.total_amount.toFixed(2)} RON · {order?.payment_method}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {assignment.status === "assigned" && (
          <form action={formAction}>
            <input type="hidden" name="assignmentId" value={assignment.id} />
            <input type="hidden" name="newStatus" value="picked_up" />
            <button type="submit" disabled={pending} className="rounded bg-[#0B4F8A] px-3 py-1.5 text-white disabled:opacity-60">
              Yola çıktım
            </button>
          </form>
        )}

        {assignment.status === "picked_up" && (
          <>
            <label className="text-xs text-[#0A2540]/60">
              Teslimat fotoğrafı (opsiyonel)
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="block" />
            </label>
            <form action={formAction}>
              <input type="hidden" name="assignmentId" value={assignment.id} />
              <input type="hidden" name="newStatus" value="delivered" />
              <input type="hidden" name="photoPath" value={photoPath ?? ""} />
              <button
                type="submit"
                disabled={pending || uploading}
                className="rounded bg-[#3EC1E0] px-3 py-1.5 text-[#0A2540] disabled:opacity-60"
              >
                Teslim edildi
              </button>
            </form>
          </>
        )}

        {(assignment.status === "assigned" || assignment.status === "picked_up") && (
          <form action={formAction}>
            <input type="hidden" name="assignmentId" value={assignment.id} />
            <input type="hidden" name="newStatus" value="cancelled" />
            <button type="submit" disabled={pending} className="rounded border border-red-300 px-3 py-1.5 text-red-600 disabled:opacity-60">
              İptal
            </button>
          </form>
        )}

        {assignment.status === "delivered" && <span className="font-medium text-green-700">Teslim edildi</span>}
        {assignment.status === "cancelled" && <span className="font-medium text-red-600">İptal edildi</span>}
      </div>

      {uploadError && <p className="text-xs text-red-600">Fotoğraf yüklenemedi: {uploadError}</p>}
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
