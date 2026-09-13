"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  brand: string | null;
  unitPrice: number;
  quantity: number; // her zaman 2'nin katı (bkz. GOREVLER.md "5L urun adet secici notu")
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "apa-expres-cart";

// Sepet sadece tarayıcıda (localStorage) tutuluyor — server'da hiçbir "sepet" tablosu
// yok, checkout'ta tüm satırlar tek seferde create_order RPC'sine gönderiliyor
// (bkz. src/app/actions/create-order.ts). Bu, tek sayfalık basit bir MVP akışı için
// ayrı bir "carts" tablosu/senkronizasyonu kurmaktan çok daha basit.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Sunucu tarafında window yok, bu yüzden ilk state boş dizi (SSR/ilk client
    // render'ı eşleşsin, hydration mismatch olmasın) - localStorage'daki gerçek
    // sepet mount sonrası buradan okunuyor. eslint-disable: bu, harici bir
    // sistemden (localStorage) ilk senkronizasyon - React'in önerdiği istisna
    // (bkz. https://react.dev/learn/you-might-not-need-an-effect).
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage bozuksa/erişilemezse sessizce boş sepetle devam edilir
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, setQuantity, removeItem, clear, total }),
    [items, addItem, setQuantity, removeItem, clear, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart, CartProvider icinde kullanilmali.");
  return ctx;
}
