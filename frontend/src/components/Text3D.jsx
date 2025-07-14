import React from 'react';
import { Text } from '@react-three/drei';

export const Text3D = ({ children, fontSize = 0.2, color = 'white', position = [0, 0, 0], ...props }) => {
  return (
    <Text
      fontSize={fontSize}
      color={color}
      position={position}
      anchorX="center"
      anchorY="middle"
      {...props}
    >
      {children}
    </Text>
  );
};
