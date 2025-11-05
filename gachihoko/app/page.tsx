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

  // ======== MESHデータ取得ループ ========
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

  // ======== 勝敗付きゲージ更新関数 ========
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

  // ======== デバッグボタン用ハンドラ ========
  const handleManualAdd = () => updateGauge(1, 5); // Blueチームに +5
  const handleManualSub = () => updateGauge(2, 5); // Pinkチームに -5
  const handleReset = () => {
    setGauge(0);
    setWinner(null);
  };

  // ======== カラー設定 ========
  const blueColor = "#00bfff";
  const pinkColor = "#ff69b4";

  // gauge (-100 ~ 100) → 正負に応じて左右に分配
  const blueWidth = gauge > 0 ? (gauge / 100) * 50 : 0;
  const pinkWidth = gauge < 0 ? (Math.abs(gauge) / 100) * 50 : 0;

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
          background: "#eee",
          borderRadius: "999px",
          overflow: "hidden",
          boxShadow: "0 0 15px rgba(0,0,0,0.3) inset",
        }}
      >
        {/* ピンク（左側） */}
        <motion.div
          animate={{ width: `${pinkWidth}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            position: "absolute",
            left: "50%",
            height: "100%",
            background: pinkColor,
            transformOrigin: "right center",
          }}
        />

        {/* 青（右側） */}
        <motion.div
          animate={{ width: `${blueWidth}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            position: "absolute",
            right: "50%",
            height: "100%",
            background: blueColor,
            transformOrigin: "left center",
          }}
        />

        {/* 中心線 */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: "2px",
            background: "#555",
            opacity: 0.4,
          }}
        />
      </div>

      {/* === ゲージ値 === */}
      <p style={{ fontSize: "1.2rem" }}>
        Gauge: {gauge.toFixed(1)}{" "}
        <span style={{ opacity: 0.6 }}>(range: -100 ~ +100)</span>
      </p>

      {/* === デバッグボタン === */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
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
