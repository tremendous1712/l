

import React, { useState } from "react";
import { fetchTokenData, fetchEmbeddings, fetchAttention, fetchNextToken } from "./api";
import { LLMStoryController } from "./components/LLMStoryController";

function App() {
  const [inputText, setInputText] = useState("the quick brown fox jumps over the lazy dog");
  const [tokenData, setTokenData] = useState(null);
  const [embData, setEmbData] = useState(null);
  const [attData, setAttData] = useState(null);
  const [nextTok, setNextTok] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const td = await fetchTokenData(inputText);
      setTokenData(td);
      const ed = await fetchEmbeddings(inputText);
      setEmbData(ed);
      const ad = await fetchAttention(inputText);
      setAttData(ad);
      const nt = await fetchNextToken(inputText);
      setNextTok(nt);
    } catch (err) {
      setError("Error fetching data. Is backend running?");
      setTokenData(null);
      setEmbData(null);
      setAttData(null);
      setNextTok(null);
    }
    setLoading(false);
  };

  // Helper to check if any data is missing or empty
  const isDataMissing =
    !tokenData || !embData || !attData || !nextTok ||
    (Array.isArray(tokenData.tokens) && tokenData.tokens.length === 0) ||
    (Array.isArray(embData.embeddings3d) && embData.embeddings3d.length === 0) ||
    (Array.isArray(attData.attentions) && attData.attentions.length === 0) ||
    (nextTok.token === "" || nextTok.token_id === -1);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#111", color: "#fff", fontFamily: "monospace" }}>
      <form onSubmit={handleSubmit} style={{ padding: "2em", background: "#222" }}>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          style={{ width: "60%", fontSize: "1.2em", padding: "0.5em" }}
        />
        <button type="submit" style={{ marginLeft: "1em", fontSize: "1em" }} disabled={loading}>
          {loading ? "Loading..." : "Visualize LLM"}
        </button>
      </form>
      {error && <div style={{ color: "#f87171", margin: "1em", fontWeight: "bold" }}>{error}</div>}
      {isDataMissing ? (
        <div style={{ padding: "2em", color: "#f87171", fontWeight: "bold", fontSize: "1.2em" }}>
          <div>Could not load LLM visualization data.</div>
          <div style={{ marginTop: "1em", fontSize: "1em", color: "#fff" }}>
            <div>Check if your backend is running and reachable.</div>
            <div>Check the backend logs for errors.</div>
            <div>Try a shorter input sentence.</div>
            <div style={{ marginTop: "1em" }}>Debug info:</div>
            <pre style={{ background: "#222", padding: "1em", borderRadius: "8px", color: "#fff" }}>
              {JSON.stringify({ tokenData, embData, attData, nextTok }, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <LLMStoryController
          tokens={tokenData.tokens || []}
          embeddings3d={embData.embeddings3d || []}
          hiddenStates={embData.hidden_states || embData.embeddings || []}
          attention={attData.attentions || attData.attention || []}
          nextToken={nextTok}
        />
      )}
    </div>
  );
}

export default App;
