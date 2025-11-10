"use client";
import { motion } from "framer-motion";

type ScoreboardProps = {
  blueScore: number;
  pinkScore: number;
  onBlueChange: (delta: number) => void;
  onPinkChange: (delta: number) => void;
};

export default function Scoreboard({
  blueScore,
  pinkScore,
  onBlueChange,
  onPinkChange,
}: ScoreboardProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "8%",
        width: "80%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "monospace",
        color: "#fff",
        fontWeight: "bold",
        zIndex: 20,
      }}
    >
      {/* === Blue team === */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => onBlueChange(-1)}
          style={{
            background: "rgba(25,215,25,0.3)",
            border: "1px solid #19d719",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "0.2rem 0.5rem",
            cursor: "pointer",
          }}
        >
          −
        </button>

        <motion.div
          key={blueScore}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          style={{
            fontSize: "1.8rem",
            textShadow: "0 0 8px rgba(25,215,25,0.7)",
          }}
        >
          BLUE: {blueScore}
        </motion.div>

        <button
          onClick={() => onBlueChange(+1)}
          style={{
            background: "rgba(25,215,25,0.3)",
            border: "1px solid #19d719",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "0.2rem 0.5rem",
            cursor: "pointer",
          }}
        >
          ＋
        </button>
      </div>

      {/* === Pink team === */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => onPinkChange(-1)}
          style={{
            background: "rgba(240,45,125,0.3)",
            border: "1px solid #f02d7d",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "0.2rem 0.5rem",
            cursor: "pointer",
          }}
        >
          −
        </button>

        <motion.div
          key={pinkScore}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          style={{
            fontSize: "1.8rem",
            textShadow: "0 0 8px rgba(240,45,125,0.7)",
          }}
        >
          PINK: {pinkScore}
        </motion.div>

        <button
          onClick={() => onPinkChange(+1)}
          style={{
            background: "rgba(240,45,125,0.3)",
            border: "1px solid #f02d7d",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "0.2rem 0.5rem",
            cursor: "pointer",
          }}
        >
          ＋
        </button>
      </div>
    </div>
  );
}
