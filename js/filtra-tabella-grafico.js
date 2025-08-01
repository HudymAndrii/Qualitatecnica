import { interruzioni, formatoData, popolaTabella } from './funzioni-utili.js';
import { generaGrafico } from './grafico-interruzioni.js';
import { raggruppaDaGrafico } from './filtra-tabella-raggruppate.js';

export function applicaFiltroPeriodo() {
  const dal = document.getElementById("dataInizioFiltro").value;
  const al = document.getElementById("dataFineFiltro").value;
  const start = dal ? new Date(`${dal}T00:00:00`) : null;
  const end = al ? new Date(`${al}T23:59:59`) : null;

  const filtrati = interruzioni.filter(i =>
    i.durata > 1 &&
    (!start || i.inizio >= start) &&
    (!end || i.inizio <= end)
  );

  const tbody = document.getElementById("tabellaGrafico").querySelector("tbody");
  tbody.innerHTML = "";
  filtrati.forEach(i => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatoData(i.inizio)}</td>
      <td>${formatoData(i.fine)}</td>
      <td>${i.fase}</td>
      <td>${i.eneltel}</td>
      <td>${(i.eneltel || '').split(',').length}</td>
      <td>${i.nFasi}</td>
      <td>${i.durata} min</td>
      <td>${i.tipologia}</td>`;
    tbody.appendChild(tr);
  });

  generaGrafico();       // ✅ Rigenera il grafico con i nuovi dati
  raggruppaDaGrafico();  // ✅ Rigenera la tabella e il grafico raggruppato
}
