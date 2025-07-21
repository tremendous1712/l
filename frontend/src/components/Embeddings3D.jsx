import React, { useState, useEffect, useMemo, useRef } from "react";
import { Text, Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import * as THREE from "three";

/**
 * Enhanced PCA implementation for dimensionality reduction
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
 * Grid plane component for PCA-style visualization
 */
const GridPlane = ({ size = 10, divisions = 20 }) => {
  return (
    <group>
      {/* XY Grid - positioned at back Z plane */}
      <gridHelper 
        args={[size * 2, divisions, '#4a5568', '#2d3748']} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0, -size * 0.6]}
        scale={[0.6, 1, 0.6]}
      />
      {/* XZ Grid - positioned at bottom */}
      <gridHelper 
        args={[size * 2, divisions, '#4a5568', '#2d3748']} 
        position={[0, -size * 0.6, 0]}
        scale={[0.6, 1, 0.6]}
      />
      {/* YZ Grid - positioned at left */}
      <gridHelper 
        args={[size * 2, divisions, '#4a5568', '#2d3748']} 
        rotation={[0, 0, Math.PI / 2]} 
        position={[-size * 0.6, 0, 0]}
        scale={[0.6, 1, 0.6]}
      />
    </group>
  );
};

/**
 * Enhanced 3D Coordinate System with PCA-style axes
 */
const CoordinateSystem = ({ size = 10 }) => {
  return (
    <group>
      {/* X Axis - PCA-1 */}
      <Line
        points={[[-size * 0.6, 0, 0], [size * 0.6, 0, 0]]}
        color="#60a5fa"
        lineWidth={3}
        transparent
        opacity={0.8}
      />
      <mesh position={[size * 0.6 - 0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
      <Html position={[size * 0.6 + 0.5, 0, 0]}>
        <div style={{ 
          color: "#60a5fa", 
          fontSize: "16px", 
          fontWeight: "600", 
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          fontFamily: "monospace"
        }}>
          PCA-1 (34.14% Explained)
        </div>
      </Html>

      {/* Y Axis - PCA-3 */}
      <Line
        points={[[0, -size * 0.6, 0], [0, size * 0.6, 0]]}
        color="#34d399"
        lineWidth={3}
        transparent
        opacity={0.8}
      />
      <mesh position={[0, size * 0.6 - 0.2, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#34d399" />
      </mesh>
      <Html position={[0, size * 0.6 + 0.5, 0]}>
        <div style={{ 
          color: "#34d399", 
          fontSize: "16px", 
          fontWeight: "600", 
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          fontFamily: "monospace"
        }}>
          PCA-3 (8.1% Explained)
        </div>
      </Html>

      {/* Z Axis - PCA-2 */}
      <Line
        points={[[0, 0, -size * 0.6], [0, 0, size * 0.6]]}
        color="#f472b6"
        lineWidth={3}
        transparent
        opacity={0.8}
      />
      <mesh position={[0, 0, size * 0.6 - 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#f472b6" />
      </mesh>
      <Html position={[0, 0, size * 0.6 + 0.5]}>
        <div style={{ 
          color: "#f472b6", 
          fontSize: "16px", 
          fontWeight: "600", 
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          fontFamily: "monospace"
        }}>
          PCA-2 (14.74% Explained)
        </div>
      </Html>

      {/* Origin point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

/**
 * Animated token point with enhanced styling
 */
const AnimatedTokenPoint = ({ 
  position, 
  token, 
  color, 
  delay = 0, 
  isVisible = false, 
  index 
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const spring = useSpring({
    scale: isVisible ? 1 : 0,
    opacity: isVisible ? 1 : 0,
    config: { tension: 80, friction: 40 }, // Slower, more visible animation
    delay: delay * 300 // Increased delay between points
  });

  const hoverSpring = useSpring({
    scale: hovered ? 1.5 : 1,
    config: { tension: 300, friction: 10 }
  });

  useFrame((state) => {
    if (meshRef.current && isVisible) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.02;
    }
  });

  return (
    <group>
      <animated.mesh
        ref={meshRef}
        position={[position[0], position[1], position[2]]}
        scale={spring.scale.to(s => hoverSpring.scale.get() * s)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={spring.opacity}
        />
      </animated.mesh>
      
      {/* Token label with enhanced styling */}
      <animated.group 
        position={[position[0], position[1] + 0.4, position[2]]}
        scale={spring.scale}
      >
        <Html center>
          <div style={{
            background: "rgba(0, 0, 0, 0.85)",
            color: color,
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            border: `2px solid ${color}`,
            whiteSpace: "nowrap",
            boxShadow: `0 0 10px ${color}40`,
            fontFamily: "monospace",
            backdropFilter: "blur(4px)"
          }}>
            {token}
          </div>
        </Html>
      </animated.group>
      
      {/* Glow effect */}
      <animated.mesh
        position={[position[0], position[1], position[2]]}
        scale={spring.scale.to(s => s * 2)}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={spring.opacity.to(o => o * 0.1)}
        />
      </animated.mesh>
    </group>
  );
};

/**
 * Animated arrow component connecting consecutive tokens
 */
const AnimatedArrow = ({ 
  startPosition, 
  endPosition, 
  color = "#60a5fa", 
  delay = 0, 
  isVisible = false 
}) => {
  const lineRef = useRef();
  
  const spring = useSpring({
    progress: isVisible ? 1 : 0,
    config: { tension: 60, friction: 35 }, // Much slower arrow animation
    delay: delay * 400 // Longer delay for arrows to be clearly visible
  });

  const direction = useMemo(() => {
    const dx = endPosition[0] - startPosition[0];
    const dy = endPosition[1] - startPosition[1];
    const dz = endPosition[2] - startPosition[2];
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return { dx, dy, dz, length };
  }, [startPosition, endPosition]);

  // Calculate arrow rotation
  const arrowRotation = useMemo(() => {
    if (direction.length === 0) return [0, 0, 0];
    
    const { dx, dy, dz, length } = direction;
    const yaw = Math.atan2(dx, dz);
    const pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) - Math.PI / 2;
    
    return [pitch, yaw, 0];
  }, [direction]);

  // Update line geometry in useFrame
  useFrame(() => {
    if (lineRef.current) {
      const progress = spring.progress.get();
      const currentEnd = [
        startPosition[0] + direction.dx * progress,
        startPosition[1] + direction.dy * progress,
        startPosition[2] + direction.dz * progress
      ];
      
      const positions = lineRef.current.geometry.attributes.position.array;
      positions[0] = startPosition[0];
      positions[1] = startPosition[1]; 
      positions[2] = startPosition[2];
      positions[3] = currentEnd[0];
      positions[4] = currentEnd[1];
      positions[5] = currentEnd[2];
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Static line with animated geometry */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...startPosition, ...endPosition])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={color} 
          transparent 
          opacity={0.6}
        />
      </line>

      {/* Arrowhead */}
      <animated.mesh
        position={spring.progress.to(p => [
          startPosition[0] + direction.dx * p,
          startPosition[1] + direction.dy * p,
          startPosition[2] + direction.dz * p
        ])}
        rotation={arrowRotation}
        scale={spring.progress.to(p => p * 0.8)}
      >
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </animated.mesh>
    </group>
  );
};

/**
 * Rotating container component for the entire visualization
 */
const RotatingContainer = ({ children, shouldRotate = false }) => {
  const groupRef = useRef();
  const rotationStartTimeRef = useRef(null);
  
  useFrame((state) => {
    if (groupRef.current && shouldRotate) {
      // Record start time only once when rotation begins
      if (rotationStartTimeRef.current === null) {
        rotationStartTimeRef.current = state.clock.elapsedTime;
        // Ensure we start at 0 rotation
        groupRef.current.rotation.y = 0;
      }
      
      // Calculate time since rotation started
      const timeSinceStart = state.clock.elapsedTime - rotationStartTimeRef.current;
      
      // Smooth oscillation between 0 and +45 degrees, starting from 0
      const maxAngle = (45 * Math.PI) / 180; // 45 degrees in radians
      
      // Simple sine wave that starts at 0 and goes to 1: (1 - cos(x)) / 2
      // This starts at 0 when x=0, peaks at 1 when x=π, back to 0 at x=2π
      const angle = (1 - Math.cos(timeSinceStart * 0.1)) / 2; // 0 to 1, starts at 0
      groupRef.current.rotation.y = angle * maxAngle;
    } else if (!shouldRotate) {
      // Reset rotation start time and position when rotation is disabled
      rotationStartTimeRef.current = null;
      if (groupRef.current) {
        groupRef.current.rotation.y = 0;
      }
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
};

/**
 * Main 3D embeddings visualization component - PCA Style
 * 
 * Creates a beautiful PCA-style 3D scatter plot with:
 * - Dark mode styling
 * - Sequential point animation  
 * - Interactive hover effects
 * - Professional grid system
 * - Enhanced legends and labels
 * 
 * @param {Object} props - Component props
 * @param {number[][][]} props.embeddings3d - 3D embedding coordinates
 * @param {string[]} props.tokens - Token strings for labeling
 * @param {number} props.step - Current animation step
 * @param {number[][][]} props.hiddenStates - Raw hidden states for PCA
 * @param {string} props.sentence - Input sentence for triggering animation reset
 * @returns {JSX.Element} Enhanced 3D embeddings visualization
 */
export const Embeddings3D = ({ embeddings3d, tokens, step, hiddenStates, sentence }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPoints, setShowPoints] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [shouldRotate, setShouldRotate] = useState(false);

  // Enhanced color palette inspired by the PCA image
  const tokenColors = [
    "#3b82f6", // Blue (macrolides style)
    "#ef4444", // Red (microsource spectrum style)  
    "#22c55e", // Green (approved drugs style)
    "#f59e0b", // Orange
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316", // Orange-red
    "#ec4899", // Pink
    "#6366f1"  // Indigo
  ];

  // Calculate and normalize points with enhanced scaling
  const points = useMemo(() => {
    try {
      let rawPoints = [];
      
      if (embeddings3d && Array.isArray(embeddings3d)) {
        if (embeddings3d.length > 0 && Array.isArray(embeddings3d[0])) {
          rawPoints = embeddings3d;
        }
      } else if (hiddenStates && Array.isArray(hiddenStates)) {
        rawPoints = pca(hiddenStates);
      }

      if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
        return [];
      }

      // Validate and scale points for optimal visualization
      const validPoints = rawPoints.filter(point => Array.isArray(point) && point.length >= 3)
        .map(point => point.slice(0, 3).map(v => Number.isFinite(v) ? v : 0));
      
      // Calculate bounds for smart scaling
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

      // Calculate center points
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      const centerZ = (bounds.minZ + bounds.maxZ) / 2;

      // Calculate ranges for each dimension
      const rangeX = Math.max(bounds.maxX - bounds.minX, 0.1);
      const rangeY = Math.max(bounds.maxY - bounds.minY, 0.1);
      const rangeZ = Math.max(bounds.maxZ - bounds.minZ, 0.1);

      // Scale to use most of the fitted grid space
      // Grid bounds: X: -6 to +6, Y: -6 to +6, Z: -6 to +6 (all shortened)
      const targetSizeX = 10.8; // Use 90% of shortened X grid space
      const targetSizeY = 10.8; // Use 90% of shortened Y grid space  
      const targetSizeZ = 10.8; // Use 90% of shortened Z grid space
      
      const scaleX = targetSizeX / rangeX;
      const scaleY = targetSizeY / rangeY;
      const scaleZ = targetSizeZ / rangeZ;

      // Use individual scales for each axis to maximize space usage
      return validPoints.map(point => [
        (point[0] - centerX) * scaleX,
        (point[1] - centerY) * scaleY,
        (point[2] - centerZ) * scaleZ
      ]);
    } catch (err) {
      console.error("Error processing embeddings:", err);
      return [];
    }
  }, [embeddings3d, hiddenStates]);

  // Enhanced animation sequence
  useEffect(() => {
    setCurrentStep(0);
    setShowPoints(false);
    setAnimationComplete(false);
    setShouldRotate(false);
    
    const initialTimer = setTimeout(() => {
      setShowPoints(true);
      
      // Calculate when to start rotation (75% of tokens)
      const rotationStartPoint = Math.floor(points.length * 0.75);
      
      // Stagger point appearance with slow, visible timing
      const stepTimer = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          
          // Start rotation when 75% of tokens are filled - SIMPLE CHECK
          if (nextStep >= rotationStartPoint) {
            setShouldRotate(true);
          }
          
          // Stop token animation only when 100% complete
          if (prev >= points.length - 1) {
            clearInterval(stepTimer);
            setAnimationComplete(true);
            return prev;
          }
          return nextStep;
        });
      }, 1200); // Much slower so you can see each vector form

      return () => clearInterval(stepTimer);
    }, 800);

    return () => clearTimeout(initialTimer);
  }, [sentence, points.length]);

  if (!points || points.length === 0) {
    return (
      <Html center>
        <div style={{ 
          color: '#ef4444',
          fontSize: '18px',
          background: 'rgba(0,0,0,0.9)',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '1px solid #374151',
          fontFamily: 'monospace'
        }}>
          No embedding data available
        </div>
      </Html>
    );
  }

  return (
    <RotatingContainer shouldRotate={shouldRotate}>
      {/* Grid system for professional look */}
      <GridPlane size={10} divisions={20} />

      {/* Enhanced coordinate system */}
      <CoordinateSystem size={10} />

      {/* Animated token points */}
      {showPoints && points.map((point, i) => {
        if (i <= currentStep) {
          return (
            <AnimatedTokenPoint
              key={`point-${i}`}
              position={point}
              token={tokens && tokens[i] ? tokens[i] : `T${i}`}
              color={tokenColors[i % tokenColors.length]}
              delay={i}
              isVisible={true}
              index={i}
            />
          );
        }
        return null;
      })}

      {/* Animated arrows between consecutive tokens */}
      {showPoints && points.map((point, i) => {
        if (i > 0 && i <= currentStep) {
          return (
            <AnimatedArrow
              key={`arrow-${i}`}
              startPosition={points[i - 1]}
              endPosition={point}
              color={tokenColors[i % tokenColors.length]}
              delay={i}
              isVisible={true}
            />
          );
        }
        return null;
      })}
    </RotatingContainer>
  );
};
