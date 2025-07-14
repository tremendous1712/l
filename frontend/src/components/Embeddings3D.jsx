import React, { useState, useEffect, useMemo, useRef } from "react";
import { Text, Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import * as THREE from "three";

// Validate and format a point to ensure it's a valid 3D coordinate
const validatePoint = (point) => {
  if (!Array.isArray(point)) {
    console.warn("Invalid point format:", point);
    return [0, 0, 0];
  }
  return point.slice(0, 3).map(v => Number.isFinite(v) ? v : 0);
};

// Simple PCA implementation for dimensionality reduction
function pca(data, n_components = 3) {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  const X = data;
  const mean = X[0].map((_, col) => X.reduce((acc, row) => acc + row[col], 0) / X.length);
  const centered = X.map(row => row.map((v, i) => v - mean[i]));
  
  // Simple approach: just take first 3 dimensions and normalize
  return centered.map(row => row.slice(0, n_components));
}

// 3D Coordinate System with proper axes
const CoordinateSystem = ({ size = 8 }) => {
  return (
    <group>
      {/* X Axis - Red */}
      <Line
        points={[[0, 0, 0], [size, 0, 0]]}
        color="#ef4444"
        lineWidth={8}
      />
      <mesh position={[size + 0.4, 0, 0]}>
        <coneGeometry args={[0.25, 0.8, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Html position={[size + 1, 0, 0]}>
        <div style={{ color: "#ef4444", fontSize: "28px", fontWeight: "bold", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>X</div>
      </Html>

      {/* Y Axis - Green */}
      <Line
        points={[[0, 0, 0], [0, size, 0]]}
        color="#22c55e"
        lineWidth={8}
      />
      <mesh position={[0, size + 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.8, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <Html position={[0, size + 1, 0]}>
        <div style={{ color: "#22c55e", fontSize: "28px", fontWeight: "bold", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>Y</div>
      </Html>

      {/* Z Axis - Blue */}
      <Line
        points={[[0, 0, 0], [0, 0, size]]}
        color="#3b82f6"
        lineWidth={8}
      />
      <mesh position={[0, 0, size + 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.25, 0.8, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <Html position={[0, 0, size + 1]}>
        <div style={{ color: "#3b82f6", fontSize: "28px", fontWeight: "bold", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>Z</div>
      </Html>

      {/* Origin point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

// Animated Vector component that draws from one token to the next
const AnimatedVector = ({ startPosition, endPosition, startToken, endToken, color, delay = 0, isVisible = false }) => {
  const vectorRef = useRef();
  
  const spring = useSpring({
    progress: isVisible ? 1 : 0,
    config: { tension: 80, friction: 20 }, // Much slower animation
    delay: delay * 1200 // Increased delay between vectors
  });

  const startPos = useMemo(() => validatePoint(startPosition), [startPosition]);
  const endPos = useMemo(() => validatePoint(endPosition), [endPosition]);
  
  const vectorDirection = useMemo(() => {
    return [
      endPos[0] - startPos[0],
      endPos[1] - startPos[1], 
      endPos[2] - startPos[2]
    ];
  }, [startPos, endPos]);

  const vectorLength = useMemo(() => {
    return Math.sqrt(
      vectorDirection[0] ** 2 + 
      vectorDirection[1] ** 2 + 
      vectorDirection[2] ** 2
    );
  }, [vectorDirection]);

  useFrame(() => {
    if (vectorRef.current && spring.progress.get() !== undefined) {
      const progress = spring.progress.get();
      
      // Update line geometry based on animation progress
      const currentEnd = [
        startPos[0] + vectorDirection[0] * progress,
        startPos[1] + vectorDirection[1] * progress,
        startPos[2] + vectorDirection[2] * progress
      ];
      
      const geometry = vectorRef.current.geometry;
      const positions = geometry.attributes.position.array;
      positions[0] = startPos[0]; positions[1] = startPos[1]; positions[2] = startPos[2];
      positions[3] = currentEnd[0]; positions[4] = currentEnd[1]; positions[5] = currentEnd[2];
      geometry.attributes.position.needsUpdate = true;
    }
  });

  // Calculate arrow rotation to point from start to end
  const arrowRotation = useMemo(() => {
    if (vectorLength === 0) return [0, 0, 0];
    
    const normalized = vectorDirection.map(v => v / vectorLength);
    const yaw = Math.atan2(normalized[0], normalized[2]);
    const pitch = Math.atan2(normalized[1], Math.sqrt(normalized[0]**2 + normalized[2]**2)) - Math.PI/2;
    
    return [pitch, yaw, 0];
  }, [vectorDirection, vectorLength]);

  return (
    <group>
      {/* Start point (token sphere) */}
      <animated.mesh 
        position={startPos}
        scale={spring.progress.to(p => Math.max(0.1, p * 0.8))} // Smaller scale
      >
        <sphereGeometry args={[0.1, 16, 16]} /> {/* Smaller sphere */}
        <meshStandardMaterial color={color} />
      </animated.mesh>

      {/* Start token label */}
      <animated.group position={startPos} scale={spring.progress.to(p => Math.max(0.1, p))}>
        <Html position={[0, 0.4, 0]}>
          <div style={{
            background: "rgba(0,0,0,0.8)",
            color: color,
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            border: `1px solid ${color}`,
            whiteSpace: "nowrap"
          }}>
            {startToken}
          </div>
        </Html>
      </animated.group>

      {/* Vector line from start to end */}
      <line ref={vectorRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...startPos, ...endPos])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={5} />
      </line>

      {/* Vector arrowhead at end position */}
      <animated.group 
        position={spring.progress.to(p => [
          startPos[0] + vectorDirection[0] * p,
          startPos[1] + vectorDirection[1] * p,
          startPos[2] + vectorDirection[2] * p
        ])}
        rotation={arrowRotation}
        scale={spring.progress.to(p => p * 1.2)}
      >
        <mesh>
          <coneGeometry args={[0.08, 0.2, 8]} /> {/* Smaller arrowhead */}
          <meshStandardMaterial color={color} />
        </mesh>
      </animated.group>

      {/* End point (token sphere) - only appears when vector is complete */}
      <animated.mesh 
        position={endPos}
        scale={spring.progress.to(p => p >= 0.8 ? (p - 0.8) * 4 : 0)} // Smaller end sphere
      >
        <sphereGeometry args={[0.1, 16, 16]} /> {/* Smaller sphere */}
        <meshStandardMaterial color={color} />
      </animated.mesh>

      {/* End token label - only appears when vector is complete */}
      <animated.group 
        position={endPos} 
        scale={spring.progress.to(p => p >= 0.8 ? (p - 0.8) * 5 : 0)}
      >
        <Html position={[0, 0.4, 0]}>
          <div style={{
            background: "rgba(0,0,0,0.8)",
            color: color,
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            border: `1px solid ${color}`,
            whiteSpace: "nowrap"
          }}>
            {endToken}
          </div>
        </Html>
      </animated.group>
    </group>
  );
};

// Matrix representation component to show raw vector values
const MatrixRepresentation = ({ embeddings, tokens, currentStep }) => {
  if (!embeddings || !tokens) return null;

  return (
    <Html position={[0, -2.5, 0]}>
      <div style={{
        background: "rgba(0,0,0,0.95)",
        border: "2px solid #38bdf8",
        borderRadius: "8px",
        padding: "15px",
        color: "white",
        fontFamily: "monospace",
        width: "800px",
        fontSize: "11px"
      }}>
        <h4 style={{ 
          color: "#38bdf8", 
          margin: "0 0 15px 0", 
          textAlign: "center",
          fontSize: "14px"
        }}>
          Vector Matrix Representation
        </h4>
        
        {/* Header with tokens */}
        <div style={{
          display: "flex",
          marginBottom: "10px",
          borderBottom: "1px solid #444",
          paddingBottom: "8px"
        }}>
          <div style={{
            width: "60px",
            fontWeight: "bold",
            color: "#38bdf8",
            fontSize: "10px",
            display: "flex",
            alignItems: "center"
          }}>
            Tokens
          </div>
          {tokens.slice(0, currentStep + 1).map((token, i) => (
            <div key={i} style={{
              flex: "1",
              textAlign: "center",
              fontWeight: "bold",
              color: i === currentStep ? "#fbbf24" : "#e2e8f0",
              background: i === currentStep ? "rgba(251, 191, 36, 0.1)" : "transparent",
              padding: "4px 2px",
              borderRadius: "4px",
              fontSize: "9px",
              minWidth: "50px",
              maxWidth: "80px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              "{token}"
            </div>
          ))}
        </div>

        {/* Matrix rows - showing first 8 dimensions */}
        {Array.from({ length: Math.min(8, embeddings[0]?.length || 0) }, (_, dimIndex) => (
          <div key={dimIndex} style={{
            display: "flex",
            marginBottom: "3px",
            alignItems: "center"
          }}>
            <div style={{
              width: "60px",
              color: "#38bdf8",
              fontSize: "10px",
              fontWeight: "bold"
            }}>
              d{dimIndex}
            </div>
            {tokens.slice(0, currentStep + 1).map((token, tokenIndex) => {
              const vector = embeddings[tokenIndex] || [];
              const value = vector[dimIndex];
              const isCurrentToken = tokenIndex === currentStep;
              
              return (
                <div key={tokenIndex} style={{
                  flex: "1",
                  textAlign: "center",
                  padding: "3px 2px",
                  color: isCurrentToken ? "#fbbf24" : "#94a3b8",
                  background: isCurrentToken ? "rgba(251, 191, 36, 0.05)" : "transparent",
                  borderRadius: "2px",
                  fontSize: "9px",
                  fontFamily: "monospace",
                  minWidth: "50px",
                  maxWidth: "80px"
                }}>
                  {typeof value === 'number' ? 
                    (Math.abs(value) >= 0.01 ? value.toFixed(2) : value.toExponential(1)) 
                    : '0.00'
                  }
                </div>
              );
            })}
          </div>
        ))}

        {/* Show "..." row for remaining dimensions */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginTop: "8px",
          paddingTop: "8px",
          borderTop: "1px solid #444"
        }}>
          <div style={{
            width: "60px",
            color: "#64748b",
            fontSize: "10px"
          }}>
            ...
          </div>
          {tokens.slice(0, currentStep + 1).map((_, tokenIndex) => (
            <div key={tokenIndex} style={{
              flex: "1",
              textAlign: "center",
              color: "#64748b",
              fontSize: "10px",
              minWidth: "50px",
              maxWidth: "80px"
            }}>
              ...
            </div>
          ))}
        </div>

        {/* Info footer */}
        <div style={{
          marginTop: "10px",
          paddingTop: "8px",
          borderTop: "1px solid #444",
          fontSize: "9px",
          color: "#94a3b8",
          textAlign: "center"
        }}>
          {embeddings[0]?.length || 0}D vectors • Step {currentStep + 1}/{tokens.length} • 
          <span style={{ color: "#fbbf24" }}> Current: "{tokens[currentStep] || ''}"</span>
        </div>
      </div>
    </Html>
  );
};

// Main Embeddings3D component
export const Embeddings3D = ({ embeddings3d, tokens, layer, step, hiddenStates, sentence }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVectors, setShowVectors] = useState(false);
  const [showMatrix, setShowMatrix] = useState(true);

  // Color palette for vectors
  const vectorColors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", 
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"
  ];

  // Calculate and normalize points
  const points = useMemo(() => {
    try {
      let rawPoints = [];
      
      if (embeddings3d && Array.isArray(embeddings3d)) {
        if (embeddings3d.length > 0 && Array.isArray(embeddings3d[0])) {
          rawPoints = embeddings3d;
        } else if (embeddings3d[layer] && Array.isArray(embeddings3d[layer])) {
          rawPoints = embeddings3d[layer];
        }
      } else if (hiddenStates && hiddenStates[layer]) {
        rawPoints = pca(hiddenStates[layer]);
      }

      if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
        return [];
      }

      // Validate and scale points to fit in a reasonable 3D space
      const validPoints = rawPoints.map(validatePoint);
      
      // Calculate bounds
      const bounds = validPoints.reduce((acc, point) => ({
        minX: Math.min(acc.minX, point[0]),
        maxX: Math.max(acc.maxX, point[0]),
        minY: Math.min(acc.minY, point[1]),
        maxY: Math.max(acc.maxY, point[1]),
        minZ: Math.min(acc.minZ, point[2]),
        maxZ: Math.max(acc.maxZ, point[2]),
      }), { 
        minX: Infinity, maxX: -Infinity,
        minY: Infinity, maxY: -Infinity,
        minZ: Infinity, maxZ: -Infinity 
      });

      // Scale to fit in a 6x6x6 space (bigger than before)
      const range = Math.max(
        bounds.maxX - bounds.minX,
        bounds.maxY - bounds.minY,
        bounds.maxZ - bounds.minZ,
        1
      );
      
      const scale = 6 / range;
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      const centerZ = (bounds.minZ + bounds.maxZ) / 2;

      return validPoints.map(point => [
        (point[0] - centerX) * scale,
        (point[1] - centerY) * scale,
        (point[2] - centerZ) * scale
      ]);
    } catch (err) {
      console.error("Error processing embeddings:", err);
      return [];
    }
  }, [embeddings3d, hiddenStates, layer]);

  // Animation sequence
  useEffect(() => {
    setCurrentStep(0);
    setShowVectors(false);
    
    const timer = setTimeout(() => {
      setShowVectors(true);
      
      // Step through vectors one by one with much longer delays
      const stepTimer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= points.length - 1) {
            clearInterval(stepTimer);
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // Increased from 600ms to 2000ms (2 seconds per step)

      return () => clearInterval(stepTimer);
    }, 1500); // Increased initial delay from 1000ms to 1500ms

    return () => clearTimeout(timer);
  }, [sentence, points.length]);

  if (!points || points.length === 0) {
    return (
      <Html center>
        <div style={{ 
          color: '#f87171',
          fontSize: '18px',
          background: 'rgba(0,0,0,0.8)',
          padding: '10px 20px',
          borderRadius: '8px'
        }}>
          No embedding data available
        </div>
      </Html>
    );
  }

  return (
    <group>
      {/* Title */}
      <Html position={[-6, 4, 0]}>
        <div style={{
          color: "#38bdf8",
          fontSize: "1.4em",
          fontWeight: "bold"
        }}>
          3D Embedding Vectors
        </div>
      </Html>

      {/* Coordinate system */}
      <CoordinateSystem size={8} />

      {/* Token-to-Token Vectors - Sequential appearance */}
      {showVectors && points.map((point, i) => {
        if (i === 0) {
          // First token - always show as starting point
          return (
            <group key={`origin-${i}`}>
              <mesh position={point}>
                <sphereGeometry args={[0.12, 16, 16]} /> {/* Smaller starting sphere */}
                <meshStandardMaterial color={vectorColors[0]} />
              </mesh>
              <Html position={[point[0], point[1] + 0.4, point[2]]}>
                <div style={{
                  background: "rgba(0,0,0,0.8)",
                  color: vectorColors[0],
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  border: `1px solid ${vectorColors[0]}`,
                  whiteSpace: "nowrap"
                }}>
                  {tokens && tokens[i] ? tokens[i] : `T${i}`} (start)
                </div>
              </Html>
            </group>
          );
        }
        
        // Only show vectors up to current step
        if (i <= currentStep) {
          return (
            <AnimatedVector
              key={`vector-${i}`}
              startPosition={points[i - 1]}
              endPosition={point}
              startToken={tokens && tokens[i - 1] ? tokens[i - 1] : `T${i-1}`}
              endToken={tokens && tokens[i] ? tokens[i] : `T${i}`}
              color={vectorColors[i % vectorColors.length]}
              delay={i - 1}
              isVisible={true} // Always visible once we reach this step
            />
          );
        }
        
        return null; // Don't render future tokens
      })}

      {/* Progress indicator */}
      <Html position={[-6, -4, 0]}>
        <div style={{
          color: "#94a3b8",
          fontSize: "14px",
          background: "rgba(0,0,0,0.7)",
          padding: "8px 12px",
          borderRadius: "6px"
        }}>
          Vectors: {Math.min(currentStep + 1, points.length)} / {points.length}
        </div>
      </Html>

      {/* Matrix representation */}
      {showMatrix && (
        <MatrixRepresentation 
          embeddings={embeddings3d || hiddenStates?.[layer]} 
          tokens={tokens} 
          currentStep={currentStep}
        />
      )}

      {/* Toggle Matrix View Button */}
      <Html position={[6, -4, 0]}>
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          style={{
            background: showMatrix ? "#38bdf8" : "rgba(56, 189, 248, 0.3)",
            color: "white",
            border: "1px solid #38bdf8",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s ease"
          }}
        >
          {showMatrix ? "Hide Matrix" : "Show Matrix"}
        </button>
      </Html>
    </group>
  );
};
