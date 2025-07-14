import React from "react";
import { animated, useSpring } from "@react-spring/three";
import { Text, Box } from "@react-three/drei";

export const TokenBlocks3D = ({ tokens, step }) => {
  // Animate tokens appearing one by one
  return (
    <group>
      {tokens.map((token, i) => {
        const spring = useSpring({
          scale: step >= i ? 1 : 0,
          config: { tension: 200, friction: 20 },
        });
        return (
          <animated.group key={i} position={[i * 2 - tokens.length, 0, 0]} scale={spring.scale}>
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
    </group>
  );
};
