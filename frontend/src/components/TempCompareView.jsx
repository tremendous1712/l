import React, { useState, useEffect, useRef } from "react";
import { fetchNextToken } from "../api";
import { useSpring, animated } from "@react-spring/web";

/**
 * TempCompareView: Side-by-side temperature comparison for LLM next-token generation
 *
 * @param {Object} props
 * @param {string} props.seedText - The initial seed text to use for both panels
 * @param {string[]} props.tokens - Array of tokenized strings  
 * @param {number} props.layer - Current layer index
 */
export const TempCompareView = ({ seedText, tokens, layer }) => {
  const [leftTemp, setLeftTemp] = useState(1.0);
  const [rightTemp, setRightTemp] = useState(3.0);
  const [leftTokens, setLeftTokens] = useState([]);
  const [rightTokens, setRightTokens] = useState([]);
  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);
  
  // Animation states
  const [leftPhase, setLeftPhase] = useState('typing');
  const [rightPhase, setRightPhase] = useState('typing');
  const [leftTypedText, setLeftTypedText] = useState('');
  const [rightTypedText, setRightTypedText] = useState('');

  // Generation control refs to cancel ongoing generations
  const leftGenerationRef = useRef(null);
  const rightGenerationRef = useRef(null);

  const tokenColors = ['#4f46e5', '#059669', '#dc2626', '#7c2d12', '#9333ea', '#0891b2'];

  // Animation for typing effect - left panel
  const leftTextSpring = useSpring({
    opacity: leftPhase === 'complete' ? 0.8 : 1,
    transform: leftPhase === 'complete' ? 'translateY(-10px)' : 'translateY(0px)',
    config: { tension: 200, friction: 25 }
  });

  // Animation for typing effect - right panel  
  const rightTextSpring = useSpring({
    opacity: rightPhase === 'complete' ? 0.8 : 1,
    transform: rightPhase === 'complete' ? 'translateY(-10px)' : 'translateY(0px)',
    config: { tension: 200, friction: 25 }
  });

  // Helper to animate typing and token generation for LEFT panel
  const generateLeftPanelTokens = async () => {
    // Create a unique generation ID to prevent race conditions
    const generationId = Date.now() + Math.random();
    leftGenerationRef.current = generationId;
    
    setLeftLoading(true);
    setLeftPhase('typing');
    setLeftTypedText('');
    setLeftTokens([]);
    
    // Type the seed text character by character
    for (let i = 0; i <= seedText.length; i++) {
      // Check if this generation was cancelled
      if (leftGenerationRef.current !== generationId) return;
      
      setLeftTypedText(seedText.slice(0, i));
      await new Promise(res => setTimeout(res, 30));
    }
    
    // Check if this generation was cancelled
    if (leftGenerationRef.current !== generationId) return;
    
    setLeftPhase('generating');
    await new Promise(res => setTimeout(res, 300));
    
    let currentText = seedText;
    const finalTokens = [];
    const maxLines = 5; // Should be 5 lines for left panel
    const maxTokens = 80; // Should be 80 tokens for left panel
    let periodCount = 0;

    for (let i = 0; i < maxTokens && periodCount < maxLines; i++) {
      if (leftGenerationRef.current !== generationId) return;

      const data = await fetchNextToken(currentText, leftTemp);
      if (!data || !data.token) {
        console.log('No data or token received, breaking generation');
        break;
      }

      let token = data.token;

      // Treat special tokens as sentence endings, but add a visible marker
      if (token.includes('<|') && token.includes('|>')) {
        console.log('Special token detected, treating as period:', token);
        periodCount++;
        finalTokens.push(' ¶'); // Add a visible marker for endoftext
        setLeftTokens([...finalTokens]);
        break; // End generation on special token
      }

      // Add proper spacing for tokens that don't start with space
      let displayToken = token;
      if (!token.startsWith(' ') && finalTokens.length > 0) {
        const lastToken = finalTokens[finalTokens.length - 1];
        const isPunctuation = /^[.,!?;:'")\]}]/.test(token);
        const lastCharIsPunctuation = /[({["']$/.test(lastToken.trim());
        if (!lastToken.endsWith(' ') && !isPunctuation && !lastCharIsPunctuation) {
          displayToken = ' ' + token;
        }
      }

      currentText += displayToken;
      finalTokens.push(displayToken);
      if (leftGenerationRef.current !== generationId) return;
      setLeftTokens([...finalTokens]);

      // Count sentence endings more carefully
      if ((token === "." || token === "!" || token === "?") && finalTokens.length > 3) {
        periodCount++;
      } else if (token.includes('\n')) {
        periodCount++;
      }

      await new Promise(res => setTimeout(res, 400));
    }

    if (leftGenerationRef.current !== generationId) return;
    setLeftPhase('complete');
    setLeftLoading(false);
  };

  // Helper to animate typing and token generation for RIGHT panel
  const generateRightPanelTokens = async () => {
    // Create a unique generation ID to prevent race conditions
    const generationId = Date.now() + Math.random();
    rightGenerationRef.current = generationId;
    
    setRightLoading(true);
    setRightPhase('typing');
    setRightTypedText('');
    setRightTokens([]);
    
    // Type the seed text character by character
    for (let i = 0; i <= seedText.length; i++) {
      // Check if this generation was cancelled
      if (rightGenerationRef.current !== generationId) return;
      
      setRightTypedText(seedText.slice(0, i));
      await new Promise(res => setTimeout(res, 30));
    }
    
    // Check if this generation was cancelled
    if (rightGenerationRef.current !== generationId) return;
    
    setRightPhase('generating');
    await new Promise(res => setTimeout(res, 300));
    
    let currentText = seedText;
    const finalTokens = [];
    const maxLines = 8; // 8 lines for right panel
    const maxTokens = 120; // 120 tokens for right panel
    let periodCount = 0;

    for (let i = 0; i < maxTokens && periodCount < maxLines; i++) {
      if (rightGenerationRef.current !== generationId) return;

      const data = await fetchNextToken(currentText, rightTemp);
      if (!data || !data.token) {
        console.log('No data or token received, breaking generation');
        break;
      }

      let token = data.token;

      // Treat special tokens as sentence endings, but add a visible marker
      if (token.includes('<|') && token.includes('|>')) {
        console.log('Special token detected, treating as period:', token);
        periodCount++;
        finalTokens.push(' ¶');
        setRightTokens([...finalTokens]);
        break;
      }

      let displayToken = token;
      if (!token.startsWith(' ') && finalTokens.length > 0) {
        const lastToken = finalTokens[finalTokens.length - 1];
        const isPunctuation = /^[.,!?;:'")\]}]/.test(token);
        const lastCharIsPunctuation = /[({["']$/.test(lastToken.trim());
        if (!lastToken.endsWith(' ') && !isPunctuation && !lastCharIsPunctuation) {
          displayToken = ' ' + token;
        }
      }

      currentText += displayToken;
      finalTokens.push(displayToken);
      if (rightGenerationRef.current !== generationId) return;
      setRightTokens([...finalTokens]);

      if ((token === "." || token === "!" || token === "?") && finalTokens.length > 3) {
        periodCount++;
      } else if (token.includes('\n')) {
        periodCount++;
      }

      await new Promise(res => setTimeout(res, 400));
    }

    if (rightGenerationRef.current !== generationId) return;
    setRightPhase('complete');
    setRightLoading(false);
  };

  // Render highlighted text with tokens
  const renderHighlightedText = (baseText, tokens, isLeft = true) => {
    if (tokens.length === 0) return baseText;
    
    return (
      <span>
        <span style={{ color: '#ccc' }}>{baseText}</span>
        {tokens.map((token, i) => (
          <span
            key={`${isLeft ? 'left' : 'right'}-${i}-${token}`}
            style={{
              backgroundColor: isLeft ? '#38bdf8' : '#f59e42',
              color: 'white',
              padding: '2px 4px',
              borderRadius: '3px',
              margin: '0 1px',
              opacity: 0.9,
              animation: 'fadeIn 0.3s ease-in'
            }}
          >
            {token}
          </span>
        ))}
      </span>
    );
  };

  // On mount or temp change, trigger both generations
  useEffect(() => {
    // Reset all states when seed or temperature changes
    setLeftTokens([]);
    setRightTokens([]);
    setLeftTypedText('');
    setRightTypedText('');
    setLeftPhase('typing');
    setRightPhase('typing');
    setLeftLoading(false);
    setRightLoading(false);
    
    // Start both generations independently with their own functions
    generateLeftPanelTokens();
    generateRightPanelTokens();
    // eslint-disable-next-line
  }, [seedText, leftTemp, rightTemp]);

  return (
    <div className="temp-compare-view" style={{
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
          color: '#f59e0b',
          fontWeight: 'bold',
          textShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
        }}>
          Temperature Comparison
        </h2>
        <p style={{
          fontSize: '1.4em',
          color: '#9ca3af',
          maxWidth: '900px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          See how different temperature values affect text generation creativity and randomness.
        </p>
      </div>

      {/* Comparison Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Left Panel - Lower Temperature */}
        <div style={{ 
          background: "#1f2937", 
          color: "#fff", 
          borderRadius: 16, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", 
          padding: 30, 
          border: '2px solid #374151',
          position: 'relative'
        }}>
          <div style={{
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: "#38bdf8", 
              fontSize: '1.8em',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              Conservative (T={leftTemp.toFixed(2)})
            </h3>
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.05}
              value={leftTemp}
              onChange={e => setLeftTemp(Number(e.target.value))}
              style={{ 
                width: '80%', 
                marginBottom: 20,
                accentColor: '#38bdf8'
              }}
            />
            <div style={{
              fontSize: '0.9em',
              color: '#9ca3af',
              marginBottom: '20px'
            }}>
              Lower temperature = More predictable, focused text
            </div>
          </div>
          
          <div style={{ 
            width: "100%", 
            minHeight: 250, 
            background: "#111827", 
            borderRadius: 12, 
            padding: 20, 
            fontFamily: "monospace", 
            fontSize: 16, 
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)", 
            wordWrap: "break-word", 
            overflowWrap: "break-word",
            position: 'relative',
            lineHeight: '1.6'
          }}>
            <animated.div style={{
              ...leftTextSpring,
              minHeight: '100px',
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
              position: 'relative'
            }}>
              {leftPhase === 'typing' && (
                <span>
                  {leftTypedText}
                  <span style={{ 
                    animation: 'blink 1s infinite', 
                    marginLeft: '2px',
                    color: '#38bdf8'
                  }}>|</span>
                </span>
              )}
              {leftPhase === 'generating' && (
                <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
                  <span style={{ color: '#d1d5db' }}>{seedText}</span>
                  {leftTokens.map((token, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#38bdf8',
                        color: 'white',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        margin: '0 1px',
                        opacity: 0.9,
                        display: 'inline-block',
                        animation: 'fadeIn 0.5s ease-in'
                      }}
                    >
                      {token}
                    </span>
                  ))}
                  {leftLoading && (
                    <span style={{ 
                      color: "#38bdf8", 
                      marginLeft: '8px',
                      animation: 'pulse 1.5s infinite'
                    }}>
                      generating...
                    </span>
                  )}
                </div>
              )}
              {leftPhase === 'complete' && (
                <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
                  <span style={{ color: '#d1d5db' }}>{seedText}</span>
                  {leftTokens.map((token, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#38bdf8',
                        color: 'white',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        margin: '0 1px',
                        opacity: 0.9,
                        display: 'inline-block'
                      }}
                    >
                      {token}
                    </span>
                  ))}
                </div>
              )}
            </animated.div>
          </div>
        </div>
        
        {/* Right Panel - Higher Temperature */}
        <div style={{ 
          background: "#1f2937", 
          color: "#fff", 
          borderRadius: 16, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", 
          padding: 30, 
          border: '2px solid #374151',
          position: 'relative'
        }}>
          <div style={{
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: "#f59e42", 
              fontSize: '1.8em',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              Creative (T={rightTemp.toFixed(2)})
            </h3>
            <input
              type="range"
              min={1.0}
              max={5.0}
              step={0.05}
              value={rightTemp}
              onChange={e => setRightTemp(Number(e.target.value))}
              style={{ 
                width: '80%', 
                marginBottom: 20,
                accentColor: '#f59e42'
              }}
            />
            <div style={{
              fontSize: '0.9em',
              color: '#9ca3af',
              marginBottom: '20px'
            }}>
              Higher temperature = More creative, unpredictable text
            </div>
          </div>
          
          <div style={{ 
            width: "100%", 
            minHeight: 250, 
            background: "#111827", 
            borderRadius: 12, 
            padding: 20, 
            fontFamily: "monospace", 
            fontSize: 16, 
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)", 
            wordWrap: "break-word", 
            overflowWrap: "break-word",
            position: 'relative',
            lineHeight: '1.6'
          }}>
            <animated.div style={{
              ...rightTextSpring,
              minHeight: '100px',
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
              position: 'relative'
            }}>
              {rightPhase === 'typing' && (
                <span>
                  {rightTypedText}
                  <span style={{ 
                    animation: 'blink 1s infinite', 
                    marginLeft: '2px',
                    color: '#f59e42'
                  }}>|</span>
                </span>
              )}
              {rightPhase === 'generating' && (
                <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
                  <span style={{ color: '#d1d5db' }}>{seedText}</span>
                  {rightTokens.map((token, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#f59e42',
                        color: 'white',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        margin: '0 1px',
                        opacity: 0.9,
                        display: 'inline-block',
                        animation: 'fadeIn 0.5s ease-in'
                      }}
                    >
                      {token}
                    </span>
                  ))}
                  {rightLoading && (
                    <span style={{ 
                      color: "#f59e42", 
                      marginLeft: '8px',
                      animation: 'pulse 1.5s infinite'
                    }}>
                      generating...
                    </span>
                  )}
                </div>
              )}
              {rightPhase === 'complete' && (
                <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
                  <span style={{ color: '#d1d5db' }}>{seedText}</span>
                  {rightTokens.map((token, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#f59e42',
                        color: 'white',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        margin: '0 1px',
                        opacity: 0.9,
                        display: 'inline-block'
                      }}
                    >
                      {token}
                    </span>
                  ))}
                </div>
              )}
            </animated.div>
          </div>
        </div>
      </div>
      
      {/* CSS Styles */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 0.9; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #374151;
          border-radius: 3px;
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};
