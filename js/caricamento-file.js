import { elaboraCSV, preparaTestoCSV } from './funzioni-utili.js';
import { applicaFiltroTutte } from './filtra-tabella-tutte.js';
import { applicaFiltroPeriodo } from './filtra-tabella-grafico.js';
import { applicaFiltroRaggruppate } from './filtra-tabella-raggruppate.js';
import { generaGrafico } from './grafico-interruzioni.js';
import { generaGraficoRaggruppate } from './grafico-interruzioni-raggruppate.js';

export function leggiFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Seleziona un file.");

  const reader = new FileReader();

  reader.onload = e => {
    const csv = preparaTestoCSV(e.target.result);

    // ✅ Mostra CSV nel textarea
    const textarea = document.getElementById("contenutoCSV");
    if (textarea) textarea.value = csv;

    // ✅ Elabora e genera tutto
    elaboraCSV(csv, () => {
      applicaFiltroTutte();              // Tabella tutte
      applicaFiltroPeriodo();            // Tabella + grafico
      generaGrafico();                   // Grafico
      applicaFiltroRaggruppate();        // Tabella raggruppata
      generaGraficoRaggruppate();        // Grafico raggruppato
    });
  };

  reader.readAsText(file);
}
