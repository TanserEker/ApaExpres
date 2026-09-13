"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/customer/CartContext";
import type { ProductRow as ProductRowType } from "@/lib/supabase/types";

// 5L su 2'li paketler halinde satılıyor/tüketiliyor -> adet secici 1'er değil
// 2'şer artıyor (bkz. GOREVLER.md "Urun adet secici notu").
const STEP = 2;

export default function ProductRow({ product }: { product: ProductRowType }) {
  const t = useTranslations("catalog");
  const [quantity, setQuantity] = useState(STEP);
  const { addItem } = useCart();

  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-[#0B4F8A]/15 p-4">
      <div>
        <p className="font-medium text-[#0A2540]">{product.name}</p>
        <p className="text-sm text-[#0A2540]/60">
          {product.size_liters} L · {product.unit_price.toFixed(2)} RON
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(STEP, q - STEP))}
            className="h-8 w-8 rounded border border-[#0B4F8A]/30 text-[#0B4F8A]"
            aria-label="-"
          >
            −
          </button>
          <span className="w-6 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + STEP)}
            className="h-8 w-8 rounded border border-[#0B4F8A]/30 text-[#0B4F8A]"
            aria-label="+"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() =>
            addItem(
              {
                productId: product.id,
                name: product.name,
                brand: product.brand ?? null,
                unitPrice: product.unit_price,
              },
              quantity
            )
          }
          className="rounded bg-[#0B4F8A] px-3 py-2 text-sm font-medium text-white hover:bg-[#0A2540]"
        >
          {t("addToCart")}
        </button>
      </div>
    </li>
  );
}
