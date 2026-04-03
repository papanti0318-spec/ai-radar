// note.com AI関連記事取得（ユーザーRSS経由、APIキー不要）

const NOTE_AI_CREATORS = [
  "chatgpt_lab",
  "shi3zblog",
  "cognitive_01",
  "aixyz_official",
  "kotone_ai_note",
  "claude_sidejob",
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    console.log("[note-articles] Fetching AI articles via RSS, limit:", limit);

    const feedPromises = NOTE_AI_CREATORS.map(async (user) => {
      try {
        const res = await fetch(`https://note.com/${user}/rss`, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; AI_RADAR/1.0)" },
          next: { revalidate: 300 },
        });

        if (!res.ok) {
          console.error(`[note-articles] RSS for ${user} returned ${res.status}`);
          return [];
        }

        const xml = await res.text();
        if (!xml || xml.trim().length === 0) return [];

        return parseRssItems(xml);
      } catch (err) {
        console.error(`[note-articles] RSS fetch failed for ${user}:`, err.message);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const allItems = results.flat();

    // 公開日が新しい順にソートして上位を返す
    allItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    const items = allItems.slice(0, limit);

    if (items.length === 0) {
      console.log("[note-articles] No articles found from RSS feeds");
      return Response.json({ items: [] });
    }

    console.log("[note-articles] Returning", items.length, "articles from RSS");
    return Response.json({ items });
  } catch (e) {
    console.error("[note-articles] Unexpected error:", e.name, e.message, e.stack);
    return Response.json(
      { error: `note.com fetch failed: ${e.message || "不明"}`, items: [] },
      { status: 500 }
    );
  }
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");

    if (!title || !link) continue;

    items.push({
      id: link,
      title: decodeEntities(title),
      url: link,
      publishedAt: pubDate || null,
    });
  }

  return items;
}

function extractTag(xml, tagName) {
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`);
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`);
  const m = xml.match(regex);
  return m ? m[1].trim() : null;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)));
}
