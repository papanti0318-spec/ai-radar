export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const subreddit = searchParams.get("sub") || "MachineLearning";

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=4&raw_json=1`,
      {
        headers: {
          "User-Agent": "AI-RADAR/0.5 (by ai-radar-app)",
        },
        next: { revalidate: 60 },
      }
    );
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "Reddit fetch failed" }, { status: 500 });
  }
}
