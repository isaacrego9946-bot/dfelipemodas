import { SEED_PRODUCTS, type StoreFile } from "../src/lib/catalog";
import { STORE_API_URL, STORE_EDIT_TOKEN, DEFAULT_ADMIN_PIN } from "../src/lib/store-config";
import { createVault } from "../src/lib/store-crypto";

async function main() {
const vault = await createVault(DEFAULT_ADMIN_PIN);
const file: StoreFile = {
  version: 1,
  updatedAt: new Date().toISOString(),
  orderSeq: 0,
  settings: {
    shopName: "D Felipe Modas",
    whatsapp: "5516999999999",
    publicKeyJwk: vault.publicKeyJwk,
    wrappedPrivateKey: vault.wrappedPrivateKey,
    pinCheck: vault.pinCheck,
  },
  products: SEED_PRODUCTS,
  orders: [],
};

const response = await fetch(STORE_API_URL, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${STORE_EDIT_TOKEN}`,
  },
  body: JSON.stringify(file),
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`Seed failed ${response.status}: ${text}`);
}

console.log("Banco da loja criado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
