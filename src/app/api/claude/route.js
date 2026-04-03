// ANTHROPIC_API_KEY を Vercel環境変数に設定してください

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("[claude] ANTHROPIC_API_KEY is not configured. Value:", apiKey === undefined ? "undefined" : "(empty)");
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured. Vercelの環境変数に設定してください。" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    if (!body.messages || !Array.isArray(body.messages)) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    console.log("[claude] Calling Anthropic API. max_tokens:", body.max_tokens || 1000);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens || 1000,
        system: body.system || "あなたはAIニュース翻訳・分析の専門アシスタントです。ユーザーの指示に従い、指定されたJSON形式のみを返してください。前置きや説明は不要です。",
        messages: body.messages,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[claude] Anthropic API returned ${res.status}: ${errorBody}`);
      return Response.json(
        { type: "error", error: { message: `Anthropic API error (${res.status}): ${errorBody}` } },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error("[claude] Anthropic API returned empty/null content:", JSON.stringify(data).slice(0, 300));
      return Response.json(
        { type: "error", error: { message: "Anthropic API returned empty content" } },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (e) {
    console.error("[claude] Unexpected error:", e.name, e.message, e.stack);
    return Response.json(
      { type: "error", error: { message: `Unexpected error: ${e.message || "不明"}` } },
      { status: 500 }
    );
  }
}
