import { runCheck } from "../lib/check.mjs";
// Controllo manuale dal pulsante "Controlla ora" (protetto dal PIN).
export default async (req) => {
  if (req.method !== "POST" || !process.env.APP_PIN || req.headers.get("x-pin") !== process.env.APP_PIN)
    return new Response("PIN errato", { status: 401 });
  return Response.json(await runCheck());
};
