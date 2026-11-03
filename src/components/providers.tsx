"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/cart-context";
import { StoreProvider } from "@/context/store-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <CartProvider>{children}</CartProvider>
    </StoreProvider>
  );
}
