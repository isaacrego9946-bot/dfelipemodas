export type Category = "feminino" | "masculino" | "acessorios";

export const CLOTHING_SIZES = ["P", "M", "G", "GG"] as const;
export const SHOE_SIZES = ["37", "38", "39", "40", "41", "42"] as const;
export const UNIQUE_SIZE = "Único";

export type OrderStatus =
  | "novo"
  | "separacao"
  | "enviado"
  | "concluido"
  | "cancelado";

export const ORDER_STATUS: { id: OrderStatus; label: string }[] = [
  { id: "novo", label: "Novo" },
  { id: "separacao", label: "Em separação" },
  { id: "enviado", label: "Enviado" },
  { id: "concluido", label: "Concluído" },
  { id: "cancelado", label: "Cancelado" },
];

export const CATEGORIES: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "feminino", label: "Feminino" },
  { id: "masculino", label: "Masculino" },
  { id: "acessorios", label: "Acessórios" },
];

export type Product = {
  id: string;
  name: string;
  cat: Category;
  price: number;
  tag: string;
  sizes: string[];
  images: string[];
  active: boolean;
};

export type OrderItem = {
  productId: string;
  name: string;
  size: string;
  qty: number;
  price: number;
};

export type Customer = {
  name: string;
  phone: string;
  email: string;
  note: string;
};

export type Order = {
  id: string;
  number: number;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
};

export type WrappedSecret = { salt: string; iv: string; data: string };

export type EncryptedOrder = {
  id: string;
  number: number;
  createdAt: string;
  iv: string;
  key: string;
  data: string;
};

export type StoreSettings = {
  shopName: string;
  whatsapp: string;
  publicKeyJwk: JsonWebKey;
  wrappedPrivateKey: WrappedSecret;
  pinCheck: WrappedSecret;
};

export type StoreFile = {
  version: 1;
  updatedAt: string;
  orderSeq: number;
  settings: StoreSettings;
  products: Product[];
  orders: EncryptedOrder[];
};

export type BackupFile = {
  exportedAt: string;
  products: Product[];
  orders: Order[];
  settings: { shopName: string; whatsapp: string };
};

export function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function orderCode(number: number) {
  return String(number).padStart(4, "0");
}

export function parsePrice(value: string) {
  const clean = value.trim().replace(/\s/g, "").replace("R$", "");
  if (!clean) return Number.NaN;
  if (clean.includes(",")) {
    return Number(clean.replace(/\./g, "").replace(",", "."));
  }
  return Number(clean);
}

export const SEED_PRODUCTS: Product[] = [
  { id: "p1", name: "Blazer Urban Black", cat: "feminino", price: 229.9, tag: "MAIS VENDIDO", sizes: [...CLOTHING_SIZES], images: [], active: true },
  { id: "p2", name: "Camisa Essential", cat: "masculino", price: 149.9, tag: "NOVO", sizes: [...CLOTHING_SIZES], images: [], active: true },
  { id: "p3", name: "Vestido Midnight", cat: "feminino", price: 189.9, tag: "", sizes: [...CLOTHING_SIZES], images: [], active: true },
  { id: "p4", name: "Relógio Classic Gold", cat: "acessorios", price: 199.9, tag: "OFERTA", sizes: [UNIQUE_SIZE], images: [], active: true },
  { id: "p5", name: "Jaqueta Street", cat: "masculino", price: 259.9, tag: "", sizes: [...CLOTHING_SIZES], images: [], active: true },
  { id: "p6", name: "Bolsa Minimal", cat: "acessorios", price: 169.9, tag: "DESTAQUE", sizes: [UNIQUE_SIZE], images: [], active: true },
  { id: "p7", name: "Calça Wide Leg", cat: "feminino", price: 179.9, tag: "", sizes: [...CLOTHING_SIZES], images: [], active: true },
  { id: "p8", name: "Tênis Urban", cat: "masculino", price: 219.9, tag: "", sizes: [...SHOE_SIZES], images: [], active: true },
];
