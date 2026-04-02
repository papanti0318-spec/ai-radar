import { YoutubeTranscript } from "youtube-transcript";

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) {
      return Response.json({ error: "URLが必要です" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return Response.json({ error: "有効なYouTube URLではありません" }, { status: 400 });
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map((t) => t.text).join(" ");

    return Response.json({ videoId, transcript: fullText });
  } catch (e) {
    console.error("Transcript error:", e);
    return Response.json(
      { error: "字幕の取得に失敗しました。字幕が無効な動画の可能性があります。" },
      { status: 500 }
    );
  }
}
