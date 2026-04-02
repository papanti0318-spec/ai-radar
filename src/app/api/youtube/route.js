export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "artificial intelligence";
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "YOUTUBE_API_KEY not set", items: [] }, { status: 500 });
  }

  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=date&maxResults=4&relevanceLanguage=en&key=${apiKey}`,
      { next: { revalidate: 300 } }
    );
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return Response.json({ items: [] });
    }

    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`,
      { next: { revalidate: 300 } }
    );
    const statsData = await statsRes.json();

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

    return Response.json({ items });
  } catch (e) {
    return Response.json({ error: "YouTube fetch failed", items: [] }, { status: 500 });
  }
}
// Environment variables verified 2026年 4月  2日 木曜日 15:21:06    
