

import React, { useState } from "react";
import { LLMScene } from "./LLMScene";
import { TokenBlocks3D } from "./TokenBlocks3D";
import { TokenizationView } from "./TokenizationView";
import { Embeddings3D } from "./Embeddings3D";
import { AttentionView } from "./AttentionView";
import { SoftmaxView } from "./SoftmaxView";

const STORY_STEPS = [
  { name: "Tokenization" },
  { name: "Embeddings" },
  { name: "Attention" },
  { name: "Softmax" },
];

export const LLMStoryController = ({ tokens, embeddings3d, attention, nextToken, hiddenStates }) => {
  const [step, setStep] = useState(0);
  const [layer, setLayer] = useState(0);

  return (
    <div style={{ width: "100vw", height: "70vh", position: "relative" }}>
      <LLMScene>
        {step === 0 && (
          <TokenizationView
            sentence={tokens.join(' ')}
            tokens={tokens}
            inputIds={Array.isArray(tokens) && tokens.length && typeof tokens[0] === 'string' ? undefined : undefined}
            tokenTypes={undefined}
            rawTokenData={tokens}
            inputIdsRaw={Array.isArray(tokens) && tokens.length && typeof tokens[0] === 'string' ? undefined : undefined}
          />
        )}
        {step === 1 && (
          (embeddings3d && embeddings3d.length > 0 && embeddings3d[layer]) || (hiddenStates && hiddenStates[layer]) ? (
            <Embeddings3D
              embeddings3d={embeddings3d}
              tokens={tokens}
              layer={layer}
              step={step}
              hiddenStates={hiddenStates}
              sentence={tokens.join(' ')}
            />
          ) : (
            <group><mesh><boxGeometry args={[2,1,0.2]} /><meshStandardMaterial color="#f87171" /></mesh></group>
          )
        )}
        {step === 2 && (
          attention && attention.length > 0 ? (
            <AttentionView attention={attention} tokens={tokens} />
          ) : (
            <div style={{ color: '#f87171' }}>No attention data</div>
          )
        )}
        {step === 3 && nextToken ? (
          <SoftmaxView nextToken={nextToken} />
        ) : step === 3 ? (
          <div style={{ color: '#f87171' }}>No softmax data</div>
        ) : null}
      </LLMScene>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, background: "rgba(34,34,34,0.8)", borderRadius: 8, padding: 12 }}>
        {STORY_STEPS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setStep(i)}
            style={{
              marginRight: 10,
              fontWeight: step === i ? "bold" : "normal",
              background: step === i ? "#38bdf8" : "#222",
              color: step === i ? "#fff" : "#38bdf8",
              borderRadius: 6,
              padding: "6px 16px",
              border: "none",
              cursor: "pointer"
            }}
          >
            {s.name}
          </button>
        ))}
        {step === 1 && (
          <>
            <span style={{ marginLeft: 10 }}>Layer:</span>
            <button onClick={() => setLayer(Math.max(0, layer - 1))}>-</button>
            <span style={{ margin: "0 10px" }}>{layer}</span>
            <button onClick={() => setLayer(layer + 1)}>+</button>
          </>
        )}
      </div>
    </div>
  );
};
