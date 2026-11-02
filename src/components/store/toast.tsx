"use client";

import { useCart } from "@/context/cart-context";

export function Toast() {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div className="animate-toast fixed bottom-5 left-1/2 z-70 -translate-x-1/2 bg-gold px-4 py-3 text-[11px] font-bold text-ink">
      {toast}
    </div>
  );
}
