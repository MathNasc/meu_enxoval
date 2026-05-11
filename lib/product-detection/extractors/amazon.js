// lib/product-detection/extractors/amazon.js
// Extrator dedicado para Amazon Brasil.

import axios from "axios";
import * as cheerio from "cheerio";
import { cleanName } from "../utils/cleanName.js";
import { parsePrice } from "../utils/parsePrice.js";

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Extrator para Amazon Brasil.
 * Usa scraping via User-Agent de desktop (JSON-LD + seletores CSS).
 */
export async function amazonExtractor(url) {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 12_000,
      maxRedirects: 5,
      responseType: "text",
      headers: {
        "User-Agent": DESKTOP_UA,
        "Accept-Language": "pt-BR,pt;q=0.9",
        Accept: "text/html",
        "Cache-Control": "no-cache",
      },
    });

    const $ = cheerio.load(html);

    // Tenta JSON-LD primeiro
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
              brand: product.brand?.name ?? null,
              store: "Amazon",
            };
          }
        }
      } catch {}
    }

    // CSS Selectors específicos da Amazon
    const rawName =
      $("#productTitle, #title").first().text().trim() ||
      $('meta[property="og:title"]').attr("content");

    const name = cleanName(rawName);
    if (!name) return null;

    // Tenta extrair preço de múltiplos seletores
    const priceSelectors = [
      ".priceToPay .a-offscreen",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      ".apexPriceToPay .a-offscreen",
      "#price_inside_buybox",
    ];

    let price = null;
    for (const sel of priceSelectors) {
      const text = $(sel).first().text();
      const parsed = parsePrice(text);
      if (parsed) {
        price = parsed;
        break;
      }
    }

    // Fallback: extrair preço dos campos whole + fraction
    if (!price) {
      const whole = $(".a-price-whole").first().text().replace(/\D/g, "");
      const frac = $(".a-price-fraction").first().text().replace(/\D/g, "");
      if (whole) {
        price = parsePrice(`${whole}.${frac || "00"}`);
      }
    }

    const imageUrl =
      $("#imgTagWrapperId img, #landingImage").first().attr("src") ||
      $('meta[property="og:image"]').attr("content") ||
      null;

    return {
      name,
      price: price ? String(price) : null,
      imageUrl,
      brand: null,
      store: "Amazon",
    };
  } catch {
    return null;
  }
}
