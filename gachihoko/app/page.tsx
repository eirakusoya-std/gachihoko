"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MeshData = {
  value: number;
  player: number;
  occurred_at: string;
};

export default function Page() {
  const [gauge, setGauge] = useState(0);
  const [meshData, setMeshData] = useState<MeshData | null>(null);
  const [lastOccurredAt, setLastOccurredAt] = useState<string | null>(null);
  const [winner, setWinner] = useState<"Green" | "pink" | null>(null);
  const [phase, setPhase] = useState<1 | 2>(1);
  const [winnerTeam, setWinnerTeam] = useState<"Green" | "pink" | null>(null);

  const [wavePathLeft, setWavePathLeft] = useState("");
  const [wavePathRight, setWavePathRight] = useState("");
  const timeRef = useRef(0);
  const animRef = useRef<number | null>(null);

  // === 波アニメーション ===
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

      let dLeft = `M0,0 L${leftPoints[0].x},0 `;
      for (let i = 1; i < leftPoints.length; i++) {
        const p = leftPoints[i];
        dLeft += `L${p.x},${p.y} `;
      }
      dLeft += "L0,60 Z";
      setWavePathLeft(dLeft);

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

  // === データ取得 ===
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

  // === ゲージ更新 ===
  const updateGauge = (player: number, value: number) => {
    setGauge((prev) => {
      if (phase === 1) {
        const next =
          player === 1 ? Math.min(prev + value*2, 100) : Math.max(prev - value*2, -100);

        if (next >= 50) {
          setWinner("Green");
          setWinnerTeam("Green");
          setPhase(2);
          return 100;
        } else if (next <= -50) {
          setWinner("pink");
          setWinnerTeam("pink");
          setPhase(2);
          return -100;
        }
        return next;
      }

      if (phase === 2) {
        if (
          (winnerTeam === "Green" && player === 1) ||
          (winnerTeam === "pink" && player === 2)
        )
          return prev;

        const slow = value * 0.6;
        const next =
          winnerTeam === "Green"
            ? Math.max(prev - slow, -100)
            : Math.min(prev + slow, 100);

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

  // === デバッグ操作 ===
  const handleManualAdd = () => updateGauge(1, 5);
  const handleManualSub = () => updateGauge(2, 5);
  const handleReset = () => {
    setGauge(0);
    setWinner(null);
    setWinnerTeam(null);
    setPhase(1);
  };

  // === 即勝利ボタン ===
const handleForceGreenWin = () => {
  setGauge(100);
  setWinner("Green");
  setWinnerTeam("Green");
  setPhase(2);
};

const handleForcePinkWin = () => {
  setGauge(-100);
  setWinner("pink");
  setWinnerTeam("pink");
  setPhase(2);
};

  // === カラー ===
  const GreenColor = "#19d719";
  const pinkColor = "#f02d7d";
  const centerPercent = (gauge + 100) / 2;

  // === 背景色 ===
  const backgroundGradient =
    winner === "Green"
      ? `radial-gradient(circle at 50% 50%, rgba(25,215,25,0.6), rgba(0,50,0,0.8))`
      : winner === "pink"
      ? `radial-gradient(circle at 50% 50%, rgba(240,45,125,0.6), rgba(60,0,30,0.8))`
      : `linear-gradient(135deg, #ffffff 0%, #cccccc 100%)`;

  // === 泡の色設定 ===
  const bubbleColor =
    winner === "Green"
      ? "rgba(25, 215, 25, 1.25)"
      : winner === "pink"
      ? "rgba(240, 45, 125, 0.25)"
      : "rgba(180, 180, 180, 0.2)";

  // === 泡を生成 ===
  const [bubbles, setBubbles] = useState<
    { id: number; size: number; x: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    // クライアント側でのみ生成（SSR安全）
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: 60 + Math.random() * 100,       // 泡の大きさ
      x: Math.random() * 100,               // X位置 (%)
      delay: Math.random() * 20,            // 出現タイミングをずらす
      duration: 15 + Math.random() * 20,    // ゆっくり上昇（15〜35秒）
    }));
    setBubbles(generated);
  }, []);

  return (
    <motion.main
      animate={{ background: backgroundGradient }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        color: "#fff",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      {/* === 泡アニメーション層 === */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, y: 300 }}
          animate={{
            opacity: [0, 0.8, 0.6, 0],
            y: [300, -400], // ゆっくり上方向へ
            x: [b.x + Math.sin(b.id) * 10, b.x + Math.sin(b.id + 2) * 20], // 横にふらふら
            scale: [1, 1.15, 1], // 少し膨らむ
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            bottom: "-100px",
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: bubbleColor,
            filter: "blur(0px)",
          }}
        />
      ))}


      {/* === UI本体 === */}
      <h1 style={{ fontSize: "2rem", zIndex: 10 }}>ホコとりゲーム</h1>

      <div
        style={{
          position: "relative",
          width: "80%",
          height: "60px",
          borderRadius: "999px",
          overflow: "hidden",
          zIndex: 10,
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
            fill={GreenColor}
            clipPath="url(#waveLeft)"
            transition={{
              type: "spring",
              stiffness: winner ? 600 : 100,
              damping: winner ? 12 : 18,
              mass: winner ? 0.4 : 1,
            }}
          />
        </svg>

        <motion.div
          animate={{ left: `${centerPercent}%` }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
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

      <p style={{ zIndex: 10 }}>
        Gauge: {gauge.toFixed(1)}{" "}
        <span style={{ opacity: 0.7 }}>(range: -100 ~ +100)</span>
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", zIndex: 10, justifyContent: "center" }}>
        <button onClick={handleManualAdd} style={{ background: GreenColor }}>
          ＋ Green +5
        </button>
        <button onClick={handleManualSub} style={{ background: pinkColor }}>
          − Pink +5
        </button>
        <button onClick={handleReset} style={{ background: "#777" }}>
          Reset
        </button>
        <button onClick={handleForceGreenWin} style={{ background: GreenColor }}>
          💥 Green Win!
        </button>
        <button onClick={handleForcePinkWin} style={{ background: pinkColor }}>
          💥 Pink Win!
        </button>
      </div>


      {winner && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          style={{
            marginTop: "1rem",
            padding: "10px 20px",
            borderRadius: "12px",
            background: winner === "Green" ? GreenColor : pinkColor,
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.5rem",
            zIndex: 10,
          }}
        >
          {winner === "Green" ? "Green WINS!" : "PINK WINS!"}
        </motion.div>
      )}
    </motion.main>
  );
}
