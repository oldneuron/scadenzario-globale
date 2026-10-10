import { runCheck } from "../lib/check.mjs";
// Controllo automatico ogni settimana.
export const config = { schedule: "@weekly" };
export default async () => { await runCheck(); };
