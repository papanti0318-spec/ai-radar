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
  研究: "#6366f1", ツール: "#10b981", ビジネス: "#f59e0b", モデル: "#ec4899",
};

const SOURCE_BADGE = {
  hn: { label: "Hacker News", icon: "🟠", color: "#ff6600", bg: "#fff3e0" },
  yt: { label: "YouTube", icon: "▶", color: "#ff0000", bg: "#ffebee" },
  note: { label: "note", icon: "📝", color: "#41c9b4", bg: "#e0f7f1" },
};

const FALLBACK_NEWS = [
  { id: "f1", title: "GPT-4o gets major update with better reasoning", titleJa: "GPT-4oが推論能力を大幅強化", source: "OpenAI Official", author: "OpenAI Official", score: 342000, num_comments: 287, created_utc: Math.floor(Date.now()/1000)-1800, permalink: "https://www.youtube.com/results?search_query=GPT-4o", category: "モデル", sourceType: "yt" },
  { id: "f2", title: "Llama 3.3 running locally is absolutely insane performance", titleJa: "Llama 3.3のローカル動作が衝撃的な性能", source: "Two Minute Papers", author: "Two Minute Papers", score: 289000, num_comments: 412, created_utc: Math.floor(Date.now()/1000)-3200, permalink: "https://www.youtube.com/results?search_query=Llama+local", category: "ツール", sourceType: "yt" },
  { id: "f3", title: "New paper: LLMs autonomously write and verify mathematical proofs", titleJa: "新論文：LLMが数学的証明を自律的に生成・検証", source: "Yannic Kilcher", author: "Yannic Kilcher", score: 210400, num_comments: 183, created_utc: Math.floor(Date.now()/1000)-5400, permalink: "https://www.youtube.com/results?search_query=LLM+math+proof", category: "研究", sourceType: "yt" },
  { id: "f4", title: "Claude 3.5 Sonnet vs GPT-4o: Full Benchmark Comparison", titleJa: "Claude 3.5 Sonnet vs GPT-4o 完全ベンチマーク比較", source: "AI Explained", author: "AI Explained", score: 187600, num_comments: 234, created_utc: Math.floor(Date.now()/1000)-7200, permalink: "https://www.youtube.com/results?search_query=Claude+GPT+benchmark", category: "モデル", sourceType: "yt" },
  { id: "f5", title: "AI replacing jobs: 40% of tasks automatable by 2026", titleJa: "AI自動化で40%の業務が代替可能との新研究", source: "Bloomberg Technology", author: "Bloomberg Technology", score: 165400, num_comments: 891, created_utc: Math.floor(Date.now()/1000)-9000, permalink: "https://www.youtube.com/results?search_query=AI+jobs+automation", category: "ビジネス", sourceType: "yt" },
  { id: "f6", title: "Build AI Agent from Scratch: Complete Tutorial 2025", titleJa: "AIエージェントをゼロから構築：完全チュートリアル2025", source: "freeCodeCamp", author: "freeCodeCamp", score: 143200, num_comments: 167, created_utc: Math.floor(Date.now()/1000)-10800, permalink: "https://www.youtube.com/results?search_query=AI+agent+tutorial", category: "ツール", sourceType: "yt" },
  { id: "f7", title: "Anthropic releases new AI safety research: Constitutional AI v2", titleJa: "AnthropicがConstitutional AI v2安全性研究を公開", source: "Lex Fridman", author: "Lex Fridman", score: 128700, num_comments: 145, created_utc: Math.floor(Date.now()/1000)-12600, permalink: "https://www.youtube.com/results?search_query=Anthropic+AI+safety", category: "研究", sourceType: "yt" },
  { id: "f8", title: "OpenAI valuation hits $300B: What it means for the industry", titleJa: "OpenAIの評価額3000億ドル突破：業界への影響を解説", source: "CNBC", author: "CNBC", score: 98700, num_comments: 543, created_utc: Math.floor(Date.now()/1000)-14400, permalink: "https://www.youtube.com/results?search_query=OpenAI+valuation", category: "ビジネス", sourceType: "yt" },
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


/* ─── Shimmer ─── */
function Shimmer({ lines = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: "14px", borderRadius: "6px",
          width: `${[100, 85, 65][i] || 70}%`,
          background: "linear-gradient(90deg,#efe8dc,#f5f0e8,#efe8dc)",
          backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
        }} />
      ))}
    </div>
  );
}

/* ─── Source Badge ─── */
function SourceBadge({ type }) {
  const s = SOURCE_BADGE[type] || SOURCE_BADGE.yt;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      background: s.bg, color: s.color, fontSize: "11px", fontWeight: "600",
      padding: "2px 8px", borderRadius: "4px", whiteSpace: "nowrap",
    }}>{s.icon} {s.label}</span>
  );
}

/* ─── Category Pill ─── */
function CategoryPill({ category }) {
  const c = CATEGORY_COLORS[category] || "#888";
  return (
    <span style={{
      background: c + "14", color: c, fontSize: "11px", fontWeight: "600",
      padding: "2px 10px", borderRadius: "4px", border: `1px solid ${c}30`,
    }}>{category}</span>
  );
}

/* ─── Detail Panel (slide-in) ─── */
function DetailPanel({ item, onClose }) {
  const [tab, setTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  useEffect(() => {
    if (item) { setSummary(null); setSummaryError(null); setComments([]); setCommentsError(null); setTab("summary"); loadSummary(item); }
  }, [item?.id]);

  useEffect(() => {
    if (tab === "comments" && comments.length === 0 && !commentsLoading && item) loadComments(item);
  }, [tab]);

  async function loadSummary(it) {
    setSummaryLoading(true);
    try {
      const sourceLabel = it.sourceType === "hn" ? "Hacker News記事" : "YouTube動画";
      const sourceField = it.sourceType === "hn" ? `投稿者: ${it.author}` : `チャンネル: ${it.source}`;
      const text = await callClaude([{ role: "user", content:
        `以下の${sourceLabel}を分析してJSONのみ返してください（前置き不要）。\nタイトル: ${it.title}\n${sourceField}\nカテゴリ: ${it.category}\n\n{"titleJa":"日本語タイトル（40文字以内）","translation":"内容の日本語要約（120字以内）","points":["ポイント1（25字以内）","ポイント2（25字以内）","ポイント3（25字以内）"],"impact":"日本への影響（45字以内）","level":"初心者|中級者|上級者"}`
      }]);
      let parsed;
      try { parsed = JSON.parse(text); } catch (parseErr) { console.error("Summary JSON parse failed:", text); throw new Error(`JSON parse failed: ${parseErr.message}`); }
      setSummary(parsed);
    } catch (e) { console.error("Summary error:", e.message); setSummaryError(`翻訳に失敗しました: ${e.message}`); }
    setSummaryLoading(false);
  }

  async function loadComments(it) {
    setCommentsLoading(true); setCommentsError(null);
    try {
      const text = await callClaude([{ role: "user", content:
        `以下のYouTube動画に対して、AI専門家・エンジニア・経営者など多様な視点からのリアルなコメントを5件生成してください。JSONのみ:\n[{"author":"名前","score":数値,"body":"英語コメント（50語以内）"}]\n\nタイトル: ${it.title}\nチャンネル: ${it.source}`
      }], 800);
      let rawComments;
      try { rawComments = JSON.parse(text); } catch (parseErr) { console.error("Comments JSON parse failed:", text); throw new Error(`JSON parse failed: ${parseErr.message}`); }
      const bodies = rawComments.map((c, i) => `${i}: ${c.body}`).join("\n");
      const transText = await callClaude([{ role: "user", content:
        `以下のコメントを日本語に翻訳してください。JSONの配列のみ返してください:\n["翻訳0","翻訳1",...]\n各60文字以内。\n\n${bodies}`
      }], 600);
      let translations;
      try { translations = JSON.parse(transText); } catch (parseErr) { console.error("Comment translation JSON parse failed:", transText); throw new Error(`JSON parse failed: ${parseErr.message}`); }
      setComments(rawComments.map((c, i) => ({ ...c, bodyJa: translations[i] || c.body })));
    } catch { setCommentsError("コメントの取得に失敗しました。"); }
    setCommentsLoading(false);
  }

  if (!item) return null;
  const catColor = CATEGORY_COLORS[item.category] || "#888";
  const levelColor = { 初心者: "#10b981", 中級者: "#f59e0b", 上級者: "#ec4899" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end", pointerEvents: "none" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", pointerEvents: "all" }} />
      <div style={{
        position: "relative", zIndex: 1, width: "min(560px, 95vw)", height: "100vh",
        background: "#FFFFFF", borderLeft: "1px solid #e8e0d4",
        display: "flex", flexDirection: "column", animation: "slideInRight 0.3s ease", pointerEvents: "all",
        boxShadow: "-8px 0 30px rgba(0,0,0,0.08)",
      }}>
        {/* Panel header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0ebe3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#10b981", fontSize: "14px", fontWeight: "700" }}>詳細 + AI翻訳</span>
          <button onClick={onClose} style={{ background: "#f5f0e6", border: "1px solid #e8e0d4", color: "#888", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <CategoryPill category={item.category} />
            <SourceBadge type={item.sourceType} />
            {item.score > 100000 && <span style={{ color: "#f97316", fontSize: "12px", fontWeight: "600" }}>🔥 人気</span>}
          </div>

          {/* Title */}
          <h2 style={{ color: "#1A1A1A", fontSize: "18px", fontWeight: "700", lineHeight: "1.6" }}>{item.title}</h2>

          {/* Info card */}
          <div style={{ background: "#f5f0e6", borderRadius: "12px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>ソース</span>
              <span style={{ color: "#1A1A1A", fontSize: "13px", fontWeight: "500" }}>{item.source}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>{item.sourceType === "hn" ? "ポイント" : "視聴回数"}</span>
              <span style={{ color: "#f59e0b", fontSize: "13px", fontWeight: "600" }}>{item.sourceType === "hn" ? `⬆ ${item.score?.toLocaleString()}` : `▶ ${formatViews(item.score)}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>コメント</span>
              <span style={{ color: "#6366f1", fontSize: "13px", fontWeight: "500" }}>{item.num_comments?.toLocaleString()} 件</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>投稿</span>
              <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>{timeLabel(item.created_utc)}</span>
            </div>
            <a href={item.permalink} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", fontSize: "13px", fontWeight: "500", textAlign: "right" }}>
              {item.sourceType === "hn" ? "HNで開く →" : "YouTubeで開く →"}
            </a>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            {["summary", "comments"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? "#1A1A1A" : "#f5f0e6", color: tab === t ? "#fff" : "#888",
                border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", transition: "all 0.2s",
              }}>{t === "summary" ? "🤖 AI翻訳・分析" : `💬 コメント${item.num_comments > 0 ? ` (${item.num_comments})` : ""}`}</button>
            ))}
          </div>

          {/* Summary tab */}
          {tab === "summary" && (
            <div style={{ background: "#f5f0e6", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: "#6366f1", fontSize: "13px", fontWeight: "600" }}>🤖 Claude AI翻訳</span>
                {summary?.level && (
                  <span style={{ color: levelColor[summary.level], background: levelColor[summary.level]+"18", fontSize: "11px", fontWeight: "600", padding: "2px 10px", borderRadius: "4px" }}>{summary.level}向け</span>
                )}
              </div>
              {summaryLoading && <Shimmer lines={5} />}
              {summaryError && !summaryLoading && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{summaryError}</p>
                  <button onClick={() => loadSummary(item)} style={{ background: "#1A1A1A", color: "#fff", border: "none", padding: "8px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>再試行</button>
                </div>
              )}
              {!summaryLoading && !summaryError && summary && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {summary.titleJa && <h3 style={{ color: "#1A1A1A", fontSize: "16px", fontWeight: "700", lineHeight: "1.5", paddingBottom: "12px", borderBottom: "1px solid #e8e0d4" }}>{summary.titleJa}</h3>}
                  <p style={{ color: "#444", fontSize: "14px", lineHeight: "1.9" }}>{summary.translation}</p>
                  {summary.points?.length > 0 && (
                    <div style={{ paddingTop: "12px", borderTop: "1px solid #e8e0d4" }}>
                      <p style={{ color: "#888", fontSize: "12px", fontWeight: "600", marginBottom: "10px" }}>3つのポイント</p>
                      {summary.points.map((p, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                          <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "700", flexShrink: 0 }}>0{i+1}</span>
                          <span style={{ color: "#555", fontSize: "13px", lineHeight: "1.7" }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {summary.impact && (
                    <div style={{ background: "#ecfdf5", borderRadius: "10px", padding: "14px 16px" }}>
                      <p style={{ color: "#10b981", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>🇯🇵 日本への影響</p>
                      <p style={{ color: "#065f46", fontSize: "13px", lineHeight: "1.7" }}>{summary.impact}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comments tab */}
          {tab === "comments" && (
            <div>
              {commentsLoading && [1,2,3].map(i => <div key={i} style={{ background: "#f5f0e6", borderRadius: "10px", padding: "16px", marginBottom: "10px" }}><Shimmer lines={3} /></div>)}
              {commentsError && !commentsLoading && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{commentsError}</p>
                  <button onClick={() => loadComments(item)} style={{ background: "#1A1A1A", color: "#fff", border: "none", padding: "8px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>再試行</button>
                </div>
              )}
              {!commentsLoading && !commentsError && comments.length > 0 && (
                <div>
                  <p style={{ color: "#aaa", fontSize: "12px", marginBottom: "14px", padding: "10px 14px", background: "#f5f0e6", borderRadius: "8px" }}>AI専門家・エンジニアの視点からClaudeが生成・翻訳</p>
                  {comments.map((c, i) => (
                    <div key={i} style={{ background: "#f5f0e6", borderRadius: "10px", padding: "14px 16px", marginBottom: "10px", borderLeft: `3px solid ${Object.values(CATEGORY_COLORS)[i % 4]}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#888", fontSize: "12px", fontWeight: "500" }}>{c.author}</span>
                        <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "600" }}>👍 {c.score?.toLocaleString()}</span>
                      </div>
                      {c.bodyJa && <p style={{ color: "#1A1A1A", fontSize: "13px", lineHeight: "1.8", marginBottom: "8px" }}>{c.bodyJa}</p>}
                      <details>
                        <summary style={{ color: "#bbb", fontSize: "11px", cursor: "pointer" }}>▶ 原文</summary>
                        <p style={{ color: "#aaa", fontSize: "12px", lineHeight: "1.7", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #e8e0d4" }}>{c.body}</p>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Hero Card (top story) ─── */
function HeroCard({ item, onClick }) {
  const [hover, setHover] = useState(false);
  if (!item) return null;
  const badge = SOURCE_BADGE[item.sourceType] || SOURCE_BADGE.yt;
  return (
    <div onClick={() => onClick(item)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: "#FFFFFF", borderRadius: "16px", padding: "32px",
      boxShadow: hover ? "0 12px 40px rgba(0,0,0,0.1)" : "0 2px 12px rgba(0,0,0,0.04)",
      cursor: "pointer", transition: "all 0.3s ease", transform: hover ? "translateY(-3px)" : "none",
      animation: "fadeIn 0.5s ease",
    }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ background: "#10b981", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 12px", borderRadius: "4px", letterSpacing: "0.05em" }}>TODAY&apos;S TOP</span>
        <CategoryPill category={item.category} />
        <SourceBadge type={item.sourceType} />
        {(item.isGenerated || /^[fg]/.test(item.id || "")) && (
          <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "4px", border: "1px solid #fcd34d" }}>✨ AI生成</span>
        )}
        <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "700", marginLeft: "auto" }}>{timeLabel(item.created_utc)}</span>
      </div>
      <h1 style={{ color: "#1A1A1A", fontSize: "24px", fontWeight: "800", lineHeight: "1.5", marginBottom: "12px" }}>{item.titleJa || item.title}</h1>
      {item.titleJa && <p style={{ color: "#999", fontSize: "13px", lineHeight: "1.5", marginBottom: "16px" }}>{item.title}</p>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "16px", color: "#888", fontSize: "13px" }}>
          <span>{item.sourceType === "hn" ? `⬆ ${item.score?.toLocaleString()}` : `▶ ${formatViews(item.score)}`}</span>
          <span>💬 {item.num_comments?.toLocaleString()}</span>
          <span style={{ color: "#aaa" }}>{item.source}</span>
        </div>
        <span style={{
          background: hover ? "#1A1A1A" : "#10b981", color: "#fff",
          padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700",
          transition: "all 0.2s",
        }}>詳細 + AI翻訳 →</span>
      </div>
    </div>
  );
}

/* ─── News Card ─── */
function NewsCard({ item, onClick, index }) {
  const [hover, setHover] = useState(false);
  const isYT = item.sourceType === "yt";
  return (
    <div onClick={() => onClick(item)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: "#FFFFFF", borderRadius: "12px", overflow: "hidden",
      boxShadow: hover ? "0 8px 28px rgba(0,0,0,0.1)" : "0 1px 6px rgba(0,0,0,0.04)",
      cursor: "pointer", transition: "all 0.2s ease", transform: hover ? "translateY(-2px)" : "none",
      animation: `fadeIn 0.4s ease ${index * 0.05}s both`,
    }}>
      {/* YouTube thumbnail */}
      {isYT && (
        <div style={{ position: "relative", paddingBottom: "56.25%", background: "#f0ebe3" }}>
          <img
            src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
          <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px" }}>▶ {formatViews(item.score)}</div>
        </div>
      )}
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <SourceBadge type={item.sourceType} />
          <CategoryPill category={item.category} />
          {(item.isGenerated || /^[fg]/.test(item.id || "")) && (
            <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", border: "1px solid #fcd34d" }}>✨ AI生成</span>
          )}
          <span style={{ color: "#10b981", fontSize: "12px", fontWeight: "600", marginLeft: "auto" }}>{timeLabel(item.created_utc)}</span>
        </div>
        <h3 style={{ color: "#1A1A1A", fontSize: "14px", fontWeight: "700", lineHeight: "1.6", marginBottom: "6px" }}>{item.titleJa || item.title}</h3>
        {item.titleJa && <p style={{ color: "#bbb", fontSize: "11px", lineHeight: "1.4", marginBottom: "10px" }}>{item.title.slice(0, 80)}{item.title.length > 80 ? "..." : ""}</p>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "12px", color: "#aaa", fontSize: "12px" }}>
            {!isYT && <span>{item.sourceType === "hn" ? `⬆ ${item.score}` : `▶ ${formatViews(item.score)}`}</span>}
            <span>💬 {item.num_comments?.toLocaleString()}</span>
          </div>
          <span style={{
            color: hover ? "#fff" : "#10b981", background: hover ? "#10b981" : "#ecfdf5",
            padding: "4px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", transition: "all 0.2s",
          }}>詳細 + AI翻訳</span>
        </div>
      </div>
    </div>
  );
}

/* ─── YouTube Transcript Panel ─── */
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
    setLoading(true); setError(null); setResult(null); setShowFull(false); setShowRaw(false); setTranscriptLang(null); setRawTranscript("");
    try {
      setStep("字幕を取得中...");
      const transcriptRes = await fetch("/api/youtube-transcript", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim() }) });
      const transcriptData = await transcriptRes.json();
      if (transcriptData.error) throw new Error(transcriptData.error);
      setTranscriptLang(transcriptData.lang);
      const fullText = transcriptData.transcript;
      setRawTranscript(fullText);
      const CHUNK_SIZE = 5000;
      const chunks = [];
      for (let i = 0; i < fullText.length; i += CHUNK_SIZE) chunks.push(fullText.slice(i, i + CHUNK_SIZE));
      let translatedParts = [];
      for (let i = 0; i < chunks.length; i++) {
        setStep(`日本語に翻訳中... (${i + 1}/${chunks.length})`);
        const chunkText = await callClaude([{ role: "user", content: `以下のYouTube字幕テキスト（パート${i + 1}/${chunks.length}）を日本語に翻訳してください。\n自然な日本語で、句読点・改行を適切に追加して読みやすくしてください。\n既に日本語の部分はそのまま残してください。\nJSONではなくプレーンテキストのみ返してください（前置き・説明不要）。\n\n字幕テキスト:\n${chunks[i]}` }], 4096);
        translatedParts.push(chunkText);
      }
      const translatedFull = translatedParts.join("\n\n");
      setStep("記事を生成中...");
      const articleInput = translatedFull.slice(0, 30000);
      const articleText = await callClaude([{ role: "user", content: `以下はYouTube動画の字幕を日本語に翻訳したテキストです。これを元に記事を作成してください。\nJSONのみ返してください（前置き不要）。\n\n翻訳済みテキスト（${translatedFull.length.toLocaleString()}文字）:\n${articleInput}\n\n以下のJSON形式で返してください:\n{"summary":"3行まとめ（各行は改行で区切る、各行40文字以内）","article":"ニュース記事形式の本文（見出し・段落分けして1500〜3000文字程度、動画の内容を漏れなくカバー）"}` }], 4096);
      let parsed;
      try { parsed = JSON.parse(articleText); } catch (parseErr) { console.error("Article JSON parse failed:", articleText); throw new Error("記事の生成に失敗しました。再試行してください。"); }
      parsed.fullText = translatedFull;
      setResult(parsed);
    } catch (e) { console.error("YouTube transcript error:", e); setError(e.message); }
    setLoading(false); setStep("");
  }

  const panelBg = "#FFFFFF";
  const sectionStyle = { background: panelBg, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#1A1A1A", fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>🎬 YouTube字幕 → AI記事生成</h2>
        <p style={{ color: "#888", fontSize: "13px" }}>URLを貼るだけで字幕を取得し、Claudeが日本語記事に変換します</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
          style={{ flex: 1, background: "#fff", border: "1px solid #e8e0d4", borderRadius: "10px", padding: "12px 16px", color: "#1A1A1A", fontSize: "14px", outline: "none" }}
          onFocus={(e) => e.target.style.borderColor = "#10b981"} onBlur={(e) => e.target.style.borderColor = "#e8e0d4"}
        />
        <button type="submit" disabled={loading || !url.trim()} style={{
          background: loading ? "#e8e0d4" : "#1A1A1A", color: loading ? "#888" : "#fff",
          border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: "700",
          cursor: loading ? "not-allowed" : "pointer", opacity: !url.trim() ? 0.5 : 1, whiteSpace: "nowrap",
        }}>{loading ? step || "処理中..." : "字幕を取得"}</button>
      </form>
      {loading && <div style={sectionStyle}><Shimmer lines={5} /><p style={{ color: "#aaa", fontSize: "12px", marginTop: "12px", textAlign: "center" }}>{step}</p></div>}
      {error && !loading && (
        <div style={{ ...sectionStyle, background: "#fef2f2", textAlign: "center" }}>
          <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
          <button onClick={handleSubmit} style={{ background: "#1A1A1A", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>再試行</button>
        </div>
      )}
      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {(transcriptLang || rawTranscript) && (
            <div style={{ display: "flex", gap: "8px" }}>
              {transcriptLang && <span style={{ background: "#ecfdf5", color: "#10b981", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "6px" }}>言語: {transcriptLang}</span>}
              {rawTranscript && <span style={{ background: "#eff6ff", color: "#6366f1", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "6px" }}>{rawTranscript.length.toLocaleString()}文字</span>}
            </div>
          )}
          <div style={sectionStyle}>
            <p style={{ color: "#6366f1", fontSize: "13px", fontWeight: "600", marginBottom: "14px" }}>① 3行まとめ</p>
            {result.summary.split("\n").map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <span style={{ color: "#10b981", fontSize: "14px", fontWeight: "700", flexShrink: 0 }}>0{i + 1}</span>
                <span style={{ color: "#1A1A1A", fontSize: "14px", lineHeight: "1.7" }}>{line}</span>
              </div>
            ))}
          </div>
          <div style={sectionStyle}>
            <p style={{ color: "#6366f1", fontSize: "13px", fontWeight: "600", marginBottom: "14px" }}>② 記事</p>
            <div style={{ color: "#333", fontSize: "14px", lineHeight: "2.0", whiteSpace: "pre-wrap" }}>{result.article}</div>
          </div>
          <div style={{ ...sectionStyle, padding: 0, overflow: "hidden" }}>
            <button onClick={() => setShowFull(!showFull)} style={{ width: "100%", background: "transparent", border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", cursor: "pointer", color: "#6366f1", fontSize: "13px", fontWeight: "600" }}>
              <span>③ 全文（日本語翻訳）</span><span style={{ color: "#aaa" }}>{showFull ? "▲" : "▼"}</span>
            </button>
            {showFull && <div style={{ padding: "0 20px 20px", maxHeight: "500px", overflowY: "auto" }}><p style={{ color: "#555", fontSize: "13px", lineHeight: "2.0", whiteSpace: "pre-wrap" }}>{result.fullText}</p></div>}
          </div>
          {rawTranscript && (
            <div style={{ ...sectionStyle, padding: 0, overflow: "hidden" }}>
              <button onClick={() => setShowRaw(!showRaw)} style={{ width: "100%", background: "transparent", border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", cursor: "pointer", color: "#aaa", fontSize: "13px", fontWeight: "600" }}>
                <span>④ 生テキスト</span><span>{showRaw ? "▲" : "▼"}</span>
              </button>
              {showRaw && <div style={{ padding: "0 20px 20px", maxHeight: "400px", overflowY: "auto" }}><p style={{ color: "#999", fontSize: "12px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{rawTranscript}</p></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─── */
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
  const [noteArticles, setNoteArticles] = useState([]);
  const [noteFilter, setNoteFilter] = useState("全て");

  useEffect(() => {
    const t = setInterval(() => { setTick(n => n + 1); setNextUpdate(prev => prev <= 1 ? 300 : prev - 1); }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (tick === 0 || nextUpdate === 300) fetchAll(); }, [tick === 0, nextUpdate === 300]);

  async function fetchAll() {
    setStatus("データ取得中...");
    const [ytResults, hnResults, noteResults] = await Promise.all([fetchYouTube(), fetchHackerNews(), fetchNoteArticles()]);
    setNoteArticles(noteResults);
    const allResults = [...ytResults, ...hnResults];
    if (allResults.length > 0) {
      setUsingFallback(false); setStatus("AI翻訳中...");
      const translated = await batchTranslate(allResults);
      updateNews(translated.sort((a, b) => b.score - a.score));
    } else {
      setUsingFallback(true); setStatus("AI生成中...");
      updateNews(await generateNews());
    }
    setLastUpdate(new Date()); setStatus("LIVE");
  }

  function updateNews(items) { setNews(items); const ids = items.slice(0, 3).map(i => i.id); setNewIds(ids); setTimeout(() => setNewIds([]), 3000); }

  async function fetchYouTube() {
    const results = [];
    for (const yt of YT_QUERIES) {
      try {
        const res = await fetch(`/api/youtube?q=${encodeURIComponent(yt.query)}`);
        const data = await res.json();
        (data?.items || []).forEach((v) => {
          results.push({ id: v.id, title: v.title, source: v.channelTitle, author: v.channelTitle, score: v.viewCount, num_comments: v.commentCount, created_utc: Math.floor(new Date(v.publishedAt).getTime() / 1000), permalink: `https://www.youtube.com/watch?v=${v.id}`, category: yt.category, titleJa: null, sourceType: "yt" });
        });
      } catch { /* skip */ }
    }
    const seen = new Set();
    return results.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; }).sort((a, b) => b.score - a.score).slice(0, 12);
  }

  async function fetchHackerNews() {
    try {
      const res = await fetch("/api/hackernews?limit=8");
      const data = await res.json();
      return (data?.items || []).map((item) => ({ id: `hn-${item.id}`, title: item.title, source: "Hacker News", author: item.author, score: item.score, num_comments: item.commentCount, created_utc: item.time, permalink: item.url, category: classifyCategory(item.title), titleJa: null, sourceType: "hn" }));
    } catch { return []; }
  }

  async function fetchNoteArticles() {
    try {
      const res = await fetch("/api/note-articles?limit=16");
      const data = await res.json();
      return (data?.items || []).map((item) => ({ id: `note-${item.id}`, title: item.title, url: item.url, author: item.author, publishedAt: item.publishedAt, category: item.category || "AI", sourceType: "note" }));
    } catch { return []; }
  }

  async function batchTranslate(posts) {
    try {
      const lines = posts.map((p, i) => `${i}: ${p.title}`).join("\n");
      const text = await callClaude([{ role: "user", content: `以下のタイトルを日本語に翻訳してください。JSONの配列のみ返してください（説明不要）:\n["翻訳0","翻訳1",...]\n各40文字以内。\n\n${lines}` }], 600);
      let translations;
      try { translations = JSON.parse(text); } catch (parseErr) { console.error("batchTranslate JSON parse failed:", text); throw parseErr; }
      return posts.map((p, i) => ({ ...p, titleJa: translations[i] || null }));
    } catch (e) { console.error("batchTranslate error:", e); return posts; }
  }

  async function generateNews() {
    try {
      const text = await callClaude([{ role: "user", content: `AI業界のリアルなYouTube動画風ニュースを8件生成してください。JSONのみ:\n[{"id":"g1","title":"英語タイトル","titleJa":"日本語（40字以内）","source":"チャンネル名","author":"チャンネル名","score":数値,"num_comments":数値,"created_utc":${Math.floor(Date.now()/1000)-3600},"permalink":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","category":"研究|ツール|ビジネス|モデル","sourceType":"yt"}]` }]);
      try {
        const parsed = JSON.parse(text);
        // AI生成フラグを付与（generateNews由来も明示）
        return parsed.map(n => ({ ...n, isGenerated: true }));
      } catch (parseErr) { console.error("generateNews JSON parse failed:", text); throw parseErr; }
    } catch (e) {
      console.error("generateNews error:", e.message);
      // FALLBACK_NEWS にも AI生成フラグを付与
      return FALLBACK_NEWS.map(n => ({ ...n, isGenerated: true }));
    }
  }

  const filtered = filter === "全て" ? news : news.filter(n => n.category === filter);
  const heroItem = filtered[0] || null;
  const gridItems = filtered.slice(1);
  const ytItems = filtered.filter(n => n.sourceType === "yt");
  const nonYtItems = filtered.filter(n => n.sourceType !== "yt");
  const isLoading = status !== "LIVE" && news.length === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e6", color: "#1A1A1A", fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ─── Header ─── */}
      <header style={{
        padding: "14px 32px", borderBottom: "1px solid #ddd5c8",
        background: "#f5f0e6",
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img src="/logo_transparent.jpg" alt="ととのえる屋" style={{ height: "56px" }} />
            <span style={{ color: "#a09080", fontSize: "12px", lineHeight: "1.6", maxWidth: "260px" }}>AI関連のニュース・YouTube・noteをリアルタイムで収集し、日本語でお届けします</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: status === "LIVE" ? "#ecfdf5" : "#fef3c7",
            padding: "4px 12px", borderRadius: "20px",
          }}>
            <span style={{ color: status === "LIVE" ? "#10b981" : "#f59e0b", animation: "pulse 1.5s infinite", fontSize: "10px" }}>●</span>
            <span style={{ color: status === "LIVE" ? "#10b981" : "#f59e0b", fontSize: "12px", fontWeight: "700" }}>{status}</span>
          </div>
          {usingFallback && <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "500" }}>AI生成モード</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Nav tabs */}
          <nav style={{ display: "flex", gap: "4px" }}>
            {[{ key: "news", label: "📡 ニュース" }, { key: "transcript", label: "🎬 字幕" }].map(t => (
              <button key={t.key} onClick={() => setMainTab(t.key)} style={{
                background: mainTab === t.key ? "#1A1A1A" : "transparent",
                color: mainTab === t.key ? "#fff" : "#888",
                border: "none", borderRadius: "8px", padding: "6px 16px", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", transition: "all 0.2s",
              }}>{t.label}</button>
            ))}
          </nav>
          <div style={{ color: "#bbb", fontSize: "12px" }}>
            {lastUpdate && <span>更新 {lastUpdate.toLocaleTimeString("ja-JP")}</span>}
            <span style={{ marginLeft: "8px" }}>次回 {nextUpdate}s</span>
          </div>
        </div>
      </header>

      {mainTab === "news" && (
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 60px" }}>

          {/* ─── Ticker ─── */}
          {news.length > 0 && (
            <div style={{ overflow: "hidden", marginBottom: "32px", padding: "8px 0", borderBottom: "1px solid #e8e0d4" }}>
              <div style={{ display: "flex", whiteSpace: "nowrap", animation: "ticker 60s linear infinite", color: "#10b981", fontSize: "13px", fontWeight: "500" }}>
                {[0,1].map(k => <span key={k} style={{ paddingRight: "60px" }}>🔴 LIVE　　{news.map(n => n.titleJa || n.title).join("　//　")}</span>)}
              </div>
            </div>
          )}

          {/* ─── Filter ─── */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                background: filter === cat ? "#1A1A1A" : "#FFFFFF",
                color: filter === cat ? "#fff" : "#888",
                border: filter === cat ? "none" : "1px solid #e8e0d4",
                borderRadius: "8px", padding: "6px 18px", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", transition: "all 0.2s",
              }}>{cat}</button>
            ))}
            <span style={{ color: "#bbb", fontSize: "13px", marginLeft: "auto" }}>{filtered.length}件</span>
          </div>

          {/* ─── Loading skeleton ─── */}
          {isLoading && (
            <div>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}><Shimmer lines={4} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" }}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ background: "#fff", borderRadius: "12px", padding: "20px" }}><Shimmer lines={4} /></div>)}
              </div>
            </div>
          )}

          {/* ─── Hero ─── */}
          {heroItem && <div style={{ marginBottom: "32px" }}><HeroCard item={heroItem} onClick={setSelected} /></div>}

          {/* ─── Section: カテゴリ別ニュース ─── */}
          {nonYtItems.length > 0 && (
            <div style={{ marginBottom: "48px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A1A", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#6366f1", color: "#fff", width: "4px", height: "20px", borderRadius: "2px", display: "inline-block" }} />
                Hacker News
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" }}>
                {nonYtItems.slice(0, 6).map((item, i) => <NewsCard key={item.id} item={item} onClick={setSelected} index={i} />)}
              </div>
            </div>
          )}

          {/* ─── Section: YouTube動画 ─── */}
          {ytItems.length > 0 && (
            <div style={{ marginBottom: "48px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A1A", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#ef4444", color: "#fff", width: "4px", height: "20px", borderRadius: "2px", display: "inline-block" }} />
                YouTube動画
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" }}>
                {ytItems.map((item, i) => <NewsCard key={item.id} item={item} onClick={setSelected} index={i} />)}
              </div>
            </div>
          )}

          {/* ─── LP Banner ─── */}
          <a href="https://totonoeru-lp.vercel.app/" target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #1A1A1A, #333)", borderRadius: "14px",
            padding: "24px 28px", marginBottom: "48px", textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)", transition: "transform 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <div>
              <p style={{ color: "#10b981", fontSize: "12px", fontWeight: "700", marginBottom: "6px", letterSpacing: "0.05em" }}>ととのえる屋</p>
              <p style={{ color: "#fff", fontSize: "16px", fontWeight: "700", lineHeight: "1.6" }}>AIについて学びたい方はコチラへ</p>
              <p style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}>暮らしとAIをつなぐ、やさしいガイド</p>
            </div>
            <span style={{ color: "#10b981", fontSize: "24px", fontWeight: "700", flexShrink: 0, marginLeft: "20px" }}>→</span>
          </a>

          {/* ─── Section: note記事 ─── */}
          {noteArticles.length > 0 && (() => {
            const noteCategories = ["全て", ...new Set(noteArticles.map(a => a.category))];
            const filteredNotes = noteFilter === "全て" ? noteArticles : noteArticles.filter(a => a.category === noteFilter);
            return (
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A1A", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#10b981", color: "#fff", width: "4px", height: "20px", borderRadius: "2px", display: "inline-block" }} />
                note 記事
              </h2>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                {noteCategories.map(cat => (
                  <button key={cat} onClick={() => setNoteFilter(cat)} style={{
                    background: noteFilter === cat ? "#1A1A1A" : "#FFFFFF",
                    color: noteFilter === cat ? "#fff" : "#888",
                    border: noteFilter === cat ? "none" : "1px solid #e8e0d4",
                    borderRadius: "8px", padding: "5px 16px", fontSize: "12px", fontWeight: "600",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>{cat}</button>
                ))}
                <span style={{ color: "#bbb", fontSize: "12px", marginLeft: "auto", alignSelf: "center" }}>{filteredNotes.length}件</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredNotes.map((article, i) => (
                  <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#FFFFFF", borderRadius: "10px", padding: "14px 20px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)", transition: "all 0.2s",
                    animation: `fadeIn 0.4s ease ${i * 0.04}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.03)"; e.currentTarget.style.transform = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                      <span style={{
                        background: article.category === "暮らし" ? "#fef3c7" : "#e0f7f1",
                        color: article.category === "暮らし" ? "#b45309" : "#10b981",
                        fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px", flexShrink: 0,
                      }}>{article.category === "暮らし" ? "🏠 暮らし" : "🤖 AI"}</span>
                      <span style={{ color: "#1A1A1A", fontSize: "14px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, marginLeft: "16px" }}>
                      {article.author && <span style={{ color: "#ccc", fontSize: "11px" }}>{article.author}</span>}
                      <span style={{ color: "#bbb", fontSize: "12px" }}>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("ja-JP") : ""}</span>
                      <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            );
          })()}
        </main>
      )}

      {mainTab === "transcript" && <YouTubeTranscriptPanel />}

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: "1px solid #e8e0d4", padding: "16px 32px", display: "flex", justifyContent: "space-between", color: "#ccc", fontSize: "12px" }}>
        <span>ととのえる屋通信 v1.0</span>
        <span>AI × 暮らし × ライフハック</span>
      </footer>

      <DetailPanel item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
