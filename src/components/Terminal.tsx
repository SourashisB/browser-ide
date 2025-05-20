import React from "react";

type Props = {
  output: string;
  onClear: () => void;
};

const Terminal: React.FC<Props> = ({ output, onClear }) => (
  <div style={{
    background: "#1e1e1e",
    color: "#d4d4d4",
    fontFamily: "monospace",
    padding: 12,
    height: "100%",
    overflowY: "auto",
    position: "relative"
  }}>
    <button
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        background: "#333",
        color: "#eee",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        padding: "2px 8px"
      }}
      onClick={onClear}
    >
      Clear
    </button>
    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{output}</pre>
  </div>
);

export default Terminal;