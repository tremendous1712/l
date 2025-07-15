import React from "react";

/**
 * Full-screen loading overlay component
 * 
 * Displays a centered loading message with backdrop overlay.
 * Used during API calls to indicate processing state.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display (defaults to "Loading...")
 * @returns {JSX.Element} Full-screen loading overlay
 */
export const LoadingOverlay = ({ message }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(34,34,34,0.7)",
      zIndex: 9999,
    }}
  >
    <div style={{
      background: "rgba(34,34,34,0.9)",
      color: "#38bdf8",
      padding: "2em 3em",
      borderRadius: "12px",
      fontSize: "1.5em",
      fontWeight: "bold",
      boxShadow: "0 2px 16px #0008"
    }}>
      {message || "Loading..."}
    </div>
  </div>
);
