import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";

/**
 * Error boundary for React Three Fiber components
 * Catches and displays 3D rendering errors gracefully
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in R3F component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div
            style={{
              background: "#f87171",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            Something went wrong rendering the 3D scene.
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

/**
 * Main 3D scene wrapper component
 * 
 * Provides the Three.js Canvas with proper lighting, camera controls,
 * and environment setup for all LLM visualizations. Includes error
 * boundary for graceful handling of 3D rendering issues.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - 3D components to render
 * @returns {JSX.Element} Configured Three.js Canvas with controls
 */
export const LLMScene = ({ children }) => {
  const cameraRef = useRef();

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(10, 8, 10);
    }
  }, []);

  return (
    <Canvas
      camera={{
        position: [10, 8, 10], // 45-degree angle view
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      style={{ width: "100%", height: "100%", background: "#111" }}
    >
      <ErrorBoundary>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Environment preset="city" />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={8}
          maxDistance={20}
          minPolarAngle={Math.PI / 3} // Limit vertical rotation
          maxPolarAngle={Math.PI / 1.5}
          minAzimuthAngle={-Math.PI / 4} // Limit horizontal rotation
          maxAzimuthAngle={Math.PI / 4}
          zoomSpeed={0.5}
          rotateSpeed={0.5}
        />
        {children}
      </ErrorBoundary>
    </Canvas>
  );
};
