# Scadenzario Globale (Netlify)

## Pubblicazione
1. Crea un repository GitHub (nuovo) e carica tutto il contenuto di questa cartella.
2. Su Netlify: Add new site > Import from Git > scegli il repository (nessun comando di build).
3. Site configuration > Environment variables, aggiungi:
   - `APP_PIN`: un PIN a tua scelta (l'app lo chiede al primo avvio su ogni dispositivo)
   - `FEEDS`: indirizzi dei feed RSS separati da virgola. Sul sito gazzettaufficiale.it, nella home sotto
     "Ultime Gazzette pubblicate", clicca l'icona arancione del feed e copia l'indirizzo
     (Serie Generale; aggiungi altre fonti ufficiali che offrono RSS se vuoi)
   - `NTFY_TOPIC` (facoltativo): un nome lungo e difficile da indovinare; installa l'app gratuita ntfy
     sul telefono e iscriviti allo stesso nome per ricevere la notifica
4. Rilancia il deploy dopo aver inserito le variabili.

## Come funziona
- Ogni settimana la funzione `controlla-norme` legge i feed e segnala le voci con parole chiave
  (revisione, IMU, TARI, bollo, caldaie...). Il primo giro memorizza solo lo stato attuale, senza avvisi.
- Le segnalazioni compaiono nell'app. Premi "Copia richiesta per Claude", incollala in chat e
  Claude verifica le fonti e ti dice quali regole cambiare.
- I dati sono salvati su Netlify (Blobs) e protetti dal PIN: stessi dati su ogni dispositivo.
- Costo: nessuna API a pagamento; solo pochi crediti Netlify (i deploy in produzione costano di più).

## Novità di questa versione
- Riepilogo in alto (scadute, entro 30 giorni, 31-90 giorni, spesa prevista a 12 mesi): i riquadri "scadute" e "entro 30 giorni" filtrano l'elenco.
- Veicoli, impianti e immobili con targa/matricola; viste Schede, 2 righe, Cronologia.
- Scadenze scadute: stato "prenotata / non prenotata" con data e note.
- Se una regola cambia, le scadenze collegate si ricalcolano e resta lo storico (prima -> dopo).
- Pulsante "Controlla ora": lancia subito il controllo delle fonti ufficiali (serve il PIN).
- Calendario: esporta un file .ics con promemoria per telefono o PC.
- QR: apre l'app dal telefono; poi "Aggiungi a schermata Home".
- Service worker: l'app si apre subito anche senza rete e si aggiorna a ogni nuovo deploy.
