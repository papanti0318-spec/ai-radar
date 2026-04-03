// note.com AI関連記事取得（note検索API経由、APIキー不要）

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    console.log("[note-articles] Fetching AI articles, limit:", limit);

    const apiUrl = `https://note.com/api/v3/searches?q=AI&size=${limit}&start=0&sort=new&context=note`;
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AI_RADAR/1.0)" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[note-articles] note.com API returned ${res.status}: ${errorBody}`);
      return Response.json(
        { error: `note.com API error (${res.status})`, items: [] },
        { status: 500 }
      );
    }

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.error("[note-articles] JSON parse failed:", parseErr.message);
      return Response.json({ error: "note.com response parse failed", items: [] }, { status: 500 });
    }

    const notes = data?.data?.notes?.contents;
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      console.log("[note-articles] No articles found");
      return Response.json({ items: [] });
    }

    const items = notes
      .filter((note) => note.type === "TextNote")
      .map((note) => ({
        id: String(note.id),
        title: note.name || "(無題)",
        url: `https://note.com/${note.user?.urlname}/n/${note.key}`,
        publishedAt: note.publish_at,
      }));

    console.log("[note-articles] Returning", items.length, "articles");
    return Response.json({ items });
  } catch (e) {
    console.error("[note-articles] Unexpected error:", e.name, e.message, e.stack);
    return Response.json(
      { error: `note.com fetch failed: ${e.message || "不明"}`, items: [] },
      { status: 500 }
    );
  }
}
