// app/api/mesh-data/route.js
let latestData = {}; // 最新データを保存

// MESHからデータを受け取る
export async function POST(request) {
  const body = await request.json();
  latestData = body;
  console.log("✅ MESH received:", latestData);
  return Response.json({ status: "ok" });
}

// ブラウザから最新データを取得
export async function GET() {
  return Response.json(latestData);
}
