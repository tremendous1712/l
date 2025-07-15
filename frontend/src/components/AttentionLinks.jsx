import React from "react";
import { Line } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

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
