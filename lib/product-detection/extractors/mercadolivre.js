// lib/product-detection/extractors/mercadolivre.js
// Extrator para Mercado Livre com 4 estratégias em cascata.

import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { cleanName } from "../utils/cleanName.js";

const agent = new https.Agent({ rejectUnauthorized: false });

/** Extrai ID do produto (MLB...) da URL */
function extractId(url) {
  const patterns = [
    /\/p\/(MLB\d{7,12})/i,
    /[/_-](MLB\d{7,12})(?:[_\-/?#]|$)/i,
    /MLB[-_]?(\d{7,12})/i,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) {
      const raw = m[1];
      return raw.toUpperCase().startsWith("MLB")
        ? raw.toUpperCase()
        : `MLB${raw}`;
    }
  }
  return null;
}

/** Extrai nome limpo do pathname da URL */
function nameFromUrl(url) {
  try {
    const clean = new URL(url).pathname
      .replace(/\/p\/MLB\d+/gi, "")
      .replace(/\/MLB[-\d]+/gi, "")
      .replace(/^\/+|\/+$/g, "")
      .split("/")[0]
      .replace(/-/g, " ")
      .trim();
    return clean.length > 3 ? clean : null;
  } catch {
    return null;
  }
}

/** Estratégia 1: API pública oficial do ML (sem autenticação) */
async function tryOfficialApi(itemId) {
  if (!itemId) return null;
  try {
    const { data } = await axios.get(
      `https://api.mercadolibre.com/items/${itemId}`,
      { timeout: 8_000, headers: { Accept: "application/json" } }
    );
    if (!data?.title) return null;

    const name = cleanName(data.title);
    if (!name) return null;

    return {
      name,
      price: data.price ? String(data.price) : null,
      imageUrl:
        (data.pictures?.[0]?.url ?? data.thumbnail ?? "").replace(
          /-I\.(jpg|webp)/i,
          "-O.$1"
        ) || null,
      brand:
        data.attributes?.find((a) => a.id === "BRAND")?.value_name ?? null,
      store: "Mercado Livre",
    };
  } catch {
    return null;
  }
}

/** Estratégia 2: ML Search API com nome extraído da URL */
async function trySearchApi(pathName) {
  if (!pathName) return null;
  try {
    const { data } = await axios.get(
      `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(pathName)}&limit=1`,
      { timeout: 8_000, headers: { Accept: "application/json" } }
    );
    const first = data?.results?.[0];
    if (!first?.title) return null;

    const name = cleanName(first.title);
    if (!name) return null;

    return {
      name,
      price: first.price ? String(first.price) : null,
      imageUrl: first.thumbnail?.replace("-I.jpg", "-O.jpg") ?? null,
      brand: null,
      store: "Mercado Livre",
    };
  } catch {
    return null;
  }
}

/** Estratégia 3: Scraping HTML com bot UA */
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

    // JSON-LD
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
              store: "Mercado Livre",
            };
          }
        }
      } catch {}
    }

    // OG tags
    const ogTitle = $('meta[property="og:title"]').attr("content");
    const name = cleanName(ogTitle);
    if (name) {
      return {
        name,
        price: null,
        imageUrl: $('meta[property="og:image"]').attr("content") ?? null,
        brand: null,
        store: "Mercado Livre",
      };
    }
  } catch {
    // Scraping falhou
  }

  return null;
}

/**
 * Extrator principal do Mercado Livre.
 * Tenta: API oficial → Search API → Scraping → Nome da URL
 */
export async function mercadoLivreExtractor(url) {
  const itemId = extractId(url);
  const pathName = nameFromUrl(url);

  return (
    (await tryOfficialApi(itemId)) ??
    (await trySearchApi(pathName)) ??
    (await tryScraping(url)) ??
    (pathName
      ? {
          name: cleanName(pathName),
          price: null,
          imageUrl: null,
          brand: null,
          store: "Mercado Livre",
        }
      : null)
  );
}
