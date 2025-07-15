import React, { useState } from "react";
import { Html } from '@react-three/drei';
import { LLMScene } from "./LLMScene";

import { TokenizationView } from "./TokenizationView";
import { Embeddings3D } from "./Embeddings3D";
import { AttentionView } from "./AttentionView";
import { SoftmaxView } from "./SoftmaxView";

/**
 * Navigation steps for the LLM visualization story
 */
const STORY_STEPS = [
  { name: "Tokenization" },
  { name: "Embeddings" },
  { name: "Attention" },
  { name: "Softmax" },
];

/**
 * Main controller component for LLM visualization story
 * 
 * Manages navigation between different visualization stages and renders
 * the appropriate 3D components based on the current step. Handles layer
 * selection for embeddings visualization.
 * 
 * @param {Object} props - Component props
 * @param {string} props.inputText - Original input text
 * @param {string[]} props.tokens - Array of tokenized strings
 * @param {number[][][]} props.embeddings3d - 3D embedding coordinates
 * @param {number[][][][]} props.attention - Attention weight matrices
 * @param {Object} props.nextToken - Next token prediction data
 * @param {number[][][]} props.hiddenStates - Hidden states from all layers
 * @param {Object} props.tokenData - Raw tokenization data with IDs
 * @returns {JSX.Element} The LLM story controller interface
 */
export const LLMStoryController = ({ inputText, tokens, embeddings3d, attention, nextToken, hiddenStates, tokenData }) => {
  const [step, setStep] = useState(0);
  const [layer, setLayer] = useState(0);

  return (
    <div>
      {/* Navigation */}
      <div className="nav-buttons">
        {STORY_STEPS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setStep(i)}
            className={`nav-button ${step === i ? 'active' : 'inactive'}`}
          >
            {s.name}
          </button>
        ))}
        {step === 1 && (
          <span>
            <span style={{ marginLeft: 10 }}>Layer:</span>
            <button onClick={() => setLayer(Math.max(0, layer - 1))}>-</button>
            <span style={{ margin: "0 10px" }}>{layer}</span>
            <button onClick={() => setLayer(layer + 1)}>+</button>
          </span>
        )}
      </div>

      {/* 3D Scene */}
      <div className="scene-container">
      <LLMScene>
        {step === 0 && (
          <TokenizationView
            sentence={inputText}
            tokens={tokens}
            inputIds={tokenData?.input_ids}
            embeddings={hiddenStates?.[0]}
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
            <Html><div style={{ color: '#f87171' }}>No attention data</div></Html>
          )
        )}
        {step === 3 && nextToken ? (
          <SoftmaxView nextToken={nextToken} />
        ) : step === 3 ? (
          <Html><div style={{ color: '#f87171' }}>No softmax data</div></Html>
        ) : null}
      </LLMScene>
      </div>
    </div>
  );
};
