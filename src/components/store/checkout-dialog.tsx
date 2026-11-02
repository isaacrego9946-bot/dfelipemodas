"use client";

import { FormEvent } from "react";
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

type CheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { clear, notice } = useCart();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "cliente");
    onOpenChange(false);
    clear();
    event.currentTarget.reset();
    notice(`Pedido de ${name} enviado com sucesso!`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-none border border-[#5d4725] bg-[#111] p-7 shadow-[0_20px_60px_#000] ring-0">
        <DialogHeader>
          <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">
            Pedido demonstrativo
          </p>
          <DialogTitle className="font-display text-[30px] font-medium">
            Finalizar compra
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-[#bbb]">
            Preencha seus dados para simular o envio do pedido. Nenhum pagamento
            será realizado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <Input
            name="name"
            required
            placeholder="Seu nome"
            className="mt-2.5 h-auto rounded-none border-[#444] bg-ink px-3 py-3"
          />
          <Input
            name="phone"
            required
            placeholder="Seu WhatsApp"
            className="mt-2.5 h-auto rounded-none border-[#444] bg-ink px-3 py-3"
          />
          <Input
            name="email"
            type="email"
            required
            placeholder="Seu e-mail"
            className="mt-2.5 h-auto rounded-none border-[#444] bg-ink px-3 py-3"
          />
          <Button
            type="submit"
            className="mt-3.5 h-auto w-full rounded-none bg-gold px-5 py-3.5 text-[10px] font-bold tracking-[1.5px] text-ink uppercase hover:bg-gold/90"
          >
            Confirmar pedido
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
