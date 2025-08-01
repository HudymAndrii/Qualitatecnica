import { interruzioni, popolaTabella } from './funzioni-utili.js';

export function applicaFiltroTutte() {
  const dal = document.getElementById("dataInizioFiltroTutte").value;
  const al = document.getElementById("dataFineFiltroTutte").value;
  const start = dal ? new Date(`${dal}T00:00:00`) : null;
  const end = al ? new Date(`${al}T23:59:59`) : null;

  const filtrati = interruzioni.filter(i =>
    (!start || i.inizio >= start) &&
    (!end || i.inizio <= end)
  );

  popolaTabella("datiTabella", filtrati);
}
