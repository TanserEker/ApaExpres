"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/customer/CartContext";
import {
  createOrder,
  saveDeliveryAddress,
  selectSubscriptionPlan,
} from "@/app/actions/create-order";
import type {
  ZoneRow,
  DeliveryAddressRow,
  SubscriptionPlanRow,
} from "@/lib/supabase/types";

type Props = {
  zones: ZoneRow[];
  addresses: DeliveryAddressRow[];
  plans: SubscriptionPlanRow[];
};

type OrderType = "one_time" | "subscription";

export default function CheckoutForm({ zones, addresses: initialAddresses, plans }: Props) {
  const t = useTranslations("checkout");
  const { items, total, clear } = useCart();
  const [isPending, startTransition] = useTransition();

  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(
    initialAddresses[0]?.id ?? ""
  );
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [orderType, setOrderType] = useState<OrderType>("one_time");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultZoneId = zones[0]?.id ?? "";

  function handleAddAddress(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveDeliveryAddress({
        zoneId: defaultZoneId,
        block: String(formData.get("block") ?? ""),
        staircase: String(formData.get("staircase") ?? ""),
        floor: String(formData.get("floor") ?? ""),
        apartment: String(formData.get("apartment") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      const newAddress: DeliveryAddressRow = {
        id: result.addressId,
        customer_id: "",
        zone_id: defaultZoneId,
        block: String(formData.get("block") ?? ""),
        staircase: String(formData.get("staircase") ?? "") || null,
        floor: String(formData.get("floor") ?? "") || null,
        apartment: String(formData.get("apartment") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        notes: String(formData.get("notes") ?? "") || null,
        lat: null,
        lng: null,
        created_at: new Date().toISOString(),
      };
      setAddresses((prev) => [newAddress, ...prev]);
      setSelectedAddressId(newAddress.id);
      setShowNewAddress(false);
    });
  }

  function handleSubmitOrder() {
    setError(null);
    setSuccess(null);
    if (!selectedAddressId) {
      setError("no_address");
      return;
    }
    startTransition(async () => {
      const result = await createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setSuccess(t("success"));
      clear();
    });
  }

  function handleSubscribe() {
    setError(null);
    setSuccess(null);
    if (!selectedPlanId) {
      setError("no_plan");
      return;
    }
    startTransition(async () => {
      const result = await selectSubscriptionPlan(selectedPlanId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSuccess(t("subscriptionSuccess"));
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-[#0B4F8A]">{t("addressTitle")}</h2>

        {addresses.length > 0 && !showNewAddress && (
          <div className="flex flex-col gap-2">
            {addresses.map((address) => (
              <label
                key={address.id}
                className="flex items-center gap-2 rounded border border-[#0B4F8A]/20 p-3 text-sm"
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                />
                {t("block")} {address.block}
                {address.staircase ? `, ${t("staircase")} ${address.staircase}` : ""}
                {address.floor ? `, ${t("floor")} ${address.floor}` : ""}, {t("apartment")}{" "}
                {address.apartment} — {address.phone}
              </label>
            ))}
            <button
              type="button"
              onClick={() => setShowNewAddress(true)}
              className="self-start text-sm text-[#0B4F8A] underline"
            >
              + {t("saveAddress")}
            </button>
          </div>
        )}

        {showNewAddress && (
          <form action={handleAddAddress} className="grid grid-cols-2 gap-3">
            <input name="block" required placeholder={t("block")} className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
            <input name="staircase" placeholder={t("staircase")} className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
            <input name="floor" placeholder={t("floor")} className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
            <input name="apartment" required placeholder={t("apartment")} className="rounded border border-[#0B4F8A]/30 px-3 py-2" />
            <input name="phone" required placeholder={t("phone")} className="col-span-2 rounded border border-[#0B4F8A]/30 px-3 py-2" />
            <textarea name="notes" placeholder={t("notes")} className="col-span-2 rounded border border-[#0B4F8A]/30 px-3 py-2" />
            <button
              type="submit"
              disabled={isPending}
              className="col-span-2 rounded bg-[#0B4F8A] px-4 py-2 font-medium text-white disabled:opacity-60"
            >
              {t("saveAddress")}
            </button>
          </form>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-[#0B4F8A]">{t("orderType")}</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOrderType("one_time")}
            className={`rounded px-3 py-2 text-sm ${
              orderType === "one_time"
                ? "bg-[#0B4F8A] text-white"
                : "border border-[#0B4F8A]/30 text-[#0B4F8A]"
            }`}
          >
            {t("oneTime")}
          </button>
          <button
            type="button"
            onClick={() => setOrderType("subscription")}
            className={`rounded px-3 py-2 text-sm ${
              orderType === "subscription"
                ? "bg-[#0B4F8A] text-white"
                : "border border-[#0B4F8A]/30 text-[#0B4F8A]"
            }`}
          >
            {t("subscription")}
          </button>
        </div>
      </section>

      {orderType === "one_time" ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-[#0B4F8A]">{t("paymentMethod")}</h2>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              {t("cash")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              {t("card")}
            </label>
          </div>

          <p className="text-sm text-[#0A2540]/70">{t("outsideHours")}</p>

          <div className="flex items-center justify-between font-medium text-[#0A2540]">
            <span>{t("total")}</span>
            <span>{total.toFixed(2)} RON</span>
          </div>

          <button
            type="button"
            disabled={isPending || items.length === 0}
            onClick={handleSubmitOrder}
            className="rounded bg-[#3EC1E0] px-4 py-3 font-medium text-[#0A2540] disabled:opacity-60"
          >
            {t("submit")}
          </button>
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          {plans.length === 0 ? (
            <p className="text-[#0A2540]/70">{t("noPlans")}</p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {plans.map((plan) => (
                  <label
                    key={plan.id}
                    className="flex items-center gap-2 rounded border border-[#0B4F8A]/20 p-3 text-sm"
                  >
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlanId === plan.id}
                      onChange={() => setSelectedPlanId(plan.id)}
                    />
                    {plan.frequency}x/hafta — {plan.unit_price.toFixed(2)} RON/bidon
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSubscribe}
                className="rounded bg-[#3EC1E0] px-4 py-3 font-medium text-[#0A2540] disabled:opacity-60"
              >
                {t("subscriptionSubmit")}
              </button>
            </>
          )}
        </section>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}
    </div>
  );
}
