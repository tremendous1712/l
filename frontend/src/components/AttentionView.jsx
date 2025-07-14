import React, { useState } from "react";
import { Html } from "@react-three/drei";

// Simple heatmap rendering for attention weights
function renderHeatmap(matrix, tokens) {
  return (
    <table style={{ 
      borderCollapse: "collapse", 
      margin: "1em auto", 
      background: "rgba(34,34,34,0.9)", 
      color: "#fff",
      fontSize: "0.9em",
      borderRadius: "8px",
      overflow: "hidden"
    }}>
      <thead>
        <tr>
          <th style={{ padding: "0.4em", background: "rgba(56,189,248,0.1)" }}></th>
          {tokens.map((t, i) => (
            <th key={i} style={{ padding: "0.4em", background: "rgba(56,189,248,0.1)" }}>
              {t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, i) => (
          <tr key={i}>
            <th style={{ padding: "0.4em", background: "rgba(56,189,248,0.1)" }}>{tokens[i]}</th>
            {row.map((v, j) => (
              <td key={j} style={{ 
                background: `rgba(56,189,248,${v})`, 
                padding: "0.4em",
                textAlign: "center",
                fontSize: "0.8em",
                fontFamily: "monospace"
              }}>
                {v.toFixed(2)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const AttentionView = ({ attention, tokens }) => {
  const [layer, setLayer] = useState(0);
  const [head, setHead] = useState(0);
  
  if (!attention || attention.length === 0) {
    return (
      <Html center>
        <div style={{ color: '#f87171' }}>No attention data</div>
      </Html>
    );
  }
  
  const numLayers = attention.length;
  const numHeads = attention[layer]?.length || 0;
  const matrix = attention[layer][head];
  
  return (
    <group position={[0, 0, 0]}>
      <Html center position={[0, 3, 0]}>
        <div style={{ 
          transform: 'scale(0.8) translateX(-50%)', 
          background: 'rgba(17,17,17,0.95)', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid rgba(56,189,248,0.2)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ marginBottom: "1em", textAlign: "center" }}>
            <div style={{ 
              color: "#38bdf8", 
              fontWeight: "bold", 
              fontSize: "1.2em",
              marginBottom: "0.5em"
            }}>
              Attention Heads
            </div>
            <div style={{ marginBottom: "0.5em" }}>
              <span style={{ marginRight: 20 }}>
                <span style={{ color: "#aaa" }}>Layer:</span>
                <button 
                  onClick={() => setLayer(Math.max(0, layer - 1))}
                  style={{ 
                    margin: "0 5px",
                    background: "#38bdf8",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  -
                </button>
                <span style={{ margin: "0 10px", color: "white" }}>{layer}</span>
                <button 
                  onClick={() => setLayer(Math.min(numLayers - 1, layer + 1))}
                  style={{ 
                    margin: "0 5px",
                    background: "#38bdf8",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  +
                </button>
              </span>
              <span>
                <span style={{ color: "#aaa" }}>Head:</span>
                <button 
                  onClick={() => setHead(Math.max(0, head - 1))}
                  style={{ 
                    margin: "0 5px",
                    background: "#38bdf8",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  -
                </button>
                <span style={{ margin: "0 10px", color: "white" }}>{head}</span>
                <button 
                  onClick={() => setHead(Math.min(numHeads - 1, head + 1))}
                  style={{ 
                    margin: "0 5px",
                    background: "#38bdf8",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  +
                </button>
              </span>
            </div>
            <div style={{ color: "#aaa", fontSize: "0.9em" }}>
              Layer {layer}, Head {head} Attention Matrix
            </div>
          </div>
          {renderHeatmap(matrix, tokens)}
        </div>
      </Html>
    </group>
  );
};
