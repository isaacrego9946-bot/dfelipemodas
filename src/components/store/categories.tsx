"use client";

import type { Category } from "@/lib/products";

const tiles: { id: Category; title: string }[] = [
  { id: "feminino", title: "Feminino" },
  { id: "masculino", title: "Masculino" },
  { id: "acessorios", title: "Acessórios" },
];

type CategoriesProps = {
  onSelect: (category: Category) => void;
};

export function Categories({ onSelect }: CategoriesProps) {
  return (
    <section className="px-4 py-[58px] md:px-[6%] md:py-[78px]" id="categorias">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">
          Encontre seu estilo
        </p>
        <h2 className="my-2.5 font-display text-[clamp(32px,5vw,52px)] font-medium">
          Explore categorias
        </h2>
        <p className="text-muted-foreground">
          Uma seleção feita para todos os momentos.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {tiles.map((tile) => (
          <a
            key={tile.id}
            href="#loja"
            className="category-tile relative flex min-h-[220px] items-end overflow-hidden p-6 transition duration-300 hover:scale-[1.01] md:min-h-[290px]"
            onClick={() => onSelect(tile.id)}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-[45px] -right-3 rotate-[-15deg] font-display text-[85px] font-bold text-white/5"
            >
              D Felipe Modas
            </span>
            <div className="relative z-1">
              <h3 className="font-display text-[29px] font-medium">{tile.title}</h3>
              <span className="mt-2 block text-[10px] font-bold tracking-[1.5px] text-gold-soft">
                VER COLEÇÃO ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
