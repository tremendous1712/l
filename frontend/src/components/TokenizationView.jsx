import React, { useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { useSpring, animated, useTransition } from "@react-spring/web";

export const TokenizationView = ({ sentence, tokens, inputIds }) => {
  const [currentPhase, setCurrentPhase] = useState('typing'); // 'typing', 'parsing', 'tokenized', 'complete'
  const [typedText, setTypedText] = useState('');
  const [highlightedTokens, setHighlightedTokens] = useState([]);
  const [showTable, setShowTable] = useState(false);

  // Color palette for alternating token colors
  const tokenColors = ['#4f46e5', '#059669', '#dc2626', '#7c2d12', '#9333ea', '#0891b2'];

  useEffect(() => {
    // Reset state when sentence changes
    setCurrentPhase('typing');
    setTypedText('');
    setHighlightedTokens([]);
    setShowTable(false);

    // Phase 1: Typing animation
    const typeText = async () => {
      for (let i = 0; i <= sentence.length; i++) {
        setTypedText(sentence.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms per character
      }
      
      // Wait a bit after typing is complete
      setTimeout(() => {
        setCurrentPhase('parsing');
        startParsing();
      }, 800);
    };

    // Phase 2: Parsing animation with token highlighting
    const startParsing = async () => {
      // Create token highlights one by one
      for (let i = 0; i < tokens.length; i++) {
        setHighlightedTokens(prev => [...prev, {
          text: tokens[i],
          color: tokenColors[i % tokenColors.length],
          index: i
        }]);
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms per token
      }

      // Wait before transition
      setTimeout(() => {
        setCurrentPhase('tokenized');
        
        // Show table after tokens are displayed
        setTimeout(() => {
          setCurrentPhase('complete');
          setShowTable(true);
        }, 1000);
      }, 500);
    };

    typeText();
  }, [sentence, tokens]);

  // Animation for the main text
  const textSpring = useSpring({
    opacity: currentPhase === 'typing' ? 1 : currentPhase === 'parsing' ? 0.6 : 0.3,
    transform: currentPhase === 'tokenized' ? 'translateY(-20px)' : 'translateY(0px)',
    config: { tension: 200, friction: 25 }
  });

  // Animation for tokenized display
  const tokensSpring = useSpring({
    opacity: currentPhase === 'tokenized' || currentPhase === 'complete' ? 1 : 0,
    transform: currentPhase === 'tokenized' || currentPhase === 'complete' ? 'translateY(0px)' : 'translateY(20px)',
    config: { tension: 200, friction: 25 }
  });

  // Animation for table
  const tableSpring = useSpring({
    opacity: showTable ? 1 : 0,
    transform: showTable ? 'translateX(0px)' : 'translateX(50px)',
    config: { tension: 200, friction: 25 }
  });

  // Get highlighted version of text for parsing phase
  const getHighlightedText = () => {
    if (currentPhase !== 'parsing') {
      return null; // Don't return anything if not in parsing phase
    }

    if (highlightedTokens.length === 0) {
      return <span>{sentence}</span>; // Show full sentence while waiting for highlights
    }

    let result = [];
    let remainingText = sentence;

    // Process each highlighted token in order
    highlightedTokens.forEach((tokenInfo, i) => {
      const token = tokenInfo.text;
      
      // For GPT-2 tokens that start with Ġ (space), handle them properly
      let searchToken = token;
      let hasSpacePrefix = false;
      
      if (token.startsWith('Ġ')) {
        searchToken = ' ' + token.slice(1);
        hasSpacePrefix = true;
      }
      
      const tokenIndex = remainingText.indexOf(searchToken);
      
      if (tokenIndex !== -1) {
        // Add text before the token
        if (tokenIndex > 0) {
          result.push(
            <span key={`before-${i}`}>
              {remainingText.slice(0, tokenIndex)}
            </span>
          );
        }

        // Add the highlighted token
        result.push(
          <span
            key={`token-${i}`}
            style={{
              backgroundColor: tokenInfo.color,
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              margin: '0 1px',
              animation: 'pulse 0.5s ease-in-out',
              fontWeight: 'bold'
            }}
          >
            {hasSpacePrefix ? searchToken : token}
          </span>
        );

        // Update remaining text
        remainingText = remainingText.slice(tokenIndex + searchToken.length);
      } else {
        // If token not found in remaining text, just add it as highlighted
        result.push(
          <span
            key={`token-${i}`}
            style={{
              backgroundColor: tokenInfo.color,
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              margin: '0 1px',
              animation: 'pulse 0.5s ease-in-out',
              fontWeight: 'bold',
              opacity: 0.7
            }}
          >
            {token}
          </span>
        );
      }
    });

    // Add any remaining text
    if (remainingText.length > 0) {
      result.push(
        <span key="remaining">
          {remainingText}
        </span>
      );
    }

    return result;
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Phase indicator */}
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

      {/* Main sentence display - starts from left */}
      <Html position={[-8, 1.5, 0]}>
        <animated.div style={{
          ...textSpring,
          fontSize: "1.6em",
          color: "#fff",
          fontFamily: "monospace",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          width: "800px", // Fixed width for consistent layout
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
            <div style={{ lineHeight: "1.6" }}>
              {getHighlightedText()}
            </div>
          )}
          {(currentPhase === 'tokenized' || currentPhase === 'complete') && (
            <span style={{ opacity: 0.3, fontSize: "0.9em" }}>
              Original text processed
            </span>
          )}
        </animated.div>
      </Html>

      {/* Tokenized display - flows naturally below sentence */}
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

      {/* Token table - positioned on the right side */}
      <Html position={[2, 0.5, 0]}>
        <animated.div style={{
          ...tableSpring,
          pointerEvents: 'none'
        }}>
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
                    <th style={{ 
                      padding: "12px 8px", 
                      textAlign: "left",
                      borderBottom: "3px solid #38bdf8",
                      color: "#38bdf8",
                      fontWeight: "600"
                    }}>#</th>
                    <th style={{ 
                      padding: "12px 8px", 
                      textAlign: "left",
                      borderBottom: "3px solid #38bdf8",
                      color: "#38bdf8",
                      fontWeight: "600"
                    }}>Token</th>
                    <th style={{ 
                      padding: "12px 8px", 
                      textAlign: "left",
                      borderBottom: "3px solid #38bdf8",
                      color: "#38bdf8",
                      fontWeight: "600"
                    }}>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, i) => (
                    <tr key={i} style={{
                      animation: `fadeIn 0.5s ease-out ${i * 0.1 + 0.5}s both`,
                      borderBottom: i < tokens.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none"
                    }}>
                      <td style={{ 
                        padding: "10px 8px",
                        fontWeight: "500"
                      }}>{i}</td>
                      <td style={{ 
                        padding: "10px 8px",
                        fontFamily: "monospace",
                        color: tokenColors[i % tokenColors.length],
                        fontWeight: "600"
                      }}>{token}</td>
                      <td style={{ 
                        padding: "10px 8px",
                        color: "#94a3b8",
                        fontFamily: "monospace"
                      }}>
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

      {/* CSS animations */}
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
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
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
