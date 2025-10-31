// app/page.jsx
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [meshData, setMeshData] = useState({});

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/mesh-data");
      const data = await res.json();
      setMeshData(data);
    }, 500); // 0.5秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>MESH Data Monitor</h1>
      <pre>{JSON.stringify(meshData, null, 2)}</pre>
    </main>
  );
}
