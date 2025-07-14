
import React from "react";
import { animated, useSpring } from "@react-spring/three";

// Simple PCA implementation for dimensionality reduction
function pca(data, n_components = 3) {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  const X = data;
  const mean = X[0].map((_, col) => X.reduce((acc, row) => acc + row[col], 0) / X.length);
  const centered = X.map(row => row.map((v, i) => v - mean[i]));
  // Covariance matrix
  const cov = centered[0].map((_, i) => centered.map(row => row[i]));
  const covMatrix = cov.map(col => col.map((_, j) => col.reduce((acc, v, k) => acc + v * centered[k][j], 0) / (X.length - 1)));
  // Eigen decomposition (approximate: just take first 3 columns)
  return centered.map(row => row.slice(0, n_components));
}

// Embeddings3D: Show embeddings as animated points in 3D space
export const Embeddings3D = ({ embeddings3d, tokens, layer, step, hiddenStates, sentence }) => {
  let points = [];
  if (embeddings3d && embeddings3d[layer]) {
    points = embeddings3d[layer];
  } else if (hiddenStates && hiddenStates[layer]) {
    // Reduce hidden states to 3D using PCA
    points = pca(hiddenStates[layer]);
  }
  if (!points || points.length === 0) {
    return (
      <group><mesh><boxGeometry args={[2,1,0.2]} /><meshStandardMaterial color="#f87171" /></mesh></group>
    );
  }
  // Animation: show sentence, then conversion, then scatter plot
  const [showEmb, setShowEmb] = React.useState(false);
  React.useEffect(() => {
    setShowEmb(false);
    const timer = setTimeout(() => setShowEmb(true), 1200);
    return () => clearTimeout(timer);
  }, [sentence]);
  return (
    <group>
      {!showEmb ? (
        <>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[6, 1, 0.2]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0, 0.5, 0.3]}>
            <textGeometry args={[sentence, { size: 0.4, height: 0.01 }]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0, -0.7, 0.3]}>
            <textGeometry args={["Converting to embeddings...", { size: 0.3, height: 0.01 }]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </>
      ) : (
        points.map((point, i) => (
          <>
            <animated.mesh key={i} position={point}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshStandardMaterial color="#38bdf8" />
            </animated.mesh>
            <mesh position={[point[0], point[1]+0.4, point[2]]}>
              <textGeometry args={[tokens[i], { size: 0.18, height: 0.01 }]} />
              <meshStandardMaterial color="#fff" />
            </mesh>
          </>
        ))
      )}
    </group>
  );
};
