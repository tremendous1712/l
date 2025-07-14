import React, { useState, useCallback, useEffect } from "react";
import { fetchTokenData, fetchEmbeddings, fetchAttention, fetchNextToken } from "./api";
import { LLMStoryController } from "./components/LLMStoryController";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./App.css";

function App() {
  const [inputText, setInputText] = useState("the quick brown fox jumps over the lazy dog");
  const [tokenData, setTokenData] = useState(null);
  const [embData, setEmbData] = useState(null);
  const [attData, setAttData] = useState(null);
  const [nextTok, setNextTok] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Reset all state values
  const resetState = useCallback(() => {
    setTokenData(null);
    setEmbData(null);
    setAttData(null);
    setNextTok(null);
    setError("");
    setRetryCount(0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
      // Escape to reset
      if (e.key === 'Escape') {
        resetState();
        setInputText("");
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [resetState]);

  // Main submit handler with retry logic
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    resetState();
    try {
      // Fetch all data in parallel for better performance
      const [tokenResult, embResult, attResult, nextResult] = await Promise.all([
        fetchTokenData(inputText),
        fetchEmbeddings(inputText),
        fetchAttention(inputText),
        fetchNextToken(inputText)
      ]);
      // Validate responses
      if (!tokenResult?.tokens?.length) throw new Error("Invalid token data");
      if (!embResult?.hidden_states?.length) throw new Error("Invalid embedding data");
      if (!attResult?.attentions?.length) throw new Error("Invalid attention data");
      if (!nextResult?.token) throw new Error("Invalid next token prediction");
      setTokenData(tokenResult);
      setEmbData(embResult);
      setAttData(attResult);
      setNextTok(nextResult);
      setRetryCount(0);
    } catch (err) {
      if (retryCount < 2) {
        setRetryCount(retryCount + 1);
        setTimeout(() => handleSubmit(), 1000);
        return;
      }
      setError(err.message || "Error fetching data. Is the backend running?");
      resetState();
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if any data is missing or empty
  const isDataMissing =
    !tokenData?.tokens?.length ||
    !embData?.hidden_states?.length ||
    !attData?.attentions?.length ||
    !nextTok?.token;

  return (
    <ErrorBoundary>
      <div className="app-container">
        <header className="app-header">
          <h1>LLM Visualization</h1>
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="text-input"
                placeholder="Enter text..."
                disabled={loading}
                aria-label="Input text for analysis"
                title="Press Ctrl+Enter to analyze, Escape to reset"
              />
              <button type="submit" className="submit-button" disabled={loading || !inputText.trim()}>
                {loading ? "Processing..." : "Analyze"}
              </button>
              <button type="button" className="reset-button" onClick={resetState} disabled={loading || (!tokenData && !error)}>
                Reset
              </button>
            </div>
            {error && <div className="error-message" role="alert">{error}</div>}
          </form>
        </header>

        <main className="app-main">
          {loading && <LoadingOverlay message={retryCount > 0 ? `Retrying... (${retryCount}/2)` : undefined} />}
          {!loading && !error && !isDataMissing && (
            <div className="app-main-overlay">
              <LLMStoryController
                tokens={tokenData.tokens}
                embeddings3d={embData.embeddings3d}
                attention={attData.attentions}
                nextToken={nextTok}
                hiddenStates={embData.hidden_states}
                tokenData={tokenData}
              />
            </div>
          )}
          {!loading && !error && isDataMissing && (
            <div className="no-data-message">
              Enter some text and click Analyze to begin
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
