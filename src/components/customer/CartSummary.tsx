"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/customer/CartContext";

export default function CartSummary() {
  const t = useTranslations("catalog");
  const { items, setQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return <p className="text-[#0A2540]/60">{t("cartEmpty")}</p>;
  }

  return (
    <div className="rounded-lg border border-[#3EC1E0]/40 bg-[#3EC1E0]/5 p-4">
      <h2 className="mb-3 font-medium text-[#0B4F8A]">{t("cartTitle")}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center justify-between text-sm text-[#0A2540]"
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <div className="flex items-center gap-2">
              <span>{(item.unitPrice * item.quantity).toFixed(2)} RON</span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 2)}
                className="text-xs text-[#0B4F8A]/70 underline"
              >
                −2
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="text-xs text-red-600 underline"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-[#0B4F8A]/15 pt-3 font-medium text-[#0A2540]">
        <span>{t("total")}</span>
        <span>{total.toFixed(2)} RON</span>
      </div>
      <Link
        href="/checkout"
        className="mt-4 block rounded bg-[#0B4F8A] px-4 py-2 text-center font-medium text-white hover:bg-[#0A2540]"
      >
        {t("goToCheckout")}
      </Link>
    </div>
  );
}
