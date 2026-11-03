import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="grid gap-6 border-t border-border px-4 py-8 text-[11px] text-muted-foreground md:flex md:justify-between md:px-[6%] md:py-[42px]">
      <div>
        <div className="font-display text-base text-gold-soft">D Felipe Modas.</div>
        <p className="mt-1">Moda com personalidade. Vista o que representa você.</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <a href="#inicio" className="hover:text-gold">
          Início
        </a>
        <a href="#loja" className="hover:text-gold">
          Coleção
        </a>
        <a href="#sobre" className="hover:text-gold">
          Sobre
        </a>
        <a href="mailto:contato@sualoja.com" className="hover:text-gold">
          Contato
        </a>
        <Link href="/admin" className="hover:text-gold">
          Painel
        </Link>
      </div>
      <div>© 2026 D Felipe Modas.</div>
    </footer>
  );
}
