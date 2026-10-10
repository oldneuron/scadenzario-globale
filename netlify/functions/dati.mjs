import { getStore } from "@netlify/blobs";
// Salva/legge i dati dell'app, protetti dal PIN (variabile APP_PIN).
export default async (req) => {
  if (!process.env.APP_PIN || req.headers.get("x-pin") !== process.env.APP_PIN)
    return new Response("PIN errato", { status: 401 });
  const s = getStore("scadenzario");
  if (req.method === "GET") {
    const state = await s.get("state", { type: "json" });
    const alerts = (await s.get("alerts", { type: "json" })) || [];
    const meta = await s.get("meta", { type: "json" });
    return Response.json({ state, alerts, meta });
  }
  if (req.method === "PUT") {
    const b = await req.json();
    if (b.state) await s.setJSON("state", b.state);
    if (Array.isArray(b.alerts)) await s.setJSON("alerts", b.alerts);
    return Response.json({ ok: true });
  }
  return new Response("Metodo non supportato", { status: 405 });
};
