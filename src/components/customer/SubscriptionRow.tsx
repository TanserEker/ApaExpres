"use client";

import { useActionState } from "react";
import { updateSubscriptionStatus, type SubscriptionActionState } from "@/app/actions/subscriptions";
import type { CustomerSubscriptionRow } from "@/lib/supabase/types";

const initialState: SubscriptionActionState = {};

export default function SubscriptionRow({ subscription }: { subscription: CustomerSubscriptionRow }) {
  const [state, formAction, pending] = useActionState(updateSubscriptionStatus, initialState);

  const nextStatus = subscription.status === "active" ? "paused" : "active";

  return (
    <div className="flex items-center justify-between rounded-lg border border-[#0B4F8A]/15 p-3 text-sm">
      <div>
        <p className="font-medium text-[#0A2540]">{subscription.frequency}x/hafta</p>
        <p className="text-[#0A2540]/60">{subscription.status}</p>
      </div>
      <div className="flex gap-2">
        {subscription.status !== "cancelled" && (
          <form action={formAction}>
            <input type="hidden" name="subscriptionId" value={subscription.id} />
            <input type="hidden" name="status" value={nextStatus} />
            <button type="submit" disabled={pending} className="rounded border border-[#0B4F8A]/30 px-3 py-1.5 text-[#0B4F8A] disabled:opacity-60">
              {subscription.status === "active" ? "Duraklat" : "Devam ettir"}
            </button>
          </form>
        )}
        {subscription.status !== "cancelled" && (
          <form action={formAction}>
            <input type="hidden" name="subscriptionId" value={subscription.id} />
            <input type="hidden" name="status" value="cancelled" />
            <button type="submit" disabled={pending} className="rounded border border-red-300 px-3 py-1.5 text-red-600 disabled:opacity-60">
              İptal
            </button>
          </form>
        )}
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
