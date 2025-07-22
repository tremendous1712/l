import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/**
 * Comprehensive Transformer Block Explainer with integrated attention and residual stream
 * Shows all key concepts: Self-Attention, Residual Connections, LayerNorm, FFN, and Layer Stacking
 * 
 * Props:
 * - blockIndex: number (for labeling)
 * - sentence: string (input to visualize)
 * - attention: attention weights from backend
 * - tokens: tokenized input
 */
export const TransformerBlockVisualizer = ({ blockIndex = 1, sentence, attention, tokens: propTokens }) => {
  const [flowStep, setFlowStep] = useState(0);
  const [attentionData, setAttentionData] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [showLayers, setShowLayers] = useState(false);
  const [layer, setLayer] = useState(0);
  const [head, setHead] = useState(0);
  
  // Attention scanning animation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanningPosition, setScanningPosition] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [scanPass, setScanPass] = useState(0); // Track current pass within a layer
  
  // Embedding evolution state
  const [embeddingVectors, setEmbeddingVectors] = useState([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  
  // Residual stream state
  const [chartData, setChartData] = useState([]);
  const [residualTokens, setResidualTokens] = useState([]);

  // Refs for autoscroll
  const attentionRef = React.useRef(null);
  const residualRef = React.useRef(null);
  const ffnRef = React.useRef(null);

  // Autoscroll function
  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  // Fetch residual stream data
  useEffect(() => {
    const fetchResiduals = async () => {
      if (!sentence) return;
      
      try {
        console.log("🔵 Sending sentence to backend for residual stream:", sentence);

        const res = await axios.post("http://localhost:8000/residual_stream", {
          text: sentence,
        });

        console.log("Raw residual stream response:", res.data);

        const { layer_values, tokens: resTokens } = res.data;

        if (
          !layer_values ||
          !Array.isArray(layer_values) ||
          layer_values.length === 0
        ) {
          console.warn("No residual data returned");
          setChartData([]);
          setResidualTokens([]);
          return;
        }

        const numLayers = layer_values[0]?.length || 0;

        const formatted = Array.from({ length: numLayers }, (_, layerIdx) => {
          const point = { layer: layerIdx };
          resTokens.forEach((_, tokenIdx) => {
            point[`token_${tokenIdx}`] = layer_values[tokenIdx][layerIdx];
          });
          return point;
        });

        setChartData(formatted);
        setResidualTokens(resTokens);
      } catch (err) {
        console.error("Error loading residuals:", err);
        setChartData([]);
        setResidualTokens([]);
      }
    };

    if (sentence) fetchResiduals();
  }, [sentence]);

  // Fetch embedding vectors for different transformer blocks from the backend
  const fetchEmbeddingForBlock = async (blockIndex) => {
    if (!sentence) return [];
    
    try {
      console.log(`🔵 Fetching REAL embeddings for layer ${blockIndex}:`, sentence);
      
      const res = await axios.post("http://localhost:8000/embeddings", {
        text: sentence,
        layer: blockIndex
      });

      console.log(`✅ Real embeddings response for layer ${blockIndex}:`, res.data);
      
      // Return the actual embedding vectors for each token from GPT-2
      if (res.data && res.data.embeddings) {
        console.log(`📊 Received ${res.data.embeddings.length} REAL embedding vectors from GPT-2`);
        return res.data.embeddings;
      } else {
        console.warn(`⚠️ No embeddings in response for layer ${blockIndex}:`, res.data);
        return [];
      }
    } catch (err) {
      console.error(`❌ Error loading REAL embeddings for layer ${blockIndex}:`, err);
      console.error(`❌ Error details:`, err.response?.data || err.message);
      return [];
    }
  };

  // Set up attention and token data
  useEffect(() => {
    if (propTokens && propTokens.length > 0) {
      setTokens(propTokens.slice(0, 6)); // Limit for visualization
    } else if (sentence) {
      const mockTokens = sentence.split(' ').slice(0, 6);
      setTokens(mockTokens);
    }

    if (attention && attention.length > 0) {
      setAttentionData(attention);
    } else if (sentence) {
      // Generate mock attention for demo
      const tokensForAttention = propTokens?.slice(0, 6) || sentence.split(' ').slice(0, 6);
      const mockAttention = tokensForAttention.map(() => 
        tokensForAttention.map(() => Math.random() * 0.8 + 0.1)
      );
      setAttentionData([[mockAttention]]); // Wrap in layer and head structure
    }
  }, [sentence, attention, propTokens]);

  // Start the flow animation sequence
  useEffect(() => {
    if (sentence) {
      setFlowStep(0);
      setShowLayers(false);
      setIsScanning(false);
      setShowHeatmap(false);
      setScanningPosition(0);
      setCurrentBlockIndex(0);
      setEmbeddingVectors([]); // Start with empty embeddings
      setScanPass(0);
      
      // Load initial layer 0 embeddings to avoid showing all zeros
      const loadInitialEmbeddings = async () => {
        const initialEmbeddings = await fetchEmbeddingForBlock(0);
        if (initialEmbeddings && initialEmbeddings.length > 0) {
          setEmbeddingVectors(initialEmbeddings.slice(0, 5)); // Show first 5 tokens
          console.log("🎯 Loaded initial layer 0 embeddings:", initialEmbeddings.slice(0, 5));
        }
      };
      
      // Load initial embeddings first
      loadInitialEmbeddings();
      
      // Start scanning animation with back-and-forth movement
      const startScanning = async () => {
        setFlowStep(1);
        setIsScanning(true);
        
        let currentLayer = 0;
        let direction = 1; // 1 for forward, -1 for backward
        
        // Scan 5 times (layers 0-4)
        for (let scanCount = 0; scanCount < 5; scanCount++) {
          setCurrentBlockIndex(currentLayer);
          
          if (direction === 1) {
            // Forward scan (0 to 4) - exactly 5 positions, stop at 4
            for (let pos = 0; pos < 5; pos++) {
              setScanningPosition(pos);
              
              // Update embeddings for the current position when scanner reaches it
              const embeddings = await fetchEmbeddingForBlock(currentLayer);
              if (embeddings && embeddings.length > pos && embeddings[pos]) {
                setEmbeddingVectors(prev => {
                  const updated = [...prev];
                  updated[pos] = embeddings[pos];
                  console.log(`Forward: Updated position ${pos} with layer ${currentLayer} embeddings`);
                  return updated;
                });
              }
              
              await new Promise(resolve => setTimeout(resolve, 250)); // Faster and smoother
            }
          } else {
            // Backward scan (4 to 0) - exactly 5 positions, stop at 0
            for (let pos = 4; pos >= 0; pos--) {
              setScanningPosition(pos);
              
              // Update embeddings for the current position when scanner reaches it
              const embeddings = await fetchEmbeddingForBlock(currentLayer);
              if (embeddings && embeddings.length > pos && embeddings[pos]) {
                setEmbeddingVectors(prev => {
                  const updated = [...prev];
                  updated[pos] = embeddings[pos];
                  console.log(`Backward: Updated position ${pos} with layer ${currentLayer} embeddings`);
                  return updated;
                });
              }
              
              await new Promise(resolve => setTimeout(resolve, 250)); // Faster and smoother
            }
          }
          
          // Move to next layer and flip direction
          currentLayer++;
          direction *= -1;
          
          // Brief pause between scans
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Complete scanning
        setIsScanning(false);
        
        // Continue with rest of animation with autoscroll
        setTimeout(() => {
          setFlowStep(2);
          scrollToSection(residualRef);
        }, 1000);   // Residual + LayerNorm
        setTimeout(() => {
          setFlowStep(3);
          scrollToSection(ffnRef);
        }, 5000);   // FFN - wait 2 seconds after residual stream appears (1000 + 2000 = 3000ms delay from residual)
        setTimeout(() => setFlowStep(4), 7000);   // Final Residual + LayerNorm
      };
      
      setTimeout(startScanning, 1000);
      
      // Initial scroll to attention section
      setTimeout(() => {
        scrollToSection(attentionRef);
      }, 1500);
    }
  }, [sentence]);

  // Color palette for tokens
  const tokenColors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // Render attention heatmap
  // Scanning animation with embedding vectors
  const renderScanningAnimation = () => {
    if (!tokens.length) return null;
    
    const displayTokens = tokens.slice(0, 5); // Show first 5 tokens
    
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '12px',
        padding: '30px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Token Embeddings Display */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          gap: '20px',
          position: 'relative'
        }}>
          {displayTokens.map((token, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '160px',
              position: 'relative'
            }}>
              {/* Embedding Values Display */}
              <div style={{
                background: '#1f2937',
                border: '2px solid #374151',
                borderRadius: '8px',
                padding: '15px',
                fontSize: '1em',
                color: '#d1d5db',
                textAlign: 'center',
                minHeight: '120px',
                width: '100%',
                position: 'relative',
                fontFamily: 'monospace'
              }}>
                {embeddingVectors && embeddingVectors[index] && embeddingVectors[index].length > 0 ? (
                  <div style={{ lineHeight: '1.4' }}>
                    <div style={{ 
                      color: '#ffffff',
                      fontSize: '1em',
                      marginBottom: '3px'
                    }}>
                      [{embeddingVectors[index][0].toFixed(2)}
                    </div>
                    <div style={{ 
                      color: '#ffffff',
                      fontSize: '1em',
                      marginBottom: '3px'
                    }}>
                      {embeddingVectors[index][1].toFixed(2)}
                    </div>
                    <div style={{ 
                      color: '#ffffff',
                      fontSize: '1em',
                      marginBottom: '5px'
                    }}>
                      {embeddingVectors[index][2].toFixed(2)}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.9em', margin: '5px 0' }}>...</div>
                    <div style={{ 
                      color: '#ffffff',
                      fontSize: '1em',
                      marginBottom: '3px'
                    }}>
                      {embeddingVectors[index].slice(-2)[0].toFixed(2)}
                    </div>
                    <div style={{ 
                      color: '#ffffff',
                      fontSize: '1em'
                    }}>
                      {embeddingVectors[index].slice(-1)[0].toFixed(2)}]
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    color: '#6b7280',
                    fontSize: '1em',
                    fontStyle: 'italic',
                    paddingTop: '30px'
                  }}>
                    [0.00<br/>0.00<br/>0.00<br/>...<br/>0.00<br/>0.00]
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Green Glowing Scanner */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '30px',
            bottom: '30px',
            left: '30px',
            right: '30px',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(scanningPosition * 20)}%`,
              width: '20%',
              background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.4), rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.4), transparent)',
              borderRadius: '8px',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.8), inset 0 0 20px rgba(34, 197, 94, 0.3)',
              animation: 'greenGlow 1.5s ease-in-out infinite',
              transition: 'left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }} />
          </div>
        )}
      </div>
    );
}

  // Render attention heatmap (after scanning)
  const renderAttentionHeatmap = () => {
    if (!attentionData || !tokens.length) return null;
    const matrix = attentionData[layer]?.[head] || attentionData[0]?.[0];
    if (!matrix) return null;
    return (
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ color: '#60a5fa', margin: 0 }}>Attention Weights Matrix</h4>
          {/* Layer and Head controls */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9em' }}>Layer:</span>
              <button onClick={() => setLayer(Math.max(0, layer - 1))} style={{ background: '#3b82f6', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: '0.8em' }}>-</button>
              <span style={{ color: 'white', fontSize: '0.9em', minWidth: '20px', textAlign: 'center' }}>{layer}</span>
              <button onClick={() => setLayer(Math.min((attentionData?.length || 1) - 1, layer + 1))} style={{ background: '#3b82f6', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: '0.8em' }}>+</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9em' }}>Head:</span>
              <button onClick={() => setHead(Math.max(0, head - 1))} style={{ background: '#3b82f6', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: '0.8em' }}>-</button>
              <span style={{ color: 'white', fontSize: '0.9em', minWidth: '20px', textAlign: 'center' }}>{head}</span>
              <button onClick={() => setHead(Math.min((attentionData?.[layer]?.length || 1) - 1, head + 1))} style={{ background: '#3b82f6', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: '0.8em' }}>+</button>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tokens.length + 1}, 1fr)`, gap: '2px', fontSize: '0.8em' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '4px' }}></div>
          {tokens.map((token, i) => (
            <div key={i} style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '4px', textAlign: 'center', color: tokenColors[i % tokenColors.length], fontWeight: 'bold' }}>{token}</div>
          ))}
          {matrix.map((row, i) => (
            <React.Fragment key={i}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '4px', color: tokenColors[i % tokenColors.length], fontWeight: 'bold', textAlign: 'center' }}>{tokens[i]}</div>
              {row.map((weight, j) => (
                <div key={j} style={{ background: `rgba(59, 130, 246, ${weight})`, padding: '8px', borderRadius: '4px', textAlign: 'center', color: '#ffffff', fontFamily: 'monospace', border: i === j ? '2px solid #f59e0b' : 'none' }}>{weight.toFixed(2)}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#9ca3af', textAlign: 'center' }}>
          Layer {layer}, Head {head} - Each token attends to all tokens (including itself)
        </div>
      </div>
    );
  };

  // Render scanning animation

  // Render residual stream chart
  const renderResidualStream = () => {
    if (chartData.length === 0) {
      return (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
          No residual stream data available. Try a longer or more meaningful sentence.
        </div>
      );
    }

    return (
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        border: '2px solid #3b82f6',
        padding: '25px',
        marginBottom: '30px',
        position: 'relative',
        boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)'
      }}>
        <h3 style={{
          color: '#f59e0b',
          fontWeight: 'bold',
          fontSize: '2em',
          textAlign: 'center',
          textShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
          marginBottom: '15px'
        }}>
          Residual Stream Norms Across Layers
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 65, 81, 0.3)" />
            <XAxis dataKey="layer" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Legend />
            {residualTokens.map((tok, idx) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={`token_${idx}`}
                stroke={tokenColors[idx % tokenColors.length]}
                strokeWidth={3}
                dot={{ r: 7, stroke: tokenColors[idx % tokenColors.length], strokeWidth: 2, fill: '#fff' }}
                name={`"${tok}"`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <React.Fragment>
      <div style={{
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
            Transformer Block
          </h2>
          <p style={{
            fontSize: '1.4em',
            color: '#9ca3af',
            maxWidth: '900px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Watch how information flows through the core components of a transformer layer.
          </p>
        </div>

        {/* Main Flow Visualization */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px'
        }}>
          {/* Transformer Block Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: flowStep >= 1 ? 1 : 0,
              scale: flowStep >= 1 ? 1 : 0.95
            }}
            transition={{ duration: 0.8 }}
            style={{
              background: '#0f172a',
              borderRadius: '20px',
              border: '3px solid #f59e0b',
              padding: '40px',
              marginBottom: '40px',
              boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)',
              position: 'relative'
            }}
          >
            {/* Transformer Block Label */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#111827',
              padding: '8px 20px',
              borderRadius: '20px',
              border: '2px solid #f59e0b',
              color: '#f59e0b',
              fontWeight: 'bold',
              fontSize: '1.2em'
            }}>
              Transformer Block
            </div>
            {/* Stage 1: Multi-Head Self-Attention */}
            <motion.div
              ref={attentionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: flowStep >= 1 ? 1 : 0,
                y: flowStep >= 1 ? 0 : 20
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                background: '#1e293b',
                borderRadius: '12px',
                border: '2px solid #3b82f6',
                padding: '25px',
                marginBottom: '30px',
                position: 'relative'
              }}
            >
              <React.Fragment>
                <h3 style={{
                  color: '#f59e0b',
                  fontWeight: 'bold',
                  fontSize: '2em',
                  textAlign: 'center',
                  textShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
                  marginBottom: '15px'
                }}>
                  Multi-Head Self-Attention
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#9ca3af',
                  textAlign: 'center',
                  marginBottom: '18px',
                  marginTop: '-8px',
                  lineHeight: '1.5'
                }}>
                 This mechanism aims to understand the relationships between tokens, enabling the model to capture deeper context.
                </p>
                {/* Technical subtitle during scanning */}
                {isScanning && (
                  <p style={{
                    fontSize: '0.95em',
                    color: '#60a5fa',
                    textAlign: 'center',
                    marginBottom: '10px',
                    marginTop: '15px',
                    lineHeight: '1.4',
                    fontStyle: 'italic',
                    fontFamily: 'monospace'
                  }}>
                    Computing attention weights and updating token representations through multi-head self-attention mechanism.
                  </p>
                )}
                {/* Attention visualization - scanning only */}
                {flowStep >= 1 && renderScanningAnimation()}
              </React.Fragment>
            </motion.div>
            {/* Animated Blue Flow Arrow between Attention and Residual Stream */}
            {flowStep >= 2 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', position: 'relative', height: '70px' }}>
                <div style={{
                  width: '4px',
                  height: flowStep >= 2 ? '60px' : '0px',
                  background: flowStep >= 2 ? '#3b82f6' : '#374151',
                  borderRadius: '2px',
                  boxShadow: flowStep >= 2 ? '0 0 16px #3b82f6' : 'none',
                  transition: 'height 1.2s cubic-bezier(0.4,0,0.2,1), background 0.5s',
                  position: 'relative',
                  animation: flowStep === 2 ? 'drawArrow 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none'
                }}>
                  {/* Flowing particle */}
                  {flowStep === 2 && (
                    <div style={{
                      position: 'absolute',
                      width: '12px',
                      height: '12px',
                      background: '#3b82f6',
                      borderRadius: '50%',
                      left: '-4px',
                      top: '0px',
                      boxShadow: '0 0 18px #3b82f6',
                      animation: 'flowDown1 1.1s ease-in-out',
                      zIndex: 2
                    }} />
                  )}
                  {/* Arrowhead */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '-6px',
                    width: '16px',
                    height: '16px',
                    background: '#3b82f6',
                    transform: 'rotate(45deg)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px #3b82f6',
                    opacity: flowStep >= 2 ? 1 : 0,
                    transition: 'opacity 0.5s'
                  }} />
                </div>
              </div>
            )}
            {/* Residual Stream Visualization */}
            {flowStep >= 2 && (
              <motion.div
                ref={residualRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ margin: '20px 0' }}
              >
                {renderResidualStream()}
              </motion.div>
            )}
            {/* Animated Blue Flow Arrow between Residual Stream and FFN */}
            {flowStep >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', position: 'relative', height: '70px' }}>
                <div style={{
                  width: '4px',
                  height: flowStep >= 3 ? '60px' : '0px',
                  background: flowStep >= 3 ? '#3b82f6' : '#374151',
                  borderRadius: '2px',
                  boxShadow: flowStep >= 3 ? '0 0 16px #3b82f6' : 'none',
                  transition: 'height 1.2s cubic-bezier(0.4,0,0.2,1), background 0.5s',
                  position: 'relative',
                  animation: flowStep === 3 ? 'drawArrow 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none'
                }}>
                  {/* Flowing particle */}
                  {flowStep === 3 && (
                    <div style={{
                      position: 'absolute',
                      width: '12px',
                      height: '12px',
                      background: '#3b82f6',
                      borderRadius: '50%',
                      left: '-4px',
                      top: '0px',
                      boxShadow: '0 0 18px #3b82f6',
                      animation: 'flowDown1 1.1s ease-in-out',
                      zIndex: 2
                    }} />
                  )}
                  {/* Arrowhead */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '-6px',
                    width: '16px',
                    height: '16px',
                    background: '#3b82f6',
                    transform: 'rotate(45deg)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px #3b82f6',
                    opacity: flowStep >= 3 ? 1 : 0,
                    transition: 'opacity 0.5s'
                  }} />
                </div>
              </div>
            )}
            {/* Stage 2: Feedforward Neural Network */}
            <motion.div
              ref={ffnRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: flowStep >= 3 ? 1 : 0,
                y: flowStep >= 3 ? 0 : 20
              }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{
                background: '#1e293b',
                borderRadius: '12px',
                border: '2px solid #8b5cf6',
                padding: '25px',
                marginBottom: '30px',
                minHeight: '320px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FFNDiagram />
            </motion.div>
            {/* Second Residual Connection + LayerNorm */}
            {/* Removed Residual + LayerNorm arc and arrow as requested. Addition symbol retained. */}
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.6); }
        }
        @keyframes drawArrow {
          0% { height: 0px; }
          100% { height: 60px; }
        }
        @keyframes flowDown1 {
          0% { top: -10px; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 60px; opacity: 0; }
        }
        @keyframes scanPulse {
          0%, 100% { opacity: 0.7; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.2); }
        }
        @keyframes greenGlow {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.8), inset 0 0 20px rgba(34, 197, 94, 0.3);
            opacity: 0.6;
          }
          50% { 
            box-shadow: 0 0 50px rgba(34, 197, 94, 1), inset 0 0 30px rgba(34, 197, 94, 0.5);
            opacity: 0.8;
          }
        }
      `}</style>
    </React.Fragment>
  );
};

export default TransformerBlockVisualizer;

// FFN diagram as a separate component
function FFNDiagram() {
  const nodeCount = 5;
  const nodeRadius = 40;
  const svgWidth = 900;
  const svgHeight = 340;
  // Three rows
  const rowCount = 3;
  const rowYs = [60, 170, 280]; // increased vertical spacing
  const nodeSpacing = 100 + nodeRadius * 2; // horizontal gap
  const centerX = svgWidth / 2;
  const middleIndex = Math.floor(nodeCount / 2);
  // Generate nodes for each row
  const rows = Array.from({length: rowCount}, (_, rowIdx) =>
    Array.from({length: nodeCount}, (_, i) => ({
      x: centerX + (i - middleIndex) * nodeSpacing,
      y: rowYs[rowIdx]
    }))
  );
  return (
    <div style={{ width: '100%' }}>
      <h3 style={{
        color: '#f59e0b',
        fontWeight: 'bold',
        fontSize: '2em',
        textAlign: 'center',
        textShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
        marginBottom: '10px',
        marginTop: '0px'
      }}>
        Feedforward Neural Network (FFN)
      </h3>
      <p style={{
        fontSize: '1.1em',
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: '18px',
        marginTop: '-8px',
        lineHeight: '1.5'
      }}>
        Each token is transformed and enriched by the feedforward network, deepening the model’s understanding at every step.
      </p>
      <div style={{ position: 'relative', width: '100%', height: `${svgHeight}px`, margin: '0 auto' }}>
        {/* SVG lines behind nodes */}
        <svg width={svgWidth} height={svgHeight} style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 0 }}>
          {/* Connect every neuron in each row to every neuron in the next row */}
          {Array.from({length: rowCount - 1}, (_, rowIdx) =>
            rows[rowIdx].map((fromNode, i) =>
              rows[rowIdx + 1].map((toNode, j) => (
                <line
                  key={`line-${rowIdx}-${i}-${j}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#991b1b"
                  strokeWidth="4"
                  opacity="0.7"
                />
              ))
            )
          )}
        </svg>
        {/* Render all neurons */}
        {rows.map((row, rowIdx) =>
          row.map((pos, i) => (
            <div key={`row${rowIdx}-node${i}`} style={{
              position: 'absolute',
              left: `calc(50% - ${svgWidth/2 - (pos.x - nodeRadius)}px)`,
              top: `${pos.y - nodeRadius}px`,
              width: `${nodeRadius*2}px`,
              height: `${nodeRadius*2}px`,
              border: '4px solid #fff',
              borderRadius: '50%',
              background: '#111827',
              boxShadow: '0 0 18px #8b5cf6',
              zIndex: 1,
            }} />
          ))
        )}
      </div>
    </div>
  );
}
