import React, { useEffect, useState } from "react";

/**
 * Web-based softmax process visualization (no Three.js)
 * 
 * Shows the complete softmax transformation process with animated flow:
 * Stage 1: Raw logits (pre-softmax outputs from attention + FFN)
 * Stage 2: Softmax transformation animation  
 * Stage 3: Final probability distribution with temperature control
 */
export const SoftmaxViewWeb = ({ nextToken }) => {
  const [flowStep, setFlowStep] = useState(0); // 0: logits, 1: arrow to transform, 2: transformation, 3: arrow to probs, 4: probabilities
  const [temperature, setTemperature] = useState(1.0);
  const [scanning85Percent, setScanning85Percent] = useState(false); // Actually 90% now - controls when probabilities appear

  // Refs for scrolling to each step
  const transformationStepRef = React.useRef(null);
  const probabilitiesStepRef = React.useRef(null);
  const probGraphRef = React.useRef(null);

  // Colors for different tokens
  const tokenColors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // Start the flow animation sequence when data loads
  useEffect(() => {
    if (nextToken?.probs) {
      setFlowStep(0);
      setScanning85Percent(false);
      
      // Immediately scroll to center the network animation
      setTimeout(() => {
        setFlowStep(1);
        if (transformationStepRef.current) {
          transformationStepRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500);
      
      // Stage 2: Start softmax processing animation with lines
      setTimeout(() => {
        setFlowStep(2);
      }, 1000);
      
      // Mark 90% scanning complete - probabilities can start appearing
      setTimeout(() => {
        setScanning85Percent(true);
      }, 2800); // 90% of 2s + 1s start delay = 2.8s
      
      // Mark scanning as complete 
      setTimeout(() => {
        // Animation completes
      }, 3000); // Full 2s animation + 1s start delay
      
      // Stage 3: Show probabilities after scanning completes
      setTimeout(() => {
        setFlowStep(3);
      }, 3200);
      
      // Stage 4: Final stage with results and scroll (wait 2 seconds after probabilities appear)
      setTimeout(() => {
        setFlowStep(4);
        // Wait a bit for the element to render, then scroll
        setTimeout(() => {
          if (probabilitiesStepRef.current) {
            probabilitiesStepRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 300); // Small delay to ensure element is rendered
      }, 5200); // Wait 2 seconds after probabilities appear (3200 + 2000)
    }
  }, [nextToken]);

  // Apply temperature scaling to probabilities
  const applyTemperature = (probs, temp) => {
    if (temp === 1.0) return probs;
    const logits = probs.map(p => Math.log(p.prob + 1e-12) / temp);
    const maxLogit = Math.max(...logits);
    const exp = logits.map(l => Math.exp(l - maxLogit));
    const sumExp = exp.reduce((a, b) => a + b, 0);
    return probs.map((p, i) => ({
      ...p,
      prob: exp[i] / sumExp
    }));
  };

  if (!nextToken || !nextToken.probs) {
    return (
      <div style={{ 
        color: '#f87171', 
        textAlign: 'center', 
        padding: '40px',
        fontSize: '1.2em',
        backgroundColor: '#111827',
        minHeight: '100vh',
        fontFamily: 'monospace'
      }}>
        No softmax data available
      </div>
    );
  }

  const tempProbs = applyTemperature(nextToken.probs, temperature);

  return (
    <>
      <div className="softmax-web-view" style={{
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
            Softmax Transformation
          </h2>
          <p style={{
            fontSize: '1.4em',
            color: '#9ca3af',
            maxWidth: '900px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Watch how raw logits from the neural network get transformed into probabilities through the softmax function.
          </p>
        </div>



        {/* Softmax Flow Section with Animation */}
        <div className="softmax-flow-section" style={{
          marginBottom: '40px',
          padding: '0 40px',
          opacity: flowStep >= 0 ? 1 : 0,
          transform: flowStep >= 0 ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s ease 0.5s'
        }}>
          
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
            
            <h3 style={{
              textAlign: 'center',
              marginBottom: '60px',
              color: '#f59e0b',
              fontSize: '2.8em',
              opacity: flowStep >= 0 ? 1 : 0,
              transform: flowStep >= 0 ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.8s ease 0.8s',
              fontWeight: 'bold',
              textShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
            }}>
              Logits → Softmax → Probabilities Flow
            </h3>
            


            {/* Stage 2: Network Connection Animation */}
            <div 
              ref={transformationStepRef}
              style={{
                marginBottom: '40px',
                opacity: flowStep >= 2 ? 1 : 0,
                transform: flowStep >= 2 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease'
              }}
            >

              {/* Network Visualization */}
              <div ref={probGraphRef} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '40px',
                backgroundColor: '#1f2937',
                borderRadius: '16px',
                border: '2px solid #374151',
                position: 'relative',
                minHeight: '400px',
                overflow: 'hidden'
              }}>
                {/* Raw Logits (Left Side) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  zIndex: 2
                }}>
                  <h5 style={{
                    color: '#f59e0b',
                    fontSize: '1.3em',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    RAW LOGITS
                  </h5>
                  {nextToken.probs.slice(0, 6).map((item, i) => (
                    <div key={`logit-${i}`} style={{
                      background: `linear-gradient(135deg, ${tokenColors[i % tokenColors.length]}44, ${tokenColors[i % tokenColors.length]}22)`,
                      border: `2px solid ${tokenColors[i % tokenColors.length]}`,
                      borderRadius: '12px',
                      padding: '12px 16px',
                      minWidth: '140px',
                      textAlign: 'center',
                      position: 'relative',
                      animation: `fadeInLeft 0.6s ease ${i * 0.1}s both`
                    }}>
                      <div style={{
                        fontSize: '0.9em',
                        color: tokenColors[i % tokenColors.length],
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}>
                        "{item.token}"
                      </div>
                      <div style={{
                        fontSize: '1.1em',
                        color: '#ffffff',
                        fontFamily: 'monospace'
                      }}>
                        {(item.logit || Math.random() * 10 - 5).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Animated Connection Lines */}
                <svg 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                  viewBox="0 0 600 400"
                >
                  {/* Generate connection lines - Sequential animation within 1.2s */}
                  {flowStep >= 2 && nextToken.probs.slice(0, 6).map((fromItem, fromIndex) => 
                    nextToken.probs.slice(0, 6).map((toItem, toIndex) => {
                      const fromX = 140; // Right edge of logit boxes
                      const fromY = 80 + fromIndex * 60; // Position of logit
                      const toX = 460; // Left edge of probability boxes  
                      const toY = 80 + toIndex * 60; // Position of probability
                      
                      // Sequential animation: go one after the other, complete all 36 connections in 2s
                      const linearIndex = fromIndex * 6 + toIndex;
                      const totalConnections = 36; // 6x6 = 36 total connections
                      const animationDelay = (linearIndex / totalConnections) * 2.0; // Spread evenly across 2s
                      
                      return (
                        <line
                          key={`connection-${fromIndex}-${toIndex}`}
                          x1={fromX}
                          y1={fromY}
                          x2={toX}
                          y2={toY}
                          stroke={flowStep >= 2 ? '#ef4444' : 'transparent'}
                          strokeWidth="2"
                          opacity="0.6"
                          style={{
                            animation: `drawLineSlow 0.1s ease ${animationDelay}s both`,
                            filter: 'drop-shadow(0 0 3px #ef4444)'
                          }}
                        />
                      );
                    })
                  )}
                </svg>

                {/* Processing Animation Overlay */}
                {flowStep >= 2 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 4,
                    textAlign: 'center',
                    pointerEvents: 'none',
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    padding: '15px 25px',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{
                      fontSize: '1.3em',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      textShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
                      marginBottom: '8px'
                    }}>
                      APPLYING SOFTMAX
                    </div>
                    <div style={{
                      fontSize: '1.4em',
                      color: '#60a5fa',
                      fontFamily: 'serif',
                      fontStyle: 'italic',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      lineHeight: '1.4'
                    }}>
                      <div style={{ 
                        borderBottom: '2px solid #60a5fa', 
                        paddingBottom: '6px', 
                        marginBottom: '6px',
                        fontSize: '1.1em'
                      }}>
                        e<sup>zi</sup>
                      </div>
                      <div style={{ fontSize: '1.1em' }}>
                        Σe<sup>zj</sup>
                      </div>
                    </div>
                  </div>
                )}

                {/* Probabilities (Right Side) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  zIndex: 2
                }}>
                  <h5 style={{
                    color: '#10b981',
                    fontSize: '1.3em',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    PROBABILITY
                  </h5>
                  {tempProbs.slice(0, 6).map((item, i) => (
                    <div key={`prob-${i}`} style={{
                      background: `linear-gradient(135deg, #10b98133, #10b98111)`,
                      border: `2px solid #10b981`,
                      borderRadius: '12px',
                      padding: '12px 16px',
                      minWidth: '140px',
                      textAlign: 'center',
                      position: 'relative',
                      animation: `fadeInRight 0.6s ease ${i * 0.1 + 2}s both`,
                      opacity: scanning85Percent ? 1 : 0,
                      transform: scanning85Percent ? 'translateX(0)' : 'translateX(30px)',
                      transition: `all 0.8s ease ${i * 0.1}s`
                    }}>
                      <div style={{
                        fontSize: '0.9em',
                        color: '#10b981',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}>
                        "{item.token}"
                      </div>
                      <div style={{
                        fontSize: '1.1em',
                        color: '#ffffff',
                        fontWeight: 'bold'
                      }}>
                        {(item.prob * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Flow Arrow */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                width: '3px',
                height: flowStep >= 3 ? '60px' : '0px',
                background: flowStep >= 3 ? '#f59e0b' : '#6b7280',
                position: 'relative',
                transition: 'height 1.5s ease-out, background 0.5s ease',
                animation: flowStep === 3 ? 'drawArrow 1.5s ease-out' : 'none'
              }}>
                {/* Flowing light effect */}
                {flowStep === 3 && (
                  <div style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    background: '#f59e0b',
                    borderRadius: '50%',
                    left: '-3px',
                    animation: 'flowDown2 1s ease-in-out',
                    boxShadow: '0 0 10px #f59e0b'
                  }} />
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '-3px',
                  left: '-3px',
                  width: '8px',
                  height: '8px',
                  background: flowStep >= 3 ? '#f59e0b' : '#6b7280',
                  transform: 'rotate(45deg)',
                  transition: 'all 0.5s ease',
                  opacity: flowStep >= 3 ? 1 : 0
                }} />
              </div>
            </div>

            {/* Stage 4: Final Results */}
            <div 
              ref={probabilitiesStepRef}
              style={{
                opacity: flowStep >= 4 ? 1 : 0,
                transform: flowStep >= 4 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease'
              }}
            >
              <h4 style={{
                fontSize: '1.8em',
                color: '#10b981',
                marginBottom: '30px',
                textAlign: 'center',
                textShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
              }}>
                Final Probability Distribution
              </h4>

              {/* Temperature Control & Graph */}
              <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px',
                border: '2px solid #374151'
              }}>
                {/* Temperature Slider */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '30px'
                }}>
                  <label style={{
                    fontSize: '1.2em',
                    color: '#f59e0b',
                    marginRight: '15px'
                  }}>
                    Temperature: <span style={{ fontWeight: 'bold' }}>{temperature.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.01"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    style={{
                      width: '200px',
                      height: '6px',
                      background: '#374151',
                      borderRadius: '3px',
                      outline: 'none',
                      verticalAlign: 'middle'
                    }}
                  />
                  <div style={{
                    fontSize: '0.9em',
                    color: '#9ca3af',
                    marginTop: '10px'
                  }}>
                    Lower = more confident, Higher = more random
                  </div>
                </div>
                
                {/* Probability Bar Chart with Grid Lines */}
                <div style={{
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'space-around',
                  height: '200px',
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  padding: '20px',
                  border: '1px solid #374151',
                  position: 'relative',
                  backgroundImage: `
                    linear-gradient(to right, rgba(55, 65, 81, 0.3) 1px, transparent 1px),
                    linear-gradient(to top, rgba(55, 65, 81, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '12.5% 25%'
                }}>
                  {/* Y-axis labels */}
                  <div style={{
                    position: 'absolute',
                    left: '5px',
                    top: '20px',
                    bottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontSize: '0.8em',
                    color: '#9ca3af',
                    pointerEvents: 'none'
                  }}>
                    <div>100%</div>
                    <div>75%</div>
                    <div>50%</div>
                    <div>25%</div>
                    <div>0%</div>
                  </div>
                  
                  {tempProbs.slice(0, 8).map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                      maxWidth: '80px',
                      height: '160px',
                      justifyContent: 'flex-end',
                      position: 'relative'
                    }}>
                      {/* Percentage label above bar */}
                      <div style={{
                        fontSize: '0.9em',
                        color: '#ffffff',
                        marginBottom: '8px',
                        fontWeight: 'bold',
                        position: 'absolute',
                        top: `${160 - (item.prob * 160) - 25}px`,
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}>
                        {(item.prob * 100).toFixed(1)}%
                      </div>
                      
                      {/* Bar that starts from bottom */}
                      <div style={{
                        width: '40px',
                        height: `${Math.max(item.prob * 160, 2)}px`,
                        backgroundColor: tokenColors[i % tokenColors.length],
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 1s ease',
                        boxShadow: `0 0 10px ${tokenColors[i % tokenColors.length]}33`,
                        alignSelf: 'center'
                      }} />
                    </div>
                  ))}
                  
                  {/* Token labels at bottom - separate layer */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '20px',
                    right: '20px',
                    display: 'flex',
                    justifyContent: 'space-around'
                  }}>
                    {tempProbs.slice(0, 8).map((item, i) => (
                      <div key={`label-${i}`} style={{
                        fontSize: '0.8em',
                        color: tokenColors[i % tokenColors.length],
                        fontWeight: 'bold',
                        textAlign: 'center',
                        wordBreak: 'break-all',
                        maxWidth: '60px',
                        flex: 1
                      }}>
                        "{item.token}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Final Result Box */}
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                border: '2px solid #10b981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{
                  fontSize: '1.3em',
                  color: '#9ca3af',
                  marginBottom: '10px'
                }}>
                  Most Likely Next Token:
                </div>
                <div style={{
                  fontSize: '2.5em',
                  color: '#10b981',
                  fontWeight: 'bold',
                  textShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
                }}>
                  "{nextToken.token}"
                </div>
                <div style={{
                  fontSize: '1.2em',
                  color: '#60a5fa',
                  marginTop: '10px'
                }}>
                  {(tempProbs[0]?.prob * 100 || 0).toFixed(1)}% confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes drawLine {
          0% {
            stroke-dasharray: 300;
            stroke-dashoffset: 300;
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            stroke-dasharray: 300;
            stroke-dashoffset: 0;
            opacity: 0.7;
          }
        }

        @keyframes drawLineSlow {
          0% {
            stroke-dasharray: 400;
            stroke-dashoffset: 400;
            opacity: 0;
          }
          20% {
            opacity: 0.3;
          }
          60% {
            opacity: 0.8;
          }
          100% {
            stroke-dasharray: 400;
            stroke-dashoffset: 0;
            opacity: 0.6;
          }
        }

        @keyframes scanEffect {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          80% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
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

        /* Custom slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }

        /* Main site scrollbar - matching tokenization page */
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
        
        /* Root element scrollbar - matching tokenization page */
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
