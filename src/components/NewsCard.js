"use client";

import { useState } from "react";
import CategoryPill from "./CategoryPill";
import SourceBadge from "./SourceBadge";
import { timeLabel, formatViews } from "../lib/helpers";

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

export default NewsCard;
