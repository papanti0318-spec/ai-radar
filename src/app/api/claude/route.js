export async function POST(req) {
  const body = await req.json();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: body.max_tokens || 1000,
      system: body.system || "あなたはAIニュース翻訳・分析の専門アシスタントです。ユーザーの指示に従い、指定されたJSON形式のみを返してください。前置きや説明は不要です。",
      messages: body.messages,
    }),
  });

  const data = await res.json();
  return Response.json(data);
}
// Environment variables updated with Anthropic API key
