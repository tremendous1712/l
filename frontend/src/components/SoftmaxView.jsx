import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

export const SoftmaxView = ({ nextToken }) => {
  const [showBars, setShowBars] = useState(false);
  
  useEffect(() => {
    setShowBars(false);
    const timer = setTimeout(() => setShowBars(true), 1000);
    return () => clearTimeout(timer);
  }, [nextToken]);

  if (!nextToken || !nextToken.probs) {
    return (
      <Html center>
        <div style={{ color: '#f87171' }}>No softmax data</div>
      </Html>
    );
  }
  
  const { probs, token, token_id } = nextToken;
  const maxProb = Math.max(...probs.map(p => p.prob));
  
  // Animation springs for each bar
  const barSprings = probs.map((p, i) => useSpring({
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

      {/* Bars - centered in 3D space */}
      {probs.map((prob, i) => (
        <group key={i} position={[(i * 1.2) - ((probs.length * 1.2) / 2), 0, 0]}>
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
          <span style={{ color: "#f59e42" }}>{token}</span>
        </div>
      </Html>
    </group>
  );
};
