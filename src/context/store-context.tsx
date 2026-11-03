"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_PRODUCTS,
  type BackupFile,
  type Order,
  type OrderStatus,
  type Product,
  type StoreFile,
} from "@/lib/catalog";
import { compressPhoto } from "@/lib/images";
import {
  decryptOrder,
  encryptOrder,
  importPublicKey,
  unlockVault,
  wrapBytes,
} from "@/lib/store-crypto";
import { readStore, resolvePhoto, updateStore, uploadPhoto } from "@/lib/store-remote";

type OrderDraft = {
  customer: { name: string; phone: string; email: string; note: string };
  lines: { productId: string; size: string; qty: number }[];
};

type Secrets = {
  pin: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  pkcs8: ArrayBuffer;
};

type StoreContextValue = {
  ready: boolean;
  error: string | null;
  saving: boolean;
  products: Product[];
  shopName: string;
  whatsapp: string;
  noticeText: string | null;
  notice: (message: string) => void;
  refresh: () => Promise<void>;
  placeOrder: (draft: OrderDraft) => Promise<Order>;
  unlocked: boolean;
  orders: Order[];
  login: (pin: string) => Promise<void>;
  logout: () => void;
  saveProduct: (product: Product, photos: File[]) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  saveShopSettings: (input: { shopName: string; whatsapp: string }) => Promise<void>;
  changePin: (current: string, next: string) => Promise<void>;
  exportBackup: () => Promise<void>;
  importBackup: (backup: BackupFile) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const PIN_SESSION = "dfelipe-admin-pin";

function emptyView() {
  return { products: SEED_PRODUCTS, shopName: "D Felipe Modas", whatsapp: "5516999999999" };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [shopName, setShopName] = useState("D Felipe Modas");
  const [whatsapp, setWhatsapp] = useState("5516999999999");
  const [orders, setOrders] = useState<Order[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [noticeText, setNoticeText] = useState<string | null>(null);
  const secrets = useRef<Secrets | null>(null);
  const fileRef = useRef<StoreFile | null>(null);
  const knownOrders = useRef<Set<string>>(new Set());

  const notice = useCallback((message: string) => {
    setNoticeText(message);
    window.setTimeout(() => setNoticeText(null), 2400);
  }, []);

  const applyFile = useCallback((file: StoreFile) => {
    fileRef.current = file;
    setProducts(file.products);
    setShopName(file.settings.shopName);
    setWhatsapp(file.settings.whatsapp);
  }, []);

  const decryptAll = useCallback(async (file: StoreFile, key: CryptoKey) => {
    const list: Order[] = [];
    for (const item of file.orders) {
      try {
        list.push(await decryptOrder(key, item));
      } catch {
        // Pedido ilegível fica de fora da lista.
      }
    }
    list.sort((a, b) => b.number - a.number);
    return list;
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await readStore();
    applyFile(data);
    if (secrets.current) {
      const list = await decryptAll(data, secrets.current.privateKey);
      const fresh = list.filter((order) => !knownOrders.current.has(order.id));
      knownOrders.current = new Set(list.map((order) => order.id));
      setOrders(list);
      if (fresh.length === 1) notice(`Novo pedido #${String(fresh[0].number).padStart(4, "0")}`);
      if (fresh.length > 1) notice(`${fresh.length} pedidos novos`);
    }
  }, [applyFile, decryptAll, notice]);

  const login = useCallback(
    async (pin: string) => {
      const file = fileRef.current ?? (await readStore()).data;
      applyFile(file);
      const opened = await unlockVault(
        pin,
        file.settings.pinCheck,
        file.settings.wrappedPrivateKey,
        file.settings.publicKeyJwk,
      );
      secrets.current = { pin, ...opened };
      const list = await decryptAll(file, opened.privateKey);
      knownOrders.current = new Set(list.map((order) => order.id));
      setOrders(list);
      setUnlocked(true);
      sessionStorage.setItem(PIN_SESSION, pin);
    },
    [applyFile, decryptAll],
  );

  const logout = useCallback(() => {
    secrets.current = null;
    setUnlocked(false);
    setOrders([]);
    sessionStorage.removeItem(PIN_SESSION);
  }, []);

  useEffect(() => {
    let active = true;
    readStore()
      .then(async ({ data }) => {
        if (!active) return;
        applyFile(data);
        setError(null);
        const savedPin = sessionStorage.getItem(PIN_SESSION);
        if (savedPin) {
          try {
            await login(savedPin);
          } catch {
            sessionStorage.removeItem(PIN_SESSION);
          }
        }
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const fallback = emptyView();
        setProducts(fallback.products);
        setError(reason instanceof Error ? reason.message : "Falha ao carregar a loja.");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [applyFile, login]);

  useEffect(() => {
    if (!unlocked) return;
    const timer = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 20000);
    return () => window.clearInterval(timer);
  }, [refresh, unlocked]);

  const runSave = useCallback(
    async (task: () => Promise<void>) => {
      setSaving(true);
      try {
        await task();
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const placeOrder = useCallback(
    async (draft: OrderDraft) => {
      let created: Order | null = null;
      await updateStore(async (file) => {
        const publicKey = await importPublicKey(file.settings.publicKeyJwk);
        const items = draft.lines.map((line) => {
          const product = file.products.find((item) => item.id === line.productId);
          const price = product?.price ?? 0;
          return {
            productId: line.productId,
            name: product?.name ?? "Peça",
            size: line.size,
            qty: line.qty,
            price,
          };
        });
        const order: Order = {
          id: crypto.randomUUID(),
          number: file.orderSeq + 1,
          createdAt: new Date().toISOString(),
          customer: draft.customer,
          items,
          total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
          status: "novo",
        };
        created = order;
        file.orderSeq = order.number;
        file.orders.push(await encryptOrder(publicKey, order));
        return file;
      });
      if (!created) throw new Error("Não foi possível registrar o pedido.");
      await refresh().catch(() => undefined);
      return created;
    },
    [refresh],
  );

  const saveProduct = useCallback(
    async (product: Product, photos: File[]) => {
      await runSave(async () => {
        const images = [...product.images];
        for (const photo of photos) {
          const dataUrl = await compressPhoto(photo);
          images.push(await uploadPhoto(dataUrl));
        }
        const nextProduct = { ...product, images };
        await updateStore((file) => {
          const index = file.products.findIndex((item) => item.id === nextProduct.id);
          if (index >= 0) file.products[index] = nextProduct;
          else file.products.unshift(nextProduct);
          return file;
        });
        await refresh();
        notice(photos.length ? "Peça e fotos salvas." : "Peça salva.");
      });
    },
    [notice, refresh, runSave],
  );

  const removeProduct = useCallback(
    async (id: string) => {
      await runSave(async () => {
        await updateStore((file) => {
          file.products = file.products.filter((item) => item.id !== id);
          return file;
        });
        await refresh();
        notice("Peça removida.");
      });
    },
    [notice, refresh, runSave],
  );

  const setOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const secret = secrets.current;
      if (!secret) throw new Error("Entre no painel de novo.");
      await runSave(async () => {
        await updateStore(async (file) => {
          const index = file.orders.findIndex((item) => item.id === id);
          if (index < 0) return file;
          const current = await decryptOrder(secret.privateKey, file.orders[index]);
          current.status = status;
          file.orders[index] = await encryptOrder(secret.publicKey, current);
          return file;
        });
        await refresh();
      });
    },
    [refresh, runSave],
  );

  const saveShopSettings = useCallback(
    async (input: { shopName: string; whatsapp: string }) => {
      await runSave(async () => {
        await updateStore((file) => {
          file.settings.shopName = input.shopName.trim() || "D Felipe Modas";
          file.settings.whatsapp = input.whatsapp.replace(/\D/g, "");
          return file;
        });
        await refresh();
        notice("Dados da loja atualizados.");
      });
    },
    [notice, refresh, runSave],
  );

  const changePin = useCallback(
    async (current: string, next: string) => {
      const secret = secrets.current;
      if (!secret || secret.pin !== current) throw new Error("Senha atual incorreta.");
      if (next.trim().length < 4) throw new Error("Use uma senha com pelo menos 4 caracteres.");
      await runSave(async () => {
        const wrappedPrivateKey = await wrapBytes(next.trim(), secret.pkcs8);
        const pinCheck = await wrapBytes(next.trim(), new TextEncoder().encode("dfelipe-ok"));
        await updateStore((file) => {
          file.settings.wrappedPrivateKey = wrappedPrivateKey;
          file.settings.pinCheck = pinCheck;
          return file;
        });
        secret.pin = next.trim();
        sessionStorage.setItem(PIN_SESSION, next.trim());
        await refresh();
        notice("Senha do painel alterada.");
      });
    },
    [notice, refresh, runSave],
  );

  const exportBackup = useCallback(async () => {
    const secret = secrets.current;
    const file = fileRef.current;
    if (!secret || !file) throw new Error("Entre no painel para exportar.");
    const productsWithPhotos: Product[] = [];
    for (const product of file.products) {
      const images: string[] = [];
      for (const image of product.images) {
        try {
          images.push(await resolvePhoto(image));
        } catch {
          images.push(image);
        }
      }
      productsWithPhotos.push({ ...product, images });
    }
    const backup: BackupFile = {
      exportedAt: new Date().toISOString(),
      products: productsWithPhotos,
      orders: await decryptAll(file, secret.privateKey),
      settings: { shopName: file.settings.shopName, whatsapp: file.settings.whatsapp },
    };
    const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dfelipe-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
    notice("Backup baixado.");
  }, [decryptAll, notice]);

  const importBackup = useCallback(
    async (backup: BackupFile) => {
      const secret = secrets.current;
      if (!secret) throw new Error("Entre no painel para importar.");
      await runSave(async () => {
        await updateStore(async (file) => {
          file.products = [];
          for (const product of backup.products) {
            const images: string[] = [];
            for (const image of product.images) {
              images.push(image.startsWith("data:") ? await uploadPhoto(image) : image);
            }
            file.products.push({ ...product, images });
          }
          file.settings.shopName = backup.settings.shopName;
          file.settings.whatsapp = backup.settings.whatsapp;
          file.orders = [];
          let seq = 0;
          for (const order of backup.orders) {
            seq = Math.max(seq, order.number);
            file.orders.push(await encryptOrder(secret.publicKey, order));
          }
          file.orderSeq = Math.max(file.orderSeq, seq);
          return file;
        });
        await refresh();
        notice("Backup importado.");
      });
    },
    [notice, refresh, runSave],
  );

  const value = useMemo(
    () => ({
      ready,
      error,
      saving,
      products,
      shopName,
      whatsapp,
      noticeText,
      notice,
      refresh,
      placeOrder,
      unlocked,
      orders,
      login,
      logout,
      saveProduct,
      removeProduct,
      setOrderStatus,
      saveShopSettings,
      changePin,
      exportBackup,
      importBackup,
    }),
    [
      ready,
      error,
      saving,
      products,
      shopName,
      whatsapp,
      noticeText,
      notice,
      refresh,
      placeOrder,
      unlocked,
      orders,
      login,
      logout,
      saveProduct,
      removeProduct,
      setOrderStatus,
      saveShopSettings,
      changePin,
      exportBackup,
      importBackup,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
