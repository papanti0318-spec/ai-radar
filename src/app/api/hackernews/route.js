export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "8");

  try {
    const idsRes = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 300 } }
    );
    const ids = await idsRes.json();

    const topIds = ids.slice(0, limit);

    const items = await Promise.all(
      topIds.map(async (id) => {
        const res = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
          { next: { revalidate: 300 } }
        );
        return res.json();
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

    return Response.json({ items: stories });
  } catch (e) {
    return Response.json(
      { error: "HackerNews fetch failed", items: [] },
      { status: 500 }
    );
  }
}
