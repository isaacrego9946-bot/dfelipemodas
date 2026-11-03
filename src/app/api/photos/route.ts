import { BINS_API_URL } from "@/lib/store-config";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { dataUrl?: string };
  if (!payload.dataUrl?.startsWith("data:image/")) {
    return Response.json({ error: "Envie uma imagem." }, { status: 400, headers: cors });
  }
  const response = await fetch(BINS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl: payload.dataUrl }),
  });
  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
