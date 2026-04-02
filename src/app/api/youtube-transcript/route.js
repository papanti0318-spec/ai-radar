import { Supadata } from "@supadata/js";

const supadata = new Supadata({ apiKey: process.env.SUPADATA_API_KEY });

export async function POST(req) {
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
    console.error("Supadata transcript error:", e);
    return Response.json(
      { error: "字幕の取得に失敗しました: " + (e.message || "不明なエラー") },
      { status: 500 }
    );
  }
}
