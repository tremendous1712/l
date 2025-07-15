import React, { useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { useSpring, animated, useTrail } from "@react-spring/web";

const TokenFlow = ({ token, tokenId, embedding, color, style }) => {
  const embeddingSnippet = embedding ? embedding.slice(0, 8) : [];

  return (
    <animated.div style={{
      ...style,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '0 10px',
      fontFamily: 'monospace',
    }}>
      {/* Token (from previous step) */}
      <div style={{
        background: color,
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '1.1em',
        marginBottom: '15px',
        border: '2px solid rgba(255,255,255,0.2)'
      }}>
        {token}
      </div>

      {/* Arrow to ID */}
      <div style={{
        width: '2px',
        height: '30px',
        background: '#4b5563',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #4b5563',
        }} />
      </div>

      {/* Token ID */}
      <div style={{
        color: '#e5e7eb',
        background: '#1f2937',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '1em',
        margin: '15px 0',
        border: '1px solid #4b5563'
      }}>
        ID: {tokenId}
      </div>

      {/* Arrow to Embedding */}
      <div style={{
        width: '2px',
        height: '30px',
        background: '#4b5563',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #4b5563',
        }} />
      </div>

      {/* Embedding Snippet as n x 1 vector */}
      <div style={{
        color: '#9ca3af',
        background: 'rgba(31, 41, 55, 0.5)',
        padding: '10px',
        borderRadius: '6px',
        marginTop: '15px',
        fontSize: '0.8em',
        width: '120px',
        textAlign: 'center',
        border: '1px solid #4b5563'
      }}>
        <div style={{ color: '#0ea5e9', fontWeight: 'bold', marginBottom: '8px' }}>Embedding</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div>[</div>
          {embeddingSnippet.map((n, i) => (
            <div key={i} style={{ margin: '2px 0' }}>{n.toFixed(2)},</div>
          ))}
          <div>...</div>
          <div>]</div>
        </div>
      </div>
    </animated.div>
  );
};

export const TokenizationView = ({ sentence, tokens, inputIds, embeddings }) => {
  const defaultSentence = "Line 42 : Segmentation Fault. Classic rite of";
  const actualSentence = sentence || defaultSentence;

  const [currentPhase, setCurrentPhase] = useState('typing');
  const [typedText, setTypedText] = useState('');
  const [highlightedTokens, setHighlightedTokens] = useState([]);
  const [showFlow, setShowFlow] = useState(false);

  const tokenColors = ['#4f46e5', '#059669', '#dc2626', '#7c2d12', '#9333ea', '#0891b2'];

  useEffect(() => {
    setCurrentPhase('typing');
    setTypedText('');
    setHighlightedTokens([]);
    setShowFlow(false);

    const typeText = async () => {
      for (let i = 0; i <= actualSentence.length; i++) {
        setTypedText(actualSentence.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      setTimeout(() => {
        setCurrentPhase('parsing');
        startParsing();
      }, 500);
    };

    const startParsing = async () => {
      for (let i = 0; i < tokens.length; i++) {
        setHighlightedTokens(prev => [...prev, tokens[i]]);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      setTimeout(() => {
        setCurrentPhase('tokenized');
        setTimeout(() => {
          setShowFlow(true);
        }, 1000);
      }, 800);
    };

    typeText();
  }, [sentence, tokens]);

  const textSpring = useSpring({
    opacity: currentPhase === 'tokenized' ? 0.5 : 1,
    transform: currentPhase === 'tokenized' ? 'translateY(-20px)' : 'translateY(0px)',
    config: { tension: 200, friction: 25 }
  });

  const trail = useTrail(tokens.length, {
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: showFlow ? 1 : 0, transform: showFlow ? 'translateY(0px)' : 'translateY(40px)' },
    config: { mass: 1, tension: 120, friction: 14 },
    delay: 200,
  });

  const renderSentenceWithHighlights = () => {
    let remainingText = actualSentence;
    const parts = [];
    let keyCounter = 0;

    highlightedTokens.forEach((token, i) => {
      const cleanToken = token.replace(/^Ġ/, '').replace(' ', ' ');
      const index = remainingText.indexOf(cleanToken);
      if (index !== -1) {
        if (index > 0) {
          parts.push(<span key={keyCounter++}>{remainingText.substring(0, index)}</span>);
        }
        parts.push(
          <span
            key={keyCounter++}
            style={{
              backgroundColor: tokenColors[i % tokenColors.length],
              color: 'white',
              padding: '2px 4px',
              borderRadius: '3px',
            }}
          >
            {cleanToken}
          </span>
        );
        remainingText = remainingText.substring(index + cleanToken.length);
      }
    });

    if (remainingText) {
      parts.push(<span key={keyCounter++}>{remainingText}</span>);
    }

    return <div>{parts}</div>;
  };

  return (
    <group position={[0, 0, 0]}>
      <Html position={[-8, 3.5, 0]}>
        <animated.div style={{
          ...textSpring,
          width: '800px',
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: '1.6em',
          color: '#fff',
          minHeight: '60px',
        }}>
          {currentPhase === 'typing' && (
            <span>
              {typedText}
              <span style={{ animation: 'blink 1s infinite', marginLeft: '2px' }}>|</span>
            </span>
          )}
          {currentPhase === 'parsing' && (
            renderSentenceWithHighlights()
          )}
          {currentPhase === 'tokenized' && (
             <div style={{ fontSize: '0.9em' }}>
              {tokens.map((token, i) => (
                 <span key={i} style={{
                    backgroundColor: tokenColors[i % tokenColors.length],
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "5px",
                    margin: '0 5px',
                    display: 'inline-block'
                 }}>
                    {token}
                 </span>
              ))}
            </div>
          )}
        </animated.div>
      </Html>

      <Html position={[-10, 1, 0]}>
        <div style={{
          width: '1200px',
          height: '400px',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minWidth: `${tokens.length * 140}px`
          }}>
            {trail.map((style, index) => (
              <TokenFlow
                key={index}
                style={style}
                token={tokens[index]}
                tokenId={inputIds ? inputIds[index] : 'N/A'}
                embedding={embeddings ? embeddings[index] : null}
                color={tokenColors[index % tokenColors.length]}
              />
            ))}
          </div>
        </div>
      </Html>

      <Html>
        <style>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </Html>
    </group>
  );
};
