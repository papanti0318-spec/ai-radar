"use client";

import { useState } from "react";
import CategoryPill from "./CategoryPill";
import SourceBadge from "./SourceBadge";
import { SOURCE_BADGE, timeLabel, formatViews } from "../lib/helpers";

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

export default HeroCard;
