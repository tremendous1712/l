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
      <Html center position={[0, -1, 0]}>
        <div style={{ 
          transform: 'scale(0.9)', 
          background: 'rgba(17,17,17,0.95)', 
          padding: '16px', 
          borderRadius: '10px',
          border: '1px solid rgba(56,189,248,0.2)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ marginBottom: "1.5em", textAlign: "center" }}>
            <div style={{ 
              color: "#38bdf8", 
              fontWeight: "bold", 
              fontSize: "1.5em",
              marginBottom: "0.8em"
            }}>
              Attention Heads
            </div>
            <div style={{ marginBottom: "0.8em", display: 'flex', gap: '30px' }}>
              <span>
                <span style={{ color: "#aaa", fontSize: '1.1em' }}>Layer:</span>
                <button 
                  onClick={() => setLayer(Math.max(0, layer - 1))}
                  style={{ 
                    margin: "0 8px",
                    background: "#38bdf8",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: '1.1em'
                  }}
                >
                  -
                </button>
                <span style={{ margin: "0 12px", color: "white", fontSize: '1.1em' }}>{layer}</span>
                <button 
                  onClick={() => setLayer(Math.min(numLayers - 1, layer + 1))}
                  style={{ 
                    margin: "0 8px",
                    background: "#38bdf8",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: '1.1em'
                  }}
                >
                  +
                </button>
              </span>
              <span>
                <span style={{ color: "#aaa", fontSize: '1.1em' }}>Head:</span>
                <button 
                  onClick={() => setHead(Math.max(0, head - 1))}
                  style={{ 
                    margin: "0 8px",
                    background: "#38bdf8",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: '1.1em'
                  }}
                >
                  -
                </button>
                <span style={{ margin: "0 12px", color: "white", fontSize: '1.1em' }}>{head}</span>
                <button 
                  onClick={() => setHead(Math.min(numHeads - 1, head + 1))}
                  style={{ 
                    margin: "0 8px",
                    background: "#38bdf8",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: '1.1em'
                  }}
                >
                  +
                </button>
              </span>
            </div>
            <div style={{ color: "#aaa", fontSize: "1em" }}>
              Layer {layer}, Head {head} Attention Matrix
            </div>
          </div>
          {renderHeatmap(matrix, tokens)}
        </div>
      </Html>
    </group>
  );
};
