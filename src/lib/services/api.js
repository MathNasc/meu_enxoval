// src/lib/services/api.js
// Centraliza todas as chamadas às API routes do Next.js.
// Motivo: isolar fetch() dos componentes facilita mock em testes
// e troca futura de endpoints sem buscar em todo o código.

async function post(endpoint, body) {
  const res = await fetch(endpoint, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Erro ${res.status}`);
  }
  return res.json();
}

export const AI = {
  /** Extrai nome, preço e imagem de um link de produto */
  extractProduct: (url) =>
    post("/api/extract-product", { url }),

  /** Busca comparativo de preços para um produto */
  comparePrice: (productName) =>
    post("/api/compare-prices", { productName }),

  /** Gera sugestões de itens faltantes por cômodo */
  completeHome: (rooms, items, aptSize) =>
    post("/api/complete-home", { rooms, items, aptSize }),
};
