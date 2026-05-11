// lib/product-detection/index.js
// Orquestrador principal: resolve URL → seleciona extrator → retorna produto.
// Para adicionar uma nova plataforma: crie o extrator e registre em EXTRACTORS.

import { resolveUrl } from "./resolveUrl.js";
import { shopeeExtractor } from "./extractors/shopee.js";
import { mercadoLivreExtractor } from "./extractors/mercadolivre.js";
import { amazonExtractor } from "./extractors/amazon.js";
import { genericExtractor } from "./extractors/generic.js";
import { guessRoom } from "./utils/guessRoom.js";
import { isAllowedUrl } from "./utils/security.js";

/**
 * Registro de extractors por plataforma.
 * A ordem importa: primeiro match vence.
 * O extrator genérico deve ser sempre o último (match: () => true).
 */
const EXTRACTORS = [
  {
    name: "Shopee",
    match: (h) => h.includes("shopee.com.br"),
    fn: shopeeExtractor,
  },
  {
    name: "Mercado Livre",
    match: (h) =>
      h.includes("mercadolivre.com.br") || h.includes("mercadolibre.com"),
    fn: mercadoLivreExtractor,
  },
  {
    name: "Amazon",
    match: (h) => h.includes("amazon.com.br"),
    fn: amazonExtractor,
  },
  {
    name: "Genérico",
    match: () => true,
    fn: genericExtractor,
  },
];

const GLOBAL_TIMEOUT_MS = 25_000;

/**
 * Detecta um produto a partir de qualquer URL de e-commerce.
 *
 * Fluxo:
 *   1. Valida URL (segurança SSRF)
 *   2. Resolve encurtadores/redirects (br.shp.ee, amzn.to, etc.)
 *   3. Valida URL resolvida
 *   4. Seleciona extrator por plataforma
 *   5. Executa extração com timeout global
 *   6. Anota cômodo sugerido com base no nome
 *
 * @param {string} rawUrl - URL original (pode ser encurtada)
 * @returns {Promise<object|null>}
 */
export async function detectProduct(rawUrl) {
  // 1. Validação inicial
  if (!rawUrl || !isAllowedUrl(rawUrl)) {
    throw new Error("URL inválida ou não permitida");
  }

  // 2. Resolver encurtadores e redirects
  let resolvedUrl;
  try {
    resolvedUrl = await resolveUrl(rawUrl);
  } catch (err) {
    console.error("[detectProduct] Erro ao resolver URL:", err.message);
    resolvedUrl = rawUrl; // fallback: tenta com a URL original
  }

  // 3. Valida URL resolvida (segurança: o redirect não pode levar a IP interno)
  if (!isAllowedUrl(resolvedUrl)) {
    throw new Error("URL resolvida não é permitida (possível SSRF)");
  }

  const hostname = (() => {
    try {
      return new URL(resolvedUrl).hostname.toLowerCase();
    } catch {
      throw new Error(`URL resolvida inválida: ${resolvedUrl}`);
    }
  })();

  // 4. Seleciona extrator
  const extractor = EXTRACTORS.find(({ match }) => match(hostname));
  console.log(
    `[detectProduct] ${extractor.name} | original=${rawUrl} | resolved=${resolvedUrl}`
  );

  // 5. Executa com timeout global
  let result;
  try {
    result = await Promise.race([
      extractor.fn(resolvedUrl),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout global de detecção")),
          GLOBAL_TIMEOUT_MS
        )
      ),
    ]);
  } catch (err) {
    console.error(`[detectProduct] Erro no extrator ${extractor.name}:`, err.message);
    result = null;
  }

  if (!result?.name) return null;

  // 6. Enriquece resultado
  return {
    name: result.name,
    price: result.price ?? null,
    imageUrl: result.imageUrl ?? null,
    brand: result.brand ?? null,
    store: result.store ?? null,
    suggestedRoom: guessRoom(result.name),
    resolvedUrl,                           // útil para debug e analytics
    originalUrl: rawUrl !== resolvedUrl ? rawUrl : undefined,
  };
}
