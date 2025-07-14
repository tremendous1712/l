import React from "react";
import { animated, useSpring } from "@react-spring/three";

// AttentionArcs3D: Animated attention links/arcs between tokens
export const AttentionArcs3D = ({ attention, tokens, step }) => {
  // attention: [layer][head][from][to]
  if (!attention || attention.length === 0) return null;
  const att = attention[attention.length - 1][0]; // last layer, first head
  return (
    <group>
      {att.map((row, fromIdx) =>
        row.map((weight, toIdx) => {
          if (weight > 0.2 && step >= fromIdx && step >= toIdx) {
            const spring = useSpring({
              opacity: weight,
              config: { tension: 120, friction: 12 },
            });
            return (
              <animated.line
                key={`${fromIdx}-${toIdx}`}
                points={[[fromIdx * 2 - tokens.length, 0, 0.2], [toIdx * 2 - tokens.length, 0, 0.2]]}
                color={`rgba(255,255,0,${weight})`}
                opacity={spring.opacity}
              />
            );
          }
          return null;
        })
      )}
    </group>
  );
};
