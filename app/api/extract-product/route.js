/**
 * POST /api/extract-product
 * Body: { url: string }
 *
 * Shopee e ML bloqueiam requests server-side (403).
 * Estratégias aplicadas por loja:
 *
 * SHOPEE (3 tentativas):
 *   1. API mobile com múltiplos headers
 *   2. Scraping HTML com User-Agent de bot social
 *   3. Extração do nome diretamente da URL (sempre funciona)
 *
 * MERCADO LIVRE (3 tentativas):
 *   1. API oficial com OAuth token (se ML_APP_ID/ML_APP_SECRET configurados)
 *   2. ML Search API com nome extraído da URL
 *   3. Scraping HTML com facebookexternalhit UA
 *
 * OUTROS: JSON-LD → Open Graph → CSS selectors → title
 */

import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ── SSRF Protection ──────────────────────────────────────
function isAllowedUrl(raw) {
  try {
    const { protocol, hostname } = new URL(raw);
    if (!["http:", "https:"].includes(protocol)) return false;
    const h = hostname.toLowerCase();
    if (/^(localhost|127\.\d+\.\d+\.\d+)$/.test(h)) return false;
    if (/^10\./.test(h)) return false;
    if (/^192\.168\./.test(h)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
    if (h === "169.254.169.254") return false;
    if (h === "metadata.google.internal") return false;
    return true;
  } catch { return false; }
}

// ── Name cleaning ────────────────────────────────────────
const SITE_SUFFIXES = /\s*[-|–|·|—]\s*(Mercado Livre|Shopee|Amazon|Magalu|Magazine Luiza|Casas Bahia|Americanas)[^$]*/gi;
const EXACT_SITES   = new Set([
  "mercado livre","mercado libre","mercadolivre","mercadolibre",
  "shopee","amazon","magalu","magazine luiza","casas bahia","americanas",
]);

function cleanName(raw) {
  if (!raw?.trim()) return null;
  let name = raw
    .replace(/^(mercado\s*li(vre|bre)|shopee|amazon|magalu)\s*[:\-–]\s*/i, "")
    .replace(SITE_SUFFIXES, "")
    .replace(/\s*\|\s*.*$/, "")
    .trim()
    .slice(0, 200);
  if (!name || name.length < 4) return null;
  if (EXACT_SITES.has(name.toLowerCase())) return null;
  return name;
}

// ── Room detection ───────────────────────────────────────
function guessRoom(name) {
  if (!name) return "outro";
  const n = name.toLowerCase();
  if (/sofá|sofa|rack|tapete|poltrona|luminária|quadro|aparador|tv\b|televisão/.test(n)) return "sala";
  if (/cama|colchão|cabeceira|guarda.roupa|cômoda|criado.mudo|travesseiro|edredom|lençol/.test(n)) return "quarto";
  if (/panela|frigideira|geladeira|fogão|micro.ondas|liquidificador|batedeira|airfryer|prato|talher|copo|tábua/.test(n)) return "cozinha";
  if (/toalha|saboneteira|box|vaso sanitário|cuba|torneira|espelho.*banh/.test(n)) return "banheiro";
  return "outro";
}

// ════════════════════════════════════════════════════════
// SHOPEE
// ════════════════════════════════════════════════════════

function shopeeNameFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const seg  = path.trim().replace(/^\/+|\/+$/g, "").split("/")[0];
    // Format: Produto-Nome-i.SHOPID.ITEMID → remove the -i.X.Y suffix
    const withoutId = seg.replace(/-i\.\d+\.\d+$/i, "");
    if (!withoutId || withoutId.length < 3) return null;
    const name = decodeURIComponent(withoutId).replace(/-/g, " ").trim();
    return name.length > 3 ? name : null;
  } catch { return null; }
}

async function extractShopee(url) {
  const match = url.match(/i\.(\d+)\.(\d+)/);

  // ── Estratégia 1: API mobile (várias combinações) ─────
  if (match) {
    const [, shopId, itemId] = match;
    const endpoints = [
      `https://shopee.com.br/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`,
      `https://shopee.com.br/api/v2/item/get?itemid=${itemId}&shopid=${shopId}`,
    ];
    const headerSets = [
      {
        "User-Agent":   "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept":       "application/json",
        "Referer":      "https://shopee.com.br/",
        "x-api-source": "rn",
      },
      {
        "User-Agent":   "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        "Accept":       "application/json",
        "Referer":      "https://shopee.com.br/",
        "x-api-source": "pc",
      },
    ];
    for (const ep of endpoints) {
      for (const headers of headerSets) {
        try {
          const { data } = await axios.get(ep, { timeout: 6_000, headers, httpsAgent });
          const item = data?.data?.item;
          if (!item?.name) continue;
          const name = cleanName(item.name);
          if (!name) continue;
          const price   = item.price ? item.price / 100000 : item.price_min ? item.price_min / 100000 : null;
          const imageId = item.image || item.images?.[0];
          console.log("[Shopee] API OK:", name.slice(0, 40));
          return {
            name, price: price ? String(price.toFixed(2)) : null,
            imageUrl: imageId ? `https://cf.shopee.com.br/file/${imageId}` : null,
            brand: item.brand || null, suggestedRoom: guessRoom(name),
          };
        } catch { /* try next */ }
      }
    }
  }

  // ── Estratégia 2: Scraping com bot UA ─────────────────
  try {
    const { data: html } = await axios.get(url, {
      timeout: 10_000, httpsAgent, maxRedirects: 5,
      responseType: "text", decompress: true,
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Accept": "text/html", "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });
    const $ = cheerio.load(html);

    // JSON-LD
    let ldName = null, ldPrice = null, ldImage = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      if (ldName) return;
      try {
        const items = [].concat(JSON.parse($(el).html() || "{}"));
        for (const item of items) {
          if (item["@type"] === "Product" && item.name) {
            ldName  = item.name;
            ldPrice = item.offers?.price || item.offers?.[0]?.price || null;
            ldImage = Array.isArray(item.image) ? item.image[0] : item.image || null;
            break;
          }
        }
      } catch {}
    });
    if (ldName) {
      const name = cleanName(ldName);
      if (name) {
        console.log("[Shopee] JSON-LD OK:", name.slice(0, 40));
        return { name, price: ldPrice ? String(ldPrice) : null, imageUrl: ldImage || null, brand: null, suggestedRoom: guessRoom(name) };
      }
    }

    // OG tags
    const ogTitle = $('meta[property="og:title"]').attr("content") || $('meta[name="twitter:title"]').attr("content");
    if (ogTitle) {
      const name = cleanName(ogTitle);
      if (name) {
        console.log("[Shopee] OG OK:", name.slice(0, 40));
        return {
          name, price: $('meta[property="product:price:amount"]').attr("content") || null,
          imageUrl: $('meta[property="og:image"]').attr("content") || null,
          brand: null, suggestedRoom: guessRoom(name),
        };
      }
    }
  } catch (e) { console.warn("[Shopee] Scraping failed:", e.message); }

  // ── Estratégia 3: Nome da URL (sempre funciona para URLs padrão) ──
  const nameFromUrl = shopeeNameFromUrl(url);
  if (nameFromUrl) {
    const name = cleanName(nameFromUrl);
    if (name) {
      console.log("[Shopee] URL fallback:", name.slice(0, 40));
      return { name, price: null, imageUrl: null, brand: null, suggestedRoom: guessRoom(name) };
    }
  }

  return null;
}

// ════════════════════════════════════════════════════════
// MERCADO LIVRE
// ════════════════════════════════════════════════════════

function extractMLId(url) {
  const patterns = [
    /\/p\/(MLB\d{7,12})/i,
    /[/_-](MLB\d{7,12})(?:[_\-/?#]|$)/i,
    /MLB[-_]?(\d{7,12})/i,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) {
      const raw = m[1];
      return raw.toUpperCase().startsWith("MLB") ? raw.toUpperCase() : `MLB${raw}`;
    }
  }
  return null;
}

function mlNameFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const clean = path
      .replace(/\/p\/MLB\d+/gi, "")
      .replace(/\/MLB[-\d]+/gi, "")
      .replace(/^\/+|\/+$/g, "")
      .split("/")[0]
      .replace(/-/g, " ")
      .trim();
    return clean.length > 3 ? clean : null;
  } catch { return null; }
}

async function extractMercadoLivre(url) {
  // ── Estratégia 1: OAuth token ─────────────────────────
  const ML_ID = process.env.ML_APP_ID;
  const ML_SECRET = process.env.ML_APP_SECRET;
  let token = null;

  if (ML_ID && ML_SECRET) {
    try {
      const { data } = await axios.post(
        "https://api.mercadolibre.com/oauth/token",
        new URLSearchParams({ grant_type: "client_credentials", client_id: ML_ID, client_secret: ML_SECRET }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 8_000 }
      );
      token = data.access_token;
    } catch (e) { console.warn("[ML] Token failed:", e.message); }
  }

  if (token) {
    const itemId = extractMLId(url);
    if (itemId) {
      try {
        const { data } = await axios.get(
          `https://api.mercadolibre.com/items/${itemId}`,
          { timeout: 10_000, headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
        );
        if (data?.title) {
          const name = cleanName(data.title);
          if (name) return {
            name, price: data.price ? String(data.price) : null,
            imageUrl: (data.pictures?.[0]?.url || data.thumbnail || "").replace(/-I\.(jpg|webp)/i, "-O.$1") || null,
            brand: data.attributes?.find(a => a.id === "BRAND")?.value_name || null,
            suggestedRoom: guessRoom(name),
          };
        }
      } catch (e) { console.warn("[ML] API token:", e.message); }
    }
  }

  // ── Estratégia 2: Search API com nome da URL ──────────
  const nameFromUrl = mlNameFromUrl(url);
  if (nameFromUrl) {
    try {
      const { data } = await axios.get(
        `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(nameFromUrl)}&limit=1`,
        { timeout: 8_000, headers: { Accept: "application/json" } }
      );
      const first = data?.results?.[0];
      if (first?.title) {
        const name = cleanName(first.title);
        if (name) return {
          name, price: first.price ? String(first.price) : null,
          imageUrl: first.thumbnail?.replace("-I.jpg", "-O.jpg") || null,
          brand: null, suggestedRoom: guessRoom(name),
        };
      }
    } catch (e) { console.warn("[ML] Search API:", e.message); }
  }

  // ── Estratégia 3: Scraping com Facebook UA ────────────
  try {
    const { data: html } = await axios.get(url, {
      timeout: 10_000, httpsAgent, maxRedirects: 5, responseType: "text", decompress: true,
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Accept": "text/html", "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });
    const $ = cheerio.load(html);
    let ldName = null, ldPrice = null, ldImage = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      if (ldName) return;
      try {
        const items = [].concat(JSON.parse($(el).html() || "{}"));
        for (const item of items) {
          if (item["@type"] === "Product" && item.name) {
            ldName  = item.name;
            ldPrice = item.offers?.price || null;
            ldImage = Array.isArray(item.image) ? item.image[0] : item.image || null;
            break;
          }
        }
      } catch {}
    });
    if (ldName) {
      const name = cleanName(ldName);
      if (name) return { name, price: ldPrice ? String(ldPrice) : null, imageUrl: ldImage || null, brand: null, suggestedRoom: guessRoom(name) };
    }
    const ogTitle = $('meta[property="og:title"]').attr("content");
    if (ogTitle) {
      const name = cleanName(ogTitle);
      if (name && !EXACT_SITES.has(name.toLowerCase())) return {
        name, price: null, imageUrl: $('meta[property="og:image"]').attr("content") || null,
        brand: null, suggestedRoom: guessRoom(name),
      };
    }
  } catch (e) { console.warn("[ML] Scraping:", e.message); }

  // ── Estratégia 4: Nome da URL ─────────────────────────
  if (nameFromUrl) {
    const name = cleanName(nameFromUrl);
    if (name) return { name, price: null, imageUrl: null, brand: null, suggestedRoom: guessRoom(name) };
  }

  return null;
}

// ════════════════════════════════════════════════════════
// GENÉRICO
// ════════════════════════════════════════════════════════
const STORE_SELECTORS = {
  "amazon.com.br":        { name: ["#productTitle","#title"],       price: [".priceToPay .a-offscreen","#priceblock_ourprice"], image: ["#imgTagWrapperId img","#landingImage"] },
  "magazineluiza.com.br": { name: ['[data-testid="heading-product-title"]',"h1"], price: ['[data-testid="price-value"]'],      image: ["picture img"] },
  "casasbahia.com.br":    { name: ["h1.product-title","h1"],         price: [".product-price__value"],                        image: ["#js-product-image"] },
  "americanas.com.br":    { name: ["h1.product-title","h1"],         price: [".priceSales"],                                  image: [".zoom img"] },
  "leroymerlin.com.br":   { name: ["h1.product-name","h1"],          price: [".price-box__price"],                            image: ["picture img"] },
};

function parsePrice(str) {
  if (!str) return null;
  const n = parseFloat(String(str).replace(/R\$\s*/g,"").replace(/\s/g,"").replace(/\.(?=\d{3})/g,"").replace(",","."));
  return (!isNaN(n) && n > 0 && n < 500_000) ? n : null;
}

async function extractGeneric(url) {
  let html;
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html", "Accept-Language": "pt-BR,pt;q=0.9",
        "Cache-Control": "no-cache",
      },
      timeout: 12_000, maxRedirects: 5, httpsAgent, responseType: "text", decompress: true,
    });
    html = data;
  } catch { return null; }

  const $ = cheerio.load(html);
  const host = (() => { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } })();
  const cfg  = Object.entries(STORE_SELECTORS).find(([d]) => host.includes(d))?.[1];

  let ldName = null, ldPrice = null, ldImage = null, ldBrand = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (ldName) return;
    try {
      const items = [].concat(JSON.parse($(el).html() || "{}"));
      for (const item of items) {
        if (item["@type"] === "Product" && item.name) {
          ldName  = item.name;
          ldPrice = item.offers?.price || item.offers?.[0]?.price || null;
          ldImage = Array.isArray(item.image) ? item.image[0] : item.image || null;
          ldBrand = item.brand?.name || null;
          break;
        }
      }
    } catch {}
  });

  const ogTitle = $('meta[property="og:title"]').attr("content") || $('meta[name="twitter:title"]').attr("content");
  const cssName = cfg?.name ? (() => { for (const s of cfg.name) { const t = $(s).first().text().trim(); if (t?.length > 3) return t; } return null; })() : null;

  const rawName = ldName || cssName || ogTitle || $("h1").first().text().trim() || null;
  const name    = cleanName(rawName);

  const price =
    (ldPrice ? parsePrice(ldPrice) : null) ||
    (() => { if (!cfg?.price) return null; for (const s of cfg.price) { const t = $(s).first().text(); const m = t.match(/R\$\s*([\d.,]+)/); if (m) { const p = parsePrice(m[0]); if (p) return p; } } return null; })() ||
    parsePrice($('meta[property="product:price:amount"]').attr("content"));

  return {
    name:     name && !EXACT_SITES.has(name.toLowerCase()) ? name : null,
    price:    price ? String(price) : null,
    imageUrl: ldImage || $('meta[property="og:image"]').attr("content") || null,
    brand:    ldBrand || null,
  };
}

// ════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════
export async function POST(req) {
  let url;
  try { ({ url } = await req.json()); }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }); }

  if (!url || !isAllowedUrl(url))
    return Response.json({ error: "URL inválida ou não permitida" }, { status: 400 });

  const host = (() => { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } })();
  let result = null;

  if (host.includes("shopee.com.br")) {
    result = await extractShopee(url);
  } else if (host.includes("mercadolivre.com.br") || host.includes("mercadolibre.com")) {
    result = await extractMercadoLivre(url);
  } else {
    result = await extractGeneric(url);
  }

  const name = result?.name ? cleanName(result.name) : null;

  if (!name) {
    return Response.json({
      name: null, price: null, imageUrl: null, brand: null,
      suggestedRoom: "outro",
      warning: "Não consegui extrair os dados automaticamente. Preencha o nome manualmente.",
    });
  }

  console.log("[extract-product] OK:", { name: name.slice(0, 40), host });

  return Response.json({
    name,
    price:         result.price    ?? null,
    imageUrl:      result.imageUrl ?? null,
    brand:         result.brand    ?? null,
    suggestedRoom: guessRoom(name),
  });
}
