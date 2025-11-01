"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [meshData, setMeshData] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/mesh-data");
      if (!res.ok) return;
      const data = await res.json();
      setMeshData(data);
    }, 500); // 0.5秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>MESH Data Monitor</h1>
      {meshData ? (
        <pre>{JSON.stringify(meshData, null, 2)}</pre>
      ) : (
        <p>Waiting for data...</p>
      )}
    </main>
  );
}
