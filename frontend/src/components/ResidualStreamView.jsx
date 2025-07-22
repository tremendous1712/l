import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export const ResidualStreamView = ({ sentence }) => {
  const [chartData, setChartData] = useState([]);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const fetchResiduals = async () => {
      try {
        console.log("🔵 Sending sentence to backend:", sentence);

        const res = await axios.post("http://localhost:8000/residual_stream", {
          text: sentence,
        });

        console.log("Raw residual stream response:", res.data);

        const { layer_values, tokens } = res.data;

        if (
          !layer_values ||
          !Array.isArray(layer_values) ||
          layer_values.length === 0
        ) {
          console.warn("No residual data returned");
          setChartData([]);
          setTokens([]);
          return;
        }

        const numLayers = layer_values[0]?.length || 0;

        const formatted = Array.from({ length: numLayers }, (_, layerIdx) => {
          const point = { layer: layerIdx };
          tokens.forEach((_, tokenIdx) => {
            point[`token_${tokenIdx}`] = layer_values[tokenIdx][layerIdx];
          });
          return point;
        });

        setChartData(formatted);
        setTokens(tokens);
      } catch (err) {
        console.error("Error loading residuals:", err);
        setChartData([]);
        setTokens([]);
      }
    };

    if (sentence) fetchResiduals();
  }, [sentence]);

  return (
    <div style={{ color: "white", padding: "1rem" }}>
      <h2>Residual Stream Norms Across Layers</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="layer" />
            <YAxis />
            <Tooltip />
            <Legend />
            {tokens.map((tok, idx) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={`token_${idx}`}
                stroke={`hsl(${(idx * 97) % 360}, 100%, 70%)`}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: "gray" }}>
          No residual data available. Try a longer or more meaningful sentence.
        </p>
      )}
    </div>
  );
};
