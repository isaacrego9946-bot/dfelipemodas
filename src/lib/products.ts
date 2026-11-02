export type Category = "feminino" | "masculino" | "acessorios";

export type Product = {
  id: number;
  name: string;
  cat: Category;
  price: number;
  tag: string;
};

export const CATEGORIES: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "feminino", label: "Feminino" },
  { id: "masculino", label: "Masculino" },
  { id: "acessorios", label: "Acessórios" },
];

export const PRODUCTS: Product[] = [
  { id: 1, name: "Blazer Urban Black", cat: "feminino", price: 229.9, tag: "MAIS VENDIDO" },
  { id: 2, name: "Camisa Essential", cat: "masculino", price: 149.9, tag: "NOVO" },
  { id: 3, name: "Vestido Midnight", cat: "feminino", price: 189.9, tag: "" },
  { id: 4, name: "Relógio Classic Gold", cat: "acessorios", price: 199.9, tag: "OFERTA" },
  { id: 5, name: "Jaqueta Street", cat: "masculino", price: 259.9, tag: "" },
  { id: 6, name: "Bolsa Minimal", cat: "acessorios", price: 169.9, tag: "DESTAQUE" },
  { id: 7, name: "Calça Wide Leg", cat: "feminino", price: 179.9, tag: "" },
  { id: 8, name: "Tênis Urban", cat: "masculino", price: 219.9, tag: "" },
];

export function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
