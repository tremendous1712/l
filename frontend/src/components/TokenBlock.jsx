import React from "react";
import { Text, Box } from "@react-three/drei";

export const TokenBlock = ({ token, position }) => {
  return (
    <group position={position}>
      <Box args={[1.2, 0.6, 0.2]}>
        <meshStandardMaterial color="#4f46e5" />
      </Box>
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {token}
      </Text>
    </group>
  );
};
