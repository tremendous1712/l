import React from "react";

export const SoftmaxView = ({ nextToken }) => {
  if (!nextToken || !nextToken.probs) return <div style={{ color: '#f87171' }}>No softmax data</div>;
  const { probs, token, token_id } = nextToken;
  // Show top 10 probabilities
  const top = probs.slice(0, 10);
  return (
    <div style={{ width: "100vw", height: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "1.5em", color: "#38bdf8", marginBottom: "1em" }}>Softmax Probabilities</div>
      <div style={{ display: "flex", alignItems: "flex-end", height: "200px", marginBottom: "2em" }}>
        {top.map((p, i) => (
          <div key={i} style={{ margin: "0 8px", textAlign: "center" }}>
            <div style={{ background: i === 0 ? "#f59e42" : "#38bdf8", width: "32px", height: `${p.prob * 180}px`, borderRadius: "8px 8px 0 0" }}></div>
            <div style={{ fontSize: "0.9em", color: "#fff", marginTop: "0.5em" }}>{p.token}</div>
            <div style={{ fontSize: "0.8em", color: "#aaa" }}>{(p.prob * 100).toFixed(2)}%</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: "1.2em", color: "#fff" }}>
        <strong>Predicted Next Token:</strong> <span style={{ color: "#f59e42" }}>{token}</span>
      </div>
    </div>
  );
};
