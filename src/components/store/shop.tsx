"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ProductPhoto } from "@/components/store/product-photo";
import { useCart } from "@/context/cart-context";
import { useStore } from "@/context/store-context";
import { CATEGORIES, formatMoney, type Category } from "@/lib/catalog";

type ShopProps = {
  active: Category | "todos";
  onFilterChange: (filter: Category | "todos") => void;
};

export function Shop({ active, onFilterChange }: ShopProps) {
  const { add, notice } = useCart();
  const { products, ready, error } = useStore();
  const [query, setQuery] = useState("");
  const [sizes, setSizes] = useState<Record<string, string>>({});

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.active &&
        (active === "todos" || product.cat === active) &&
        product.name.toLowerCase().includes(q),
    );
  }, [active, products, query]);

  return (
    <section className="bg-[#0d0d0d] px-4 py-[58px] md:px-[6%] md:py-[78px]" id="loja">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">
          Curadoria D Felipe Modas
        </p>
        <h2 className="my-2.5 font-display text-[clamp(32px,5vw,52px)] font-medium">
          Peças em destaque
        </h2>
        <p className="text-muted-foreground">
          {!ready
            ? "Carregando a coleção..."
            : error
              ? error
              : `${list.length} produto${list.length === 1 ? "" : "s"} encontrado${list.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onFilterChange(category.id)}
              className={`shrink-0 border px-3.5 py-2 text-[10px] tracking-wide uppercase transition ${
                active === category.id
                  ? "border-gold bg-gold text-ink"
                  : "border-[#3b3b3b] bg-transparent text-[#ccc] hover:border-gold hover:bg-gold hover:text-ink"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar produto..."
          type="search"
          className="h-auto min-w-0 rounded-none border-[#3b3b3b] bg-card px-3.5 py-2.5 text-foreground md:min-w-[220px]"
        />
      </div>

      {ready && list.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {list.map((product, index) => {
            const selected = sizes[product.id] ?? (product.sizes.length === 1 ? product.sizes[0] : "");
            return (
              <article key={product.id} className="animate-fade-in group">
                <div
                  className={`product-visual relative grid h-[195px] place-items-center overflow-hidden sm:h-[220px] md:h-[315px] ${
                    index % 3 === 2 ? "alt" : ""
                  }`}
                >
                  <ProductPhoto
                    url={product.images[0]}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {product.tag ? (
                    <span className="absolute top-2.5 left-2.5 z-1 bg-gold px-2 py-1.5 text-[9px] font-bold text-ink">
                      {product.tag}
                    </span>
                  ) : null}
                  <span
                    aria-hidden
                    className="rotate-[-12deg] font-display text-[28px] font-semibold tracking-[3px] text-white/10 md:text-[50px]"
                  >
                    D Felipe Modas
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const size = selected || product.sizes[0];
                      if (!size) {
                        notice("Esta peça está sem tamanho.");
                        return;
                      }
                      if (product.sizes.length > 1 && !selected) {
                        notice("Escolha o tamanho.");
                        return;
                      }
                      add(product.id, size);
                    }}
                    className="absolute right-1.5 bottom-1.5 left-1.5 z-1 border border-gold bg-[#080808ed] px-1 py-2 text-[8px] font-bold tracking-wide text-gold-soft uppercase transition group-hover:bg-gold group-hover:text-ink sm:text-[9px] md:right-2.5 md:bottom-2.5 md:left-2.5 md:px-3 md:py-3 md:text-[9px]"
                  >
                    + Adicionar ao carrinho
                  </button>
                </div>
                <div className="px-0.5 py-3">
                  <small className="text-[9px] tracking-wide text-muted-foreground uppercase">
                    {product.cat}
                  </small>
                  <h3 className="my-1.5 text-xs font-normal md:text-[13px]">{product.name}</h3>
                  <div className="font-bold text-gold-soft">{formatMoney(product.price)}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSizes((current) => ({ ...current, [product.id]: size }))}
                        className={`border px-1.5 py-1 text-[10px] ${
                          selected === size
                            ? "border-gold bg-gold text-ink"
                            : "border-[#3b3b3b] text-[#ccc]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
