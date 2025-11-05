// ==============================
// MESHデータ受信API
// ==============================

// 最新のデータをメモリに保持
let latestMeshData = null;
let lastReceivedAt = 0;

// MESHからデータを受け取る（POST）
export async function POST(request) {
  try {
    const body = await request.json();

    // body が空でないか確認
    if (!body || typeof body.value === "undefined") {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    // データを保存
    latestMeshData = {
      value: Number(body.value),
      occurred_at: body.occurred_at || new Date().toISOString(),
    };
    lastReceivedAt = Date.now();

    console.log("✅ Received from MESH:", latestMeshData);

    // レスポンスを返す
    return Response.json({ ok: true });
  } catch (err) {
    console.error("❌ POST error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// ブラウザなどからのGET（最新データを返す）
export async function GET() {
  // まだデータが来ていない場合
  if (!latestMeshData) {
    return Response.json({
      active: false,
      message: "No MESH data received yet",
    });
  }

  // 最後の受信が3秒以内なら「接続中」とみなす
  const isActive = Date.now() - lastReceivedAt < 3000;

  return Response.json({
    active: isActive,
    latest: latestMeshData,
  });
}
