"use client";

import { useState, useEffect } from "react";

const CATEGORIES = ["全て", "研究", "ツール", "ビジネス", "モデル"];

const YT_QUERIES = [
  { query: "machine learning research 2026", category: "研究" },
  { query: "LLM AI tools tutorial 2026", category: "ツール" },
  { query: "AI business enterprise technology", category: "ビジネス" },
  { query: "GPT Claude Gemini AI model release", category: "モデル" },
  { query: "artificial intelligence news latest", category: "研究" },
];

const CATEGORY_COLORS = {
  研究: "#818cf8", ツール: "#34d399", ビジネス: "#f59e0b", モデル: "#f472b6",
};

const FALLBACK_NEWS = [
  { id: "f1", title: "GPT-4o gets major update with better reasoning", titleJa: "GPT-4oが推論能力を大幅強化", source: "OpenAI Official", author: "OpenAI Official", score: 342000, num_comments: 287, created_utc: Math.floor(Date.now()/1000)-1800, permalink: "https://www.youtube.com/results?search_query=GPT-4o", category: "モデル" },
  { id: "f2", title: "Llama 3.3 running locally is absolutely insane performance", titleJa: "Llama 3.3のローカル動作が衝撃的な性能", source: "Two Minute Papers", author: "Two Minute Papers", score: 289000, num_comments: 412, created_utc: Math.floor(Date.now()/1000)-3200, permalink: "https://www.youtube.com/results?search_query=Llama+local", category: "ツール" },
  { id: "f3", title: "New paper: LLMs autonomously write and verify mathematical proofs", titleJa: "新論文：LLMが数学的証明を自律的に生成・検証", source: "Yannic Kilcher", author: "Yannic Kilcher", score: 210400, num_comments: 183, created_utc: Math.floor(Date.now()/1000)-5400, permalink: "https://www.youtube.com/results?search_query=LLM+math+proof", category: "研究" },
  { id: "f4", title: "Claude 3.5 Sonnet vs GPT-4o: Full Benchmark Comparison", titleJa: "Claude 3.5 Sonnet vs GPT-4o 完全ベンチマーク比較", source: "AI Explained", author: "AI Explained", score: 187600, num_comments: 234, created_utc: Math.floor(Date.now()/1000)-7200, permalink: "https://www.youtube.com/results?search_query=Claude+GPT+benchmark", category: "モデル" },
  { id: "f5", title: "AI replacing jobs: 40% of tasks automatable by 2026", titleJa: "AI自動化で40%の業務が代替可能との新研究", source: "Bloomberg Technology", author: "Bloomberg Technology", score: 165400, num_comments: 891, created_utc: Math.floor(Date.now()/1000)-9000, permalink: "https://www.youtube.com/results?search_query=AI+jobs+automation", category: "ビジネス" },
  { id: "f6", title: "Build AI Agent from Scratch: Complete Tutorial 2025", titleJa: "AIエージェントをゼロから構築：完全チュートリアル2025", source: "freeCodeCamp", author: "freeCodeCamp", score: 143200, num_comments: 167, created_utc: Math.floor(Date.now()/1000)-10800, permalink: "https://www.youtube.com/results?search_query=AI+agent+tutorial", category: "ツール" },
  { id: "f7", title: "Anthropic releases new AI safety research: Constitutional AI v2", titleJa: "AnthropicがConstitutional AI v2安全性研究を公開", source: "Lex Fridman", author: "Lex Fridman", score: 128700, num_comments: 145, created_utc: Math.floor(Date.now()/1000)-12600, permalink: "https://www.youtube.com/results?search_query=Anthropic+AI+safety", category: "研究" },
  { id: "f8", title: "OpenAI valuation hits $300B: What it means for the industry", titleJa: "OpenAIの評価額3000億ドル突破：業界への影響を解説", source: "CNBC", author: "CNBC", score: 98700, num_comments: 543, created_utc: Math.floor(Date.now()/1000)-14400, permalink: "https://www.youtube.com/results?search_query=OpenAI+valuation", category: "ビジネス" },
];

function classifyCategory(title) {
  const t = title.toLowerCase();
  const toolWords = ["tool", "tutorial", "framework", "library", "sdk", "api", "app", "build", "code", "dev", "github", "open source", "rust", "python", "launch", "release", "docker", "cli", "plugin", "extension", "editor", "ide"];
  const bizWords = ["business", "startup", "funding", "valuation", "billion", "million", "revenue", "company", "market", "invest", "ipo", "acquisition", "layoff", "hire", "ceo", "enterprise", "regulation", "policy", "law", "ban", "government", "gdpr", "copyright"];
  const modelWords = ["gpt", "claude", "gemini", "llama", "mistral", "model", "llm", "chatgpt", "copilot", "benchmark", "parameter", "fine-tun", "training", "inference", "token", "transformer", "diffusion", "stable diffusion", "midjourney", "sora", "openai", "anthropic", "google ai", "meta ai"];
  if (modelWords.some(w => t.includes(w))) return "モデル";
  if (bizWords.some(w => t.includes(w))) return "ビジネス";
  if (toolWords.some(w => t.includes(w))) return "ツール";
  return "研究";
}

function timeLabel(utc) {
  const diff = Math.floor(Date.now() / 1000) - utc;
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

function formatViews(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

async function callClaude(messages, maxTokens = 1000) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, max_tokens: maxTokens }),
  });
  const data = await res.json();
  if (data.type === "error") {
    const msg = data.error?.message || JSON.stringify(data);
    console.error("Claude API error:", msg);
    throw new Error(`Claude API error: ${msg}`);
  }
  const text = (data.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
  if (!text) {
    console.error("Claude API returned empty content:", data);
    throw new Error("Claude API returned empty content");
  }
  return text;
}

function Ticker({ news }) {
  if (!news.length) return null;
  const items = news.map(n => n.titleJa || n.title).join("　／／　");
  return (
    <div style={{ background: "#0a0a0a", borderBottom: "1px solid #1f2937", padding: "7px 0", overflow: "hidden" }}>
      <div style={{ display: "flex", whiteSpace: "nowrap", animation: "ticker 60s linear infinite", color: "#6ee7b7", fontFamily: "monospace", fontSize: "12px" }}>
        <span style={{ paddingRight: "60px" }}>🔴 LIVE　　{items}</span>
        <span style={{ paddingRight: "60px" }}>🔴 LIVE　　{items}</span>
      </div>
      <style>{`
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        *{box-sizing:border-box;}
        a{color:inherit;}
        details summary::-webkit-details-marker{display:none;}
      `}</style>
    </div>
  );
}

function Shimmer({ lines = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: "12px", borderRadius: "4px",
          width: `${[100, 80, 60][i] || 70}%`,
          background: "linear-gradient(90deg,#1e3a5f,#2d5a8e,#1e3a5f)",
          backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
        }} />
      ))}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#6b7280", fontSize: "12px" }}>{label}</span>
      <span style={{ color: color || "#9ca3af", fontSize: "12px", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

function Tab({ label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#1e3a5f" : "transparent",
      color: active ? "#60a5fa" : "#4b5563",
      border: `1px solid ${active ? "#3b82f6" : "#1f2937"}`,
      borderRadius: "6px", padding: "6px 16px", fontSize: "12px",
      cursor: "pointer", fontFamily: "monospace", transition: "all 0.2s",
      display: "flex", alignItems: "center", gap: "6px",
    }}>
      {label}
      {badge && (
        <span style={{ background: active ? "#3b82f6" : "#374151", color: active ? "#fff" : "#6b7280", borderRadius: "10px", padding: "1px 6px", fontSize: "10px" }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function CommentCard({ comment, index }) {
  return (
    <div style={{
      background: "#080c14",
      border: "1px solid #1a2332",
      borderLeft: `3px solid ${["#818cf8","#34d399","#f59e0b","#f472b6","#60a5fa"][index % 5]}`,
      borderRadius: "6px", padding: "12px 14px", marginBottom: "10px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ color: "#4b5563", fontSize: "11px", fontFamily: "monospace" }}>{comment.author}</span>
        <span style={{ color: "#f59e0b", fontSize: "11px", fontFamily: "monospace" }}>👍 {comment.score?.toLocaleString()}</span>
      </div>
      {comment.bodyJa && (
        <div style={{ color: "#bfdbfe", fontSize: "12px", lineHeight: "1.8", fontFamily: "monospace", marginBottom: "8px" }}>
          {comment.bodyJa}
        </div>
      )}
      <details>
        <summary style={{ color: "#374151", fontSize: "10px", fontFamily: "monospace", cursor: "pointer" }}>▶ 原文（英語）</summary>
        <div style={{ color: "#4b5563", fontSize: "11px", lineHeight: "1.7", fontFamily: "monospace", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #1a2332" }}>
          {comment.body}
        </div>
      </details>
    </div>
  );
}

function DetailPanel({ item, onClose }) {
  const [tab, setTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  useEffect(() => {
    if (item) {
      setSummary(null); setSummaryError(null);
      setComments([]); setCommentsError(null);
      setTab("summary");
      loadSummary(item);
    }
  }, [item?.id]);

  useEffect(() => {
    if (tab === "comments" && comments.length === 0 && !commentsLoading && item) {
      loadComments(item);
    }
  }, [tab]);

  async function loadSummary(it) {
    setSummaryLoading(true);
    try {
      const sourceLabel = it.sourceType === "hn" ? "Hacker News記事" : "YouTube動画";
      const sourceField = it.sourceType === "hn" ? `投稿者: ${it.author}` : `チャンネル: ${it.source}`;
      const text = await callClaude([{ role: "user", content:
        `以下の${sourceLabel}を分析してJSONのみ返してください（前置き不要）。
タイトル: ${it.title}
${sourceField}
カテゴリ: ${it.category}

{"titleJa":"日本語タイトル（40文字以内）","translation":"内容の日本語要約（120字以内）","points":["ポイント1（25字以内）","ポイント2（25字以内）","ポイント3（25字以内）"],"impact":"日本への影響（45字以内）","level":"初心者|中級者|上級者"}`
      }]);
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        console.error("Summary JSON parse failed. Raw text:", text);
        throw new Error(`JSON parse failed: ${parseErr.message}`);
      }
      setSummary(parsed);
    } catch (e) {
      console.error("Summary error:", e.message);
      setSummaryError(`翻訳に失敗しました: ${e.message}`);
    }
    setSummaryLoading(false);
  }

  async function loadComments(it) {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const text = await callClaude([{ role: "user", content:
        `以下のYouTube動画に対して、AI専門家・エンジニア・経営者など多様な視点からのリアルなコメントを5件生成してください。JSONのみ:\n[{"author":"名前","score":数値,"body":"英語コメント（50語以内）"}]\n\nタイトル: ${it.title}\nチャンネル: ${it.source}`
      }], 800);
      let rawComments;
      try {
        rawComments = JSON.parse(text);
      } catch (parseErr) {
        console.error("Comments JSON parse failed. Raw text:", text);
        throw new Error(`JSON parse failed: ${parseErr.message}`);
      }

      const bodies = rawComments.map((c, i) => `${i}: ${c.body}`).join("\n");
      const transText = await callClaude([{ role: "user", content:
        `以下のコメントを日本語に翻訳してください。JSONの配列のみ返してください:\n["翻訳0","翻訳1",...]\n各60文字以内。\n\n${bodies}`
      }], 600);
      let translations;
      try {
        translations = JSON.parse(transText);
      } catch (parseErr) {
        console.error("Comment translation JSON parse failed. Raw text:", transText);
        throw new Error(`JSON parse failed: ${parseErr.message}`);
      }
      setComments(rawComments.map((c, i) => ({ ...c, bodyJa: translations[i] || c.body })));
    } catch {
      setCommentsError("コメントの取得に失敗しました。");
    }
    setCommentsLoading(false);
  }

  if (!item) return null;
  const catColor = CATEGORY_COLORS[item.category] || "#9ca3af";
  const levelColor = { 初心者: "#34d399", 中級者: "#f59e0b", 上級者: "#f472b6" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end", pointerEvents: "none" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)", pointerEvents: "all" }} />
      <div style={{
        position: "relative", zIndex: 1, width: "min(520px, 95vw)", height: "100vh",
        background: "linear-gradient(160deg,#0d1117,#0f1923)", borderLeft: "1px solid #1f2937",
        display: "flex", flexDirection: "column", animation: "slideInRight 0.3s ease", pointerEvents: "all",
      }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #1f2937", background: "rgba(13,17,23,0.95)", flexShrink: 0, backdropFilter: "blur(10px)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#34d399", fontSize: "12px", fontFamily: "monospace" }}>▶ 詳細 + AI翻訳</span>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #374151", color: "#9ca3af", width: "28px", height: "28px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ background: catColor+"22", color: catColor, border: `1px solid ${catColor}44`, borderRadius: "4px", padding: "2px 10px", fontSize: "11px", fontFamily: "monospace" }}>{item.category}</span>
            {item.sourceType === "hn" ? (
              <span style={{ color: "#ff6600", background: "#ff660015", border: "1px solid #ff660030", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontFamily: "monospace" }}>🟠 Hacker News</span>
            ) : (
              <span style={{ color: "#ff0000", background: "#ff000015", border: "1px solid #ff000030", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontFamily: "monospace" }}>▶ YouTube</span>
            )}
            {item.score > 100000 && <span style={{ color: "#f97316", fontSize: "11px", animation: "pulse 2s infinite" }}>🔥 人気動画</span>}
          </div>

          <div style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: "700", lineHeight: "1.5", fontFamily: "monospace" }}>{item.title}</div>

          <div style={{ background: "#0a0f1a", border: "1px solid #1f2937", borderRadius: "8px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "9px" }}>
            <div style={{ color: "#374151", fontSize: "11px", fontFamily: "monospace" }}>── ソース情報</div>
            <Row label="メディア" value={item.sourceType === "hn" ? "🟠 Hacker News" : "▶ YouTube"} color={item.sourceType === "hn" ? "#ff6600" : "#ff0000"} />
            <Row label={item.sourceType === "hn" ? "投稿者" : "チャンネル"} value={item.source} color={item.sourceType === "hn" ? "#ff9944" : "#ff6666"} />
            <Row label={item.sourceType === "hn" ? "ポイント" : "視聴回数"} value={item.sourceType === "hn" ? `⬆ ${item.score?.toLocaleString()}` : `▶ ${formatViews(item.score)}`} color="#f59e0b" />
            <Row label="コメント" value={`${item.num_comments?.toLocaleString()} 件`} color="#60a5fa" />
            <Row label="投稿時刻" value={timeLabel(item.created_utc)} color="#9ca3af" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280", fontSize: "12px" }}>{item.sourceType === "hn" ? "元記事" : "元動画"}</span>
              <a href={item.permalink} target="_blank" rel="noopener noreferrer" style={{ color: item.sourceType === "hn" ? "#ff9944" : "#ff6666", fontSize: "11px", fontFamily: "monospace", textDecoration: "none" }}>
                {item.sourceType === "hn" ? "HNで開く →" : "YouTubeで開く →"}
              </a>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Tab label="🤖 AI翻訳・分析" active={tab === "summary"} onClick={() => setTab("summary")} />
            <Tab label="💬 コメント" active={tab === "comments"} onClick={() => setTab("comments")} badge={item.num_comments > 0 ? item.num_comments : null} />
          </div>

          {tab === "summary" && (
            <div style={{ background: "linear-gradient(135deg,#0a1628,#0d1f2d)", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ color: "#60a5fa", fontSize: "12px", fontFamily: "monospace" }}>🤖 Claude AI翻訳 + 分析</span>
                {summary?.level && (
                  <span style={{ color: levelColor[summary.level], background: levelColor[summary.level]+"20", border: `1px solid ${levelColor[summary.level]}40`, fontSize: "10px", padding: "2px 8px", borderRadius: "3px", fontFamily: "monospace" }}>{summary.level}向け</span>
                )}
              </div>
              {summaryLoading && <Shimmer lines={4} />}
              {summaryError && !summaryLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                  <div style={{ color: "#fca5a5", fontSize: "12px" }}>{summaryError}</div>
                  <button onClick={() => loadSummary(item)} style={{ background: "#1e3a5f", border: "1px solid #3b82f6", color: "#60a5fa", padding: "8px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontFamily: "monospace" }}>🔄 再試行</button>
                </div>
              )}
              {!summaryLoading && !summaryError && summary && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {summary.titleJa && <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "600", fontFamily: "monospace", borderBottom: "1px solid #1e3a5f", paddingBottom: "10px" }}>{summary.titleJa}</div>}
                  <div style={{ color: "#bfdbfe", fontSize: "13px", lineHeight: "1.9", fontFamily: "monospace" }}>{summary.translation}</div>
                  {summary.points?.length > 0 && (
                    <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: "12px" }}>
                      <div style={{ color: "#374151", fontSize: "11px", fontFamily: "monospace", marginBottom: "8px" }}>── 3つのポイント</div>
                      {summary.points.map((p, i) => (
                        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "7px" }}>
                          <span style={{ color: "#34d399", fontFamily: "monospace", fontSize: "12px", flexShrink: 0 }}>0{i+1}</span>
                          <span style={{ color: "#9ca3af", fontSize: "12px", lineHeight: "1.7" }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {summary.impact && (
                    <div style={{ background: "#0a2a1a", border: "1px solid #14532d", borderRadius: "6px", padding: "10px 12px" }}>
                      <div style={{ color: "#34d399", fontSize: "11px", fontFamily: "monospace", marginBottom: "4px" }}>🇯🇵 日本への影響</div>
                      <div style={{ color: "#86efac", fontSize: "12px", lineHeight: "1.7" }}>{summary.impact}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "comments" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ color: "#60a5fa", fontSize: "12px", fontFamily: "monospace" }}>💬 専門家の反応（AI生成）</span>
                {comments.length > 0 && <span style={{ color: "#374151", fontSize: "11px", fontFamily: "monospace" }}>{comments.length}件</span>}
              </div>
              {commentsLoading && [1,2,3].map(i => (
                <div key={i} style={{ background: "#080c14", border: "1px solid #1a2332", borderRadius: "6px", padding: "12px 14px", marginBottom: "10px" }}>
                  <Shimmer lines={3} />
                </div>
              ))}
              {commentsError && !commentsLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", padding: "20px 0" }}>
                  <div style={{ color: "#fca5a5", fontSize: "12px" }}>{commentsError}</div>
                  <button onClick={() => loadComments(item)} style={{ background: "#1e3a5f", border: "1px solid #3b82f6", color: "#60a5fa", padding: "8px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontFamily: "monospace" }}>🔄 再試行</button>
                </div>
              )}
              {!commentsLoading && !commentsError && comments.length > 0 && (
                <div>
                  <div style={{ background: "#0a1a2a", border: "1px solid #1e3a5f", borderRadius: "6px", padding: "8px 12px", marginBottom: "12px" }}>
                    <span style={{ color: "#4b5563", fontSize: "11px", fontFamily: "monospace" }}>ℹ️ AI専門家・エンジニアの視点からコメントをClaudeが生成・翻訳しています。</span>
                  </div>
                  {comments.map((c, i) => <CommentCard key={i} comment={c} index={i} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item, isNew, onClick }) {
  const [hover, setHover] = useState(false);
  const catColor = CATEGORY_COLORS[item.category] || "#9ca3af";
  return (
    <div onClick={() => onClick(item)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: "linear-gradient(135deg,#0f1117,#111827)",
      border: `1px solid ${isNew ? "#34d399" : hover ? "#374151" : "#1f2937"}`,
      borderRadius: "8px", padding: "16px", position: "relative", overflow: "hidden",
      animation: isNew ? "fadeSlideIn 0.5s ease" : "none",
      boxShadow: hover ? "0 8px 24px rgba(0,0,0,0.35)" : isNew ? "0 0 20px rgba(52,211,153,0.15)" : "none",
      cursor: "pointer", transform: hover ? "translateY(-2px)" : "translateY(0)", transition: "all 0.2s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <span style={{ background: catColor+"22", color: catColor, border: `1px solid ${catColor}44`, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontFamily: "monospace" }}>{item.category}</span>
          {item.sourceType === "hn" ? (
            <span style={{ color: "#ff6600", background: "#ff660015", border: "1px solid #ff660030", borderRadius: "3px", padding: "2px 6px", fontSize: "10px", fontFamily: "monospace" }}>🟠 HN</span>
          ) : (
            <span style={{ color: "#ff6666", background: "#ff000015", border: "1px solid #ff000030", borderRadius: "3px", padding: "2px 6px", fontSize: "10px", fontFamily: "monospace" }}>▶ YT</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {item.score > 100000 && <span style={{ fontSize: "10px" }}>🔥</span>}
          <span style={{ color: "#4b5563", fontSize: "10px", fontFamily: "monospace" }}>{item.sourceType === "hn" ? `⬆${item.score}` : `▶${formatViews(item.score)}`}</span>
          <span style={{ color: "#374151", fontSize: "10px", fontFamily: "monospace" }}>{timeLabel(item.created_utc)}</span>
        </div>
      </div>
      <div style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "600", lineHeight: "1.6", marginBottom: "6px", fontFamily: "monospace" }}>{item.titleJa || item.title}</div>
      {item.titleJa && (
        <div style={{ color: "#2d3748", fontSize: "10px", lineHeight: "1.5", marginBottom: "10px", fontFamily: "monospace" }}>
          {item.title.slice(0, 70)}{item.title.length > 70 ? "..." : ""}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#374151", fontSize: "10px", fontFamily: "monospace" }}>💬 {item.num_comments?.toLocaleString()}</span>
        <span style={{ color: hover ? "#34d399" : "#374151", fontSize: "10px", fontFamily: "monospace", transition: "color 0.2s" }}>詳細 + AI翻訳 →</span>
      </div>
    </div>
  );
}

function YouTubeTranscriptPanel() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showFull, setShowFull] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [transcriptLang, setTranscriptLang] = useState(null);
  const [rawTranscript, setRawTranscript] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowFull(false);
    setShowRaw(false);
    setTranscriptLang(null);
    setRawTranscript("");
    try {
      setStep("字幕を取得中...");
      const transcriptRes = await fetch("/api/youtube-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const transcriptData = await transcriptRes.json();
      if (transcriptData.error) throw new Error(transcriptData.error);

      setTranscriptLang(transcriptData.lang);
      const fullText = transcriptData.transcript;
      setRawTranscript(fullText);

      // Step 1: 要約＋詳細（字幕全文を最大30,000文字送る、出力は短い）
      setStep("AI要約を生成中...");
      const summaryInput = fullText.slice(0, 30000);
      const summaryText = await callClaude([{ role: "user", content:
        `以下のYouTube動画の字幕テキスト全文を分析して、JSONのみ返してください（前置き不要）。

字幕テキスト（${fullText.length.toLocaleString()}文字）:
${summaryInput}

以下のJSON形式で返してください:
{"summary":"3行まとめ（各行は改行で区切る、各行40文字以内）","detail":"詳細記事（ニュース記事のように整形、500〜800文字程度、動画全体の内容を網羅）"}`
      }], 2048);

      let parsed;
      try {
        parsed = JSON.parse(summaryText);
      } catch (parseErr) {
        console.error("Summary JSON parse failed. Raw:", summaryText);
        throw new Error("要約の生成に失敗しました。再試行してください。");
      }

      // Step 2: 整形全文（5,000文字ずつチャンク分割して順番に処理）
      const CHUNK_SIZE = 5000;
      const chunks = [];
      for (let i = 0; i < fullText.length; i += CHUNK_SIZE) {
        chunks.push(fullText.slice(i, i + CHUNK_SIZE));
      }

      let formattedParts = [];
      for (let i = 0; i < chunks.length; i++) {
        setStep(`全文整形中... (${i + 1}/${chunks.length})`);
        const chunkText = await callClaude([{ role: "user", content:
          `以下のYouTube字幕テキスト（パート${i + 1}/${chunks.length}）を読みやすい日本語に整形してください。
句読点・改行を適切に追加し、自然な文章にしてください。
JSONではなくプレーンテキストのみ返してください（前置き・説明不要）。

字幕テキスト:
${chunks[i]}`
        }], 4096);
        formattedParts.push(chunkText);
      }

      parsed.fullText = formattedParts.join("\n\n");
      setResult(parsed);
    } catch (e) {
      console.error("YouTube transcript error:", e);
      setError(e.message);
    }
    setLoading(false);
    setStep("");
  }

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ color: "#34d399", fontSize: "14px", fontFamily: "monospace", marginBottom: "6px" }}>▶ YouTube字幕 → AI整形</div>
        <div style={{ color: "#4b5563", fontSize: "11px", fontFamily: "monospace", lineHeight: "1.8" }}>YouTube動画のURLを貼るだけで、字幕を自動取得してClaudeが日本語で整形します</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          style={{
            flex: 1, background: "#0f1117", border: "1px solid #1f2937", borderRadius: "6px",
            padding: "10px 14px", color: "#e2e8f0", fontSize: "13px", fontFamily: "monospace",
            outline: "none",
          }}
          onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
          onBlur={(e) => e.target.style.borderColor = "#1f2937"}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          style={{
            background: loading ? "#1e3a5f" : "#34d399", color: loading ? "#60a5fa" : "#000",
            border: "none", borderRadius: "6px", padding: "10px 20px",
            fontSize: "12px", fontFamily: "monospace", fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
            opacity: !url.trim() ? 0.5 : 1, transition: "all 0.2s",
          }}
        >
          {loading ? step || "処理中..." : "字幕を取得"}
        </button>
      </form>

      {loading && (
        <div style={{ background: "linear-gradient(135deg,#0a1628,#0d1f2d)", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "20px" }}>
          <Shimmer lines={5} />
          <div style={{ color: "#4b5563", fontSize: "11px", fontFamily: "monospace", marginTop: "12px", textAlign: "center" }}>{step}</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{ color: "#fca5a5", fontSize: "12px", fontFamily: "monospace" }}>{error}</div>
          <button onClick={handleSubmit} style={{ background: "#1e3a5f", border: "1px solid #3b82f6", color: "#60a5fa", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontFamily: "monospace" }}>🔄 再試行</button>
        </div>
      )}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {(transcriptLang || rawTranscript) && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {transcriptLang && <span style={{ background: "#34d39922", color: "#34d399", border: "1px solid #34d39944", borderRadius: "4px", padding: "2px 10px", fontSize: "11px", fontFamily: "monospace" }}>字幕言語: {transcriptLang}</span>}
              {rawTranscript && <span style={{ background: "#60a5fa22", color: "#60a5fa", border: "1px solid #60a5fa44", borderRadius: "4px", padding: "2px 10px", fontSize: "11px", fontFamily: "monospace" }}>字幕: {rawTranscript.length.toLocaleString()}文字</span>}
            </div>
          )}
          {/* 3行まとめ */}
          <div style={{ background: "linear-gradient(135deg,#0a1628,#0d1f2d)", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "16px" }}>
            <div style={{ color: "#60a5fa", fontSize: "12px", fontFamily: "monospace", marginBottom: "12px" }}>① 3行まとめ</div>
            {result.summary.split("\n").map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "7px" }}>
                <span style={{ color: "#34d399", fontFamily: "monospace", fontSize: "12px", flexShrink: 0 }}>0{i + 1}</span>
                <span style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: "1.7", fontFamily: "monospace" }}>{line}</span>
              </div>
            ))}
          </div>

          {/* 詳細 */}
          <div style={{ background: "linear-gradient(135deg,#0a1628,#0d1f2d)", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "16px" }}>
            <div style={{ color: "#60a5fa", fontSize: "12px", fontFamily: "monospace", marginBottom: "12px" }}>② 詳細</div>
            <div style={{ color: "#bfdbfe", fontSize: "13px", lineHeight: "2.0", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{result.detail}</div>
          </div>

          {/* 全文トグル */}
          <div style={{ background: "linear-gradient(135deg,#0a1628,#0d1f2d)", border: "1px solid #1e3a5f", borderRadius: "8px", overflow: "hidden" }}>
            <button
              onClick={() => setShowFull(!showFull)}
              style={{
                width: "100%", background: "transparent", border: "none", borderBottom: showFull ? "1px solid #1e3a5f" : "none",
                padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", color: "#60a5fa", fontSize: "12px", fontFamily: "monospace",
              }}
            >
              <span>③ 全文（整形済み）</span>
              <span style={{ color: "#4b5563", fontSize: "11px" }}>{showFull ? "▲ 閉じる" : "▼ 開く"}</span>
            </button>
            {showFull && (
              <div style={{ padding: "16px", maxHeight: "500px", overflowY: "auto" }}>
                <div style={{ color: "#9ca3af", fontSize: "12px", lineHeight: "2.0", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{result.fullText}</div>
              </div>
            )}
          </div>

          {/* 生テキストトグル */}
          {rawTranscript && (
            <div style={{ background: "linear-gradient(135deg,#0a1628,#0d1f2d)", border: "1px solid #1e3a5f", borderRadius: "8px", overflow: "hidden" }}>
              <button
                onClick={() => setShowRaw(!showRaw)}
                style={{
                  width: "100%", background: "transparent", border: "none", borderBottom: showRaw ? "1px solid #1e3a5f" : "none",
                  padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", color: "#4b5563", fontSize: "12px", fontFamily: "monospace",
                }}
              >
                <span>④ 生テキスト（元の字幕データ）</span>
                <span style={{ fontSize: "11px" }}>{showRaw ? "▲ 閉じる" : "▼ 開く"}</span>
              </button>
              {showRaw && (
                <div style={{ padding: "16px", maxHeight: "400px", overflowY: "auto" }}>
                  <div style={{ color: "#4b5563", fontSize: "11px", lineHeight: "1.8", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{rawTranscript}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState("全て");
  const [newIds, setNewIds] = useState([]);
  const [status, setStatus] = useState("起動中...");
  const [nextUpdate, setNextUpdate] = useState(300);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [mainTab, setMainTab] = useState("news");

  useEffect(() => {
    const t = setInterval(() => {
      setTick(n => n + 1);
      setNextUpdate(prev => prev <= 1 ? 300 : prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (tick === 0 || nextUpdate === 300) fetchAll();
  }, [tick === 0, nextUpdate === 300]);

  async function fetchAll() {
    setStatus("データ取得中...");
    const [ytResults, hnResults] = await Promise.all([
      fetchYouTube(),
      fetchHackerNews(),
    ]);
    const allResults = [...ytResults, ...hnResults];
    if (allResults.length > 0) {
      setUsingFallback(false);
      setStatus("AI翻訳中...");
      const translated = await batchTranslate(allResults);
      updateNews(translated.sort((a, b) => b.score - a.score));
    } else {
      setUsingFallback(true);
      setStatus("AI生成中...");
      const generated = await generateNews();
      updateNews(generated);
    }
    setLastUpdate(new Date());
    setStatus("LIVE");
  }

  function updateNews(items) {
    setNews(items);
    const ids = items.slice(0, 3).map(i => i.id);
    setNewIds(ids);
    setTimeout(() => setNewIds([]), 3000);
  }

  async function fetchYouTube() {
    const results = [];
    for (const yt of YT_QUERIES) {
      try {
        const res = await fetch(`/api/youtube?q=${encodeURIComponent(yt.query)}`);
        const data = await res.json();
        const items = data?.items || [];
        items.forEach((v) => {
          const publishedAt = new Date(v.publishedAt);
          results.push({
            id: v.id,
            title: v.title,
            source: v.channelTitle,
            author: v.channelTitle,
            score: v.viewCount,
            num_comments: v.commentCount,
            created_utc: Math.floor(publishedAt.getTime() / 1000),
            permalink: `https://www.youtube.com/watch?v=${v.id}`,
            category: yt.category,
            titleJa: null,
            sourceType: "yt",
          });
        });
      } catch { /* skip */ }
    }
    // Deduplicate by id
    const seen = new Set();
    const unique = results.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    return unique.sort((a, b) => b.score - a.score).slice(0, 12);
  }

  async function fetchHackerNews() {
    try {
      const res = await fetch("/api/hackernews?limit=8");
      const data = await res.json();
      return (data?.items || []).map((item) => ({
        id: `hn-${item.id}`,
        title: item.title,
        source: "Hacker News",
        author: item.author,
        score: item.score,
        num_comments: item.commentCount,
        created_utc: item.time,
        permalink: item.url,
        category: classifyCategory(item.title),
        titleJa: null,
        sourceType: "hn",
      }));
    } catch {
      return [];
    }
  }

  async function batchTranslate(posts) {
    try {
      const lines = posts.map((p, i) => `${i}: ${p.title}`).join("\n");
      const text = await callClaude([{ role: "user", content:
        `以下のタイトルを日本語に翻訳してください。JSONの配列のみ返してください（説明不要）:\n["翻訳0","翻訳1",...]\n各40文字以内。\n\n${lines}`
      }], 600);
      let translations;
      try {
        translations = JSON.parse(text);
      } catch (parseErr) {
        console.error("batchTranslate JSON parse failed. Raw text:", text);
        throw new Error(`JSON parse failed: ${parseErr.message}`);
      }
      return posts.map((p, i) => ({ ...p, titleJa: translations[i] || null }));
    } catch (e) {
      console.error("batchTranslate error:", e);
      return posts;
    }
  }

  async function generateNews() {
    try {
      const text = await callClaude([{ role: "user", content:
        `AI業界のリアルなYouTube動画風ニュースを8件生成してください。JSONのみ:\n[{"id":"g1","title":"英語タイトル","titleJa":"日本語（40字以内）","source":"チャンネル名","author":"チャンネル名","score":数値,"num_comments":数値,"created_utc":${Math.floor(Date.now()/1000)-3600},"permalink":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","category":"研究|ツール|ビジネス|モデル"}]`
      }]);
      try {
        return JSON.parse(text);
      } catch (parseErr) {
        console.error("generateNews JSON parse failed. Raw text:", text);
        throw parseErr;
      }
    } catch (e) {
      console.error("generateNews error:", e.message);
      return FALLBACK_NEWS;
    }
  }

  const filtered = filter === "全て" ? news : news.filter(n => n.category === filter);
  const isLoading = status !== "LIVE" && news.length === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#060810", color: "#e2e8f0", fontFamily: "monospace" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(#0f172a33 1px,transparent 1px),linear-gradient(90deg,#0f172a33 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #1f2937", background: "rgba(6,8,16,0.95)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "0.15em", color: "#f0fdf4" }}>▶ AI_RADAR</div>
              <div style={{ color: "#374151", fontSize: "11px", marginTop: "2px" }}>
                YouTube × HackerNews × Claude AI — リアルタイム翻訳
                {usingFallback && <span style={{ color: "#f59e0b", marginLeft: "8px" }}>[AI生成モード]</span>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: status === "LIVE" ? "#34d399" : "#f59e0b" }}>
                <span style={{ animation: "pulse 1.5s infinite" }}>●</span>{status}
              </div>
              <div style={{ color: "#374151", fontSize: "10px", marginTop: "3px" }}>次回更新: {nextUpdate}秒後</div>
            </div>
          </div>
        </div>

        {/* Main tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #1f2937", background: "#080a10" }}>
          <button onClick={() => setMainTab("news")} style={{
            background: mainTab === "news" ? "#0f1117" : "transparent",
            color: mainTab === "news" ? "#34d399" : "#4b5563",
            border: "none", borderBottom: mainTab === "news" ? "2px solid #34d399" : "2px solid transparent",
            padding: "10px 24px", fontSize: "13px", fontFamily: "monospace", fontWeight: "700",
            cursor: "pointer", transition: "all 0.2s",
          }}>📡 ニュース</button>
          <button onClick={() => setMainTab("transcript")} style={{
            background: mainTab === "transcript" ? "#0f1117" : "transparent",
            color: mainTab === "transcript" ? "#34d399" : "#4b5563",
            border: "none", borderBottom: mainTab === "transcript" ? "2px solid #34d399" : "2px solid transparent",
            padding: "10px 24px", fontSize: "13px", fontFamily: "monospace", fontWeight: "700",
            cursor: "pointer", transition: "all 0.2s",
          }}>🎬 YouTube字幕</button>
        </div>

        {mainTab === "news" && <>
        <Ticker news={news} />

        {/* Source badges */}
        <div style={{ display: "flex", gap: "8px", padding: "10px 24px", borderBottom: "1px solid #111827", background: "#080a10", overflowX: "auto" }}>
          {YT_QUERIES.map(yt => (
            <span key={yt.query} style={{ color: "#ff6666", background: "#ff000010", border: "1px solid #ff000030", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontFamily: "monospace", whiteSpace: "nowrap" }}>▶ {yt.query}</span>
          ))}
          {lastUpdate && <span style={{ marginLeft: "auto", color: "#374151", fontSize: "10px", whiteSpace: "nowrap", alignSelf: "center" }}>更新: {lastUpdate.toLocaleTimeString("ja-JP")}</span>}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "8px", padding: "12px 24px", overflowX: "auto" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              background: filter === cat ? "#34d399" : "transparent",
              color: filter === cat ? "#000" : "#6b7280",
              border: `1px solid ${filter === cat ? "#34d399" : "#1f2937"}`,
              borderRadius: "4px", padding: "4px 14px", fontSize: "12px",
              cursor: "pointer", fontFamily: "monospace", whiteSpace: "nowrap", transition: "all 0.2s",
            }}>{cat}</button>
          ))}
          <span style={{ marginLeft: "auto", color: "#374151", fontSize: "11px", alignSelf: "center" }}>{filtered.length}件</span>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "#0f1117", border: "1px solid #1f2937", borderRadius: "8px", padding: "16px" }}>
                <Shimmer lines={4} />
              </div>
            ))}
          </div>
        )}

        {/* News grid */}
        {news.length > 0 && (
          <div style={{ padding: "0 24px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" }}>
            {filtered.map(item => (
              <NewsCard key={item.id} item={item} isNew={newIds.includes(item.id)} onClick={setSelected} />
            ))}
          </div>
        )}

        </>}

        {mainTab === "transcript" && <YouTubeTranscriptPanel />}

        <div style={{ borderTop: "1px solid #111827", padding: "12px 24px", display: "flex", justifyContent: "space-between", color: "#1f2937", fontSize: "11px" }}>
          <span>AI_RADAR v0.8</span>
          <span>YouTube × HackerNews × Claude AI</span>
        </div>
      </div>
      <DetailPanel item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
// Vercel redeploy 2026年 4月  2日 木曜日 15:13:17    
