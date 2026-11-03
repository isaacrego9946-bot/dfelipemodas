"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useStore } from "@/context/store-context";
import { orderCode } from "@/lib/catalog";

type CheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { items, clear, notice } = useCart();
  const { placeOrder } = useStore();
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    try {
      const order = await placeOrder({
        customer: {
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          email: String(form.get("email") ?? ""),
          note: String(form.get("note") ?? ""),
        },
        lines: items.map((item) => ({
          productId: item.id,
          size: item.size,
          qty: item.qty,
        })),
      });
      onOpenChange(false);
      clear();
      event.currentTarget.reset();
      notice(`Pedido #${orderCode(order.number)} registrado`);
    } catch (reason) {
      notice(reason instanceof Error ? reason.message : "Não foi possível enviar o pedido.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-none border border-[#5d4725] bg-[#111] p-7 shadow-[0_20px_60px_#000] ring-0">
        <DialogHeader>
          <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">
            Pedido da loja
          </p>
          <DialogTitle className="font-display text-[30px] font-medium">
            Finalizar compra
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-[#bbb]">
            O pedido entra na base da loja para separação e impressão. Nenhum
            pagamento é cobrado por aqui.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Input name="name" required placeholder="Seu nome" className="mt-2.5 h-auto rounded-none border-[#444] bg-ink px-3 py-3" />
          <Input name="phone" required placeholder="Seu WhatsApp" className="mt-2.5 h-auto rounded-none border-[#444] bg-ink px-3 py-3" />
          <Input name="email" type="email" required placeholder="Seu e-mail" className="mt-2.5 h-auto rounded-none border-[#444] bg-ink px-3 py-3" />
          <Input name="note" placeholder="Observação (opcional)" className="mt-2.5 h-auto rounded-none border-[#444] bg-ink px-3 py-3" />
          <Button
            type="submit"
            disabled={sending || items.length === 0}
            className="mt-3.5 h-auto w-full rounded-none bg-gold px-5 py-3.5 text-[10px] font-bold tracking-[1.5px] text-ink uppercase hover:bg-gold/90"
          >
            {sending ? "Enviando..." : "Confirmar pedido"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
