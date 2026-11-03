"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductPhoto } from "@/components/store/product-photo";
import { useCart } from "@/context/cart-context";
import { useStore } from "@/context/store-context";
import { formatMoney } from "@/lib/catalog";
import { CheckoutDialog } from "@/components/store/checkout-dialog";

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, total, change, notice } = useCart();
  const { products } = useStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full border-l border-[#5d4725] bg-[#111] p-0 sm:max-w-[420px]"
        >
          <SheetHeader className="border-b border-border p-6">
            <SheetTitle className="font-display text-[28px] font-medium">
              Seu carrinho
            </SheetTitle>
            <SheetDescription className="sr-only">
              Itens selecionados para compra
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-6">
            {items.length === 0 ? (
              <div className="px-2.5 py-11 text-center text-[#888]">
                Seu carrinho está vazio.
                <br />
                <br />
                Adicione uma peça da coleção.
              </div>
            ) : (
              items.map((item) => {
                const product = products.find((entry) => entry.id === item.id);
                if (!product) return null;
                return (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="grid grid-cols-[58px_1fr_auto] items-center gap-2.5 border-b border-border py-3.5"
                  >
                    <div className="product-visual relative grid h-[70px] w-[58px] place-items-center overflow-hidden font-display text-[11px] text-white/30">
                      <ProductPhoto
                        url={product.images[0]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      DF
                    </div>
                    <div>
                      <h4 className="text-xs font-normal">{product.name}</h4>
                      <p className="mt-1 text-xs text-gold-soft">
                        {formatMoney(product.price)} · tam. {item.size}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="size-[22px] border border-[#555] text-foreground"
                          onClick={() => change(product.id, item.size, -1)}
                        >
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          className="size-[22px] border border-[#555] text-foreground"
                          onClick={() => change(product.id, item.size, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-[19px] text-[#aaa]"
                      aria-label="Remover"
                      onClick={() => change(product.id, item.size, -item.qty)}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <SheetFooter className="border-t border-border p-6">
            <div className="mb-1 flex w-full justify-between">
              <span>Total</span>
              <strong className="text-gold-soft">{formatMoney(total)}</strong>
            </div>
            <Button
              className="h-auto w-full rounded-none bg-gold px-5 py-3.5 text-[10px] font-bold tracking-[1.5px] text-ink uppercase hover:bg-gold/90"
              onClick={() => {
                if (!items.length) {
                  notice("Adicione um produto primeiro");
                  return;
                }
                onOpenChange(false);
                setCheckoutOpen(true);
              }}
            >
              Finalizar compra
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
