"use client";

import { CATEGORY_COLORS } from "../lib/helpers";

function CategoryPill({ category }) {
  const c = CATEGORY_COLORS[category] || "#888";
  return (
    <span style={{
      background: c + "14", color: c, fontSize: "11px", fontWeight: "600",
      padding: "2px 10px", borderRadius: "4px", border: `1px solid ${c}30`,
    }}>{category}</span>
  );
}

export default CategoryPill;
