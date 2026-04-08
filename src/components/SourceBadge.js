"use client";

import { SOURCE_BADGE } from "../lib/helpers";

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

export default SourceBadge;
