// lib/product-detection/utils/parsePrice.js
// Converte strings de preço (BRL) em número float.

/**
 * Extrai valor numérico de strings como "R$ 1.299,90", "1299.90", etc.
 * Retorna null para valores inválidos ou fora do range esperado.
 * @param {string|number|null|undefined} str
 * @returns {number|null}
 */
export function parsePrice(str) {
  if (!str) return null;

  const cleaned = String(str)
    .replace(/R\$\s*/g, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:[,.]|$))/g, "") // remove separador de milhar (ponto antes de 3 dígitos)
    .replace(",", ".");                      // vírgula decimal → ponto

  const n = parseFloat(cleaned);

  // Valida range razoável para produtos de e-commerce
  if (isNaN(n) || n <= 0 || n >= 500_000) return null;

  return n;
}
