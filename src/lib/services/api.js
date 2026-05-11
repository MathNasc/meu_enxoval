// src/lib/services/api.js

async function post(endpoint, body) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Erro " + res.status);
  }
  return res.json();
}

export const AI = {
  detectProduct: function(url) {
    return post("/api/detect-product", { url });
  },

  extractProduct: function(url) {
    return post("/api/detect-product", { url });
  },

  comparePrice: function(productName) {
    return post("/api/compare-prices", { productName });
  },

  completeHome: function(rooms, items, aptSize) {
    return post("/api/complete-home", { rooms, items, aptSize });
  },
};
