"use client";

import { Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { CartSheet } from "@/components/store/cart-sheet";

const links = [
  { href: "#inicio", label: "Início" },
  { href: "#categorias", label: "Categorias" },
  { href: "#loja", label: "Coleção" },
  { href: "#sobre", label: "Sobre" },
];

export function SiteHeader() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-[#080808ed] px-4 backdrop-blur-md md:min-h-[72px] md:px-[6%]">
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground md:hidden"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu className="size-5" />
        </Button>

        <a href="#inicio" className="flex items-center gap-2.5 text-gold-soft">
          <span className="grid size-10 place-items-center rounded-full border border-gold bg-ink font-display text-lg font-bold tracking-tight md:size-12 md:text-[19px]">
            DF
          </span>
          <span className="font-display text-lg font-semibold tracking-wide md:text-[23px]">
            D Felipe Modas
          </span>
        </a>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute top-full right-0 left-0 z-25 flex-col border-b border-border bg-[#0b0b0b] md:static md:flex md:flex-row md:gap-6 md:border-0 md:bg-transparent`}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-white/5 px-4 py-3 text-[10px] tracking-[1.5px] uppercase transition-colors hover:text-gold md:border-0 md:px-0 md:py-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground"
          aria-label="Abrir carrinho"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag className="size-5" />
          <span className="absolute -top-0.5 -right-0.5 grid size-[17px] place-items-center rounded-full bg-gold text-[10px] font-bold text-ink">
            {count}
          </span>
        </Button>
      </header>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
