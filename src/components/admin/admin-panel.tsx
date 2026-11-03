"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ProductPhoto } from "@/components/store/product-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/context/store-context";
import {
  CATEGORIES,
  CLOTHING_SIZES,
  ORDER_STATUS,
  SHOE_SIZES,
  UNIQUE_SIZE,
  formatMoney,
  formatWhen,
  orderCode,
  parsePrice,
  type BackupFile,
  type Category,
  type Order,
  type Product,
} from "@/lib/catalog";

const goldButton =
  "h-auto rounded-none bg-gold px-4 py-3 text-[10px] font-bold tracking-[1.5px] text-ink uppercase hover:bg-gold/90";

type Section = "produtos" | "pedidos" | "relatorios" | "ajustes";

const sections: { id: Section; label: string }[] = [
  { id: "produtos", label: "Produtos" },
  { id: "pedidos", label: "Pedidos" },
  { id: "relatorios", label: "Relatórios" },
  { id: "ajustes", label: "Ajustes" },
];

export function AdminPanel() {
  const store = useStore();
  const [section, setSection] = useState<Section>("pedidos");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [printing, setPrinting] = useState<Order | null>(null);
  const newOrders = store.orders.filter((order) => order.status === "novo").length;

  async function enter(event: FormEvent) {
    event.preventDefault();
    setLoginError("");
    try {
      await store.login(pin);
    } catch (reason) {
      setLoginError(reason instanceof Error ? reason.message : "Não foi possível entrar.");
    }
  }

  function printOrder(order: Order) {
    setPrinting(order);
    window.setTimeout(() => window.print(), 60);
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f6f1e8]">
      <header className="flex items-center justify-between border-b border-[#292929] px-4 py-4 md:px-8">
        <div>
          <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">D Felipe Modas</p>
          <h1 className="font-display text-3xl">Painel do lojista</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[10px] tracking-[1.5px] uppercase hover:text-gold">
            Ver loja
          </Link>
          {store.unlocked ? (
            <button type="button" onClick={store.logout} className="text-[10px] tracking-[1.5px] uppercase text-[#aaa]">
              Sair
            </button>
          ) : null}
        </div>
      </header>

      {!store.ready ? (
        <p className="px-8 py-16 text-[#aaa]">Abrindo o banco da loja...</p>
      ) : !store.unlocked ? (
        <form onSubmit={enter} className="mx-auto mt-16 w-[min(420px,calc(100%-32px))] border border-[#5d4725] bg-[#111] p-7">
          <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">Acesso</p>
          <h2 className="mt-2 font-display text-4xl">Entrar</h2>
          <Input
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="Senha"
            className="mt-5 h-auto rounded-none border-[#444] bg-[#080808] px-3 py-3"
            required
          />
          {loginError ? <p className="mt-3 text-sm text-red-300">{loginError}</p> : null}
          {store.error ? <p className="mt-3 text-sm text-red-300">{store.error}</p> : null}
          <Button type="submit" className={`${goldButton} mt-4 w-full`}>
            Entrar no painel
          </Button>
        </form>
      ) : (
        <div className="md:grid md:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto border-b border-[#292929] p-3 md:flex-col md:border-r md:border-b-0 md:p-4">
            {sections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`shrink-0 px-3 py-3 text-left text-[11px] tracking-[1.5px] uppercase ${
                  section === item.id ? "bg-gold text-[#111]" : "text-[#ccc] hover:text-gold"
                }`}
              >
                {item.label}
                {item.id === "pedidos" && newOrders > 0 ? ` (${newOrders})` : ""}
              </button>
            ))}
          </nav>
          <main className="p-4 md:p-8">
            {store.saving ? <p className="mb-4 text-xs text-gold">Salvando...</p> : null}
            {section === "produtos" ? <Products /> : null}
            {section === "pedidos" ? <Orders onPrint={printOrder} /> : null}
            {section === "relatorios" ? <Reports /> : null}
            {section === "ajustes" ? <Settings /> : null}
          </main>
        </div>
      )}

      {store.noticeText ? (
        <div className="fixed bottom-5 left-1/2 z-70 -translate-x-1/2 bg-gold px-4 py-3 text-[11px] font-bold text-[#111]">
          {store.noticeText}
        </div>
      ) : null}
      <Receipt order={printing} />
    </div>
  );
}

function Products() {
  const { products, saveProduct, removeProduct } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const blank = (): Product => ({
    id: crypto.randomUUID(),
    name: "",
    cat: "feminino",
    price: 0,
    tag: "",
    sizes: [...CLOTHING_SIZES],
    images: [],
    active: true,
  });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">Coleção</p>
          <h2 className="font-display text-4xl">Roupas e preços</h2>
        </div>
        <Button type="button" className={goldButton} onClick={() => setEditing(blank())}>
          Nova peça
        </Button>
      </div>
      {editing ? (
        <ProductForm
          product={editing}
          onCancel={() => setEditing(null)}
          onSave={async (product, photos) => {
            await saveProduct(product, photos);
            setEditing(null);
          }}
        />
      ) : null}
      <div className="mt-6 grid gap-3">
        {products.map((product) => (
          <article key={product.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 border border-[#292929] bg-[#111] p-3">
            <div className="product-visual relative h-20 overflow-hidden">
              <ProductPhoto url={product.images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div>
              <h3>{product.name}</h3>
              <p className="text-sm text-gold-soft">
                {formatMoney(product.price)} · {product.sizes.join(" ")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" className="text-xs uppercase tracking-wide hover:text-gold" onClick={() => setEditing(product)}>
                Editar
              </button>
              <button
                type="button"
                className="text-xs uppercase tracking-wide text-[#aaa]"
                onClick={() => removeProduct(product.id)}
              >
                Remover
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProductForm({
  product,
  onCancel,
  onSave,
}: {
  product: Product;
  onCancel: () => void;
  onSave: (product: Product, photos: File[]) => Promise<void>;
}) {
  const [draft, setDraft] = useState(product);
  const [price, setPrice] = useState(product.price ? String(product.price).replace(".", ",") : "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState("");
  const group = draft.sizes.every((size) => SHOE_SIZES.includes(size as (typeof SHOE_SIZES)[number]))
    ? "calcados"
    : draft.sizes.includes(UNIQUE_SIZE) && draft.sizes.length === 1
      ? "unico"
      : "roupas";

  function chooseGroup(next: "roupas" | "calcados" | "unico") {
    const sizes =
      next === "roupas" ? [...CLOTHING_SIZES] : next === "calcados" ? [...SHOE_SIZES] : [UNIQUE_SIZE];
    setDraft({ ...draft, sizes });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = parsePrice(price);
    if (!draft.name.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Informe o nome e um preço válido.");
      return;
    }
    if (draft.sizes.length === 0) {
      setError("Marque pelo menos um tamanho.");
      return;
    }
    setError("");
    await onSave({ ...draft, name: draft.name.trim(), price: value }, photos);
  }

  const options = group === "roupas" ? CLOTHING_SIZES : group === "calcados" ? SHOE_SIZES : [UNIQUE_SIZE];

  return (
    <form onSubmit={submit} className="border border-[#5d4725] bg-[#111] p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Nome da peça" className="h-auto rounded-none border-[#444] bg-[#080808] px-3 py-3" required />
        <Input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Preço, ex. 229,90" className="h-auto rounded-none border-[#444] bg-[#080808] px-3 py-3" required />
        <Input value={draft.tag} onChange={(event) => setDraft({ ...draft, tag: event.target.value })} placeholder="Selo (opcional): NOVO, OFERTA" className="h-auto rounded-none border-[#444] bg-[#080808] px-3 py-3" />
        <select
          value={draft.cat}
          onChange={(event) => setDraft({ ...draft, cat: event.target.value as Category })}
          className="border border-[#444] bg-[#080808] px-3 py-3"
        >
          {CATEGORIES.filter((item) => item.id !== "todos").map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["roupas", "Roupas P–GG"],
            ["calcados", "Calçados 37–42"],
            ["unico", "Tamanho único"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => chooseGroup(id)} className={`border px-3 py-2 text-[10px] tracking-wide uppercase ${group === id ? "border-gold bg-gold text-[#111]" : "border-[#444]"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((size) => {
          const checked = draft.sizes.includes(size);
          return (
            <label key={size} className={`border px-3 py-2 text-sm ${checked ? "border-gold text-gold-soft" : "border-[#444] text-[#888]"}`}>
              <input
                type="checkbox"
                className="mr-2"
                checked={checked}
                onChange={() =>
                  setDraft({
                    ...draft,
                    sizes: checked ? draft.sizes.filter((item) => item !== size) : [...draft.sizes, size],
                  })
                }
              />
              {size}
            </label>
          );
        })}
      </div>
      <label className="mt-4 block text-sm text-[#bbb]">
        Fotos do WhatsApp (JPG, PNG ou WEBP)
        <input
          type="file"
          accept="image/*"
          multiple
          className="mt-2 block w-full text-sm"
          onChange={(event) => setPhotos(Array.from(event.target.files ?? []))}
        />
      </label>
      {photos.length > 0 ? <p className="mt-2 text-xs text-[#aaa]">{photos.length} arquivo(s) novo(s) pronto(s) para enviar.</p> : null}
      {draft.images.length > 0 ? (
        <div className="mt-3 flex gap-2">
          {draft.images.map((image) => (
            <button
              key={image}
              type="button"
              className="relative h-16 w-14 overflow-hidden border border-[#444]"
              onClick={() => setDraft({ ...draft, images: draft.images.filter((item) => item !== image) })}
              title="Remover foto"
            >
              <ProductPhoto url={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <div className="mt-4 flex gap-3">
        <Button type="submit" className={goldButton}>Salvar peça</Button>
        <button type="button" onClick={onCancel} className="text-xs uppercase tracking-wide text-[#aaa]">Cancelar</button>
      </div>
    </form>
  );
}

function Orders({ onPrint }: { onPrint: (order: Order) => void }) {
  const { orders, setOrderStatus } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null);
  const selected = orders.find((order) => order.id === selectedId) ?? orders[0] ?? null;

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">Base de pedidos</p>
      <h2 className="mb-6 font-display text-4xl">Pedidos para imprimir</h2>
      {orders.length === 0 ? (
        <p className="text-[#aaa]">Nenhum pedido ainda. Quando alguém finalizar uma compra na loja, ele aparece aqui.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="border border-[#292929]">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedId(order.id)}
                className={`block w-full border-b border-[#292929] px-3 py-3 text-left ${selected?.id === order.id ? "bg-[#1d160e]" : ""}`}
              >
                <strong>#{orderCode(order.number)}</strong>
                <span className="mt-1 block text-xs text-[#aaa]">
                  {order.customer.name} · {formatWhen(order.createdAt)}
                </span>
              </button>
            ))}
          </div>
          {selected ? (
            <article className="border border-[#5d4725] bg-[#111] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-3xl">Pedido #{orderCode(selected.number)}</h3>
                  <p className="text-sm text-[#aaa]">{formatWhen(selected.createdAt)} · horário de Brasília</p>
                </div>
                <Button type="button" className={goldButton} onClick={() => onPrint(selected)}>
                  Imprimir pedido
                </Button>
              </div>
              <p className="mt-4">
                {selected.customer.name}
                <br />
                {selected.customer.phone}
                <br />
                {selected.customer.email}
              </p>
              {selected.customer.note ? <p className="mt-2 text-sm text-[#ccc]">Obs.: {selected.customer.note}</p> : null}
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {selected.items.map((item) => (
                    <tr key={`${item.productId}-${item.size}`} className="border-t border-[#292929]">
                      <td className="py-2">{item.name}</td>
                      <td>{item.size}</td>
                      <td>{item.qty}</td>
                      <td className="text-right">{formatMoney(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-right font-bold text-gold-soft">{formatMoney(selected.total)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ORDER_STATUS.map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => setOrderStatus(selected.id, status.id)}
                    className={`border px-3 py-2 text-[10px] tracking-wide uppercase ${selected.status === status.id ? "border-gold bg-gold text-[#111]" : "border-[#444]"}`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Reports() {
  const { orders } = useStore();
  const [period, setPeriod] = useState<"hoje" | "7" | "30" | "tudo">("30");
  const filtered = useMemo(() => {
    const now = Date.now();
    const start =
      period === "hoje"
        ? new Date().setHours(0, 0, 0, 0)
        : period === "7"
          ? now - 7 * 86400000
          : period === "30"
            ? now - 30 * 86400000
            : 0;
    return orders.filter((order) => new Date(order.createdAt).getTime() >= start);
  }, [orders, period]);
  const active = filtered.filter((order) => order.status !== "cancelado");
  const revenue = active.reduce((sum, order) => sum + order.total, 0);
  const byProduct = new Map<string, { name: string; qty: number; total: number }>();
  for (const order of active) {
    for (const item of order.items) {
      const current = byProduct.get(item.name) ?? { name: item.name, qty: 0, total: 0 };
      current.qty += item.qty;
      current.total += item.price * item.qty;
      byProduct.set(item.name, current);
    }
  }
  const ranking = [...byProduct.values()].sort((a, b) => b.total - a.total);
  const max = ranking[0]?.total ?? 1;

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">Leitura da loja</p>
      <h2 className="font-display text-4xl">Relatórios</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["hoje", "Hoje"],
            ["7", "7 dias"],
            ["30", "30 dias"],
            ["tudo", "Tudo"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setPeriod(id)} className={`border px-3 py-2 text-[10px] uppercase tracking-wide ${period === id ? "border-gold bg-gold text-[#111]" : "border-[#444]"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Stat label="Pedidos" value={String(filtered.length)} />
        <Stat label="Faturamento" value={formatMoney(revenue)} />
        <Stat label="Ticket médio" value={formatMoney(active.length ? revenue / active.length : 0)} />
      </div>
      <div className="mt-8">
        {ranking.length === 0 ? (
          <p className="text-[#aaa]">Ainda não há vendas neste período.</p>
        ) : (
          ranking.map((item) => (
            <div key={item.name} className="mb-3">
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.name}</span>
                <span>
                  {item.qty} un. · {formatMoney(item.total)}
                </span>
              </div>
              <div className="h-2 bg-[#222]">
                <div className="h-2 bg-gold" style={{ width: `${Math.max(6, (item.total / max) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#5d4725] bg-[#111] p-4">
      <p className="text-[10px] tracking-[1.5px] text-[#aaa] uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl text-gold-soft">{value}</p>
    </div>
  );
}

function Settings() {
  const store = useStore();
  const [shopName, setShopName] = useState(store.shopName);
  const [whatsapp, setWhatsapp] = useState(store.whatsapp);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState("");

  async function saveShop(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await store.saveShopSettings({ shopName, whatsapp });
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar.");
    }
  }

  async function savePin(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await store.changePin(current, next);
      setCurrent("");
      setNext("");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Não foi possível trocar a senha.");
    }
  }

  return (
    <div className="max-w-xl">
      <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">Loja</p>
      <h2 className="mb-4 font-display text-4xl">Ajustes</h2>
      <form onSubmit={saveShop} className="grid gap-3">
        <Input value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder="Nome da loja" className="h-auto rounded-none border-[#444] bg-[#111] px-3 py-3" />
        <Input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="WhatsApp com DDD, só números" className="h-auto rounded-none border-[#444] bg-[#111] px-3 py-3" />
        <Button type="submit" className={goldButton}>Salvar contato</Button>
      </form>
      <form onSubmit={savePin} className="mt-8 grid gap-3">
        <h3 className="font-display text-2xl">Senha do painel</h3>
        <Input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} placeholder="Senha atual" className="h-auto rounded-none border-[#444] bg-[#111] px-3 py-3" />
        <Input type="password" value={next} onChange={(event) => setNext(event.target.value)} placeholder="Nova senha" className="h-auto rounded-none border-[#444] bg-[#111] px-3 py-3" />
        <Button type="submit" className={goldButton}>Trocar senha</Button>
      </form>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" className={goldButton} onClick={() => store.exportBackup()}>
          Exportar backup
        </Button>
        <label className="inline-flex cursor-pointer items-center border border-gold px-4 py-3 text-[10px] font-bold tracking-[1.5px] text-gold uppercase">
          Importar backup
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const backup = JSON.parse(await file.text()) as BackupFile;
              await store.importBackup(backup);
            }}
          />
        </label>
      </div>
      {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}
      <p className="mt-6 text-sm leading-relaxed text-[#aaa]">
        Produtos, fotos e pedidos ficam num banco compartilhado entre a loja e este painel. Os dados dos clientes
        ficam protegidos pela senha. Exporte um backup para guardar uma cópia no seu computador. A cópia online de
        teste permanece disponível por cerca de 7 dias a partir de 2 de novembro de 2026.
      </p>
    </div>
  );
}

function Receipt({ order }: { order: Order | null }) {
  if (!order) return null;
  const status = ORDER_STATUS.find((item) => item.id === order.status)?.label ?? order.status;
  return (
    <article className="receipt">
      <p style={{ letterSpacing: "3px", fontSize: 12 }}>D FELIPE MODAS</p>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, margin: "8px 0" }}>Pedido #{orderCode(order.number)}</h1>
      <p>{formatWhen(order.createdAt)} · Brasília</p>
      <p style={{ marginTop: 16 }}>
        <strong>{order.customer.name}</strong>
        <br />
        WhatsApp: {order.customer.phone}
        <br />
        E-mail: {order.customer.email}
      </p>
      {order.customer.note ? <p>Obs.: {order.customer.note}</p> : null}
      <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Peça</th>
            <th align="left">Tam.</th>
            <th align="left">Qtd</th>
            <th align="right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={`${item.productId}-${item.size}`}>
              <td style={{ padding: "8px 0", borderTop: "1px solid #ccc" }}>{item.name}</td>
              <td style={{ borderTop: "1px solid #ccc" }}>{item.size}</td>
              <td style={{ borderTop: "1px solid #ccc" }}>{item.qty}</td>
              <td align="right" style={{ borderTop: "1px solid #ccc" }}>{formatMoney(item.price * item.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 16, fontSize: 18 }}>
        <strong>Total {formatMoney(order.total)}</strong>
      </p>
      <p>Status: {status}</p>
    </article>
  );
}
