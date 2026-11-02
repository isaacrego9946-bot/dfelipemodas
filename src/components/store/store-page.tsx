"use client";

import { useState } from "react";
import type { Category } from "@/lib/products";
import { CartProvider } from "@/context/cart-context";
import { SiteHeader } from "@/components/store/site-header";
import { Hero } from "@/components/store/hero";
import { Categories } from "@/components/store/categories";
import { Shop } from "@/components/store/shop";
import { Promo } from "@/components/store/promo";
import { SiteFooter } from "@/components/store/site-footer";
import { Toast } from "@/components/store/toast";
import { WhatsappButton } from "@/components/store/whatsapp-button";

export function StorePage() {
  const [active, setActive] = useState<Category | "todos">("todos");

  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main>
          <Hero />
          <Categories onSelect={setActive} />
          <Shop active={active} onFilterChange={setActive} />
          <Promo />
        </main>
        <SiteFooter />
        <WhatsappButton />
        <Toast />
      </div>
    </CartProvider>
  );
}
