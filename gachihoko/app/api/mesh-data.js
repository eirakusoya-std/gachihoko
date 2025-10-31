// app/api/mesh-data/route.js
let latestData = {}; // 最新のMESHデータを保持

export async function POST(request) {
  const body = await request.json();
  latestData = body;
  console.log("✅ MESHから受信:", latestData);
  return Response.json({ ok: true });
}

export async function GET() {
  // ブラウザから最新データを取得できるようにする
  return Response.json(latestData);
}
