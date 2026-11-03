import type { StoreFile } from "@/lib/catalog";
import { BINS_API_URL, STORE_API_URL, STORE_EDIT_TOKEN, STORE_PUBLIC_URL } from "@/lib/store-config";

const proxy = "https://proxy.corsfix.com/?";

function throughProxy(url: string) {
  return `${proxy}${url}`;
}

function cleanEtag(value: string | null) {
  return (value ?? "").replace(/^W\//, "");
}

export async function readStore() {
  const response = await fetch(throughProxy(STORE_PUBLIC_URL), { cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível ler o banco da loja.");
  const data = (await response.json()) as StoreFile;
  if (!data || data.version !== 1 || !Array.isArray(data.products)) {
    throw new Error("O banco da loja ainda não está pronto.");
  }
  return { data, etag: cleanEtag(response.headers.get("etag")) };
}

export async function writeStore(data: StoreFile, etag: string) {
  const response = await fetch(throughProxy(STORE_API_URL), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STORE_EDIT_TOKEN}`,
      ...(etag ? { "If-Match": etag } : {}),
    },
    body: JSON.stringify(data),
  });
  if (response.status === 412) return { conflict: true as const };
  if (!response.ok) throw new Error("Não foi possível salvar no banco da loja.");
  const body = (await response.json()) as { etag?: string };
  return { conflict: false as const, etag: cleanEtag(body.etag ?? response.headers.get("etag")) };
}

export async function updateStore(mutator: (data: StoreFile) => Promise<StoreFile> | StoreFile) {
  let last = "A base foi atualizada ao mesmo tempo. Tente de novo.";
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = await readStore();
    const next = await mutator(structuredClone(current.data));
    next.updatedAt = new Date().toISOString();
    const saved = await writeStore(next, current.etag);
    if (!saved.conflict) return next;
    last = "Outra pessoa salvou ao mesmo tempo. Tentando de novo.";
  }
  throw new Error(last);
}

export async function uploadPhoto(dataUrl: string) {
  const response = await fetch(throughProxy(BINS_API_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  if (!response.ok) {
    throw new Error("Não foi possível guardar a foto. Tente uma imagem menor.");
  }
  const body = (await response.json()) as { url?: string };
  if (!body.url) throw new Error("A foto não retornou um endereço.");
  return body.url;
}

const photoCache = new Map<string, string>();

export async function resolvePhoto(url: string) {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  const cached = photoCache.get(url);
  if (cached) return cached;
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error("foto");
  const body = (await response.json()) as { dataUrl?: string };
  if (!body.dataUrl) throw new Error("foto");
  photoCache.set(url, body.dataUrl);
  return body.dataUrl;
}
