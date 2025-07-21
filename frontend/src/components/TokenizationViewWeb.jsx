import React, { useEffect, useState } from "react";
import { useSpring, animated, useTrail } from "@react-spring/web";

/**
 * Individual token flow component showing token -> ID -> embedding pipeline
 * 
 * Displays a single token's journey through the tokenization process with
 * animated arrows and embedding vector preview.
 * 
 * @param {Object} props - Component props
 * @param {string} props.token - Token string
 * @param {number} props.tokenId - Unique token ID
 * @param {number[]} props.embedding - Embedding vector (first 8 dimensions shown)
 * @param {string} props.color - Display color for the token
 * @param {Object} props.style - React Spring animation style
 * @returns {JSX.Element} Token flow visualization
 */
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
      minWidth: '120px'
    }}>
      {/* Token */}
      <div style={{
        background: color,
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '1.1em',
        marginBottom: '15px',
        border: '2px solid rgba(255,255,255,0.2)',
        textAlign: 'center',
        minWidth: '80px'
      }}>
        {token}
      </div>

      {/* Arrow to ID */}
      <div style={{
        width: '2px',
        height: '30px',
        background: '#6b7280',
        position: 'relative',
        marginBottom: '15px'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-3px',
          left: '-3px',
          width: '8px',
          height: '8px',
          background: '#6b7280',
          transform: 'rotate(45deg)'
        }} />
      </div>

      {/* Token ID */}
      <div style={{
        background: '#374151',
        color: '#d1d5db',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '0.9em',
        marginBottom: '15px',
        border: '1px solid #4b5563',
        textAlign: 'center',
        minWidth: '60px'
      }}>
        ID: {tokenId !== undefined && tokenId !== null ? tokenId : 'N/A'}
      </div>

      {/* Arrow to Embedding */}
      <div style={{
        width: '2px',
        height: '30px',
        background: '#6b7280',
        position: 'relative',
        marginBottom: '15px'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-3px',
          left: '-3px',
          width: '8px',
          height: '8px',
          background: '#6b7280',
          transform: 'rotate(45deg)'
        }} />
      </div>

      {/* Embedding Vector Preview */}
      <div style={{
        background: '#1f2937',
        color: '#9ca3af',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '0.8em',
        border: '1px solid #374151',
        textAlign: 'center',
        maxWidth: '120px'
      }}>
        <div style={{ 
          color: '#60a5fa', 
          fontWeight: 'bold', 
          marginBottom: '4px',
          fontSize: '0.9em'
        }}>
          Embedding
        </div>
        {embeddingSnippet.length > 0 ? (
          <div style={{ lineHeight: '1.2' }}>
            {embeddingSnippet.map((val, i) => (
              <div key={i} style={{ 
                fontSize: '0.75em',
                color: val > 0 ? '#34d399' : '#f87171'
              }}>
                {val.toFixed(2)}
              </div>
            ))}
            <div style={{ 
              color: '#6b7280', 
              fontSize: '0.7em', 
              marginTop: '2px' 
            }}>
              ...{embedding ? embedding.length - 8 : 0} more
            </div>
          </div>
        ) : (
          <div style={{ color: '#6b7280', fontSize: '0.75em' }}>
            {embedding === null ? 'Loading...' : 'No data'}
          </div>
        )}
      </div>
    </animated.div>
  );
};

/**
 * Web-based tokenization view component (no Three.js)
 * 
 * Shows the complete tokenization process with animated typing, token highlighting,
 * and vertical flow from tokens to IDs to embeddings. Uses normal DOM elements
 * instead of Three.js Html components.
 */
export const TokenizationView = ({ sentence, tokens, inputIds, embeddings }) => {
  const [currentPhase, setCurrentPhase] = useState('typing');
  const [typedText, setTypedText] = useState('');
  const [highlightedTokens, setHighlightedTokens] = useState([]);
  const [flowStep, setFlowStep] = useState(0); // 0: tokens, 1: flowing to IDs, 2: IDs, 3: flowing to embeddings, 4: embeddings

  // Refs for scrolling to each step
  const tokenStepRef = React.useRef(null);
  const idStepRef = React.useRef(null);
  const embeddingStepRef = React.useRef(null);

  // Debug info
  console.log('TokenizationView Data:', {
    sentence,
    tokens: tokens?.length,
    inputIds: inputIds?.length, 
    embeddings: embeddings?.length,
    tokensArray: tokens,
    inputIdsArray: inputIds,
    embeddingsFirst: embeddings?.[0]?.slice(0, 3)
  });

  // Define colors for tokens
  const tokenColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  // Text typing animation
  const textSpring = useSpring({
    opacity: currentPhase === 'typing' ? 1 : currentPhase === 'parsing' ? 1 : 0.8,
    transform: currentPhase === 'tokenized' ? 'scale(0.95)' : 'scale(1)',
    config: { tension: 200, friction: 20 }
  });

  // Token flow trail animation
  const trail = useTrail(tokens?.length || 0, {
    opacity: currentPhase === 'tokenized' ? 1 : 0,
    transform: currentPhase === 'tokenized' ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 200, friction: 20 },
    delay: currentPhase === 'tokenized' ? 500 : 0
  });

  // Simulate typing effect
  useEffect(() => {
    if (sentence && currentPhase === 'typing') {
      let index = 0;
      const timer = setInterval(() => {
        setTypedText(sentence.slice(0, index + 1));
        index++;
        if (index >= sentence.length) {
          clearInterval(timer);
          setTimeout(() => setCurrentPhase('parsing'), 500);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [sentence, currentPhase]);

  // Handle parsing phase and start flow animation
  useEffect(() => {
    if (currentPhase === 'parsing' && tokens) {
      let tokenIndex = 0;
      const timer = setInterval(() => {
        setHighlightedTokens(tokens.slice(0, tokenIndex + 1));
        tokenIndex++;
        if (tokenIndex >= tokens.length) {
          clearInterval(timer);
          setTimeout(() => {
            setCurrentPhase('tokenized');
            // Start the flow animation sequence with auto-scrolling
            setTimeout(() => {
              setFlowStep(1);
              // Scroll to tokens when arrow starts drawing
              if (tokenStepRef.current) {
                tokenStepRef.current.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }
            }, 2000); // Increased delay for smoother transition
            setTimeout(() => {
              setFlowStep(2);
              // Scroll to IDs when they appear
              if (idStepRef.current) {
                idStepRef.current.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }
            }, 3500);
            setTimeout(() => {
              setFlowStep(3);
            }, 5000);
            setTimeout(() => {
              setFlowStep(4);
              // Scroll to embeddings when they appear
              if (embeddingStepRef.current) {
                embeddingStepRef.current.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }
            }, 6500);
          }, 1000);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [currentPhase, tokens]);

  // Render sentence with highlighted tokens
  const renderSentenceWithHighlights = () => {
    if (!sentence || !highlightedTokens.length) return sentence;

    let remainingText = sentence;
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
    <>
      <div className="tokenization-web-view" style={{
        padding: '40px 0',
        backgroundColor: '#111827',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: 'monospace'
      }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          padding: '0 40px'
        }}>
          <h2 style={{
            fontSize: '3.5em',
            marginBottom: '20px',
            color: '#60a5fa',
            fontWeight: 'bold'
          }}>
            Tokenization Process
          </h2>
          <p style={{
            fontSize: '1.4em',
            color: '#9ca3af',
            maxWidth: '900px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Watch how your input text gets broken down into tokens, converted to IDs, and mapped to embedding vectors
          </p>
        </div>

        {/* Text Display Section */}
        <animated.div style={{
          ...textSpring,
          textAlign: 'center',
          marginBottom: currentPhase === 'tokenized' ? '40px' : '80px',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 40px',
          transition: 'margin-bottom 0.8s ease'
        }}>
          <div style={{
            fontSize: '1.8em',
            maxWidth: '900px',
            lineHeight: '1.5',
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            border: '2px solid #374151'
          }}>
            {currentPhase === 'typing' && (
              <span>
                {typedText}
                <span style={{ 
                  animation: 'blink 1s infinite', 
                  marginLeft: '2px',
                  color: '#60a5fa'
                }}>|</span>
              </span>
            )}
            {currentPhase === 'parsing' && renderSentenceWithHighlights()}
            {currentPhase === 'tokenized' && (
              <div style={{ fontSize: '0.9em' }}>
                {tokens.map((token, i) => (
                  <span key={i} style={{
                    backgroundColor: tokenColors[i % tokenColors.length],
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    margin: '4px',
                    display: 'inline-block',
                    fontWeight: 'bold',
                    transform: 'scale(1)',
                    transition: 'all 0.5s ease'
                  }}>
                    {token}
                  </span>
                ))}
              </div>
            )}
          </div>
        </animated.div>

        {/* Transition Bridge Section */}
        {currentPhase === 'tokenized' && (
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            opacity: flowStep >= 0 ? 1 : 0,
            transform: flowStep >= 0 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease'
          }}>
            <div style={{
              fontSize: '1.4em',
              color: '#60a5fa',
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              ↓
            </div>
            <p style={{
              fontSize: '1.2em',
              color: '#9ca3af',
              marginBottom: '0'
            }}>
              Now let's see how each token flows through the pipeline
            </p>
          </div>
        )}

        {/* Token Flow Section with Animation */}
        {currentPhase === 'tokenized' && tokens && tokens.length > 0 && (
          <div className="token-flow-section" style={{
            marginBottom: '40px',
            padding: '0 40px',
            opacity: flowStep >= 0 ? 1 : 0,
            transform: flowStep >= 0 ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease 0.5s'
          }}>
            <h3 style={{
              textAlign: 'center',
              marginBottom: '50px',
              color: '#60a5fa',
              fontSize: '2.2em',
              opacity: flowStep >= 0 ? 1 : 0,
              transform: flowStep >= 0 ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.8s ease 0.8s'
            }}>
              Token → ID → Embedding Flow
            </h3>
            
            {/* Animated Pipeline - Full Width */}
            <div style={{
              width: '100%',
              padding: '40px 20px',
              background: '#0f172a',
              borderRadius: '16px',
              border: '2px solid #1e293b',
              boxSizing: 'border-box',
              transform: flowStep >= 0 ? 'scale(1)' : 'scale(0.98)',
              transition: 'all 0.8s ease 1s'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '0',
                gap: '30px',
                width: '100%'
              }}>
                {tokens.slice(0, 5).map((token, index) => (
                  <div key={index} className={`token-column ${index < 3 ? 'tokens-section' : index >= tokens.length - 3 ? 'embeddings-section' : ''}`} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '180px',
                    fontFamily: 'monospace',
                    position: 'relative',
                    opacity: flowStep >= 0 ? 1 : 0,
                    transform: flowStep >= 0 ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.6s ease ${1.2 + index * 0.1}s`
                  }}>
                      {/* Token */}
                      <div 
                        ref={index === 2 ? tokenStepRef : null}
                        style={{
                          background: tokenColors[index % tokenColors.length],
                          color: 'white',
                          padding: '12px 18px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '1.3em',
                          marginBottom: '20px',
                          border: '2px solid rgba(255,255,255,0.2)',
                          textAlign: 'center',
                          minWidth: '90px',
                          transition: 'all 0.5s ease',
                          boxShadow: flowStep >= 0 ? '0 4px 8px rgba(0,0,0,0.3)' : 'none'
                        }}>
                        {token}
                      </div>                    {/* Animated Flow Line 1 - With Drawing Effect */}
                    <div style={{
                      width: '3px',
                      height: flowStep >= 1 ? '60px' : '0px',
                      background: flowStep >= 1 ? '#60a5fa' : '#6b7280',
                      marginBottom: '15px',
                      position: 'relative',
                      transition: 'height 1.5s ease-out, background 0.5s ease',
                      animation: flowStep === 1 ? 'drawArrow 1.5s ease-out' : 'none'
                    }}>
                      {/* Flowing particle */}
                      {flowStep === 1 && (
                        <div style={{
                          position: 'absolute',
                          width: '8px',
                          height: '8px',
                          background: '#60a5fa',
                          borderRadius: '50%',
                          left: '-3px',
                          animation: 'flowDown1 1s ease-in-out',
                          boxShadow: '0 0 10px #60a5fa'
                        }} />
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '-3px',
                        left: '-3px',
                        width: '8px',
                        height: '8px',
                        background: flowStep >= 1 ? '#60a5fa' : '#6b7280',
                        transform: 'rotate(45deg)',
                        transition: 'all 0.5s ease',
                        opacity: flowStep >= 1 ? 1 : 0
                      }} />
                    </div>

                    {/* Token ID */}
                    <div 
                      ref={index === 2 ? idStepRef : null}
                      style={{
                        background: flowStep >= 2 ? '#374151' : '#2d3748',
                        color: flowStep >= 2 ? '#d1d5db' : '#6b7280',
                        padding: '14px 16px',
                        borderRadius: '6px',
                        fontSize: '1.2em',
                        marginBottom: '20px',
                        border: `1px solid ${flowStep >= 2 ? '#4b5563' : '#374151'}`,
                        textAlign: 'center',
                        minWidth: '110px',
                        transform: flowStep >= 2 ? 'scale(1)' : 'scale(0.8)',
                        transition: 'all 0.5s ease'
                      }}>
                      ID: {inputIds && inputIds[index] ? inputIds[index] : 'N/A'}
                    </div>

                    {/* Animated Flow Line 2 - With Drawing Effect */}
                    <div style={{
                      width: '3px',
                      height: flowStep >= 3 ? '60px' : '0px',
                      background: flowStep >= 3 ? '#60a5fa' : '#6b7280',
                      marginBottom: '15px',
                      position: 'relative',
                      transition: 'height 1.5s ease-out, background 0.5s ease',
                      animation: flowStep === 3 ? 'drawArrow 1.5s ease-out' : 'none'
                    }}>
                      {/* Flowing particle */}
                      {flowStep === 3 && (
                        <div style={{
                          position: 'absolute',
                          width: '8px',
                          height: '8px',
                          background: '#60a5fa',
                          borderRadius: '50%',
                          left: '-3px',
                          animation: 'flowDown2 1s ease-in-out',
                          boxShadow: '0 0 10px #60a5fa'
                        }} />
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '-3px',
                        left: '-3px',
                        width: '8px',
                        height: '8px',
                        background: flowStep >= 3 ? '#60a5fa' : '#6b7280',
                        transform: 'rotate(45deg)',
                        transition: 'all 0.5s ease',
                        opacity: flowStep >= 3 ? 1 : 0
                      }} />
                    </div>

                    {/* Embedding */}
                    <div 
                      ref={index === 2 ? embeddingStepRef : null}
                      style={{
                        background: flowStep >= 4 ? '#1f2937' : 'transparent',
                        color: flowStep >= 4 ? '#9ca3af' : 'transparent',
                        padding: '16px',
                        borderRadius: '6px',
                        fontSize: '1.1em',
                        border: `1px solid ${flowStep >= 4 ? '#374151' : 'transparent'}`,
                        textAlign: 'center',
                        maxWidth: '160px',
                        minHeight: '115px',
                        transform: flowStep >= 4 ? 'scale(1)' : 'scale(0.8)',
                        transition: 'all 0.5s ease',
                        opacity: flowStep >= 4 ? 1 : 0
                      }}>
                      <div style={{ 
                        color: flowStep >= 4 ? '#60a5fa' : 'transparent', 
                        fontWeight: 'bold', 
                        marginBottom: '8px',
                        fontSize: '1.15em',
                        transition: 'all 0.5s ease'
                      }}>
                        Embedding
                      </div>
                      {flowStep >= 4 ? (
                        embeddings && embeddings[index] ? (
                          <div style={{ lineHeight: '1.3' }}>
                            <div style={{ 
                              fontSize: '0.85em',
                              color: '#d1d5db',
                              marginBottom: '2px'
                            }}>
                              [
                            </div>
                            {/* First 3 values */}
                            {embeddings[index].slice(0, 3).map((val, i) => (
                              <div key={i} style={{ 
                                fontSize: '0.75em',
                                color: '#ffffff',
                                paddingLeft: '8px'
                              }}>
                                {val.toFixed(2)},
                              </div>
                            ))}
                            {/* Ellipsis */}
                            <div style={{ 
                              color: '#6b7280', 
                              fontSize: '0.7em',
                              paddingLeft: '8px'
                            }}>
                              ...
                            </div>
                            {/* Last 2 values */}
                            {embeddings[index].slice(-2).map((val, i) => (
                              <div key={`last-${i}`} style={{ 
                                fontSize: '0.75em',
                                color: '#ffffff',
                                paddingLeft: '8px'
                              }}>
                                {val.toFixed(2)}{i === 1 ? '' : ','}
                              </div>
                            ))}
                            <div style={{ 
                              fontSize: '0.75em',
                              color: '#d1d5db'
                            }}>
                              ]
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '0.9em',
                            fontStyle: 'italic'
                          }}>
                            No data
                          </div>
                        )
                      ) : (
                        <div style={{ 
                          color: 'transparent', 
                          fontSize: '0.9em',
                          fontStyle: 'italic'
                        }}>
                          Loading...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes flowDown1 {
          0% {
            top: -10px;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 70px;
            opacity: 0;
          }
        }
        
        @keyframes flowDown2 {
          0% {
            top: -10px;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 70px;
            opacity: 0;
          }
        }
        
        @keyframes drawArrow {
          0% {
            height: 0px;
          }
          100% {
            height: 60px;
          }
        }
        
        /* Main site scrollbar */
        html {
          overflow-x: hidden;
          overflow-y: auto;
        }
        
        body {
          overflow-x: hidden;
          overflow-y: auto;
          margin: 0;
          padding: 0;
        }
        
        body::-webkit-scrollbar {
          width: 16px;
        }
        
        body::-webkit-scrollbar-track {
          background: #111827;
        }
        
        body::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 8px;
          border: 2px solid #111827;
        }
        
        body::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        
        /* Root element scrollbar */
        #root {
          overflow-x: hidden;
          overflow-y: auto;
        }
        
        #root::-webkit-scrollbar {
          width: 16px;
        }
        
        #root::-webkit-scrollbar-track {
          background: #111827;
        }
        
        #root::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 8px;
          border: 2px solid #111827;
        }
        
        #root::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </>
  );
};
