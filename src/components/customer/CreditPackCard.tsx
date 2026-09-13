"use client";

import { useActionState } from "react";
import { purchaseCreditPack, type SubscriptionActionState } from "@/app/actions/subscriptions";
import type { SubscriptionPlanRow } from "@/lib/supabase/types";

const initialState: SubscriptionActionState = {};

export default function CreditPackCard({ plan }: { plan: SubscriptionPlanRow }) {
  const [state, formAction, pending] = useActionState(purchaseCreditPack, initialState);

  return (
    <form action={formAction} className="flex items-center justify-between rounded-lg border border-[#0B4F8A]/15 p-3 text-sm">
      <input type="hidden" name="planId" value={plan.id} />
      <div>
        <p className="font-medium text-[#0A2540]">{plan.pack_size} bidon</p>
        <p className="text-[#0A2540]/60">
          {plan.unit_price.toFixed(2)} RON/bidon · toplam {plan.total_price?.toFixed(2)} RON
        </p>
      </div>
      <button type="submit" disabled={pending} className="rounded bg-[#3EC1E0] px-3 py-1.5 text-[#0A2540] disabled:opacity-60">
        Satın al
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-700">Eklendi!</p>}
    </form>
  );
}
