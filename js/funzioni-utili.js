
export let interruzioni = [];
export let tuttiEneltelUnici = new Set();


export function toggle(id) {
  const box = document.getElementById(id);
  if (!box) return;

  const isVisible = box.style.display === "block";
  box.style.display = isVisible ? "none" : "block";

  if (!isVisible) {
    // Resize grafici dopo apertura
    setTimeout(() => {
      const chart1 = document.getElementById("chart-container");
      if (chart1) Plotly.Plots.resize(chart1);

      const chart2 = document.getElementById("chart-container-raggruppate");
      if (chart2) Plotly.Plots.resize(chart2);
    }, 300);
  }
}


export function preparaTestoCSV(input) {
  return input.split('\n').map(riga => {
    return riga.trim().split(',').map(campo => {
      campo = campo.trim();
      if (!campo.startsWith('"')) campo = `"${campo}`;
      if (!campo.endsWith('"')) campo = `${campo}"`;
      return campo;
    }).join(',');
  }).join('\n');
}

export function elaboraCSV(csvText, callback) {
  Papa.parse(csvText, {
    skipEmptyLines: true,
    delimiter: ",",
    complete: function (results) {
      const rows = results.data;

      const rawStart = rows[1]?.[2]?.replace(/"/g, '').trim();
      const rawEnd = rows[1]?.[3]?.replace(/"/g, '').trim();
      const dataSegnalazione = convertiData(rawStart);
      const dataRipresa = convertiData(rawEnd);

      let start = null, end = null;
      if (dataSegnalazione && dataRipresa) {
        const dataInizio = new Date(dataSegnalazione);
        const dataFine = new Date(dataRipresa);
        start = dataInizio < dataFine ? dataInizio : dataFine;
        end = dataInizio < dataFine ? dataFine : dataInizio;

        const yyyyMMdd = d => d.toISOString().slice(0, 10);
        document.getElementById("dataInizioFiltro").value = yyyyMMdd(start);
        document.getElementById("dataFineFiltro").value = yyyyMMdd(end);
        document.getElementById("dataInizioFiltroTutte").value = yyyyMMdd(start);
        document.getElementById("dataFineFiltroTutte").value = yyyyMMdd(end);
        document.getElementById("dataInizioFiltroRaggruppate").value = yyyyMMdd(start);
        document.getElementById("dataFineFiltroRaggruppate").value = yyyyMMdd(end);
      }

      const headers = rows.find(r => r.some(c => c.toLowerCase().includes("inizio disalim")));
      const dataRows = rows.slice(rows.indexOf(headers) + 1);

      const getIndex = label => headers.findIndex(h => h.toLowerCase().includes(label));
      const inizioIndex = getIndex("inizio disalim");
      const fineIndex = getIndex("fine disalim");
      const faseIndex = getIndex("fase");
      const eneltelIndex = getIndex("eneltel");
      const tipoIndex = getIndex("durata disalim");

      // Calcolo tutti gli Eneltel unici nel CSV
      tuttiEneltelUnici = new Set(
        dataRows
          .map(row => row[eneltelIndex])
          .filter(Boolean)
          .flatMap(e => e.split(/[ ,]+/).map(id => id.trim()))
          .filter(id => id.length > 0)
      );


      interruzioni = dataRows.map(row => {
        const inizio = convertiData(row[inizioIndex]);
        const fine = convertiData(row[fineIndex]);
        const fase = row[faseIndex]?.trim();
        const eneltel = eneltelIndex !== -1 ? row[eneltelIndex]?.trim() : "-";
        const tipologia = tipoIndex !== -1 ? row[tipoIndex]?.trim() : "-";
        if (!inizio || !fine || !fase) return null;
        const dInizio = new Date(inizio);
        const dFine = new Date(fine);
        return {
          inizio: dInizio,
          fine: dFine,
          fase,
          eneltel,
          tipologia,
          durata: Math.round((dFine - dInizio) / 60000),
          nFasi: fase.split(/[ ,]+/).filter(f => f).length
        };
      }).filter(i => i);

      interruzioni.sort((a, b) => a.inizio - b.inizio);

      if (callback) callback(); // ✅ chiamata dopo parsing completato
    }
  });
}


export function popolaTabella(id, dati) {
  const tbody = document.getElementById(id).querySelector("tbody");
  tbody.innerHTML = "";

  const mostraPercentuale = id === "tabellaUnificata";  // ✅ SOLO per la tabella raggruppata

  dati.forEach(i => {
    const tr = document.createElement("tr");

    let html = `
      <td>${formatoData(i.inizio)}</td>
      <td>${formatoData(i.fine)}</td>
      <td>${i.fase}</td>
      <td>${i.eneltel}</td>
      <td>${i.nFasi}</td>
      <td>${i.durata} min</td>
      <td>${i.tipologia}</td>`;

    if (mostraPercentuale) {
      html += `<td class="percentuale">${i.percentuale !== undefined ? i.percentuale + ' %' : '-'}</td>`;
    }

    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}



export function parseDataItaliana(dataStr) {
  const parts = dataStr.trim().split(/[,\s]+/);
  if (parts.length < 2) return new Date(NaN);
  const [gg, mm, aaaa] = parts[0].split('/');
  const [hh, min, ss] = parts[1].split(':');
  return new Date(`${aaaa}-${mm}-${gg}T${hh}:${min}:${ss}`);
}

export function formatoData(data) {
  return data.toLocaleString("it-IT", {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

export function convertiData(data) {
  if (!data) return null;

  const pulita = data.replace(/"/g, '').replace(/\s+/g, ' ').trim();
  const match = pulita.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [_, dd, mm, yyyy, hh, min, ss] = match;
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
  }

  const d = new Date(pulita);
  return isNaN(d) ? null : d.toISOString();
}
