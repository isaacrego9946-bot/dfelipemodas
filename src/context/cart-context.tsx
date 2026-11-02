"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS } from "@/lib/products";

export type CartItem = { id: number; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (id: number) => void;
  change: (id: number, delta: number) => void;
  clear: () => void;
  toast: string | null;
  notice: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const notice = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const add = useCallback(
    (id: number) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.id === id);
        if (existing) {
          return prev.map((item) =>
            item.id === id ? { ...item, qty: item.qty + 1 } : item,
          );
        }
        return [...prev, { id, qty: 1 }];
      });
      notice("Produto adicionado ao carrinho");
    },
    [notice],
  );

  const change = useCallback((id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items],
  );

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = PRODUCTS.find((p) => p.id === item.id);
        return sum + (product?.price ?? 0) * item.qty;
      }, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, count, total, add, change, clear, toast, notice }),
    [items, count, total, add, change, clear, toast, notice],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
