import { Supadata } from "@supadata/js";

// SUPADATA_API_KEY を Vercel環境変数に設定してください
// 取得先: https://dash.supadata.ai

export async function POST(req) {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) {
    console.error("SUPADATA_API_KEY is not configured in environment variables");
    return Response.json(
      { error: "SUPADATA_API_KEY is not configured. Vercelの環境変数に設定してください。" },
      { status: 400 }
    );
  }

  const supadata = new Supadata({ apiKey });

  try {
    const { url } = await req.json();
    if (!url) {
      return Response.json({ error: "URLが必要です" }, { status: 400 });
    }

    const transcript = await supadata.transcript({
      url,
      text: true,
    });

    if (!transcript?.content) {
      return Response.json(
        { error: "この動画の字幕を取得できませんでした" },
        { status: 404 }
      );
    }

    return Response.json({
      transcript: transcript.content,
      lang: transcript.lang,
      availableLangs: transcript.availableLangs,
    });
  } catch (e) {
    console.error("Supadata transcript error:", e.message, e.status || "", e);
    const msg = e.message || "不明なエラー";
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return Response.json(
      { error: `字幕の取得に失敗しました: ${msg}` },
      { status }
    );
  }
}
