/**
 * POST /api/extract-product
 * Body: { url: string }
 *
 * Estratégias por loja:
 *   - Mercado Livre → ML OAuth token (se configurado) OU fallback via URL redirect
 *   - Shopee        → API mobile + OG
 *   - Demais        → JSON-LD + Open Graph + seletores CSS
 *
 * Para habilitar ML com token (recomendado):
 *   1. Crie app gratuito em developers.mercadolivre.com.br
 *   2. Adicione ML_APP_ID e ML_APP_SECRET no .env.local / Vercel
 */

import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const UA_BROWSER = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];
const rUA = () => UA_BROWSER[Math.floor(Math.random() * UA_BROWSER.length)];

const webHeaders = (url) => ({
  "User-Agent":                rUA(),
  "Accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language":           "pt-BR,pt;q=0.9",
  "Accept-Encoding":           "gzip, deflate, br",
  "Cache-Control":             "no-cache",
  "Referer":                   (() => { try { return new URL(url).origin; } catch { return ""; } })(),
  "upgrade-insecure-requests": "1",
});

// ── Limpeza de nomes de produtos ─────────────────────────
const SITE_SUFFIXES = /\s*[-|–|·|—|,]\s*(Mercado Livre|Shopee|Amazon|Magalu|Magazine Luiza|Casas Bahia|Americanas|Submarino|Leroy Merlin|Tok &? ?Stok)[^$]*/gi;

const EXACT_SITES = new Set([
  "mercado livre","mercado libre","mercadolivre","mercadolibre",
  "shopee","amazon","magalu","magazine luiza","casas bahia",
  "americanas","submarino","leroy merlin","tok stok","tok&stok","extra",
]);

function cleanName(raw) {
  if (!raw) return null;
  let name = raw
    .replace(/^mercado\s*li(vre|bre)\s*[:\-–]\s*/i, "")
    .replace(/^shopee\s*[:\-–]\s*/i, "")
    .replace(SITE_SUFFIXES, "")
    .replace(/\s*\|\s*.*$/, "")
    .trim()
    .slice(0, 200);
  if (!name || name.length < 4) return null;
  if (EXACT_SITES.has(name.toLowerCase())) return null;
  return name;
}

function isSiteName(name) {
  if (!name) return true;
  const n = name.toLowerCase().trim();
  return EXACT_SITES.has(n) || n.length < 4;
}

// ════════════════════════════════════════════════════════
// MERCADO LIVRE — 3 estratégias em cascata
// ════════════════════════════════════════════════════════
async function extractMercadoLivre(url) {

  // ── Estratégia 1: ML API com token OAuth (mais confiável) ──
  const ML_ID = process.env.ML_APP_ID;
  const ML_SECRET = process.env.ML_APP_SECRET;
  let accessToken = null;

  if (ML_ID && ML_SECRET) {
    try {
      const tokenRes = await axios.post(
        "https://api.mercadolibre.com/oauth/token",
        new URLSearchParams({
          grant_type:    "client_credentials",
          client_id:     ML_ID,
          client_secret: ML_SECRET,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 8_000 }
      );
      accessToken = tokenRes.data.access_token;
    } catch (e) {
      console.warn("[ML] Token fetch failed:", e.message);
    }
  }

  if (accessToken) {
    const itemId = extractMLId(url);
    if (itemId) {
      try {
        const { data } = await axios.get(
          `https://api.mercadolibre.com/items/${itemId}`,
          {
            timeout: 10_000,
            headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
          }
        );
        if (data?.title) {
          const name = cleanName(data.title);
          if (name) {
            return {
              name,
              price:    data.price ? String(data.price) : null,
              imageUrl: (data.pictures?.[0]?.url || data.thumbnail || "").replace(/-I\.(jpg|webp)/i, "-O.$1") || null,
              brand:    data.attributes?.find(a => a.id === "BRAND")?.value_name || null,
              suggestedRoom: guessRoom(name),
            };
          }
        }
      } catch (e) {
        console.warn("[ML] API with token failed:", e.message);
      }
    }
  }

  // ── Estratégia 2: ML Search API (pública, sem token) ──
  // Extrai o nome do produto da URL e busca na API de busca
  const productNameFromUrl = extractNameFromMLUrl(url);
  if (productNameFromUrl) {
    try {
      const { data } = await axios.get(
        `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(productNameFromUrl)}&limit=1`,
        {
          timeout: 8_000,
          headers: { Accept: "application/json", "User-Agent": rUA() },
        }
      );
      const first = data?.results?.[0];
      if (first?.title) {
        const name = cleanName(first.title);
        if (name) {
          return {
            name,
            price:         first.price ? String(first.price) : null,
            imageUrl:      first.thumbnail?.replace("-I.jpg", "-O.jpg") || null,
            brand:         null,
            suggestedRoom: guessRoom(name),
          };
        }
      }
    } catch (e) {
      console.warn("[ML] Search API failed:", e.message);
    }
  }

  // ── Estratégia 3: Scraping direto com headers de bot ──
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        ...webHeaders(url),
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Accept": "text/html",
      },
      timeout: 10_000,
      httpsAgent,
      maxRedirects: 5,
      responseType: "text",
      decompress: true,
    });

    const $ = cheerio.load(html);

    // ML injeta JSON-LD com dados do produto
    let ldName = null, ldPrice = null, ldImage = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      if (ldName) return;
      try {
        const json = JSON.parse($(el).html() || "{}");
        const items = Array.isArray(json) ? json : [json];
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
        return {
          name,
          price:    ldPrice ? String(ldPrice) : null,
          imageUrl: ldImage || null,
          brand:    null,
          suggestedRoom: guessRoom(name),
        };
      }
    }

    // Fallback: og:title (ML às vezes expõe para bots de redes sociais)
    const ogTitle = $('meta[property="og:title"]').attr("content") ||
                    $('meta[name="twitter:title"]').attr("content");
    if (ogTitle) {
      const name = cleanName(ogTitle);
      if (name && !isSiteName(name)) {
        return {
          name,
          price:    $('meta[property="product:price:amount"]').attr("content") || null,
          imageUrl: $('meta[property="og:image"]').attr("content") || null,
          brand:    null,
          suggestedRoom: guessRoom(name),
        };
      }
    }
  } catch (e) {
    console.warn("[ML] Scraping failed:", e.message);
  }

  return null;
}

// Extrai MLB ID da URL
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

// Extrai nome legível da URL do ML
// Ex: /sofa-retratil-3-lugares/p/MLB... → "sofa retratil 3 lugares"
function extractNameFromMLUrl(url) {
  try {
    const path = new URL(url).pathname;
    // Remove IDs e segmentos técnicos
    const clean = path
      .replace(/\/p\/MLB\d+/gi, "")
      .replace(/\/MLB[-\d]+/gi, "")
      .replace(/^\/+|\/+$/g, "")
      .split("/")[0]  // pega só o primeiro segmento
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return clean.length > 3 ? clean : null;
  } catch {
    return null;
  }
}

// ════════════════════════════════════════════════════════
// SHOPEE — 3 estratégias em cascata
// A API mobile bloqueia requests sem cookie de sessão.
// ════════════════════════════════════════════════════════
async function extractShopee(url) {

  // ── Estratégia 1: API mobile com múltiplos headers ──
  const match = url.match(/i\.(\d+)\.(\d+)/);
  if (match) {
    const shopId = match[1];
    const itemId = match[2];

    // Tenta variantes de endpoint da API Shopee
    const endpoints = [
      `https://shopee.com.br/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`,
      `https://shopee.com.br/api/v2/item/get?itemid=${itemId}&shopid=${shopId}`,
    ];

    const mobileHeaders = [
      // iOS Safari
      {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept": "application/json",
        "Referer": "https://shopee.com.br/",
        "x-api-source": "rn",
        "af-ac-enc-dat": "null",
        "shopee_http_dns_mode": "0",
      },
      // Android Chrome
      {
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://shopee.com.br/",
        "x-api-source": "pc",
      },
    ];

    for (const endpoint of endpoints) {
      for (const headers of mobileHeaders) {
        try {
          const { data } = await axios.get(endpoint, {
            timeout: 8_000,
            headers,
            httpsAgent,
          });
          const item = data?.data?.item;
          if (!item?.name) continue;
          const name = cleanName(item.name);
          if (!name) continue;
          const price   = item.price     ? item.price / 100000 :
                          item.price_min ? item.price_min / 100000 : null;
          const imageId = item.image || item.images?.[0];
          console.log("[Shopee] API OK:", name);
          return {
            name,
            price:    price ? String(price.toFixed(2)) : null,
            imageUrl: imageId ? `https://cf.shopee.com.br/file/${imageId}` : null,
            brand:    item.brand || null,
            suggestedRoom: guessRoom(name),
          };
        } catch (e) {
          // Try next combination
        }
      }
    }
  }

  // ── Estratégia 2: Scraping da página com OG + JSON-LD ──
  // Shopee expõe dados em meta tags para bots de redes sociais
  try {
    const { data: html } = await axios.get(url, {
      timeout: 12_000,
      headers: {
        // Googlebot tem acesso especial às meta tags da Shopee
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
        "Cache-Control": "no-cache",
      },
      httpsAgent,
      maxRedirects: 5,
      responseType: "text",
      decompress: true,
    });

    const $ = cheerio.load(html);

    // JSON-LD (mais confiável)
    let ldResult = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      if (ldResult) return;
      try {
        const items = [].concat(JSON.parse($(el).html() || "{}"));
        for (const item of items) {
          if (item["@type"] === "Product" && item.name) {
            const name = cleanName(item.name);
            if (name) {
              ldResult = {
                name,
                price: item.offers?.price ? String(item.offers.price) : null,
                imageUrl: Array.isArray(item.image) ? item.image[0] : item.image || null,
                brand: item.brand?.name || null,
                suggestedRoom: guessRoom(name),
              };
            }
            break;
          }
        }
      } catch {}
    });
    if (ldResult) { console.log("[Shopee] JSON-LD OK:", ldResult.name); return ldResult; }

    // Open Graph
    const ogTitle = $('meta[property="og:title"]').attr("content") ||
                    $('meta[name="twitter:title"]').attr("content");
    const ogImage = $('meta[property="og:image"]').attr("content");
    const ogPrice = $('meta[property="product:price:amount"]').attr("content");

    if (ogTitle) {
      const name = cleanName(ogTitle);
      if (name && !isSiteName(name)) {
        console.log("[Shopee] OG OK:", name);
        return {
          name,
          price: ogPrice || null,
          imageUrl: ogImage || null,
          brand: null,
          suggestedRoom: guessRoom(name),
        };
      }
    }
  } catch (e) {
    console.warn("[Shopee] Scraping failed:", e.message);
  }

  // ── Estratégia 3: Extrai nome da URL ─────────────────
  // Ex: /Calçados-Femininos-i.123456.789 → "Calçados Femininos"
  try {
    const path = new URL(url).pathname;
    const nameFromUrl = path
      .split("/")
      .find(seg => seg && !seg.match(/^i\./))
      ?.replace(/-/g, " ")
      ?.trim();
    if (nameFromUrl && nameFromUrl.length > 3) {
      const name = cleanName(nameFromUrl);
      if (name && !isSiteName(name)) {
        console.log("[Shopee] URL fallback:", name);
        return { name, price: null, imageUrl: null, brand: null, suggestedRoom: guessRoom(name) };
      }
    }
  } catch {}

  console.warn("[Shopee] All strategies failed for:", url);
  return null;
}

// ════════════════════════════════════════════════════════
// GENÉRICO — JSON-LD + Open Graph + seletores CSS
// ════════════════════════════════════════════════════════
const STORE_SELECTORS = {
  "amazon.com.br":        { name: ["#productTitle","#title"],       price: [".priceToPay .a-offscreen","#priceblock_ourprice",".a-price-whole"], image: ["#imgTagWrapperId img","#landingImage"] },
  "magazineluiza.com.br": { name: ['[data-testid="heading-product-title"]',"h1"], price: ['[data-testid="price-value"]'],          image: ["picture img"] },
  "casasbahia.com.br":    { name: ["h1.product-title","h1"],         price: [".product-price__value",'[class*="price"]'],          image: ["#js-product-image"] },
  "americanas.com.br":    { name: ["h1.product-title","h1"],         price: [".priceSales",'[class*="price"]'],                    image: [".zoom img"] },
  "leroymerlin.com.br":   { name: ["h1.product-name","h1"],          price: [".price-box__price",'[class*="price"]'],              image: ["picture img"] },
};

function parsePrice(str) {
  if (!str) return null;
  const c = String(str).replace(/R\$\s*/g,"").replace(/\s/g,"").replace(/\.(?=\d{3})/g,"").replace(",",".");
  const n = parseFloat(c);
  return (!isNaN(n) && n > 0 && n < 500_000) ? n : null;
}

async function extractGeneric(url) {
  let html;
  try {
    const { data } = await axios.get(url, {
      headers: webHeaders(url), timeout: 12_000,
      maxRedirects: 5, httpsAgent, responseType: "text", decompress: true,
    });
    html = data;
  } catch (err) {
    console.warn("[Generic] fetch:", err.message);
    return null;
  }

  const $   = cheerio.load(html);
  const host = (() => { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } })();
  const cfg  = Object.entries(STORE_SELECTORS).find(([d]) => host.includes(d))?.[1];

  // JSON-LD
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

  // Open Graph
  const ogTitle    = $('meta[property="og:title"]').attr("content") || $('meta[name="twitter:title"]').attr("content");
  const ogImage    = $('meta[property="og:image"]').attr("content");
  const ogPrice    = $('meta[property="product:price:amount"]').attr("content") || $('meta[property="og:price:amount"]').attr("content");

  // CSS selectors
  const cssName = cfg?.name ? (() => {
    for (const s of cfg.name) {
      const t = $(s).first().text().replace(/\s+/g," ").trim();
      if (t?.length > 3) return t;
    }
    return null;
  })() : null;

  const cssPrice = cfg?.price ? (() => {
    for (const s of cfg.price) {
      const text = $(s).first().text().replace(/\s+/g," ").trim();
      const m = text.match(/R\$\s*([\d.,]+)/);
      if (m) return parsePrice(m[0]);
    }
    return null;
  })() : null;

  const cssImage = cfg?.image ? (() => {
    for (const s of cfg.image) {
      const v = $(s).first().attr("src");
      if (v && !v.startsWith("data:")) return v;
    }
    return null;
  })() : null;

  // Priority: JSON-LD > CSS > Open Graph
  const rawName = ldName || cssName || ogTitle || $("h1").first().text().trim() || null;
  const name    = cleanName(rawName);

  return {
    name:     name && !isSiteName(name) ? name : null,
    price:    ldPrice ? String(ldPrice) : (cssPrice ? String(cssPrice) : (parsePrice(ogPrice) ? String(parsePrice(ogPrice)) : null)),
    imageUrl: ldImage || cssImage || ogImage || null,
    brand:    ldBrand || null,
  };
}

// ════════════════════════════════════════════════════════
// Detecta cômodo pelo nome
// ════════════════════════════════════════════════════════
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
// HANDLER
// ════════════════════════════════════════════════════════
// ── SSRF protection ───────────────────────────────────────
// Blocks internal IPs, localhost and non-http(s) protocols
// to prevent Server-Side Request Forgery attacks
function isAllowedUrl(raw) {
  try {
    const { protocol, hostname } = new URL(raw);
    if (!["http:", "https:"].includes(protocol)) return false;
    const h = hostname.toLowerCase();
    // Block loopback, private ranges and cloud metadata endpoints
    if (/^(localhost|127\.\d+\.\d+\.\d+)$/.test(h)) return false;
    if (/^10\./.test(h)) return false;
    if (/^192\.168\./.test(h)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
    if (h === "169.254.169.254") return false;        // AWS metadata
    if (h === "metadata.google.internal") return false; // GCP metadata
    return true;
  } catch {
    return false;
  }
}


export async function POST(req) {
  let url;
  try { ({ url } = await req.json()); }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }); }

  if (!url || !isAllowedUrl(url))
    return Response.json({ error: "URL inválida ou não permitida" }, { status: 400 });

  const host = (() => { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } })();
  let result = null;

  if (host.includes("mercadolivre.com.br") || host.includes("mercadolibre.com")) {
    result = await extractMercadoLivre(url);
  } else if (host.includes("shopee.com.br")) {
    result = await extractShopee(url);
  }

  if (!result?.name || isSiteName(result.name)) {
    const generic = await extractGeneric(url);
    if (generic?.name && !isSiteName(generic.name)) {
      result = { ...result, ...generic };
    }
  }

  const name = result?.name && !isSiteName(result.name)
    ? cleanName(result.name)
    : null;

  if (!name) {
    return Response.json({
      name: null, price: null, imageUrl: null, brand: null,
      suggestedRoom: "outro",
      warning: "Não consegui extrair os dados automaticamente. Preencha o nome manualmente.",
    });
  }

  console.log("[extract-product] OK:", { name, price: result.price, host });

  return Response.json({
    name,
    price:         result.price    ?? null,
    imageUrl:      result.imageUrl ?? null,
    brand:         result.brand    ?? null,
    suggestedRoom: guessRoom(name),
  });
}
