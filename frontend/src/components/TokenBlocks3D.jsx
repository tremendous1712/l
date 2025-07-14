import React from "react";
import { animated, useSpring } from "@react-spring/three";
import { Text, Box, Html } from "@react-three/drei";

// Matrix view of tokens showing their raw data
const TokenMatrix = ({ tokens, step }) => {
  return (
    <Html position={[0, -2, 0]}>
      <div style={{
        background: "rgba(0,0,0,0.9)",
        border: "2px solid #4f46e5",
        borderRadius: "12px",
        padding: "20px",
        color: "white",
        fontFamily: "monospace",
        minWidth: "600px"
      }}>
        <h3 style={{ color: "#4f46e5", marginTop: 0, textAlign: "center" }}>
          Token Matrix View
        </h3>
        
        <table style={{
          borderCollapse: "collapse",
          width: "100%",
          fontSize: "14px"
        }}>
          <thead>
            <tr>
              <th style={{ 
                border: "1px solid #444", 
                padding: "12px", 
                background: "#1e293b",
                color: "#4f46e5"
              }}>
                Index
              </th>
              <th style={{ 
                border: "1px solid #444", 
                padding: "12px", 
                background: "#1e293b",
                color: "#4f46e5"
              }}>
                Token
              </th>
              <th style={{ 
                border: "1px solid #444", 
                padding: "12px", 
                background: "#1e293b",
                color: "#4f46e5"
              }}>
                Length
              </th>
              <th style={{ 
                border: "1px solid #444", 
                padding: "12px", 
                background: "#1e293b",
                color: "#4f46e5"
              }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, i) => (
              <tr key={i} style={{
                background: i <= step ? "rgba(79, 70, 229, 0.2)" : "rgba(100, 116, 139, 0.1)",
                transition: "background-color 0.3s"
              }}>
                <td style={{ 
                  border: "1px solid #444", 
                  padding: "12px",
                  textAlign: "center",
                  color: i <= step ? "#4f46e5" : "#64748b"
                }}>
                  {i}
                </td>
                <td style={{ 
                  border: "1px solid #444", 
                  padding: "12px",
                  fontWeight: "bold",
                  color: i <= step ? "#e2e8f0" : "#64748b"
                }}>
                  "{token}"
                </td>
                <td style={{ 
                  border: "1px solid #444", 
                  padding: "12px",
                  textAlign: "center",
                  color: i <= step ? "#fbbf24" : "#64748b"
                }}>
                  {token.length}
                </td>
                <td style={{ 
                  border: "1px solid #444", 
                  padding: "12px",
                  textAlign: "center",
                  color: i <= step ? "#22c55e" : "#64748b"
                }}>
                  {i <= step ? "✓ Processed" : "⏳ Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{
          marginTop: "15px",
          padding: "12px",
          background: "rgba(79, 70, 229, 0.1)",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#94a3b8"
        }}>
          <strong style={{ color: "#4f46e5" }}>Matrix Info:</strong><br/>
          • Total tokens: {tokens.length}<br/>
          • Processed: {Math.min(step + 1, tokens.length)} / {tokens.length}<br/>
          • Current step: {step >= 0 ? step : "None"}
        </div>
      </div>
    </Html>
  );
};

export const TokenBlocks3D = ({ tokens, step }) => {
  // Center tokens in the viewport, using their count and spacing
  const spacing = 2;
  const centerOffset = ((tokens.length - 1) * spacing) / 2;
  
  return (
    <group>
      {/* 3D Token Blocks */}
      {tokens.map((token, i) => {
        const spring = useSpring({
          scale: step >= i ? 1 : 0,
          config: { tension: 200, friction: 20 },
        });
        return (
          <animated.group key={i} position={[(i * spacing) - centerOffset, 0, 0]} scale={spring.scale}>
            <Box args={[1.2, 0.6, 0.2]}>
              <meshStandardMaterial color="#4f46e5" />
            </Box>
            <Text
              position={[0, 0, 0.21]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {token}
            </Text>
          </animated.group>
        );
      })}

      {/* Matrix Representation */}
      <TokenMatrix tokens={tokens} step={step} />
    </group>
  );
};
