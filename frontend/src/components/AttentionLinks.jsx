import React from "react";

export const AttentionLinks = ({ attention, tokens }) => {
  // attention: [layer][head][from][to]
  // For simplicity, show links from first head of last layer
  if (!attention || attention.length === 0) return null;
  const att = attention[attention.length - 1][0];
  return (
    <>
      {att.map((row, fromIdx) =>
        row.map((weight, toIdx) =>
          weight > 0.2 ? (
            <line
              key={`${fromIdx}-${toIdx}`}
              geometry={{
                vertices: [
                  [fromIdx * 2 - tokens.length, 0, 0.2],
                  [toIdx * 2 - tokens.length, 0, 0.2],
                ],
              }}
              material={{ color: `rgba(255,255,0,${weight})` }}
            />
          ) : null
        )
      )}
    </>
  );
};
