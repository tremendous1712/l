import React, { useState, useEffect, useMemo, useRef } from "react";
import { Text, Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import * as THREE from "three";

/**
 * Validate and format a point to ensure it's a valid 3D coordinate
 * @param {number[]} point - Input point array
 * @returns {number[]} Valid 3D coordinate [x, y, z]
 */
const validatePoint = (point) => {
  if (!Array.isArray(point)) {
    console.warn("Invalid point format:", point);
    return [0, 0, 0];
  }
  return point.slice(0, 3).map(v => Number.isFinite(v) ? v : 0);
};

/**
 * Simple PCA implementation for dimensionality reduction
 * @param {number[][]} data - Input data matrix
 * @param {number} n_components - Number of components to keep (default: 3)
 * @returns {number[][]} Reduced dimensionality data
 */
function pca(data, n_components = 3) {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  const X = data;
  const mean = X[0].map((_, col) => X.reduce((acc, row) => acc + row[col], 0) / X.length);
  const centered = X.map(row => row.map((v, i) => v - mean[i]));
  
  // Simple approach: just take first 3 dimensions and normalize
  return centered.map(row => row.slice(0, n_components));
}

/**
 * 3D Coordinate System component with labeled axes
 * 
 * Renders X (red), Y (green), and Z (blue) axes with directional arrows
 * and labels, plus an origin point.
 * 
 * @param {Object} props - Component props
 * @param {number} props.size - Length of each axis (default: 8)
 * @returns {JSX.Element} 3D coordinate system
 */
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

/**
 * Animated vector component connecting tokens in 3D space
 * 
 * Draws an animated vector from one position to another with labels,
 * representing the sequential flow of tokens through embedding space.
 * 
 * @param {Object} props - Component props
 * @param {number[]} props.startPosition - Start position [x, y, z]
 * @param {number[]} props.endPosition - End position [x, y, z]
 * @param {string} props.startToken - Label for start position
 * @param {string} props.endToken - Label for end position
 * @param {string} props.color - Vector color
 * @param {number} props.delay - Animation delay multiplier
 * @param {boolean} props.isVisible - Whether vector should be visible
 * @returns {JSX.Element} Animated vector with labels
 */
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
      {/* Start token label */}
      {startToken !== 'Origin' && (
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
      )}

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

/**
 * Main 3D embeddings visualization component
 * 
 * Displays token embeddings as vectors in 3D space with sequential animation.
 * Handles PCA dimensionality reduction, coordinate system rendering, and
 * step-by-step vector appearance with proper scaling.
 * 
 * Features:
 * - Automatic scaling to maximize 3D space usage
 * - Sequential vector animation with delays
 * - Color-coded vectors for different tokens
 * - Origin-based first vector positioning
 * - Progress indicator
 * 
 * @param {Object} props - Component props
 * @param {number[][][]} props.embeddings3d - 3D embedding coordinates
 * @param {string[]} props.tokens - Token strings for labeling
 * @param {number} props.layer - Current layer index
 * @param {number} props.step - Current animation step
 * @param {number[][][]} props.hiddenStates - Raw hidden states for PCA
 * @param {string} props.sentence - Input sentence for triggering animation reset
 * @returns {JSX.Element} 3D embeddings visualization
 */
export const Embeddings3D = ({ embeddings3d, tokens, layer, step, hiddenStates, sentence }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVectors, setShowVectors] = useState(false);

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

      // Scale to fit in a 7.5x7.5x7.5 space to maximize usage
      const range = Math.max(
        bounds.maxX - bounds.minX,
        bounds.maxY - bounds.minY,
        bounds.maxZ - bounds.minZ,
        1
      );
      
      const scale = 7.5 / range;
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
        if (i <= currentStep) {
          const startPos = i === 0 ? [0, 0, 0] : points[i - 1];
          const startTok = i === 0 ? "Origin" : (tokens && tokens[i - 1] ? tokens[i - 1] : `T${i-1}`);
          
          return (
            <AnimatedVector
              key={`vector-${i}`}
              startPosition={startPos}
              endPosition={point}
              startToken={startTok}
              endToken={tokens && tokens[i] ? tokens[i] : `T${i}`}
              color={vectorColors[i % vectorColors.length]}
              delay={i}
              isVisible={true}
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
    </group>
  );
};
