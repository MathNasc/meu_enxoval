"use client";

// Skeleton loading placeholder — exibe shimmer enquanto dados carregam
const Sk = ({ w = "100%", h = 14, r = 8 }) => (
  <span
    className="shimmer"
    style={{ width: w, height: h, borderRadius: r, display: "block" }}
  />
);

export default Sk;
