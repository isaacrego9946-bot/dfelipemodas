import { STORE_API_URL, STORE_EDIT_TOKEN, STORE_PUBLIC_URL } from "@/lib/store-config";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Store-Etag",
  "Access-Control-Expose-Headers": "X-Store-Etag",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET() {
  const response = await fetch(STORE_PUBLIC_URL, { cache: "no-store" });
  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "X-Store-Etag": response.headers.get("etag") ?? "",
    },
  });
}

export async function PUT(request: Request) {
  const etag = request.headers.get("x-store-etag") ?? "";
  const body = await request.text();
  const response = await fetch(STORE_API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STORE_EDIT_TOKEN}`,
      ...(etag ? { "If-Match": etag } : {}),
    },
    body,
  });
  const text = await response.text();
  let etagOut = "";
  try {
    etagOut = (JSON.parse(text) as { etag?: string }).etag ?? "";
  } catch {
    etagOut = response.headers.get("etag") ?? "";
  }
  return new Response(text, {
    status: response.status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "X-Store-Etag": etagOut,
    },
  });
}
