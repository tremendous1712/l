import React, { useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/web";

export const TokenizationView = ({ sentence, tokens, inputIds }) => {
  const defaultSentence = "Line 42 : Segmentation Fault. Classic rite of";
  const actualSentence = sentence || defaultSentence;

  const [currentPhase, setCurrentPhase] = useState('typing');
  const [typedText, setTypedText] = useState('');
  const [highlightedSpans, setHighlightedSpans] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const tokenColors = ['#4f46e5', '#059669', '#dc2626', '#7c2d12', '#9333ea', '#0891b2'];

  useEffect(() => {
    setCurrentPhase('typing');
    setTypedText('');
    setHighlightedSpans([]);
    setShowTable(false);

    const typeText = async () => {
      // Type out the actual sentence from input, not tokens
      for (let i = 0; i <= actualSentence.length; i++) {
        setTypedText(actualSentence.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setTimeout(() => {
        setCurrentPhase('parsing');
        startParsing();
      }, 800);
    };

    const startParsing = async () => {
      for (let i = 0; i < tokens.length; i++) {
        setHighlightedSpans(prev => [...prev, {
          text: tokens[i],
          color: tokenColors[i % tokenColors.length],
          index: i
        }]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setTimeout(() => {
        setCurrentPhase('tokenized');
        setTimeout(() => {
          setCurrentPhase('complete');
          setShowTable(true);
        }, 1000);
      }, 500);
    };

    typeText();
  }, [sentence, tokens]);

  const textSpring = useSpring({
    opacity: currentPhase === 'typing' ? 1 : currentPhase === 'parsing' ? 0.6 : 0.3,
    transform: currentPhase === 'tokenized' ? 'translateY(-20px)' : 'translateY(0px)',
    config: { tension: 200, friction: 25 }
  });

  const tokensSpring = useSpring({
    opacity: currentPhase === 'tokenized' || currentPhase === 'complete' ? 1 : 0,
    transform: currentPhase === 'tokenized' || currentPhase === 'complete' ? 'translateY(0px)' : 'translateY(20px)',
    config: { tension: 200, friction: 25 }
  });

  const tableSpring = useSpring({
    opacity: showTable ? 1 : 0,
    transform: showTable ? 'translateX(0px)' : 'translateX(50px)',
    config: { tension: 200, friction: 25 }
  });

  const getParsedHighlightText = () => {
    if (currentPhase !== 'parsing') {
      // Show the typed sentence from input
      return <span style={{ letterSpacing: '2px', wordSpacing: '18px' }}>{typedText}</span>;
    }
    
    // During parsing: break sentence based on tokens and highlight each token progressively
    let result = [];
    let sentenceIndex = 0;
    let sentence = actualSentence;
    
    // Process each token that should be highlighted so far
    for (let tokenIdx = 0; tokenIdx < highlightedSpans.length; tokenIdx++) {
      const span = highlightedSpans[tokenIdx];
      let tokenText = span.text;
      
      // Clean token text - remove leading spaces and GPT-2 markers
      if (tokenText.startsWith(' ')) {
        tokenText = tokenText.substring(1);
      }
      tokenText = tokenText.replace(/^Ġ/, '').trim();
      
      if (!tokenText) continue;
      
      // Find this token in the remaining sentence
      let remainingSentence = sentence.substring(sentenceIndex);
      let tokenPosition = remainingSentence.toLowerCase().indexOf(tokenText.toLowerCase());
      
      if (tokenPosition !== -1) {
        // Add any text before this token (unhighlighted)
        if (tokenPosition > 0) {
          let beforeText = remainingSentence.substring(0, tokenPosition);
          result.push(
            <span key={`before-${tokenIdx}`} style={{ marginRight: '2px' }}>
              {beforeText}
            </span>
          );
        }
        
        // Add the highlighted token
        result.push(
          <span
            key={`token-${tokenIdx}`}
            style={{
              backgroundColor: span.color,
              color: 'white',
              padding: '0px 1px',
              borderRadius: '2px',
              fontWeight: 'bold',
              display: 'inline-block',
              marginRight: '2px'
            }}
          >
            {tokenText}
          </span>
        );
        
        // Update sentence index to continue after this token
        sentenceIndex += tokenPosition + tokenText.length;
      }
    }
    
    // Add any remaining unhighlighted text
    if (sentenceIndex < sentence.length) {
      let remainingText = sentence.substring(sentenceIndex);
      result.push(
        <span key="remaining" style={{ marginRight: '2px' }}>
          {remainingText}
        </span>
      );
    }
    
    return (
      <div style={{ letterSpacing: '2px', textAlign: 'center' }}>
        {result}
      </div>
    );
  };

  return (
    <group position={[0, 0, 0]}>
      <Html position={[-8, 3, 0]}>
        <div style={{
          color: "#38bdf8",
          fontSize: "1.4em",
          fontWeight: "bold",
          marginBottom: "20px"
        }}>
          Tokenization Process
        </div>
      </Html>

      <Html position={[-8, 1.5, 0]}>
        <animated.div style={{
          ...textSpring,
          fontSize: "1.6em",
          color: "#fff",
          fontFamily: "monospace",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          width: "800px",
          lineHeight: "1.4"
        }}>
          {currentPhase === 'typing' && (
            <span>
              {typedText}
              <span style={{
                animation: 'blink 1s infinite',
                marginLeft: '2px'
              }}>|</span>
            </span>
          )}
          {currentPhase === 'parsing' && (
            <div>{getParsedHighlightText()}</div>
          )}
          {(currentPhase === 'tokenized' || currentPhase === 'complete') && (
            <span style={{ opacity: 0.3, fontSize: "0.9em" }}>
              Original text processed
            </span>
          )}
        </animated.div>
      </Html>

      <Html position={[-8, 0, 0]}>
        <animated.div style={{
          ...tokensSpring,
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          maxWidth: "700px",
          marginTop: "20px"
        }}>
          {(currentPhase === 'tokenized' || currentPhase === 'complete') && tokens.map((token, i) => (
            <div
              key={i}
              style={{
                backgroundColor: tokenColors[i % tokenColors.length],
                color: "white",
                padding: "10px 15px",
                borderRadius: "8px",
                fontSize: "1.1em",
                fontFamily: "monospace",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                animation: `slideIn 0.5s ease-out ${i * 0.1}s both`,
                border: "2px solid rgba(255,255,255,0.1)"
              }}
            >
              {token}
            </div>
          ))}
        </animated.div>
      </Html>

      <Html position={[2, 0.5, 0]}>
        <animated.div style={{ ...tableSpring, pointerEvents: 'none' }}>
          {showTable && (
            <div style={{
              background: "rgba(20, 25, 35, 0.95)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(56, 189, 248, 0.3)",
              minWidth: "280px"
            }}>
              <h3 style={{
                color: "#38bdf8",
                margin: "0 0 20px 0",
                fontSize: "1.3em",
                textAlign: "center",
                fontWeight: "600"
              }}>
                Token Analysis
              </h3>
              <table style={{
                color: "#fff",
                borderCollapse: "collapse",
                fontSize: "0.95em",
                width: "100%"
              }}>
                <thead>
                  <tr>
                    <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "3px solid #38bdf8", color: "#38bdf8", fontWeight: "600" }}>#</th>
                    <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "3px solid #38bdf8", color: "#38bdf8", fontWeight: "600" }}>Token</th>
                    <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "3px solid #38bdf8", color: "#38bdf8", fontWeight: "600" }}>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, i) => (
                    <tr key={i} style={{
                      animation: `fadeIn 0.5s ease-out ${i * 0.1 + 0.5}s both`,
                      borderBottom: i < tokens.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none"
                    }}>
                      <td style={{ padding: "10px 8px", fontWeight: "500" }}>{i}</td>
                      <td style={{ padding: "10px 8px", fontFamily: "monospace", color: tokenColors[i % tokenColors.length], fontWeight: "600" }}>
                        {token}
                      </td>
                      <td style={{ padding: "10px 8px", color: "#94a3b8", fontFamily: "monospace" }}>
                        {inputIds ? inputIds[i] : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </animated.div>
      </Html>

      <Html>
        <style>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </Html>
    </group>
  );
};
