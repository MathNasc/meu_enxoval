// lib/product-detection/utils/cleanName.js
// Remove sufixos de loja, nomes de site e textos inválidos do nome do produto.

const SITE_NAMES = new Set([
  "mercado livre", "mercado libre", "mercadolivre", "mercadolibre",
  "shopee", "amazon", "magalu", "magazine luiza",
  "casas bahia", "americanas", "leroy merlin",
  "shopee brasil", "amazon.com.br",
]);

const SUFFIX_PATTERN =
  /\s*[-|–·—]\s*(Mercado Livre|Shopee|Amazon|Magalu|Magazine Luiza|Casas Bahia|Americanas|Leroy Merlin|Submarino|Netshoes)[^$]*/gi;

const PREFIX_PATTERN =
  /^(mercado\s*li(vre|bre)|shopee|amazon|magalu)\s*[:\-–]\s*/i;

/**
 * Limpa e valida o nome de um produto extraído de uma página.
 * @param {string|null|undefined} raw
 * @returns {string|null}
 */
export function cleanName(raw) {
  if (!raw?.trim()) return null;

  const name = raw
    .replace(PREFIX_PATTERN, "")
    .replace(SUFFIX_PATTERN, "")
    .replace(/\s*\|\s*.*$/, "")           // remove tudo após "|"
    .replace(/\s{2,}/g, " ")              // colapsa espaços múltiplos
    .trim()
    .slice(0, 200);

  if (name.length < 4) return null;
  if (SITE_NAMES.has(name.toLowerCase())) return null;

  return name;
}
