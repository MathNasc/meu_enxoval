/**
 * POST /api/extract-product
 * Body: { url: string }
 *
 * Extrai nome, preço e imagem de e-commerces brasileiros.
 * Estratégias por loja:
 *   - Mercado Livre → API oficial + fallback scraping OG
 *   - Shopee        → API mobile + fallback OG
 *   - Demais        → JSON-LD + Open Graph + seletores CSS
 */

import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const UA_LIST = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];
const rUA = () => UA_LIST[Math.floor(Math.random() * UA_LIST.length)];

const webHeaders = (url) => ({
  "User-Agent":                rUA(),
  "Accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language":           "pt-BR,pt;q=0.9,en;q=0.7",
  "Accept-Encoding":           "gzip, deflate, br",
  "Cache-Control":             "no-cache",
  "Pragma":                    "no-cache",
  "Referer":                   (() => { try { return new URL(url).origin; } catch { return ""; } })(),
  "sec-fetch-dest":            "document",
  "sec-fetch-mode":            "navigate",
  "sec-fetch-site":            "none",
  "upgrade-insecure-requests": "1",
});

// ── Site name patterns — strings que NÃO são nomes de produto ──
const SITE_NAME_PATTERNS = [
  /^mercado\s*li(vre|bre)(\s*-|\s*:|$)/i,
  /^shopee(\s*-|\s*:|$)/i,
  /^amazon(\s*-|\s*:|$)/i,
  /^magalu(\s*-|\s*:|$)/i,
  /^magazine\s*luiza(\s*-|\s*:|$)/i,
  /^casas\s*bahia(\s*-|\s*:|$)/i,
  /^americanas(\s*-|\s*:|$)/i,
  /^submarino(\s*-|\s*:|$)/i,
  /^leroy\s*merlin(\s*-|\s*:|$)/i,
  /^tok\s*[&e]?\s*stok(\s*-|\s*:|$)/i,
  /^extra\s*-/i,
];

const EXACT_SITE_NAMES = new Set([
  "mercado livre", "mercado libre", "mercadolivre", "mercadolibre",
  "shopee", "amazon", "magalu", "magazine luiza", "casas bahia",
  "americanas", "submarino", "leroy merlin", "tok stok", "tok&stok",
  "extra",
]);

function isSiteName(name) {
  if (!name) return true;
  const n = name.toLowerCase().trim();
  if (EXACT_SITE_NAMES.has(n)) return true;
  if (SITE_NAME_PATTERNS.some(p => p.test(n))) return true;
  // Very short strings are likely not product names
  if (n.length < 4) return true;
  return false;
}

// Strip common site name prefixes from og:title
// e.g. "Mercado Livre: Sofá 3 lugares" → "Sofá 3 lugares"
function stripSitePrefix(name) {
  if (!name) return name;
  return name
    .replace(/^mercado\s*li(vre|bre)\s*[:\-–]\s*/i, "")
    .replace(/^shopee\s*[:\-–]\s*/i, "")
    .replace(/^amazon\s*[:\-–]\s*/i, "")
    .replace(/^magalu\s*[:\-–]\s*/i, "")
    .replace(/^magazine\s*luiza\s*[:\-–]\s*/i, "")
    .replace(/^casas\s*bahia\s*[:\-–]\s*/i, "")
    .replace(/^americanas\s*[:\-–]\s*/i, "")
    .replace(/\s*\|\s*Mercado Livre.*$/i, "")
    .replace(/\s*\|\s*Shopee.*$/i, "")
    .replace(/\s*[-|–]\s*(Amazon|Shopee|Magalu|Americanas|Casas Bahia|Mercado Livre).*$/i, "")
    .trim();
}

// ═══════════════════════════════════════════════════════
// MERCADO LIVRE — API oficial (gratuita, sem key)
// ═══════════════════════════════════════════════════════
async function extractMercadoLivre(url) {
  // Extrai MLB ID em múltiplos formatos de URL
  const idPatterns = [
    /\/p\/(MLB\d{7,12})/i,              // /p/MLB123456789 (catalog page)
    /[\/_-](MLB\d{7,12})(?:[_\-/?#]|$)/i, // -MLB123 ou _MLB123
    /MLB[-_]?(\d{7,12})/i,             // MLB-123 ou MLB123 (captures digits only)
  ];

  let itemId = null;
  for (const pat of idPatterns) {
    const m = url.match(pat);
    if (m) {
      const raw = m[1];
      itemId = raw.toUpperCase().startsWith("MLB") ? raw.toUpperCase() : `MLB${raw}`;
      break;
    }
  }

  if (!itemId) {
    console.warn("[ML] No item ID in URL:", url.slice(-80));
    return null;
  }

  console.log("[ML] Fetching item:", itemId);

  try {
    const { data } = await axios.get(
      `https://api.mercadolibre.com/items/${itemId}`,
      {
        timeout: 10_000,
        headers: { "Accept": "application/json", "User-Agent": rUA() },
      }
    );

    if (!data?.title) {
      console.warn("[ML] API returned no title for", itemId);
      return null;
    }

    const cleanTitle = stripSitePrefix(data.title);
    if (!cleanTitle || isSiteName(cleanTitle)) {
      console.warn("[ML] Title is site name:", data.title);
      return null;
    }

    const imageUrl =
      (data.pictures?.[0]?.url || data.thumbnail || "")
        .replace(/-I\.(jpg|webp)/i, "-O.$1") || null;

    return {
      name:          cleanTitle,
      price:         data.price ? String(data.price) : null,
      imageUrl:      imageUrl || null,
      brand:         data.attributes?.find(a => a.id === "BRAND")?.value_name || null,
      suggestedRoom: guessRoom(cleanTitle),
    };
  } catch (err) {
    const status = err.response?.status;
    console.warn("[ML] API error:", status, err.message);
    // 404 = item não existe com esse ID, tenta fallback
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// SHOPEE — API mobile informal
// ═══════════════════════════════════════════════════════
async function extractShopee(url) {
  const match = url.match(/i\.(\d+)\.(\d+)/);
  if (!match) return null;

  try {
    const { data } = await axios.get(
      `https://shopee.com.br/api/v4/item/get?itemid=${match[2]}&shopid=${match[1]}`,
      {
        timeout: 10_000,
        headers: {
          "User-Agent":   "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
          "Accept":       "application/json",
          "Referer":      "https://shopee.com.br/",
          "x-api-source": "pc",
        },
        httpsAgent,
      }
    );

    const item = data?.data?.item;
    if (!item?.name) return null;

    const cleanName = stripSitePrefix(item.name);
    if (!cleanName || isSiteName(cleanName)) return null;

    const price    = item.price     ? item.price / 100000 :
                     item.price_min ? item.price_min / 100000 : null;
    const imageId  = item.image || item.images?.[0];

    return {
      name:          cleanName,
      price:         price ? String(price.toFixed(2)) : null,
      imageUrl:      imageId ? `https://cf.shopee.com.br/file/${imageId}` : null,
      brand:         item.brand || null,
      suggestedRoom: guessRoom(cleanName),
    };
  } catch (err) {
    console.warn("[Shopee] API error:", err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// GENÉRICO — JSON-LD + Open Graph + seletores CSS
// ═══════════════════════════════════════════════════════
const STORE_SELECTORS = {
  "amazon.com.br": {
    name:  ["#productTitle", "#title"],
    price: [".priceToPay .a-offscreen", "#priceblock_ourprice", ".a-price-whole"],
    image: ["#imgTagWrapperId img", "#landingImage"],
  },
  "magazineluiza.com.br": {
    name:  ['[data-testid="heading-product-title"]', "h1"],
    price: ['[data-testid="price-value"]'],
    image: ["picture img"],
  },
  "casasbahia.com.br": {
    name:  ["h1.product-title", "h1"],
    price: [".product-price__value", '[class*="price"]'],
    image: ["#js-product-image"],
  },
  "americanas.com.br": {
    name:  ["h1.product-title", "h1"],
    price: [".priceSales", '[class*="price"]'],
    image: [".zoom img"],
  },
  "leroymerlin.com.br": {
    name:  ["h1.product-name", "h1"],
    price: [".price-box__price", '[class*="price"]'],
    image: ["picture img"],
  },
};

function getStoreConfig(url) {
  try {
    const h = new URL(url).hostname.toLowerCase();
    for (const [domain, cfg] of Object.entries(STORE_SELECTORS)) {
      if (h.includes(domain)) return cfg;
    }
  } catch {}
  return null;
}

function getOG($) {
  const m = (...props) => {
    for (const p of props) {
      const v = $(`meta[property="${p}"]`).attr("content") ||
                $(`meta[name="${p}"]`).attr("content");
      if (v?.trim()) return v.trim();
    }
    return null;
  };
  return {
    name:     m("og:title", "twitter:title"),
    imageUrl: m("og:image", "twitter:image", "og:image:secure_url"),
    price:    m("product:price:amount", "og:price:amount", "price"),
  };
}

function getJsonLd($) {
  let result = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (result) return;
    try {
      const json  = JSON.parse($(el).html() || "{}");
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item["@type"] === "Product" && item.name) {
          const offer = item.offers?.price || item.offers?.[0]?.price;
          result = {
            name:     item.name,
            price:    offer ? String(offer) : null,
            imageUrl: Array.isArray(item.image) ? item.image[0] : item.image || null,
            brand:    item.brand?.name || null,
          };
          return;
        }
      }
    } catch {}
  });
  return result;
}

function getText($, sels) {
  for (const s of (sels || [])) {
    if (s.startsWith("meta")) {
      const v = $(s).attr("content");
      if (v?.trim()) return v.trim();
    }
    const t = $(s).first().text().replace(/\s+/g, " ").trim();
    if (t?.length > 3) return t;
  }
  return null;
}

function getAttr($, sels, attr) {
  for (const s of (sels || [])) {
    const v = $(s).first().attr(attr);
    if (v?.trim() && !v.startsWith("data:")) return v.trim();
  }
  return null;
}

function parsePrice(str) {
  if (!str) return null;
  const c = String(str)
    .replace(/R\$\s*/g, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3})/g, "")
    .replace(",", ".");
  const n = parseFloat(c);
  return (!isNaN(n) && n > 0 && n < 500_000) ? n : null;
}

function extractPrice($, storeSels) {
  const all = [...(storeSels || []),
    '[class*="price"]', '[class*="preco"]', '[class*="valor"]', ".price"];
  for (const s of all) {
    if (s.startsWith("meta")) {
      const n = parsePrice($(s).attr("content"));
      if (n) return n;
      continue;
    }
    const text = $(s).first().text().replace(/\s+/g, " ").trim();
    if (!text) continue;
    const m = text.match(/R\$\s*([\d.,]+)/) ||
              text.match(/([\d]{1,3}(?:\.[\d]{3})*,\d{2})/) ||
              text.match(/([\d]+,\d{2})/);
    if (m) {
      const n = parsePrice(m[0] || m[1]);
      if (n) return n;
    }
  }
  return null;
}

async function extractGeneric(url) {
  let html;
  try {
    const { data } = await axios.get(url, {
      headers:      webHeaders(url),
      timeout:      12_000,
      maxRedirects: 5,
      httpsAgent,
      responseType: "text",
      decompress:   true,
    });
    html = data;
  } catch (err) {
    console.warn("[Generic] fetch error:", err.message);
    return null;
  }

  const $   = cheerio.load(html);
  const cfg = getStoreConfig(url);
  const og  = getOG($);
  const ld  = getJsonLd($);

  // Strip site prefixes from og:title before using it
  const ogNameClean = stripSitePrefix(og.name || "");

  const rawName =
    (ld?.name   ? stripSitePrefix(ld.name)     : null) ||
    (cfg?.name  ? getText($, cfg.name)          : null) ||
    (ogNameClean && ogNameClean.length > 3 ? ogNameClean : null) ||
    (() => {
      const h1 = $("h1").first().text().trim();
      return h1?.length > 3 ? stripSitePrefix(h1) : null;
    })() ||
    (() => {
      const t = $("title").text().replace(/\s*[-|–|·|—].*$/, "").trim();
      return t?.length > 3 ? stripSitePrefix(t) : null;
    })() ||
    null;

  const price =
    (ld?.price   ? parsePrice(ld.price)  : null) ||
    extractPrice($, cfg?.price) ||
    parsePrice(og.price) ||
    null;

  const imageUrl =
    ld?.imageUrl ||
    (cfg?.image ? getAttr($, cfg.image, "src") : null) ||
    og.imageUrl ||
    null;

  return {
    name:     rawName,
    price:    price ? String(price) : null,
    imageUrl: imageUrl || null,
    brand:    ld?.brand || $('meta[property="og:brand"]').attr("content") || null,
  };
}

// ═══════════════════════════════════════════════════════
// Detecta cômodo pelo nome do produto
// ═══════════════════════════════════════════════════════
function guessRoom(name) {
  if (!name) return "outro";
  const n = name.toLowerCase();
  if (/sofá|sofa|rack|tapete|poltrona|luminária|quadro|aparador|tv\b|televisão/.test(n)) return "sala";
  if (/cama|colchão|cabeceira|guarda.roupa|cômoda|criado.mudo|travesseiro|edredom|lençol/.test(n)) return "quarto";
  if (/panela|frigideira|geladeira|fogão|micro.ondas|liquidificador|batedeira|airfryer|prato|talher|copo|tábua/.test(n)) return "cozinha";
  if (/toalha|saboneteira|box|vaso sanitário|cuba|torneira|espelho.*banh/.test(n)) return "banheiro";
  return "outro";
}

// ═══════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════
export async function POST(req) {
  let url;
  try { ({ url } = await req.json()); }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }); }

  if (!url?.startsWith("http"))
    return Response.json({ error: "URL inválida" }, { status: 400 });

  const host = (() => { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } })();
  let result = null;

  // 1. Estratégias específicas por loja
  if (host.includes("mercadolivre.com.br") || host.includes("mercadolibre.com")) {
    result = await extractMercadoLivre(url);
  } else if (host.includes("shopee.com.br")) {
    result = await extractShopee(url);
  }

  // 2. Fallback genérico (OG + JSON-LD + CSS)
  if (!result?.name || isSiteName(result.name)) {
    console.log("[extract-product] Trying generic fallback for:", host);
    const generic = await extractGeneric(url);
    if (generic?.name && !isSiteName(generic.name)) {
      result = { ...result, ...generic };
    }
  }

  // 3. Nada encontrado — retorna aviso para preenchimento manual
  if (!result?.name || isSiteName(result.name)) {
    console.warn("[extract-product] No product data from:", host);
    return Response.json({
      name: null, price: null, imageUrl: null, brand: null,
      suggestedRoom: "outro",
      warning: "Não consegui extrair os dados automaticamente. Preencha o nome manualmente.",
    });
  }

  // Limpeza final do nome
  const name = stripSitePrefix(result.name)
    ?.replace(/\s*\|\s*.*$/, "")
    ?.trim()
    ?.slice(0, 200) || null;

  if (!name || isSiteName(name)) {
    return Response.json({
      name: null, price: null, imageUrl: null, brand: null,
      suggestedRoom: "outro",
      warning: "Não consegui extrair o nome do produto. Preencha manualmente.",
    });
  }

  console.log("[extract-product] OK:", { name, price: result.price, image: !!result.imageUrl });

  return Response.json({
    name,
    price:         result.price    ?? null,
    imageUrl:      result.imageUrl ?? null,
    brand:         result.brand    ?? null,
    suggestedRoom: guessRoom(name),
  });
}
