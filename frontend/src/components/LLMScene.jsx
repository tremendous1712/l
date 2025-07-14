import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

export const LLMScene = ({ children }) => {
  const cameraRef = useRef();
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 12);
    }
  }, []);
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Environment preset="city" />
      <OrbitControls />
      {children}
    </Canvas>
  );
};
