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
  
  // Embedding evolution state
  const [embeddingVectors, setEmbeddingVectors] = useState([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  
  // Residual stream state
  const [chartData, setChartData] = useState([]);
  const [residualTokens, setResidualTokens] = useState([]);

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

  // Fetch embedding vectors for different transformer blocks
  const fetchEmbeddingForBlock = async (blockIndex) => {
    if (!sentence) return [];
    
    try {
      console.log(`🔵 Fetching embeddings for block ${blockIndex}:`, sentence);
      
      // First test if backend is reachable
      try {
        const healthCheck = await axios.get("http://localhost:8000/health");
        console.log(`💚 Backend health check OK:`, healthCheck.data);
      } catch (healthErr) {
        console.error(`💥 Backend health check failed:`, healthErr.message);
        throw new Error("Backend server is not reachable");
      }
      
      const res = await axios.post("http://localhost:8000/embeddings", {
        text: sentence,
        layer: blockIndex
      });

      console.log(`✅ Embeddings response for block ${blockIndex}:`, res.data);
      
      // Return the actual embedding vectors for each token
      if (res.data && res.data.embeddings) {
        console.log(`📊 Received ${res.data.embeddings.length} embedding vectors`);
        return res.data.embeddings;
      } else {
        console.warn(`⚠️ No embeddings in response for block ${blockIndex}:`, res.data);
        return [];
      }
    } catch (err) {
      console.error(`❌ Error loading embeddings for block ${blockIndex}:`, err);
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
      setEmbeddingVectors([]);
      
      // Animate through stages
      const timeouts = [
        setTimeout(async () => {
          setFlowStep(1);
          // Start attention scanning animation
          setIsScanning(true);
          setScanningPosition(0);
          setCurrentBlockIndex(0);
          
          // Fetch initial embeddings for block 0
          console.log("🚀 Starting embedding scanning...");
          const initialEmbeddings = await fetchEmbeddingForBlock(0);
          setEmbeddingVectors(initialEmbeddings);
        }, 1000),
        
        // Scanning animation - progress through transformer blocks
        setTimeout(async () => {
          setCurrentBlockIndex(1);
          const embeddings = await fetchEmbeddingForBlock(1);
          setEmbeddingVectors(embeddings);
          setScanningPosition(1);
        }, 1500),
        setTimeout(async () => {
          setCurrentBlockIndex(2);
          const embeddings = await fetchEmbeddingForBlock(2);
          setEmbeddingVectors(embeddings);
          setScanningPosition(2);
        }, 2000),
        setTimeout(async () => {
          setCurrentBlockIndex(3);
          const embeddings = await fetchEmbeddingForBlock(3);
          setEmbeddingVectors(embeddings);
          setScanningPosition(3);
        }, 2500),
        setTimeout(async () => {
          setCurrentBlockIndex(4);
          const embeddings = await fetchEmbeddingForBlock(4);
          setEmbeddingVectors(embeddings);
          setScanningPosition(4);
        }, 3000),
        setTimeout(async () => {
          setCurrentBlockIndex(5);
          const embeddings = await fetchEmbeddingForBlock(5);
          setEmbeddingVectors(embeddings);
          setScanningPosition(5);
        }, 3500),
        
        // Complete scanning
        setTimeout(() => {
          setIsScanning(false);
        }, 4000),
        
        setTimeout(() => setFlowStep(2), 5000),   // Residual + LayerNorm
        setTimeout(() => setFlowStep(3), 7000),   // FFN
        setTimeout(() => setFlowStep(4), 9000),   // Final Residual + LayerNorm
      ];
      
      return () => timeouts.forEach(clearTimeout);
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
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h4 style={{
          color: '#fbbf24',
          textShadow: '0 0 8px #f59e0b, 0 0 16px #fbbf24',
          margin: '0 0 20px 0',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '2.2em',
          letterSpacing: '0.03em',
          background: 'linear-gradient(90deg, #fbbf24 60%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 6px #fbbf24)',
        }}>
          Embedding Evolution
        </h4>
        
        {/* Current Block Indicator */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ color: '#f59e0b', fontSize: '1.2em', fontWeight: 'bold' }}>
            Processing Block: {currentBlockIndex}
          </span>
        </div>
        
        {/* Embedding Vector Display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', position: 'relative' }}>
          {/* Embedding Values List */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '20px',
            minWidth: '300px',
            maxWidth: '500px',
            fontFamily: 'monospace'
          }}>
            <div style={{ 
              color: '#f59e0b', 
              fontSize: '1.1em', 
              fontWeight: 'bold', 
              marginBottom: '15px', 
              textAlign: 'center',
              borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
              paddingBottom: '10px'
            }}>
              vals
            </div>
            
            {/* Display embedding values as a simple list */}
            <div style={{ fontSize: '0.9em', lineHeight: '1.4' }}>
              {embeddingVectors.length > 0 && embeddingVectors[0] ? (
                embeddingVectors[0].slice(0, 12).map((val, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0.5, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      color: isScanning ? '#f59e0b' : '#cbd5e1',
                      scale: isScanning ? 1.05 : 1
                    }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    style={{ 
                      padding: '2px 0',
                      fontWeight: isScanning ? 'bold' : 'normal',
                      borderLeft: isScanning ? '3px solid #f59e0b' : '3px solid transparent',
                      paddingLeft: '8px',
                      marginBottom: '1px'
                    }}
                  >
                    {val.toFixed(4)}
                  </motion.div>
                ))
              ) : (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  {embeddingVectors.length === 0 ? 
                    "[Loading embeddings...]" : 
                    `[Debug: embeddingVectors.length=${embeddingVectors.length}]`
                  }
                  <br />
                  <small style={{ fontSize: '0.7em', color: '#9ca3af' }}>
                    Block: {currentBlockIndex} | Sentence: "{sentence?.slice(0, 20)}..."
                  </small>
                </div>
              )}
              
              {embeddingVectors.length > 0 && embeddingVectors[0] && embeddingVectors[0].length > 12 && (
                <div style={{ 
                  color: '#9ca3af', 
                  fontSize: '0.8em', 
                  marginTop: '8px', 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(156, 163, 175, 0.2)',
                  paddingTop: '8px'
                }}>
                  ... and {embeddingVectors[0].length - 12} more values
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: '#f59e0b', fontSize: '1.1em', fontWeight: 'bold', marginTop: '20px' }}>
            🧠 Processing Transformer Block {currentBlockIndex}... 
            <br />
            <span style={{ fontSize: '0.9em', color: '#fbbf24' }}>
              Embedding vectors are updating with new values!
            </span>
            <br />
            <small style={{ fontSize: '0.7em', color: '#9ca3af', marginTop: '8px', display: 'block' }}>
              💡 If stuck on "Loading embeddings...", make sure backend is running on port 8000
            </small>
          </motion.div>
        )}
      </div>
    );
  };

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
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '12px', padding: '20px' }}>
        <h4 style={{ color: '#10b981', marginBottom: '15px', textAlign: 'center' }}>
          Residual Stream Norms Across Layers
        </h4>
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
                strokeWidth={2}
                dot={false}
                name={`"${tok}"`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <>
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

        {/* Layer Stacking Visualization */}
        {/* Removed Multiple Layers Stack Together section and showLayers block as requested */}

        {/* Main Flow Visualization */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px'
        }}>


          {/* Flow Arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: flowStep >= 1 ? 1 : 0 }}
            style={{ textAlign: 'center', margin: '30px 0' }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <path d="M30 10 v40" stroke="#f59e0b" strokeWidth="4" />
              <polygon points="20,45 40,45 30,55" fill="#f59e0b" />
            </svg>
          </motion.div>

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
              
              {/* Attention visualization - scanning only */}
              {flowStep >= 1 && (
                <>
                  {renderScanningAnimation()}
                </>
              )}
            </motion.div>

            {/* Residual Connection + LayerNorm Arrow and Process */}
            {/* Removed Residual + LayerNorm arc and arrow as requested. Addition symbol retained. */}

            {/* Residual Stream Visualization */}
            {flowStep >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ margin: '20px 0' }}
              >
                {renderResidualStream()}
              </motion.div>
            )}

            {/* Stage 2: Feedforward Neural Network */}
            <motion.div
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
                marginBottom: '30px'
              }}
            >
              <h3 style={{
                color: '#f59e0b',
                fontWeight: 'bold',
                fontSize: '2em',
                textAlign: 'center',
                textShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
                marginBottom: '15px'
              }}>
                Feedforward Neural Network (FFN)
              </h3>
              
              {/* FFN diagram */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '12px',
                padding: '25px',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#8b5cf6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      margin: '0 auto 8px'
                    }}>
                      d
                    </div>
                    <div style={{ color: '#a78bfa', fontSize: '0.8em' }}>Input</div>
                  </div>
                  
                  <div style={{ color: '#f59e0b', fontSize: '1.5em' }}>→</div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: '#ec4899',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      margin: '0 auto 8px',
                      fontSize: '0.9em'
                    }}>
                      4d
                    </div>
                    <div style={{ color: '#ec4899', fontSize: '0.8em' }}>Hidden</div>
                  </div>
                  
                  <div style={{ color: '#f59e0b', fontSize: '1.5em' }}>→</div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#8b5cf6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      margin: '0 auto 8px'
                    }}>
                      d
                    </div>
                    <div style={{ color: '#a78bfa', fontSize: '0.8em' }}>Output</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Second Residual Connection + LayerNorm */}
            {/* Removed Residual + LayerNorm arc and arrow as requested. Addition symbol retained. */}
          </motion.div>

          {/* Flow Arrow pointing to Final Output */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: flowStep >= 4 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            style={{ textAlign: 'center', margin: '30px 0' }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <path d="M30 10 v40" stroke="#f59e0b" strokeWidth="6" />
              <polygon points="20,45 40,45 30,55" fill="#f59e0b" />
            </svg>
          </motion.div>

          {/* Final Transformer Output Vector */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: flowStep >= 4 ? 1 : 0,
              y: flowStep >= 4 ? 0 : 30
            }}
            transition={{ duration: 0.8, delay: 1.2 }}
            style={{
              background: '#0f172a',
              borderRadius: '16px',
              border: '3px solid #10b981',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
            }}
          >
            <h3 style={{
              color: '#f59e0b',
              fontWeight: 'bold',
              fontSize: '2em',
              textAlign: 'center',
              textShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
              marginBottom: '15px'
            }}>
              Final Transformer Output Vector
            </h3>
            <div style={{
              color: '#cbd5e1',
              fontSize: '1.2em',
              marginBottom: '20px'
            }}>
              Enhanced token representations ready for the next layer
            </div>

            {/* Enhanced Output Tokens */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              {tokens.map((token, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + i * 0.1 }}
                  style={{
                    background: `linear-gradient(135deg, ${tokenColors[i % tokenColors.length]}66, ${tokenColors[i % tokenColors.length]}44)`,
                    border: `2px solid ${tokenColors[i % tokenColors.length]}`,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    boxShadow: `0 0 20px ${tokenColors[i % tokenColors.length]}44`,
                    position: 'relative'
                  }}
                >
                  "{token}"
                  <div style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8em'
                  }}>
                    ✨
                  </div>
                </motion.div>
              ))}
            </div>
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
      `}</style>
    </>
  );
};

export default TransformerBlockVisualizer;
