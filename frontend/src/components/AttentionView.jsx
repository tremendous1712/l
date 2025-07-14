import React, { useState } from "react";

// Simple heatmap rendering for attention weights
function renderHeatmap(matrix, tokens) {
  return (
    <table style={{ borderCollapse: "collapse", margin: "1em auto", background: "#222", color: "#fff" }}>
      <thead>
        <tr>
          <th></th>
          {tokens.map((t, i) => <th key={i} style={{ padding: "0.3em" }}>{t}</th>)}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, i) => (
          <tr key={i}>
            <th style={{ padding: "0.3em" }}>{tokens[i]}</th>
            {row.map((v, j) => (
              <td key={j} style={{ background: `rgba(56,189,248,${v})`, padding: "0.3em" }}>{v.toFixed(2)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const AttentionView = ({ attention, tokens }) => {
  // attention: [layer][head][from][to]
  const [layer, setLayer] = useState(0);
  const [head, setHead] = useState(0);
  if (!attention || attention.length === 0) return <div style={{ color: '#f87171' }}>No attention data</div>;
  const numLayers = attention.length;
  const numHeads = attention[layer]?.length || 0;
  const matrix = attention[layer][head];
  return (
    <div style={{ width: "100vw", height: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginBottom: "1em" }}>
        <span style={{ color: "#38bdf8", fontWeight: "bold" }}>Attention Heads</span>
        <span style={{ marginLeft: 20 }}>Layer:
          <button onClick={() => setLayer(Math.max(0, layer - 1))} style={{ margin: "0 5px" }}>-</button>
          <span style={{ margin: "0 10px" }}>{layer}</span>
          <button onClick={() => setLayer(Math.min(numLayers - 1, layer + 1))} style={{ margin: "0 5px" }}>+</button>
        </span>
        <span style={{ marginLeft: 20 }}>Head:
          <button onClick={() => setHead(Math.max(0, head - 1))} style={{ margin: "0 5px" }}>-</button>
          <span style={{ margin: "0 10px" }}>{head}</span>
          <button onClick={() => setHead(Math.min(numHeads - 1, head + 1))} style={{ margin: "0 5px" }}>+</button>
        </span>
      </div>
      <div style={{ marginBottom: "1em" }}>
        <span style={{ color: "#fff" }}>Heatmap for Layer {layer}, Head {head}</span>
      </div>
      {renderHeatmap(matrix, tokens)}
    </div>
  );
};
