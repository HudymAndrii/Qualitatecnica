import { leggiFile } from './caricamento-file.js';
import { applicaFiltroTutte } from './filtra-tabella-tutte.js';
import { applicaFiltroPeriodo } from './filtra-tabella-grafico.js';
import { applicaFiltroRaggruppate } from './filtra-tabella-raggruppate.js';
import { generaGrafico } from './grafico-interruzioni.js';
import { generaGraficoRaggruppate } from './grafico-interruzioni-raggruppate.js';
import { toggle } from './funzioni-utili.js';

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("caricaBtn").addEventListener("click", leggiFile);
  document.getElementById("fileInput").addEventListener("change", leggiFile);
  document.getElementById("btnFiltroTutte").addEventListener("click", applicaFiltroTutte);
  document.getElementById("btnFiltroPeriodo").addEventListener("click", () => {
    applicaFiltroPeriodo();
    generaGrafico();
  });
  document.getElementById("btnFiltroRaggruppate").addEventListener("click", applicaFiltroRaggruppate);
  document.getElementById("btnGrafico").addEventListener("click", generaGrafico);
  document.getElementById("btnGraficoRaggruppate").addEventListener("click", generaGraficoRaggruppate);

  // rende toggle accessibile globalmente
  window.toggle = toggle;
});
