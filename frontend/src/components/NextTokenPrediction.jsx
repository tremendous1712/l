import React from "react";

export const NextTokenPrediction = ({ prediction }) => {
  if (!prediction) return null;
  return (
    <div style={{ color: "#38bdf8", fontSize: "1.2em", margin: "1em" }}>
      <strong>Next Token Prediction:</strong> {prediction.token} (prob: {prediction.probability})
    </div>
  );
};
