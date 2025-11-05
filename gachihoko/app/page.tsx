"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [meshData, setMeshData] = useState(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/mesh-data", { cache: "no-store" });
      const data = await res.json();
      setActive(data.active);
      if (data.latest) setMeshData(data.latest);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>MESH Data Monitor</h1>

      {!active && <p>🟡 Waiting for MESH data...</p>}

      {active && meshData && (
        <>
          <p>🟢 MESH Active</p>
          <pre>{JSON.stringify(meshData, null, 2)}</pre>
        </>
      )}
    </main>
  );
}
