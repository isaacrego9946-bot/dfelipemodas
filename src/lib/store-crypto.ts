import type { EncryptedOrder, Order, WrappedSecret } from "@/lib/catalog";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const PIN_MARK = "dfelipe-ok";

export function bytesToB64(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function b64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function deriveKey(pin: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 120000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function wrapBytes(pin: string, bytes: BufferSource): Promise<WrappedSecret> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
  return { salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(data) };
}

export async function unwrapBytes(pin: string, wrapped: WrappedSecret) {
  const key = await deriveKey(pin, b64ToBytes(wrapped.salt));
  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(wrapped.iv) },
    key,
    b64ToBytes(wrapped.data),
  );
}

export async function createVault(pin: string) {
  const pair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
  const wrappedPrivateKey = await wrapBytes(pin, pkcs8);
  const pinCheck = await wrapBytes(pin, encoder.encode(PIN_MARK));
  return { publicKeyJwk, wrappedPrivateKey, pinCheck, pkcs8 };
}

export async function unlockVault(
  pin: string,
  pinCheck: WrappedSecret,
  wrappedPrivateKey: WrappedSecret,
  publicKeyJwk: JsonWebKey,
) {
  try {
    const mark = await unwrapBytes(pin, pinCheck);
    if (decoder.decode(mark) !== PIN_MARK) throw new Error("senha");
    const pkcs8 = await unwrapBytes(pin, wrappedPrivateKey);
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      pkcs8,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"],
    );
    const publicKey = await importPublicKey(publicKeyJwk);
    return { privateKey, publicKey, pkcs8 };
  } catch {
    throw new Error("Senha incorreta.");
  }
}

export async function importPublicKey(jwk: JsonWebKey) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

export async function encryptOrder(publicKey: CryptoKey, order: Order): Promise<EncryptedOrder> {
  const aes = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aes,
    encoder.encode(JSON.stringify(order)),
  );
  const raw = await crypto.subtle.exportKey("raw", aes);
  const key = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, raw);
  return {
    id: order.id,
    number: order.number,
    createdAt: order.createdAt,
    iv: bytesToB64(iv),
    data: bytesToB64(data),
    key: bytesToB64(key),
  };
}

export async function decryptOrder(privateKey: CryptoKey, encrypted: EncryptedOrder) {
  const raw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    b64ToBytes(encrypted.key),
  );
  const aes = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
  const json = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(encrypted.iv) },
    aes,
    b64ToBytes(encrypted.data),
  );
  return JSON.parse(decoder.decode(json)) as Order;
}
