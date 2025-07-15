import React from "react";
import { Line } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

/**
 * Animated line component for attention visualization
 * 
 * @param {Object} props - Component props
 * @param {number[]} props.start - Start position [x, y, z]
 * @param {number[]} props.end - End position [x, y, z]
 * @param {number} props.weight - Attention weight (0-1)
 * @returns {JSX.Element} Animated line with progress animation
 */
const AnimatedLine = ({ start, end, weight }) => {
  const { progress } = useSpring({
    from: { progress: 0 },
    to: { progress: 1 },
    config: { duration: 500 },
  });

  const points = progress.to((p) => {
    const interpolatedEnd = [
      start[0] + (end[0] - start[0]) * p,
      start[1] + (end[1] - start[1]) * p,
      start[2] + (end[2] - start[2]) * p,
    ];
    return [start, interpolatedEnd];
  });

  return (
    <animated.group>
      <Line
        points={points}
        color="yellow"
        lineWidth={3}
        opacity={weight}
        transparent
      />
    </animated.group>
  );
};

/**
 * 3D attention links visualization component
 * 
 * Renders animated lines showing attention weights between tokens.
 * Only displays connections above a threshold weight for clarity.
 * 
 * @param {Object} props - Component props
 * @param {number[][][][]} props.attention - Attention matrices [layer][head][from][to]
 * @param {string[]} props.tokens - Token strings for positioning
 * @returns {JSX.Element} Collection of animated attention links
 */
export const AttentionLinks = ({ attention, tokens }) => {
  // attention: [layer][head][from][to]
  // For simplicity, show links from first head of last layer
  if (!attention || attention.length === 0) return null;
  const att = attention[attention.length - 1][0];
  return (
    <>
      {att.map((row, fromIdx) =>
        row.map((weight, toIdx) =>
          weight > 0.2 ? (
            <AnimatedLine
              key={`${fromIdx}-${toIdx}`}
              start={[fromIdx * 2 - tokens.length, 0, 0.2]}
              end={[toIdx * 2 - tokens.length, 0, 0.2]}
              weight={weight}
            />
          ) : null
        )
      )}
    </>
  );
};
