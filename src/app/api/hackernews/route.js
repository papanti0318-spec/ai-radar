// HackerNews API（APIキー不要）

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    console.log("[hackernews] Fetching top stories, limit:", limit);

    const idsRes = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 300 } }
    );

    if (!idsRes.ok) {
      const errorBody = await idsRes.text();
      console.error(`[hackernews] Top stories API returned ${idsRes.status}: ${errorBody}`);
      return Response.json(
        { error: `HackerNews API error (${idsRes.status})`, items: [] },
        { status: 500 }
      );
    }

    let ids;
    try {
      ids = await idsRes.json();
    } catch (parseErr) {
      console.error("[hackernews] Top stories JSON parse failed:", parseErr.message);
      return Response.json({ error: "HackerNews response parse failed", items: [] }, { status: 500 });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.error("[hackernews] Top stories returned empty/null:", ids);
      return Response.json({ items: [] });
    }

    const topIds = ids.slice(0, limit);

    const items = await Promise.all(
      topIds.map(async (id) => {
        try {
          const res = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { next: { revalidate: 300 } }
          );
          if (!res.ok) {
            console.error(`[hackernews] Item ${id} returned ${res.status}`);
            return null;
          }
          return await res.json();
        } catch (itemErr) {
          console.error(`[hackernews] Item ${id} fetch failed:`, itemErr.message);
          return null;
        }
      })
    );

    const stories = items
      .filter((item) => item && item.type === "story")
      .map((item) => ({
        id: String(item.id),
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        author: item.by,
        score: item.score,
        commentCount: item.descendants || 0,
        time: item.time,
      }));

    console.log("[hackernews] Returning", stories.length, "stories");
    return Response.json({ items: stories });
  } catch (e) {
    console.error("[hackernews] Unexpected error:", e.name, e.message, e.stack);
    return Response.json(
      { error: `HackerNews fetch failed: ${e.message || "不明"}`, items: [] },
      { status: 500 }
    );
  }
}
