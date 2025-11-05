"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MeshData = {
  value: number;
  player: number;
  occurred_at: string;
};

export default function Page() {
  // 現在のゲージ位置 (-100 ~ 100)
  const [gauge, setGauge] = useState(0);
  const [meshData, setMeshData] = useState<MeshData | null>(null);
  const [lastOccurredAt, setLastOccurredAt] = useState<string | null>(null);
  const [winner, setWinner] = useState<"blue" | "pink" | null>(null);

  // MESHデータ取得ループ
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/mesh-data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      // active=falseなら停止
      if (!data.active) return;

      if (data.latest) {
        const latest = data.latest as MeshData;

        // 重複防止
        if (latest.occurred_at !== lastOccurredAt) {
          setMeshData(latest);
          setLastOccurredAt(latest.occurred_at);

          // Player 1 = +加算（右へ押す）
          // Player 2 = -加算（左へ押す）
          setGauge((prev) => {
            const next =
              latest.player === 1
                ? Math.min(prev + latest.value, 100)
                : Math.max(prev - latest.value, -100);

            // 勝敗判定
            if (next >= 50) setWinner("blue");
            else if (next <= -50) setWinner("pink");

            return next;
          });
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, [lastOccurredAt]);

  // カラー設定
  const blueColor = "#00bfff";
  const pinkColor = "#ff69b4";

  // 中央を基準に左右で塗り分けるゲージの見た目
  const leftRatio = ((100 - (gauge + 100)) / 200) * 100; // 負側
  const rightRatio = ((gauge + 100) / 200) * 100; // 正側

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
          display: "flex",
        }}
      >
        {/* Pink side（左側） */}
        <motion.div
          animate={{ width: `${leftRatio}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            height: "100%",
            background: pinkColor,
            transformOrigin: "right center",
          }}
        />

        {/* Blue side（右側） */}
        <motion.div
          animate={{ width: `${rightRatio}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            height: "100%",
            background: blueColor,
            transformOrigin: "left center",
          }}
        />

        {/* 中心ライン */}
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

      {/* === 数値表示 === */}
      <p style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        Gauge: {gauge.toFixed(1)}{" "}
        <span style={{ opacity: 0.6 }}>(range: -100 ~ +100)</span>
      </p>

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

      {/* === 最新データ表示 === */}
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
            Player {meshData.player}: ±{meshData.value.toFixed(2)}
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}
