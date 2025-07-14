import React from "react";
import { Text } from "@react-three/drei";

export const EmbeddingBlock = ({ embedding, token, position }) => {
  // Simple visualization: color/size by norm
  const norm = Math.sqrt(embedding.reduce((acc, v) => acc + v * v, 0));
  const color = `rgb(${Math.min(255, norm * 10)}, 100, 200)`;
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <group position={[0, 0, 0.21]}>
        <Text fontSize={0.2} color="white" anchorX="center" anchorY="middle">
          {token}
        </Text>
      </group>
    </group>
  );
};
