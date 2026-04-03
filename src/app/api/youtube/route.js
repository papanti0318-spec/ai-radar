// YOUTUBE_API_KEY を Vercel環境変数に設定してください

export async function GET(req) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("[youtube] YOUTUBE_API_KEY is not configured. Value:", apiKey === undefined ? "undefined" : "(empty)");
    return Response.json(
      { error: "YOUTUBE_API_KEY is not configured. Vercelの環境変数に設定してください。", items: [] },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "artificial intelligence";

    console.log("[youtube] Searching:", query);

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=date&maxResults=4&relevanceLanguage=en&key=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!searchRes.ok) {
      const errorBody = await searchRes.text();
      console.error(`[youtube] Search API returned ${searchRes.status}: ${errorBody}`);
      return Response.json(
        { error: `YouTube Search API error (${searchRes.status})`, items: [] },
        { status: 500 }
      );
    }

    let searchData;
    try {
      searchData = await searchRes.json();
    } catch (parseErr) {
      console.error("[youtube] Search response JSON parse failed:", parseErr.message);
      return Response.json({ error: "YouTube Search response parse failed", items: [] }, { status: 500 });
    }

    if (!searchData.items || !Array.isArray(searchData.items) || searchData.items.length === 0) {
      console.log("[youtube] No search results for:", query);
      return Response.json({ items: [] });
    }

    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!statsRes.ok) {
      const errorBody = await statsRes.text();
      console.error(`[youtube] Stats API returned ${statsRes.status}: ${errorBody}`);
      return Response.json(
        { error: `YouTube Stats API error (${statsRes.status})`, items: [] },
        { status: 500 }
      );
    }

    let statsData;
    try {
      statsData = await statsRes.json();
    } catch (parseErr) {
      console.error("[youtube] Stats response JSON parse failed:", parseErr.message);
      return Response.json({ error: "YouTube Stats response parse failed", items: [] }, { status: 500 });
    }

    const statsMap = {};
    (statsData.items || []).forEach((item) => {
      statsMap[item.id] = item.statistics;
    });

    const items = searchData.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description,
      viewCount: parseInt(statsMap[item.id.videoId]?.viewCount || 0),
      likeCount: parseInt(statsMap[item.id.videoId]?.likeCount || 0),
      commentCount: parseInt(statsMap[item.id.videoId]?.commentCount || 0),
    }));

    console.log("[youtube] Returning", items.length, "results for:", query);
    return Response.json({ items });
  } catch (e) {
    console.error("[youtube] Unexpected error:", e.name, e.message, e.stack);
    return Response.json(
      { error: `YouTube fetch failed: ${e.message || "不明"}`, items: [] },
      { status: 500 }
    );
  }
}
