"use client";
import { getStore } from "../../lib/constants/index";

const StoreBadge = ({ url }) => {
  const s = getStore(url);
  if (!s) return null;
  return (
    <span className="sbdg" style={{ background: s.bg, color: s.fg }}>
      {s.n}
    </span>
  );
};

export default StoreBadge;
