// lib/product-detection/extractors/shopee.js
// Extrator dedicado para Shopee com suporte a produtos com variações
// (cor, tamanho, quantidade) — retorna média dos preços disponíveis.

import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { cleanName } from "../utils/cleanName.js";

const agent = new https.Agent({ rejectUnauthorized: false });

// ── Helpers ──────────────────────────────────────────────

/** Converte valor em micro-unidades Shopee (÷ 100.000) para float. */
function fromMicro(v) {
  const n = Number(v);
  return n > 0 ? n / 100_000 : null;
}

/**
 * Extrai o melhor preço disponível de um item da API Shopee.
 *
 * Shopee armazena preço em micro-unidades (100.000 = R$ 1,00).
 * Produtos com variações têm price = 0 e usam price_min / price_max.
 * Modelos individuais ficam em item.models[].price.
 *
 * Estratégia:
 *   1. Preço único (sem variações)
 *   2. Média entre price_min e price_max
 *   3. Média dos modelos individuais (cor/tamanho/qtd)
 *   4. Qualquer valor > 0 encontrado
 */
function extractPrice(item) {
  // 1. Preço único (produto sem variações)
  const single = fromMicro(item.price);
  if (single) return single;

  // 2. Faixa de preço (produtos com variações — ex: cores, tamanhos)
  const min = fromMicro(item.price_min);
  const max = fromMicro(item.price_max);

  if (min && max) {
    // Retorna média arredondada: equivale a "valor intermediário das opções"
    return parseFloat(((min + max) / 2).toFixed(2));
  }
  if (min) return min;
  if (max) return max;

  // 3. Modelos individuais (ex: 100g = R$10, 200g = R$18, 500g = R$40)
  if (Array.isArray(item.models) && item.models.length > 0) {
    const prices = item.models
      .map((m) => fromMicro(m.price))
      .filter(Boolean);

    if (prices.length > 0) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      return parseFloat(avg.toFixed(2));
    }
  }

  // 4. Tiers de variação (price_before_discount é confiável)
  const before = fromMicro(item.price_before_discount);
  if (before) return before;

  return null;
}

/** Extrai preço de JSON-LD, incluindo AggregateOffer (faixa de preço). */
function priceFromLd(offers) {
  if (!offers) return null;

  // AggregateOffer → lowPrice + highPrice (produtos com variações)
  if (offers["@type"] === "AggregateOffer") {
    const low  = parseFloat(offers.lowPrice);
    const high = parseFloat(offers.highPrice);
    if (!isNaN(low) && !isNaN(high) && low > 0 && high > 0) {
      return parseFloat(((low + high) / 2).toFixed(2));
    }
    if (!isNaN(low) && low > 0) return low;
    if (!isNaN(high) && high > 0) return high;
  }

  // Offer simples
  const p = parseFloat(offers.price);
  return !isNaN(p) && p > 0 ? p : null;
}

/** Extrai nome limpo do pathname da URL Shopee. */
function nameFromUrl(url) {
  try {
    const seg = new URL(url).pathname
      .replace(/^\/+|\/+$/g, "")
      .split("/")[0]
      .replace(/-i\.\d+\.\d+$/i, "")
      .replace(/-/g, " ")
      .trim();
    return seg.length > 3 ? seg : null;
  } catch {
    return null;
  }
}

// ── Estratégia 1: API mobile da Shopee ───────────────────

async function tryMobileApi(url) {
  const match = url.match(/i\.(\d+)\.(\d+)/);
  if (!match) return null;

  const [, shopId, itemId] = match;

  const endpoints = [
    `https://shopee.com.br/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`,
    `https://shopee.com.br/api/v2/item/get?itemid=${itemId}&shopid=${shopId}`,
  ];

  const headerSets = [
    {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      Accept: "application/json",
      Referer: "https://shopee.com.br/",
      "x-api-source": "rn",
    },
    {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      Accept: "application/json",
      Referer: "https://shopee.com.br/",
      "x-api-source": "pc",
    },
  ];

  for (const ep of endpoints) {
    for (const headers of headerSets) {
      try {
        const { data } = await axios.get(ep, {
          timeout: 6_000,
          headers,
          httpsAgent: agent,
        });

        const item = data?.data?.item;
        if (!item?.name) continue;

        const name = cleanName(item.name);
        if (!name) continue;

        const price    = extractPrice(item);
        const imageId  = item.image ?? item.images?.[0] ?? null;

        return {
          name,
          price:    price ? String(price.toFixed(2)) : null,
          imageUrl: imageId ? `https://cf.shopee.com.br/file/${imageId}` : null,
          brand:    item.brand || null,
          store:    "Shopee",
        };
      } catch {
        // Tenta próxima combinação
      }
    }
  }

  return null;
}

// ── Estratégia 2: Scraping HTML ───────────────────────────

async function tryScraping(url) {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 10_000,
      httpsAgent: agent,
      maxRedirects: 5,
      responseType: "text",
      decompress: true,
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });

    const $ = cheerio.load(html);

    // 1. JSON-LD (inclui AggregateOffer para variações)
    for (const el of $('script[type="application/ld+json"]').toArray()) {
      try {
        const items = [].concat(JSON.parse($(el).html() ?? "{}"));
        const product = items.find((i) => i["@type"] === "Product" && i.name);
        if (!product) continue;

        const name = cleanName(product.name);
        if (!name) continue;

        const price = priceFromLd(product.offers);

        return {
          name,
          price:    price ? String(price.toFixed(2)) : null,
          imageUrl: Array.isArray(product.image)
            ? product.image[0]
            : product.image ?? null,
          brand: product.brand?.name ?? null,
          store: "Shopee",
        };
      } catch {}
    }

    // 2. Meta tags de preço (product:price:amount, og:price:amount)
    const metaPrice =
      $('meta[property="product:price:amount"]').attr("content") ??
      $('meta[property="og:price:amount"]').attr("content") ??
      null;

    // 3. OG title
    const ogTitle =
      $('meta[property="og:title"]').attr("content") ??
      $('meta[name="twitter:title"]').attr("content");

    const name = cleanName(ogTitle);
    if (name) {
      return {
        name,
        price:    metaPrice ?? null,
        imageUrl: $('meta[property="og:image"]').attr("content") ?? null,
        brand:    null,
        store:    "Shopee",
      };
    }
  } catch {
    // Segue para próxima estratégia
  }

  return null;
}

// ── Extrator principal ────────────────────────────────────

/**
 * Tenta em cascata:
 *   1. API mobile (melhor precisão de preço com variações)
 *   2. Scraping HTML (JSON-LD + meta tags)
 *   3. Nome extraído da URL (fallback sem preço)
 */
export async function shopeeExtractor(url) {
  const result = (await tryMobileApi(url)) ?? (await tryScraping(url));
  if (result) return result;

  const nameFromPath = cleanName(nameFromUrl(url));
  return nameFromPath
    ? { name: nameFromPath, price: null, imageUrl: null, brand: null, store: "Shopee" }
    : null;
}
