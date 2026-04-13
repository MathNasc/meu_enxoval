// app/api/extract-product/route.js
//
// FIX #1: Nome retornava domínio em vez do produto
// CAUSA:  Shopee/ML são SPAs — HTML chega sem conteúdo renderizado.
//         O fallback retornava null; o frontend exibia o hostname da URL.
// SOLUÇÃO:
//   - Mercado Livre: usa API oficial gratuita (api.mercadolibre.com)
//   - Shopee:        tenta a API móvel informal + JSON-LD
//   - Outros:        Open Graph + JSON-LD + seletores CSS + title tag

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
  "Referer":                   new URL(url).origin,
  "sec-fetch-dest":            "document",
  "sec-fetch-mode":            "navigate",
  "sec-fetch-site":            "none",
  "upgrade-insecure-requests": "1",
});

// ═══════════════════════════════════════════════════════
// MERCADO LIVRE — API oficial gratuita
// URL formato: https://www.mercadolivre.com.br/xxx-MLB{id}/p/{pid}
//              ou https://produto.mercadolivre.com.br/MLB-{id}-...
// ═══════════════════════════════════════════════════════
async function extractMercadoLivre(url) {
  // Extrai o ID do item (MLB-XXXXXXX ou MLBXXXXXXX)
  const match = url.match(/MLB[-_]?(\d{7,12})/i);
  if (!match) return null;

  const itemId = `MLB${match[1]}`;
  const apiUrl = `https://api.mercadolibre.com/items/${itemId}`;

  try {
    const { data } = await axios.get(apiUrl, {
      timeout: 8_000,
      headers: { "Accept": "application/json" },
    });

    if (!data?.title) return null;

    return {
      name:     data.title,
      price:    data.price ? String(data.price) : null,
      imageUrl: data.thumbnail?.replace("I.jpg", "O.jpg") || data.thumbnail || null,
      brand:    data.attributes?.find(a => a.id === "BRAND")?.value_name || null,
      suggestedRoom: guessRoom(data.title),
    };
  } catch (err) {
    console.warn("[extract-product] ML API:", err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// SHOPEE — API informal via URL de produto
// URL formato: https://shopee.com.br/nome-i.{shopid}.{itemid}
// ═══════════════════════════════════════════════════════
async function extractShopee(url) {
  // Extrai shopid e itemid da URL
  const match = url.match(/i\.(\d+)\.(\d+)/);
  if (!match) return null;

  const shopId = match[1];
  const itemId = match[2];

  // API mobile da Shopee (sem autenticação necessária)
  const apiUrl = `https://shopee.com.br/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

  try {
    const { data } = await axios.get(apiUrl, {
      timeout: 8_000,
      headers: {
        "User-Agent":     "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept":         "application/json",
        "Referer":        "https://shopee.com.br/",
        "x-api-source":   "pc",
      },
      httpsAgent,
    });

    const item = data?.data?.item;
    if (!item) return null;

    const price = item.price ? item.price / 100000 : // Shopee usa centavos × 1000
                  item.price_min ? item.price_min / 100000 : null;

    const imageId = item.image || item.images?.[0];
    const imageUrl = imageId
      ? `https://cf.shopee.com.br/file/${imageId}`
      : null;

    return {
      name:     item.name || null,
      price:    price ? String(price.toFixed(2)) : null,
      imageUrl,
      brand:    item.brand || null,
      suggestedRoom: guessRoom(item.name),
    };
  } catch (err) {
    console.warn("[extract-product] Shopee API:", err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// EXTRAÇÃO GENÉRICA — Open Graph + JSON-LD + CSS selectors
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

// Extrai dados do JSON-LD (schema.org Product)
function getJsonLd($) {
  let result = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (result) return;
    try {
      const json = JSON.parse($(el).html() || "{}");
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item["@type"] === "Product") {
          const offer = item.offers?.price || item.offers?.[0]?.price;
          result = {
            name:     item.name     || null,
            price:    offer         ? String(offer) : null,
            imageUrl: item.image    || (Array.isArray(item.image) ? item.image[0] : null),
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
    if (t?.length > 2) return t;
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
  const all = [
    ...(storeSels || []),
    '[class*="price"]', '[class*="preco"]', '[class*="valor"]', ".price",
  ];
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
      headers: webHeaders(url),
      timeout: 12_000,
      maxRedirects: 5,
      httpsAgent,
      responseType: "text",
      decompress: true,
    });
    html = data;
  } catch (err) {
    console.warn("[extract-product] fetch:", err.message);
    return null;
  }

  const $ = cheerio.load(html);
  const cfg = getStoreConfig(url);
  const og  = getOG($);
  const ld  = getJsonLd($);

  // Nome: JSON-LD > store selectors > OG > h1 > title
  const rawName =
    ld?.name ||
    (cfg?.name ? getText($, cfg.name) : null) ||
    og.name ||
    $("h1").first().text().trim() ||
    $("title").text().replace(/\s*[-|–|·].*$/, "").trim() ||
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

  const brand =
    ld?.brand ||
    $('meta[property="og:brand"]').attr("content") ||
    $('[itemprop="brand"] [itemprop="name"]').first().text().trim() ||
    null;

  // Limpa sufixos de loja do título
  const name = rawName
    ?.replace(/\s*[-|–|·]\s*.*(Amazon|Mercado|Shopee|Magalu|Americanas|Casas Bahia|Leroy|Tok).*$/i, "")
    .trim()
    .slice(0, 200) || null;

  return { name, price: price ? String(price) : null, imageUrl, brand };
}

// ═══════════════════════════════════════════════════════
// DETECÇÃO DE CÔMODO
// ═══════════════════════════════════════════════════════
function guessRoom(name) {
  if (!name) return "outro";
  const n = name.toLowerCase();
  if (/sofá|sofa|rack|tapete|poltrona|luminária|quadro|aparador|tv\b|televisão|home theater/.test(n)) return "sala";
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

  // ── Estratégias específicas por loja ──────────────────
  if (host.includes("mercadolivre.com.br") || host.includes("mercadopago.com.br")) {
    result = await extractMercadoLivre(url);
  } else if (host.includes("shopee.com.br")) {
    result = await extractShopee(url);
  }

  // ── Fallback genérico para todas as lojas ─────────────
  if (!result?.name) {
    const generic = await extractGeneric(url);
    if (generic?.name) {
      result = { ...result, ...generic };
    }
  }

  // ── Fallback final: pelo menos retorna o hostname formatado ──
  // Antes retornava null e o frontend mostrava o domínio.
  // Agora retornamos null explícito e o frontend exibe erro claro.
  if (!result?.name) {
    console.warn("[extract-product] No data extracted from:", url);
    return Response.json({
      name:         null,
      price:        null,
      imageUrl:     null,
      brand:        null,
      suggestedRoom: "outro",
      warning:      "Não consegui extrair os dados automaticamente. Preencha manualmente.",
    });
  }

  const name = result.name?.replace(
    /\s*[-|–|·]\s*.*(Amazon|Mercado|Shopee|Magalu|Americanas|Casas Bahia).*$/i, ""
  ).trim().slice(0, 200);

  console.log("[extract-product] OK:", { name, price: result.price, image: !!result.imageUrl });

  return Response.json({
    name,
    price:         result.price    ?? null,
    imageUrl:      result.imageUrl ?? null,
    brand:         result.brand    ?? null,
    suggestedRoom: guessRoom(name),
  });
}
