"use client";

import { useActionState } from "react";
import { approveOrder, assignDriver, setReceiptNumber, type AdminActionState } from "@/app/actions/admin-orders";

type Order = {
  id: string;
  created_at: string;
  status: string;
  payment_method: string;
  total_amount: number;
  driver_id: string | null;
  receipt_number: string | null;
  customers: { name: string; phone: string } | null;
  delivery_addresses: {
    block: string | null;
    staircase: string | null;
    floor: string | null;
    apartment: string | null;
  } | null;
  drivers: { name: string } | null;
};

const initialState: AdminActionState = {};

export default function OrderRow({
  order,
  drivers,
}: {
  order: Order;
  drivers: { id: string; name: string; vehicle_id: string | null }[];
}) {
  const [approveState, approveAction, approvePending] = useActionState(approveOrder, initialState);
  const [assignState, assignAction, assignPending] = useActionState(assignDriver, initialState);
  const [receiptState, receiptAction, receiptPending] = useActionState(setReceiptNumber, initialState);

  const address = order.delivery_addresses;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#0B4F8A]/15 bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-[#0A2540]">
          {order.customers?.name ?? "?"} — {order.customers?.phone ?? ""}
        </p>
        <p className="text-[#0A2540]/60">
          {address ? `Blok ${address.block}${address.staircase ? `, Scară ${address.staircase}` : ""}, Kat ${address.floor ?? "-"}, Daire ${address.apartment}` : "adres yok"}
        </p>
        <p className="text-[#0A2540]/60">
          {new Date(order.created_at).toLocaleString("ro-RO")} · {order.total_amount.toFixed(2)} RON ·{" "}
          {order.payment_method} ·{" "}
          <span className="font-medium">{order.status}</span>
          {order.drivers?.name ? ` · Kurye: ${order.drivers.name}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {order.status === "received" && (
          <form action={approveAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <button
              type="submit"
              disabled={approvePending}
              className="rounded bg-[#0B4F8A] px-3 py-1.5 text-white disabled:opacity-60"
            >
              Onayla
            </button>
          </form>
        )}

        {!order.driver_id && order.status !== "delivered" && order.status !== "cancelled" && (
          <form action={assignAction} className="flex items-center gap-1">
            <input type="hidden" name="orderId" value={order.id} />
            <select name="driverId" required className="rounded border border-[#0B4F8A]/30 px-2 py-1.5">
              <option value="">Kurye seç</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id} disabled={!d.vehicle_id}>
                  {d.name}
                  {!d.vehicle_id ? " (araç yok)" : ""}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={assignPending}
              className="rounded bg-[#3EC1E0] px-3 py-1.5 text-[#0A2540] disabled:opacity-60"
            >
              Ata
            </button>
          </form>
        )}

        {order.status !== "cancelled" && (
          <form action={receiptAction} className="flex items-center gap-1">
            <input type="hidden" name="orderId" value={order.id} />
            <input
              name="receiptNumber"
              defaultValue={order.receipt_number ?? ""}
              placeholder="Fiş no"
              required
              className="w-24 rounded border border-[#0B4F8A]/30 px-2 py-1.5"
            />
            <button
              type="submit"
              disabled={receiptPending}
              className="rounded border border-[#0B4F8A]/30 px-3 py-1.5 text-[#0B4F8A] disabled:opacity-60"
            >
              Fiş no kaydet
            </button>
          </form>
        )}

        {(approveState.error || assignState.error || receiptState.error) && (
          <p className="w-full text-xs text-red-600">
            {approveState.error ?? assignState.error ?? receiptState.error}
          </p>
        )}
      </div>
    </div>
  );
}
