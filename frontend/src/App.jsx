import React, { useEffect, useState } from "react";
import { Scene } from "./Scene";
import { TokenBlock } from "./components/TokenBlock";
import { fetchTokenData } from "./api";

const sampleText = "the quick brown fox jumps over the lazy dog";

function App() {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const loadTokens = async () => {
      const data = await fetchTokenData(sampleText);
      setTokens(data.tokens);
    };
    loadTokens();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Scene>
        {tokens.map((token, i) => (
          <TokenBlock key={i} token={token} position={[i * 2 - tokens.length, 0, 0]} />
        ))}
      </Scene>
    </div>
  );
}

export default App;
