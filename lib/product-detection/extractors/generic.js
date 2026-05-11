// lib/product-detection/extractors/generic.js
// Extrator genérico para qualquer loja de e-commerce.
// Usa JSON-LD → CSS selectors por loja → OG tags → <h1>

import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { cleanName } from "../utils/cleanName.js";
import { parsePrice } from "../utils/parsePrice.js";

const agent = new https.Agent({ rejectUnauthorized: false });

/**
 * Mapa de seletores CSS por domínio.
 * Adicione novas lojas aqui sem alterar a lógica principal.
 */
const STORE_SELECTORS = {
  "magazineluiza.com.br": {
    name: ['[data-testid="heading-product-title"]', "h1"],
    price: ['[data-testid="price-value"]', ".price-box__price"],
    image: ["picture img", '[data-testid="product-image"] img'],
  },
  "casasbahia.com.br": {
    name: ["h1.product-title", "h1"],
    price: [".product-price__value", ".price-block__final-price"],
    image: ["#js-product-image", ".product-photo img"],
  },
  "americanas.com.br": {
    name: ["h1.product-title", "h1"],
    price: [".priceSales", ".price__best-price"],
    image: [".zoom img", ".product-image img"],
  },
  "leroymerlin.com.br": {
    name: ["h1.product-name", "h1"],
    price: [".price-box__price", ".product-price"],
    image: ["picture img", ".product-image img"],
  },
  "shopee.com.br": {
    name: ["._44qnta", "h1"],
    price: ["._3n5NQx", ".pqTWkA"],
    image: [".product-image img"],
  },
};

/** Encontra config de seletores para o hostname atual */
function getStoreConfig(hostname) {
  const entry = Object.entries(STORE_SELECTORS).find(([domain]) =>
    hostname.includes(domain)
  );
  return entry?.[1] ?? null;
}

/** Aplica lista de seletores CSS e retorna primeiro valor não-vazio */
function firstMatch($, selectors, attr = null) {
  for (const sel of selectors) {
    const el = $(sel).first();
    const val = attr ? el.attr(attr) : el.text().trim();
    if (val && val.length > 0) return val;
  }
  return null;
}

/**
 * Extrator genérico.
 * Funciona para qualquer site de e-commerce com OG tags ou JSON-LD.
 */
export async function genericExtractor(url) {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 12_000,
      maxRedirects: 5,
      httpsAgent: agent,
      responseType: "text",
      decompress: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9",
        Accept: "text/html",
        "Cache-Control": "no-cache",
      },
    });

    const $ = cheerio.load(html);
    const hostname = (() => {
      try {
        return new URL(url).hostname.toLowerCase();
      } catch {
        return "";
      }
    })();
    const cfg = getStoreConfig(hostname);

    // 1. JSON-LD (fonte mais confiável e estruturada)
    let ldData = null;
    for (const el of $('script[type="application/ld+json"]').toArray()) {
      try {
        const items = [].concat(JSON.parse($(el).html() ?? "{}"));
        const product = items.find(
          (i) => i["@type"] === "Product" && i.name
        );
        if (product) {
          ldData = {
            name: cleanName(product.name),
            price: product.offers?.price
              ? parsePrice(String(product.offers.price))
              : product.offers?.[0]?.price
              ? parsePrice(String(product.offers[0].price))
              : null,
            imageUrl: Array.isArray(product.image)
              ? product.image[0]
              : product.image ?? null,
            brand: product.brand?.name ?? null,
          };
          if (ldData.name) break;
        }
      } catch {}
    }

    // 2. CSS selectors por loja (quando disponível)
    const cssName = cfg ? firstMatch($, cfg.name) : null;
    const cssPrice = cfg
      ? parsePrice(firstMatch($, cfg.price) ?? "")
      : null;
    const cssImage = cfg ? firstMatch($, cfg.image, "src") : null;

    // 3. OG / meta tags (fallback universal)
    const ogTitle =
      $('meta[property="og:title"]').attr("content") ??
      $('meta[name="twitter:title"]').attr("content");
    const ogImage = $('meta[property="og:image"]').attr("content");
    const metaPrice = parsePrice(
      $('meta[property="product:price:amount"]').attr("content") ?? ""
    );

    // 4. <h1> como último recurso
    const h1Text = $("h1").first().text().trim();

    // Monta resultado priorizando fontes mais confiáveis
    const rawName =
      ldData?.name ?? cssName ?? cleanName(ogTitle) ?? cleanName(h1Text);

    if (!rawName) return null;

    const price = ldData?.price ?? cssPrice ?? metaPrice ?? null;
    const imageUrl =
      ldData?.imageUrl ?? cssImage ?? ogImage ?? null;

    // Deriva nome amigável da loja a partir do hostname
    const storeName = hostname
      .replace(/^www\./, "")
      .split(".")
      .slice(0, -1) // remove TLD
      .join(".")
      .split(".")
      .pop() // pega último segmento antes do TLD
      ?.replace(/[-_]/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) // capitaliza
      ?? "Loja";

    return {
      name: rawName,
      price: price ? String(price) : null,
      imageUrl,
      brand: ldData?.brand ?? null,
      store: storeName,
    };
  } catch {
    return null;
  }
}
