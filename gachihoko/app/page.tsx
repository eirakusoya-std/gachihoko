"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MeshData = {
  value: number;
  player: number;
  occurred_at: string;
};

export default function Page() {
  const [gauge, setGauge] = useState(0); // -100 ~ 100
  const [meshData, setMeshData] = useState<MeshData | null>(null);
  const [lastOccurredAt, setLastOccurredAt] = useState<string | null>(null);
  const [winner, setWinner] = useState<"blue" | "pink" | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/mesh-data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      if (!data.active) return;

      if (data.latest) {
        const latest = data.latest as MeshData;

        if (latest.occurred_at !== lastOccurredAt) {
          setMeshData(latest);
          setLastOccurredAt(latest.occurred_at);

          updateGauge(latest.player, latest.value);
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, [lastOccurredAt]);

  const updateGauge = (player: number, value: number) => {
    setGauge((prev) => {
      const next =
        player === 1
          ? Math.min(prev + value, 100)
          : Math.max(prev - value, -100);

      if (next >= 50) setWinner("blue");
      else if (next <= -50) setWinner("pink");

      return next;
    });
  };

  const handleManualAdd = () => updateGauge(1, 5);
  const handleManualSub = () => updateGauge(2, 5);
  const handleReset = () => {
    setGauge(0);
    setWinner(null);
  };

  const blueColor = "#00bfff";
  const pinkColor = "#ff69b4";

  // gauge (-100 ~ 100) → 中央の境界線を動かす位置
  const centerPercent = (gauge + 100) / 2; // -100→0%, +100→100%

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
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#444" }}>
        Splatoon-style Tug-of-War ⚖️
      </h1>

      {/* === ゲージバー === */}
      <div
        style={{
          position: "relative",
          width: "80%",
          height: "60px",
          background: pinkColor, // ← 背景をピンク固定にする
          borderRadius: "999px",
          overflow: "hidden",
          boxShadow: "0 0 15px rgba(0,0,0,0.3) inset",
        }}
      >
        {/* === 青ゾーン === */}
        <motion.div
          animate={{ width: `${centerPercent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            background: blueColor,
            borderRadius: "inherit",
            zIndex: 2, // ← ピンクの上に重ねる
          }}
        />

        {/* === 中央線 === */}
        <motion.div
          animate={{ left: `${centerPercent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "2px",
            background: "#fff",
            zIndex: 3, // ← 一番上に境界線
            boxShadow: "0 0 6px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* === ゲージ値 === */}
      <p style={{ fontSize: "1.2rem" }}>
        Gauge: {gauge.toFixed(1)}{" "}
        <span style={{ opacity: 0.6 }}>(range: -100 ~ +100)</span>
      </p>

      {/* === デバッグボタン === */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handleManualAdd}
          style={{
            background: blueColor,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ＋ Blue +5
        </button>
        <button
          onClick={handleManualSub}
          style={{
            background: pinkColor,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          − Pink +5
        </button>
        <button
          onClick={handleReset}
          style={{
            background: "#777",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Reset
        </button>
      </div>

      {/* === 勝敗表示 === */}
      {winner && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 10 }}
          style={{
            marginTop: "1rem",
            padding: "10px 20px",
            borderRadius: "12px",
            background: winner === "blue" ? blueColor : pinkColor,
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          {winner === "blue" ? "BLUE WINS!" : "PINK WINS!"}
        </motion.div>
      )}

      {/* === 最新データ === */}
      <AnimatePresence>
        {meshData && (
          <motion.p
            key={meshData.occurred_at}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: "1rem",
              fontSize: "0.9rem",
              color:
                meshData.player === 1
                  ? blueColor
                  : meshData.player === 2
                  ? pinkColor
                  : "#333",
            }}
          >
            Player {meshData.player}: ±{meshData.value.toFixed(2)}
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}
