import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

/**
 * 3D visualization of softmax probability distribution
 * 
 * Displays next token predictions as animated 3D bars, showing the
 * probability distribution over potential next tokens. Features animated
 * bar scaling and probability labels.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.nextToken - Next token prediction data
 * @param {string} props.nextToken.token - Predicted token
 * @param {number} props.nextToken.token_id - Token ID
 * @param {Array} props.nextToken.probs - Array of {token, prob} objects
 * @returns {JSX.Element} 3D softmax probability visualization
 */
export const SoftmaxView = ({ nextToken }) => {
  const [showBars, setShowBars] = useState(false);
  const [temperature, setTemperature] = useState(1.0);

  useEffect(() => {
    setShowBars(false);
    const timer = setTimeout(() => setShowBars(true), 1000);
    return () => clearTimeout(timer);
  }, [nextToken, temperature]);

  if (!nextToken || !nextToken.probs) {
    return (
      <Html center>
        <div style={{ color: '#f87171' }}>No softmax data</div>
      </Html>
    );
  }

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

  const tempProbs = applyTemperature(nextToken.probs, temperature);
  const maxProb = Math.max(...tempProbs.map(p => p.prob));

  // Animation springs for each bar
  const barSprings = tempProbs.map((p, i) => useSpring({
    scaleY: showBars ? p.prob / maxProb : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  }));
  
  return (
    <group position={[0, 0, 0]}>
      {/* Title */}
      <Html center position={[0, 4, 0]}>
        <div style={{ color: "#38bdf8", fontSize: "24px", fontWeight: "bold", textAlign: "center", transform: "translateX(-50%)" }}>
          Softmax Probabilities
        </div>
      </Html>

      {/* Temperature slider */}
      <Html center position={[6, 3, 0]}>
        <div style={{ 
          background: "rgba(0,0,0,0.7)", 
          padding: "10px 18px", 
          borderRadius: "8px", 
          color: "#fff", 
          fontSize: "1em", 
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
        }}>
          <label htmlFor="temp-slider" style={{ marginRight: 10 }}>
            Temperature: <span style={{ color: "#f59e42", fontWeight: "bold" }}>{temperature.toFixed(2)}</span>
          </label>
          <input
            id="temp-slider"
            type="range"
            min="0.5"
            max="2.0"
            step="0.01"
            value={temperature}
            onChange={e => setTemperature(Number(e.target.value))}
            style={{ verticalAlign: "middle", width: 120 }}
          />
        </div>
      </Html>

      {/* Bars - centered in 3D space */}
      {tempProbs.map((prob, i) => (
        <group key={i} position={[(i * 1.2) - ((tempProbs.length * 1.2) / 2), 0, 0]}>
          <animated.mesh 
            position-y={barSprings[i].scaleY.to(s => s * 2)}
            scale={barSprings[i].scaleY.to(s => [1, s, 1])}
            position={[0, 2, 0]}
          >
            <boxGeometry args={[1, 4, 1]} />
            <meshStandardMaterial color={i === 0 ? "#f59e42" : "#38bdf8"} />
          </animated.mesh>
          
          {/* Token labels */}
          <Html center position={[0, -2, 0]}>
            <div style={{ 
              color: "white", 
              transform: "scale(0.7) translateX(-50%)",
              textAlign: "center",
              width: "100px"
            }}>
              <div style={{ fontWeight: "bold" }}>{prob.token}</div>
              <div style={{ color: "#aaa" }}>{(prob.prob * 100).toFixed(1)}%</div>
            </div>
          </Html>
        </group>
      ))}

      {/* Predicted token */}
      <Html center position={[0, -3, 0]}>
        <div style={{ 
          background: "rgba(0,0,0,0.5)", 
          padding: "10px 20px", 
          borderRadius: "8px",
          color: "white",
          textAlign: "center",
          transform: "translateX(-50%)"
        }}>
          <strong>Next Token:</strong>{" "}
          <span style={{ color: "#f59e42" }}>{nextToken.token}</span>
        </div>
      </Html>
    </group>
  );
};
