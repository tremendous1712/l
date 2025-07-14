import React from "react";
import { Text } from "@react-three/drei";

export const SoftmaxPrediction3D = ({ token, position }) => {
  // Highlight the predicted token in 3D
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#f59e42" />
      </mesh>
      <Text
        position={[0, 0, 0.21]}
        fontSize={0.25}
        color="#fff"
        anchorX="center"
        anchorY="middle"
      >
        {token}
      </Text>
    </group>
  );
};
