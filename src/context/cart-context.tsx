"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "@/context/store-context";

export type CartItem = { id: string; size: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (id: string, size: string) => void;
  change: (id: string, size: string, delta: number) => void;
  clear: () => void;
  toast: string | null;
  notice: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const notice = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const add = useCallback(
    (id: string, size: string) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.id === id && item.size === size);
        if (existing) {
          return prev.map((item) =>
            item.id === id && item.size === size ? { ...item, qty: item.qty + 1 } : item,
          );
        }
        return [...prev, { id, size, qty: 1 }];
      });
      notice("Produto adicionado ao carrinho");
    },
    [notice],
  );

  const change = useCallback((id: string, size: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id && item.size === size ? { ...item, qty: item.qty + delta } : item,
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
        const product = products.find((entry) => entry.id === item.id);
        return sum + (product?.price ?? 0) * item.qty;
      }, 0),
    [items, products],
  );

  const value = useMemo(
    () => ({ items, count, total, add, change, clear, toast, notice }),
    [items, count, total, add, change, clear, toast, notice],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
