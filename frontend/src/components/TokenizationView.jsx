import React, { useEffect, useState } from "react";

export const TokenizationView = ({ sentence, tokens, inputIds, tokenTypes }) => {
  const [showTokens, setShowTokens] = useState(false);

  useEffect(() => {
    setShowTokens(false);
    const timer = setTimeout(() => setShowTokens(true), 1000);
    return () => clearTimeout(timer);
  }, [sentence]);

  return (
    <div style={{ width: "100vw", height: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "2em", marginBottom: "1em", color: "#38bdf8" }}>{sentence}</div>
      <div style={{ fontSize: "1.2em", marginBottom: "1em", color: "#fff" }}>
        {showTokens ? tokens.map((t, i) => (
          <span key={i} style={{ margin: "0 0.5em", padding: "0.2em 0.5em", background: "#222", borderRadius: 6 }}>{t}</span>
        )) : <span style={{ color: "#aaa" }}>Splitting into tokens...</span>}
      </div>
      {showTokens && (
        <table style={{ background: "#222", color: "#fff", borderRadius: 8, padding: "1em", fontSize: "1em" }}>
          <thead>
            <tr>
              <th style={{ padding: "0.5em" }}>#</th>
              <th style={{ padding: "0.5em" }}>Token</th>
              <th style={{ padding: "0.5em" }}>Token ID</th>
              <th style={{ padding: "0.5em" }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr key={i}>
                <td style={{ padding: "0.5em" }}>{i}</td>
                <td style={{ padding: "0.5em" }}>{t}</td>
                <td style={{ padding: "0.5em" }}>{inputIds ? inputIds[i] : "-"}</td>
                <td style={{ padding: "0.5em" }}>{tokenTypes ? tokenTypes[i] : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
