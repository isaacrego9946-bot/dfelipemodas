export function WhatsappButton() {
  const href =
    "https://wa.me/5516999999999?text=" +
    encodeURIComponent("Olá, gostaria de saber mais sobre a loja D Felipe Modas.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className="fixed right-3.5 bottom-3.5 z-30 flex size-[51px] items-center justify-center gap-2 rounded-[30px] bg-whatsapp text-[#06200e] shadow-[0_8px_25px_#0008] transition hover:-translate-y-0.5 hover:brightness-110 md:right-5 md:bottom-5 md:h-auto md:w-auto md:px-4 md:py-3.5"
    >
      <span className="text-[22px] leading-none md:text-sm">◉</span>
      <strong className="hidden text-xs font-bold md:inline">Fale conosco</strong>
    </a>
  );
}
