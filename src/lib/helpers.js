// Shared helpers and constants for ai-radar dashboard components.

export const CATEGORY_COLORS = {
  研究: "#6366f1", ツール: "#10b981", ビジネス: "#f59e0b", モデル: "#ec4899",
};

export const SOURCE_BADGE = {
  hn: { label: "Hacker News", icon: "🟠", color: "#ff6600", bg: "#fff3e0" },
  yt: { label: "YouTube", icon: "▶", color: "#ff0000", bg: "#ffebee" },
  note: { label: "note", icon: "📝", color: "#41c9b4", bg: "#e0f7f1" },
};

export const FALLBACK_NEWS = [
  { id: "f1", title: "GPT-4o gets major update with better reasoning", titleJa: "GPT-4oが推論能力を大幅強化", source: "OpenAI Official", author: "OpenAI Official", score: 342000, num_comments: 287, created_utc: Math.floor(Date.now()/1000)-1800, permalink: "https://www.youtube.com/results?search_query=GPT-4o", category: "モデル", sourceType: "yt" },
  { id: "f2", title: "Llama 3.3 running locally is absolutely insane performance", titleJa: "Llama 3.3のローカル動作が衝撃的な性能", source: "Two Minute Papers", author: "Two Minute Papers", score: 289000, num_comments: 412, created_utc: Math.floor(Date.now()/1000)-3200, permalink: "https://www.youtube.com/results?search_query=Llama+local", category: "ツール", sourceType: "yt" },
  { id: "f3", title: "New paper: LLMs autonomously write and verify mathematical proofs", titleJa: "新論文：LLMが数学的証明を自律的に生成・検証", source: "Yannic Kilcher", author: "Yannic Kilcher", score: 210400, num_comments: 183, created_utc: Math.floor(Date.now()/1000)-5400, permalink: "https://www.youtube.com/results?search_query=LLM+math+proof", category: "研究", sourceType: "yt" },
  { id: "f4", title: "Claude 3.5 Sonnet vs GPT-4o: Full Benchmark Comparison", titleJa: "Claude 3.5 Sonnet vs GPT-4o 完全ベンチマーク比較", source: "AI Explained", author: "AI Explained", score: 187600, num_comments: 234, created_utc: Math.floor(Date.now()/1000)-7200, permalink: "https://www.youtube.com/results?search_query=Claude+GPT+benchmark", category: "モデル", sourceType: "yt" },
  { id: "f5", title: "AI replacing jobs: 40% of tasks automatable by 2026", titleJa: "AI自動化で40%の業務が代替可能との新研究", source: "Bloomberg Technology", author: "Bloomberg Technology", score: 165400, num_comments: 891, created_utc: Math.floor(Date.now()/1000)-9000, permalink: "https://www.youtube.com/results?search_query=AI+jobs+automation", category: "ビジネス", sourceType: "yt" },
  { id: "f6", title: "Build AI Agent from Scratch: Complete Tutorial 2025", titleJa: "AIエージェントをゼロから構築：完全チュートリアル2025", source: "freeCodeCamp", author: "freeCodeCamp", score: 143200, num_comments: 167, created_utc: Math.floor(Date.now()/1000)-10800, permalink: "https://www.youtube.com/results?search_query=AI+agent+tutorial", category: "ツール", sourceType: "yt" },
  { id: "f7", title: "Anthropic releases new AI safety research: Constitutional AI v2", titleJa: "AnthropicがConstitutional AI v2安全性研究を公開", source: "Lex Fridman", author: "Lex Fridman", score: 128700, num_comments: 145, created_utc: Math.floor(Date.now()/1000)-12600, permalink: "https://www.youtube.com/results?search_query=Anthropic+AI+safety", category: "研究", sourceType: "yt" },
  { id: "f8", title: "OpenAI valuation hits $300B: What it means for the industry", titleJa: "OpenAIの評価額3000億ドル突破：業界への影響を解説", source: "CNBC", author: "CNBC", score: 98700, num_comments: 543, created_utc: Math.floor(Date.now()/1000)-14400, permalink: "https://www.youtube.com/results?search_query=OpenAI+valuation", category: "ビジネス", sourceType: "yt" },
];

export function classifyCategory(title) {
  const t = title.toLowerCase();
  const toolWords = ["tool", "tutorial", "framework", "library", "sdk", "api", "app", "build", "code", "dev", "github", "open source", "rust", "python", "launch", "release", "docker", "cli", "plugin", "extension", "editor", "ide"];
  const bizWords = ["business", "startup", "funding", "valuation", "billion", "million", "revenue", "company", "market", "invest", "ipo", "acquisition", "layoff", "hire", "ceo", "enterprise", "regulation", "policy", "law", "ban", "government", "gdpr", "copyright"];
  const modelWords = ["gpt", "claude", "gemini", "llama", "mistral", "model", "llm", "chatgpt", "copilot", "benchmark", "parameter", "fine-tun", "training", "inference", "token", "transformer", "diffusion", "stable diffusion", "midjourney", "sora", "openai", "anthropic", "google ai", "meta ai"];
  if (modelWords.some(w => t.includes(w))) return "モデル";
  if (bizWords.some(w => t.includes(w))) return "ビジネス";
  if (toolWords.some(w => t.includes(w))) return "ツール";
  return "研究";
}

export function timeLabel(utc) {
  const diff = Math.floor(Date.now() / 1000) - utc;
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

export function formatViews(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}
