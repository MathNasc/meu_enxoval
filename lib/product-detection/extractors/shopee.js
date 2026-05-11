// lib/product-detection/extractors/shopee.js
// Extrator dedicado para Shopee com 3 estratégias em cascata.

import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { cleanName } from "../utils/cleanName.js";

const agent = new https.Agent({ rejectUnauthorized: false });

/** Extrai nome limpo do pathname da URL Shopee (ex: /Nome-Do-Produto-i.123.456) */
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

/** Estratégia 1: API mobile não-autenticada da Shopee */
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

        const rawPrice = item.price ?? item.price_min ?? null;
        const price = rawPrice ? rawPrice / 100_000 : null;
        const imageId = item.image ?? item.images?.[0] ?? null;

        return {
          name,
          price: price ? String(price.toFixed(2)) : null,
          imageUrl: imageId
            ? `https://cf.shopee.com.br/file/${imageId}`
            : null,
          brand: item.brand || null,
          store: "Shopee",
        };
      } catch {
        // Tenta próxima combinação
      }
    }
  }

  return null;
}

/** Estratégia 2: Scraping HTML com User-Agent de bot social */
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

    // Tenta JSON-LD (mais confiável)
    for (const el of $('script[type="application/ld+json"]').toArray()) {
      try {
        const items = [].concat(JSON.parse($(el).html() ?? "{}"));
        const product = items.find(
          (i) => i["@type"] === "Product" && i.name
        );
        if (product) {
          const name = cleanName(product.name);
          if (name) {
            return {
              name,
              price: product.offers?.price
                ? String(product.offers.price)
                : null,
              imageUrl: Array.isArray(product.image)
                ? product.image[0]
                : product.image ?? null,
              brand: null,
              store: "Shopee",
            };
          }
        }
      } catch {}
    }

    // Fallback: OG tags
    const ogTitle =
      $('meta[property="og:title"]').attr("content") ??
      $('meta[name="twitter:title"]').attr("content");
    const name = cleanName(ogTitle);
    if (name) {
      return {
        name,
        price:
          $('meta[property="product:price:amount"]').attr("content") ?? null,
        imageUrl: $('meta[property="og:image"]').attr("content") ?? null,
        brand: null,
        store: "Shopee",
      };
    }
  } catch {
    // Scraping falhou — segue para próxima estratégia
  }

  return null;
}

/**
 * Extrator principal da Shopee.
 * Tenta: API mobile → Scraping HTML → Nome da URL
 */
export async function shopeeExtractor(url) {
  const result =
    (await tryMobileApi(url)) ?? (await tryScraping(url));

  if (result) return result;

  // Estratégia 3: Nome extraído do pathname da URL (sempre funciona para URLs padrão)
  const nameFromPath = cleanName(nameFromUrl(url));
  return nameFromPath
    ? {
        name: nameFromPath,
        price: null,
        imageUrl: null,
        brand: null,
        store: "Shopee",
      }
    : null;
}
