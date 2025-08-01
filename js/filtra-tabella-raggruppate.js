import { interruzioni, formatoData, popolaTabella, tuttiEneltelUnici } from './funzioni-utili.js';
import { generaGraficoRaggruppate } from './grafico-interruzioni-raggruppate.js';

export function applicaFiltroRaggruppate() {
  const dal = document.getElementById("dataInizioFiltroRaggruppate").value;
  const al = document.getElementById("dataFineFiltroRaggruppate").value;
  const start = dal ? new Date(`${dal}T00:00:00`) : null;
  const end = al ? new Date(`${al}T23:59:59`) : null;

  const datiFiltrati = interruzioni.filter(i =>
    i.durata > 1 &&
    (!start || i.inizio >= start) &&
    (!end || i.inizio <= end)
  );

  const MAX_DIFF_MS = 180000; // ±3 minuti
  const MAX_DIFF_MINUTI = 3;

  datiFiltrati.sort((a, b) => a.inizio - b.inizio);
  const gruppi = [];

  for (const riga of datiFiltrati) {
    let aggiunto = false;

    for (const gruppo of gruppi) {
      const ultimi = gruppo.slice(-5);

      const compatibile = ultimi.some(g => {
        const inizioVicino = Math.abs(riga.inizio - g.inizio) <= MAX_DIFF_MS;
        const fineVicino = Math.abs(riga.fine - g.fine) <= MAX_DIFF_MS;
        const durataVicino = Math.abs(riga.durata - g.durata) <= MAX_DIFF_MINUTI;
        return inizioVicino && fineVicino && durataVicino;
      });

      if (compatibile) {
        gruppo.push(riga);
        aggiunto = true;
        break;
      }
    }

    if (!aggiunto) {
      gruppi.push([riga]);
    }
  }

  // ✅ Usa il set globale per ottenere il numero totale clienti
  const totaleClienti = tuttiEneltelUnici.size;

  const risultati = gruppi.map(gruppo => combinaGruppo(gruppo, totaleClienti));
  popolaTabella("tabellaUnificata", risultati);

  // Mostra sezione grafico raggruppate
  document.getElementById("graficoRaggruppateBox").style.display = "block";
  generaGraficoRaggruppate();
}

function combinaGruppo(gruppo, totaleClienti) {
  const inizio = gruppo[0].inizio;
  const fine = gruppo.reduce((acc, curr) => curr.fine > acc ? curr.fine : acc, gruppo[0].fine);
  const fasi = [...new Set(gruppo.flatMap(i => i.fase.split(/[ ,]+/).filter(f => f)))].join(', ');

  // 🧠 Estrai tutti gli eneltel unici reali da ogni riga
  const eneltelUnici = new Set();
  gruppo.forEach(i => {
    if (i.eneltel) {
      i.eneltel.split(/[ ,]+/).forEach(e => {
        const cleaned = e.trim();
        if (cleaned) eneltelUnici.add(cleaned);
      });
    }
  });

  const eneltel = Array.from(eneltelUnici).join(', ');
  const tipologia = [...new Set(gruppo.map(i => i.tipologia).filter(Boolean))].join(', ');
  const durata = Math.round((fine - inizio) / 60000);
  const nFasi = fasi ? fasi.split(',').length : 0;

  // ✅ Calcolo percentuale corretta
  const percentuale = totaleClienti > 0 ? ((eneltelUnici.size / totaleClienti) * 100).toFixed(2) : "-";

  return {
    inizio,
    fine,
    fase: fasi,
    eneltel,
    nFasi,
    durata,
    tipologia,
    percentuale
  };
}


export function raggruppaDaGrafico() {
  const righe = document.querySelectorAll("#tabellaGrafico tbody tr");
  const dati = Array.from(righe).map(riga => {
    const celle = riga.querySelectorAll("td");
    return {
      inizio: new Date(celle[0].innerText),
      fine: new Date(celle[1].innerText),
      fase: celle[2].innerText.trim(),
      eneltel: celle[3].innerText.trim(),
      nFasi: parseInt(celle[5].innerText),
      durata: parseInt(celle[6].innerText),
      tipologia: celle[7].innerText.trim()
    };
  });

  const MAX_DIFF_MS = 180000;
  const MAX_DIFF_MINUTI = 3;

  dati.sort((a, b) => a.inizio - b.inizio);

  const gruppi = [];

  for (const riga of dati) {
    let aggiunto = false;

    for (const gruppo of gruppi) {
      const ultimi = gruppo.slice(-5);

      const compatibile = ultimi.some(g => {
        const inizioVicino = Math.abs(riga.inizio - g.inizio) <= MAX_DIFF_MS;
        const fineVicino = Math.abs(riga.fine - g.fine) <= MAX_DIFF_MS;
        const durataVicino = Math.abs(riga.durata - g.durata) <= MAX_DIFF_MINUTI;
        return inizioVicino && fineVicino && durataVicino;
      });

      if (compatibile) {
        gruppo.push(riga);
        aggiunto = true;
        break;
      }
    }

    if (!aggiunto) {
      gruppi.push([riga]);
    }
  }

  const totaleClienti = tuttiEneltelUnici.size;
  const risultati = gruppi.map(gruppo => combinaGruppo(gruppo, totaleClienti));
  popolaTabella("tabellaUnificata", risultati);
}
