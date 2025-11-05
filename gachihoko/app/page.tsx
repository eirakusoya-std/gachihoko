"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MeshData = {
  value: number;
  player: number;
  occurred_at: string;
};

export default function Page() {
  const [blueTotal, setBlueTotal] = useState(0);
  const [pinkTotal, setPinkTotal] = useState(0);
  const [meshData, setMeshData] = useState<MeshData | null>(null);
  const [lastOccurredAt, setLastOccurredAt] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/mesh-data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      // ✅ active=falseなら加算処理をスキップ
      if (!data.active) return;

      if (data.latest) {
        const latest = data.latest as MeshData;

        // 重複防止（同じoccurred_atならスキップ）
        if (latest.occurred_at !== lastOccurredAt) {
          setMeshData(latest);
          setLastOccurredAt(latest.occurred_at);

          if (latest.player === 1) {
            setBlueTotal((prev) => Math.min(prev + latest.value, 100));
          } else if (latest.player === 2) {
            setPinkTotal((prev) => Math.min(prev + latest.value, 100));
          }
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, [lastOccurredAt]);

  const blueColor = "#00bfff";
  const pinkColor = "#ff69b4";

  const totalSum = Math.min(blueTotal + pinkTotal, 100);
  const blueRatio = (blueTotal / totalSum) * 100 || 0;
  const pinkRatio = (pinkTotal / totalSum) * 100 || 0;

  return (
    <main
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #ffffff 0%, #cccccc 100%)",
        color: "#333",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#444" }}>
        Splatoon-style Dual Gauge ⚔️
      </h1>

      <div
        style={{
          position: "relative",
          width: "80%",
          height: "60px",
          background: "#eee",
          borderRadius: "999px",
          overflow: "hidden",
          boxShadow: "0 0 15px rgba(0,0,0,0.3) inset",
          display: "flex",
        }}
      >
        {/* Blue side */}
        <motion.div
          animate={{ width: `${blueRatio}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            height: "100%",
            background: blueColor,
            borderRadius: "inherit",
            transformOrigin: "left center",
          }}
        />

        {/* Pink side */}
        <motion.div
          animate={{ width: `${pinkRatio}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            height: "100%",
            background: pinkColor,
            borderRadius: "inherit",
            transformOrigin: "right center",
            marginLeft: "auto",
          }}
        />
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "3rem" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: blueColor, fontSize: "1.2rem", fontWeight: "bold" }}>
            BLUE
          </p>
          <p style={{ fontSize: "1rem" }}>{Math.floor(blueTotal)} pts</p>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: pinkColor, fontSize: "1.2rem", fontWeight: "bold" }}>
            PINK
          </p>
          <p style={{ fontSize: "1rem" }}>{Math.floor(pinkTotal)} pts</p>
        </div>
      </div>

      <AnimatePresence>
        {meshData && (
          <motion.p
            key={meshData.occurred_at}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: "1.5rem",
              fontSize: "0.9rem",
              color:
                meshData.player === 1
                  ? blueColor
                  : meshData.player === 2
                  ? pinkColor
                  : "#333",
            }}
          >
            Player {meshData.player}: +{meshData.value.toFixed(2)}
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}
