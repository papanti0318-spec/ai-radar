// SUPADATA_API_KEY を Vercel環境変数に設定してください
// 取得先: https://dash.supadata.ai

export async function POST(req) {
  // 1. 環境変数チェック
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("[youtube-transcript] SUPADATA_API_KEY is not configured. Value:", apiKey === undefined ? "undefined" : apiKey === "" ? "(empty string)" : "(whitespace only)");
    return Response.json(
      { error: "SUPADATA_API_KEY is not configured. Vercelの環境変数に設定してください。" },
      { status: 400 }
    );
  }

  try {
    // リクエストボディ解析
    const body = await req.json();
    const url = body?.url;
    if (!url || typeof url !== "string" || !url.trim()) {
      return Response.json({ error: "URLが必要です" }, { status: 400 });
    }

    // 2. Supadata API呼び出し（fetch で直接叩いて詳細なエラーを取得）
    const apiUrl = `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(url.trim())}&text=true`;
    console.log("[youtube-transcript] Calling Supadata API:", apiUrl);

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    // 3. APIレスポンスチェック（200以外）
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[youtube-transcript] Supadata API returned ${res.status}: ${errorBody}`);
      return Response.json(
        { error: `Transcript fetch failed (${res.status}): ${errorBody || res.statusText}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    console.log("[youtube-transcript] Supadata response keys:", Object.keys(data), "lang:", data.lang);

    // 4. 空レスポンスチェック
    if (!data || !data.content || (typeof data.content === "string" && data.content.trim() === "") || (Array.isArray(data.content) && data.content.length === 0)) {
      console.error("[youtube-transcript] Supadata returned empty content:", JSON.stringify(data).slice(0, 200));
      return Response.json(
        { error: "この動画の字幕を取得できませんでした（字幕データが空です）" },
        { status: 404 }
      );
    }

    // 成功: テキスト化して返す
    const transcript = typeof data.content === "string"
      ? data.content
      : data.content.map((c) => c.text).join(" ");

    return Response.json({
      transcript,
      lang: data.lang || null,
      availableLangs: data.availableLangs || [],
    });

  } catch (e) {
    // 5. 予期しないエラー
    console.error("[youtube-transcript] Unexpected error:", e.name, e.message, e.stack);
    return Response.json(
      { error: `予期しないエラーが発生しました: ${e.message || "不明"}` },
      { status: 500 }
    );
  }
}
