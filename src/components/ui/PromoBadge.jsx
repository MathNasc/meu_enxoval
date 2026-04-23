"use client";
import { BadgePercent } from "lucide-react";
import { fmt } from "../../lib/utils/format";

const PromoBadge = ({ promoInfo }) => {
  if (!promoInfo) return null;
  return (
    <div className="promo-strip">
      <BadgePercent size={13} />
      <span>🔥 Em promoção — {promoInfo.discount}% OFF</span>
      <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: 4, textDecoration: "line-through", fontSize: 11 }}>
        era {fmt(promoInfo.originalPrice)}
      </span>
    </div>
  );
};

export default PromoBadge;
