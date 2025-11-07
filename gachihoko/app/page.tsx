"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MeshData = {
  value: number;
  player: number;
  occurred_at: string;
};

export default function Page() {
  // === 状態 ===
  const [gauge, setGauge] = useState(0); // -100 ~ 100
  const [meshData, setMeshData] = useState<MeshData | null>(null);
  const [lastOccurredAt, setLastOccurredAt] = useState<string | null>(null);
  const [winner, setWinner] = useState<"blue" | "pink" | null>(null);
  const [phase, setPhase] = useState<1 | 2>(1); // 1: 通常 / 2: 勝利後モード
  const [winnerTeam, setWinnerTeam] = useState<"blue" | "pink" | null>(null);

  // === 波アニメーション ===
  const [wavePathLeft, setWavePathLeft] = useState("");
  const [wavePathRight, setWavePathRight] = useState("");
  const timeRef = useRef(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.04;
      const amp = 5;
      const freq = 2;
      const steps = 30;
      const leftPoints = [];
      const rightPoints = [];

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = 60 * t;
        const xLeft = 100 + Math.sin(t * Math.PI * freq + timeRef.current) * amp;
        const xRight = 0 - Math.sin(t * Math.PI * freq + timeRef.current) * amp;
        leftPoints.push({ x: xLeft, y });
        rightPoints.push({ x: xRight, y });
      }

      // 左
      let dLeft = `M0,0 L${leftPoints[0].x},0 `;
      for (let i = 1; i < leftPoints.length; i++) {
        const p = leftPoints[i];
        dLeft += `L${p.x},${p.y} `;
      }
      dLeft += "L0,60 Z";
      setWavePathLeft(dLeft);

      // 右
      let dRight = `M100,0 L${rightPoints[0].x},0 `;
      for (let i = 1; i < rightPoints.length; i++) {
        const p = rightPoints[i];
        dRight += `L${p.x},${p.y} `;
      }
      dRight += "L100,60 Z";
      setWavePathRight(dRight);

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
    }
  };
}, []);

  // === データ受信 ===
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

  // === ゲージ更新ロジック ===
  const updateGauge = (player: number, value: number) => {
    setGauge((prev) => {
      // === フェーズ1：通常押し合い ===
      if (phase === 1) {
        const next =
          player === 1 ? Math.min(prev + value, 100) : Math.max(prev - value, -100);

        // 勝利判定
        if (next >= 50) {
          setWinner("blue");
          setWinnerTeam("blue");
          setPhase(2);
          return 100; // バネ演出で右端へ
        } else if (next <= -50) {
          setWinner("pink");
          setWinnerTeam("pink");
          setPhase(2);
          return -100; // バネ演出で左端へ
        }
        return next;
      }

      // === フェーズ2：勝利後モード ===
      if (phase === 2) {
        // 勝者は動けない
        if (
          (winnerTeam === "blue" && player === 1) ||
          (winnerTeam === "pink" && player === 2)
        )
          return prev;

        // 敗者はゆっくり押し返せる（感度低下）
        const slow = value * 0.2;
        const next =
          winnerTeam === "blue"
            ? Math.max(prev - slow, -100)
            : Math.min(prev + slow, 100);

        // 中央近くに戻ったらリセット
        if (Math.abs(next) <= 10) {
          setPhase(1);
          setWinner(null);
          setWinnerTeam(null);
        }

        return next;
      }

      return prev;
    });
  };

  // === 手動操作 ===
  const handleManualAdd = () => updateGauge(1, 5);
  const handleManualSub = () => updateGauge(2, 5);
  const handleReset = () => {
    setGauge(0);
    setWinner(null);
    setWinnerTeam(null);
    setPhase(1);
  };

  // === 色設定 ===
  const blueColor = "#19d719";
  const pinkColor = "#f02d7d";
  const centerPercent = (gauge + 100) / 2;

  return (
    <main
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #fff, #ccc)",
        color: "#333",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      <h1>Splatoon-style Tug-of-War ⚖️</h1>

      {/* === ゲージバー === */}
      <div
        style={{
          position: "relative",
          width: "80%",
          height: "60px",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        {/* ピンク側 */}
        <svg
          width="100%"
          height="60"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          style={{ position: "absolute", left: 0, top: 0, zIndex: 1 }}
        >
          <defs>
            <clipPath id="waveRight" clipPathUnits="userSpaceOnUse">
              <path d={wavePathRight} fill="white" />
            </clipPath>
          </defs>
          <motion.rect
            x={`${centerPercent}%`}
            y="0"
            width={`${100 - centerPercent}%`}
            height="60"
            fill={pinkColor}
            clipPath="url(#waveRight)"
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </svg>

        {/* 青側 */}
        <svg
          width="100%"
          height="60"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          style={{ position: "absolute", left: 0, top: 0, zIndex: 2 }}
        >
          <defs>
            <clipPath id="waveLeft" clipPathUnits="userSpaceOnUse">
              <path d={wavePathLeft} fill="white" />
            </clipPath>
          </defs>
          <motion.rect
            x="0"
            y="0"
            width={`${centerPercent}%`}
            height="60"
            fill={blueColor}
            clipPath="url(#waveLeft)"
            transition={{
              type: "spring",
              stiffness: winner ? 600 : 100, // 勝利時は勢い強く
              damping: winner ? 12 : 18,
              mass: winner ? 0.4 : 1,
            }}
          />
        </svg>

        {/* 中央線 */}
        <motion.div
          animate={{ left: `${centerPercent}%` }}
          transition={{
            type: "spring",
            stiffness: winner ? 500 : 120,
            damping: 18,
          }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "2px",
            background: "#fff",
            zIndex: 3,
            boxShadow: "0 0 6px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* === ゲージ値 === */}
      <p>
        Gauge: {gauge.toFixed(1)} <span style={{ opacity: 0.6 }}>(-100 ~ +100)</span>
      </p>

      {/* === デバッグ操作 === */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <button onClick={handleManualAdd} style={{ background: blueColor, color: "#fff" }}>
          ＋ Blue +5
        </button>
        <button onClick={handleManualSub} style={{ background: pinkColor, color: "#fff" }}>
          − Pink +5
        </button>
        <button onClick={handleReset} style={{ background: "#777", color: "#fff" }}>
          Reset
        </button>
      </div>

      {/* === 勝敗表示 === */}
      {winner && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
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
    </main>
  );
}
