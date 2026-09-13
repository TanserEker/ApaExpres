import type { ReactNode } from "react";
import { CartProvider } from "@/components/customer/CartContext";

// Katalog/checkout/orders akışının ortak sarmalayıcısı — sadece sepet context'ini
// sağlıyor (bkz. GOREVLER.md Görev 3 "Dokunur: src/app/[locale]/(customer)/**").
// Not: (customer) bir route group olduğu için tek bir URL'e karşılık gelmiyor,
// bu yüzden burada next/typegen'in ürettiği LayoutProps<'/...'> yerine düz ReactNode
// tipi kullanıldı.
export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
