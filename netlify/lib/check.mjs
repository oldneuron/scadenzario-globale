import { getStore } from "@netlify/blobs";
// Legge i feed RSS ufficiali (variabile FEEDS) e segnala le voci con parole chiave utili.
const KW = ["revisione", "imu", "tari", "bollo", "caldaie", "impianti termici",
  "efficienza energetica", "codice della strada", "730", "dichiarazione dei redditi",
  "cedolare", "patente", "carta d'identità", "pneumatici", "assicurazione obbligatoria",
  "tributi locali", "rifiuti", "rca", "estintori", "gpl", "bombole"];
const RX = KW.map((k) => new RegExp("(^|[^\\p{L}\\d])" + k + "([^\\p{L}\\d]|$)", "iu"));
const tag = (x, t) => (x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i")) || [])[1]
  ?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";

export async function runCheck() {
  const feeds = (process.env.FEEDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const s = getStore("scadenzario");
  const seenArr = await s.get("seen", { type: "json" });
  const first = !seenArr;
  const seen = new Set(seenArr || []);
  const found = [];
  for (const url of feeds) {
    try {
      const xml = await (await fetch(url)).text();
      for (const it of xml.split(/<item[\s>]/i).slice(1)) {
        const title = tag(it, "title"), link = tag(it, "link"), id = tag(it, "guid") || link || title;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        if (/^https?:\/\//.test(link) && RX.some((r) => r.test(title + " " + tag(it, "description"))))
          found.push({ title, link, date: new Date().toISOString().slice(0, 10) });
      }
    } catch (e) { console.log("Feed non letto:", url, e.message); }
  }
  await s.setJSON("seen", [...seen].slice(-500));
  await s.setJSON("meta", { last: new Date().toISOString(), feeds: feeds.length });
  if (first || !found.length) return { feeds: feeds.length, found: 0, first };
  const old = (await s.get("alerts", { type: "json" })) || [];
  await s.setJSON("alerts", [...found, ...old].slice(0, 30));
  if (process.env.NTFY_TOPIC)
    await fetch("https://ntfy.sh/" + process.env.NTFY_TOPIC, {
      method: "POST", headers: { Title: "Scadenzario Globale: novità normative" },
      body: found.slice(0, 5).map((f) => f.title).join("\n"),
    });
  return { feeds: feeds.length, found: found.length, first };
}
