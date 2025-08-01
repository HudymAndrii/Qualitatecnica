export function generaGrafico() {
    const rows = document.querySelectorAll("#tabellaGrafico tbody tr");
    const dati = Array.from(rows).map(tr => {
      const celle = tr.querySelectorAll("td");
      return {
        inizio: new Date(celle[0].innerText),
        fine: new Date(celle[1].innerText),
        fase: celle[2].innerText
      };
    });
  
    const baseY = { R: 3, S: 2, T: 1 };
    const colori = { R: 'red', S: 'blue', T: 'green' };
    const fasiData = { R: [], S: [], T: [] };
  
    let minTime = dati.length > 0 ? dati[0].inizio : new Date();
    dati.forEach(d => {
      if (d.inizio < minTime) minTime = d.inizio;
    });
    minTime = new Date(minTime.getTime() - 60000); // -1 minuto
  
    Object.keys(fasiData).forEach(f => {
      fasiData[f].push({ x: minTime, y: baseY[f] });
    });
  
    dati.forEach(({ inizio, fine, fase }) => {
      fase.split(/[ ,]+/).forEach(f => {
        if (!baseY[f]) return;
  
        const yBase = baseY[f];
        const data = fasiData[f];
  
        if (data.length === 0 || data[data.length - 1].x.getTime() !== inizio.getTime()) {
          data.push({ x: inizio, y: yBase });
        }
  
        data.push({ x: inizio, y: yBase + 1 });
        data.push({ x: fine, y: yBase + 1 });
        data.push({ x: fine, y: yBase });
      });
    });
  
    const traces = Object.keys(fasiData).map(f => ({
      x: fasiData[f].map(p => p.x),
      y: fasiData[f].map(p => p.y),
      type: 'scatter',
      mode: 'lines',
      name: `Fase ${f}`,
      line: {
        shape: 'hv',
        color: colori[f],
        width: 4
      },
      hoverinfo: 'x+name'
    }));
  
    const annotations = Object.keys(baseY).map(f => ({
      xref: 'paper',
      x: -0.02,
      y: baseY[f] + 0.5,
      xanchor: 'right',
      yanchor: 'middle',
      text: `<b>${f}</b>`,
      showarrow: false,
      font: {
        color: colori[f],
        size: 16
      }
    }));
  
    Plotly.newPlot("chart-container", traces, {
      title: "Interruzioni su Fasi (Livelli Separati)",
      xaxis: {
        title: 'Tempo',
        type: 'date',
        tickformat: "%d/%m %H:%M",
        showgrid: true
      },
      yaxis: {
        title: 'Fase',
        tickvals: [1, 2, 3],
        ticktext: ['', '', ''],
        range: [0.5, 4.5],
        showgrid: true
      },
      annotations: annotations,
      height: 500,
      margin: { t: 50, l: 100 }
    });
  
    setTimeout(() => {
      Plotly.Plots.resize(document.getElementById('chart-container'));
    }, 100);
  }
  
