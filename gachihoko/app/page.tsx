"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MeshData = {
  value: number;
  occurred_at: string;
};

export default function Page() {
  const [total, setTotal] = useState(0);
  const [team, setTeam] = useState<"blue" | "pink">("blue");
  const [meshData, setMeshData] = useState<MeshData | null>(null);

  // 定期的にMESHデータを取得
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/mesh-data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      if (data.latest) {
        setMeshData(data.latest);

        // ✅ サーバーからの合計値を直接使用
        const newTotal = Number(data.total) || 0;
        setTotal(newTotal);

        // ✅ 100を超えたらチーム切替
        if (newTotal >= 100) {
          setTeam((prevTeam) => (prevTeam === "blue" ? "pink" : "blue"));
          // リセット要求を送ってサーバー側のtotalを0に戻す（任意）
          await fetch("/api/mesh-data/reset", { method: "POST" }).catch(() => {});
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // チームカラー設定
  const blueColor = "#00bfff";
  const pinkColor = "#ff69b4";
  const bgColor = team === "blue" ? blueColor : pinkColor;
  const gaugeColor = team === "blue" ? pinkColor : blueColor;

  // 押し合いゲージ幅（0〜100）
  const gaugeWidth = `${Math.min(total, 100)}%`;

  return (
    <main
      style={{
        height: "100vh",
        background: `linear-gradient(135deg, ${bgColor} 0%, #ffffff 100%)`,
        color: "#fff",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.5s ease",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Splatoon-style Gauge Battle 🎮
      </h1>

      <div
        style={{
          position: "relative",
          width: "80%",
          height: "50px",
          background: "#eee",
          borderRadius: "999px",
          overflow: "hidden",
          boxShadow: "0 0 10px rgba(0,0,0,0.3) inset",
        }}
      >
        <motion.div
          animate={{ width: gaugeWidth }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            height: "100%",
            background: gaugeColor,
            borderRadius: "inherit",
          }}
        />
      </div>

      <p style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        Team:{" "}
        <span
          style={{
            fontWeight: "bold",
            color: team === "blue" ? blueColor : pinkColor,
          }}
        >
          {team.toUpperCase()}
        </span>
      </p>

      <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>
        Total: {Math.floor(total)} / 100
      </p>

      <AnimatePresence>
        {meshData && (
          <motion.p
            key={meshData.occurred_at}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#fff" }}
          >
            +{meshData.value.toFixed(2)} (from MESH)
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}
