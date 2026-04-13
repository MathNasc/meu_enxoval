// app/api/extract-product/route.js
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const UA_LIST = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];
const rUA = () => UA_LIST[Math.floor(Math.random() * UA_LIST.length)];

const baseHeaders = (url) => ({
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

// ── Configurações de seletores por loja ──────────────────
const STORES = {
  "amazon.com.br": {
    name:  ["#productTitle", "#title"],
    price: [".priceToPay .a-offscreen", "#priceblock_ourprice", ".a-price-whole"],
    image: ["#imgTagWrapperId img", "#landingImage"],
  },
  "mercadolivre.com.br": {
    name:  [".ui-pdp-title", "h1.ui-pdp-title"],
    price: [".ui-pdp-price__second-line .andes-money-amount__fraction",
            'meta[itemprop="price"]'],
    image: [".ui-pdp-gallery__figure img"],
  },
  "shopee.com.br": {
    // Shopee usa React/SPA; dados ficam em JSON da página ou meta tags
    name:  ['meta[property="og:title"]', ".pdp-product-title", "h1"],
    price: ['meta[property="product:price:amount"]', ".pdp-price", "._3n5NQx"],
    image: ['meta[property="og:image"]', ".pdp-image img"],
    // Shopee precisa de cookie especial, tentamos o JSON embutido
    useJsonExtraction: true,
  },
  "magazineluiza.com.br": {
    name:  ['[data-testid="heading-product-title"]', "h1"],
    price: ['[data-testid="price-value"]'],
    image: ["picture img"],
  },
  "casasbahia.com.br": {
    name:  ["h1.product-title", "h1"],
    price: [".product-price__value", '[class*="price"]'],
    image: ["#js-product-image", ".product-image img"],
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
  "tokstok.com.br": {
    name:  ["h1"],
    price: ['[class*="price"]', '[class*="Price"]'],
    image: ["picture img", "img.product-image"],
  },
};

function getStore(url) {
  try {
    const h = new URL(url).hostname.toLowerCase();
    for (const [d, cfg] of Object.entries(STORES)) {
      if (h.includes(d)) return cfg;
    }
  } catch {}
  return null;
}

// ── Shopee: extrai dados do JSON embutido no HTML ────────
function extractShopeeJson(html) {
  try {
    // Shopee injeta dados em window.__INITIAL_STATE__ ou similar
    const patterns = [
      /"name"\s*:\s*"([^"]{5,200})"/,
      /"item_name"\s*:\s*"([^"]{5,200})"/,
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) return { name: m[1], price: null, imageUrl: null };
    }
    // Tenta extrair preço do JSON
    const priceMatch = html.match(/"price"\s*:\s*(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) / 100000 : null; // Shopee usa centavos × 1000
    return { name: null, price, imageUrl: null };
  } catch { return null; }
}

// ── Extrai texto de seletores ────────────────────────────
function getText($, sels) {
  for (const s of (sels || [])) {
    if (s.startsWith("meta")) {
      const v = $(s).attr("content");
      if (v?.trim()) return v.trim();
    }
    const t = $(s).first().text().replace(/\s+/g, " ").trim();
    if (t && t.length > 2) return t;
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

// ── Extrai Open Graph ────────────────────────────────────
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

// ── Parse de preço ───────────────────────────────────────
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

function guessRoom(name) {
  if (!name) return "outro";
  const n = name.toLowerCase();
  if (/sofá|sofa|rack|tapete|poltrona|luminária|quadro|aparador|televisão/.test(n)) return "sala";
  if (/cama|colchão|cabeceira|guarda.roupa|cômoda|criado.mudo|travesseiro|edredom|lençol/.test(n)) return "quarto";
  if (/panela|frigideira|geladeira|fogão|micro.ondas|liquidificador|batedeira|airfryer|prato|talher|copo/.test(n)) return "cozinha";
  if (/toalha|saboneteira|box|vaso sanitário|cuba|torneira/.test(n)) return "banheiro";
  return "outro";
}

// ── Handler principal ────────────────────────────────────
export async function POST(req) {
  let url;
  try { ({ url } = await req.json()); }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }); }

  if (!url?.startsWith("http"))
    return Response.json({ error: "URL inválida" }, { status: 400 });

  // ── Fetch HTML ───────────────────────────────────────────
  let html = "";
  try {
    const { data } = await axios.get(url, {
      headers:      baseHeaders(url),
      timeout:      12_000,
      maxRedirects: 5,
      httpsAgent,
      responseType: "text",
      decompress:   true,
    });
    html = data;
  } catch (err) {
    console.error("[extract-product] fetch:", err.message);
    // Fallback mínimo: retorna URL como link sem dados extraídos
    return Response.json({
      name: null, price: null, imageUrl: null,
      brand: null, suggestedRoom: "outro",
      error: `Não foi possível acessar o site: ${err.message}`,
    }, { status: 200 }); // 200 para o frontend mostrar mensagem de fallback
  }

  const $   = cheerio.load(html);
  const cfg = getStore(url);
  const og  = getOG($);

  // ── Shopee: tenta JSON embutido primeiro ─────────────────
  let shopeeData = null;
  if (cfg?.useJsonExtraction) {
    shopeeData = extractShopeeJson(html);
  }

  // ── Nome ─────────────────────────────────────────────────
  const rawName =
    shopeeData?.name ||
    (cfg?.name ? getText($, cfg.name) : null) ||
    og.name ||
    $("h1").first().text().trim() ||
    $("title").text().replace(/\s*[-|].*$/, "").trim() ||
    null;

  // ── Preço ────────────────────────────────────────────────
  const price =
    shopeeData?.price ||
    extractPrice($, cfg?.price) ||
    parsePrice(og.price) ||
    null;

  // ── Imagem ───────────────────────────────────────────────
  const imageUrl =
    shopeeData?.imageUrl ||
    (cfg?.image ? getAttr($, cfg.image, "src") : null) ||
    og.imageUrl ||
    null;

  // ── Marca ────────────────────────────────────────────────
  const brand =
    $('meta[property="og:brand"]').attr("content") ||
    $('[itemprop="brand"] [itemprop="name"]').first().text().trim() ||
    null;

  const name = rawName
    ?.replace(/\s*[-|–]\s*.*(Amazon|Mercado|Shopee|Magalu|Americanas|Casas Bahia).*$/i, "")
    .trim().slice(0, 200) || null;

  console.log("[extract-product]", { name, price: !!price, image: !!imageUrl });

  return Response.json({
    name,
    price:         price != null ? String(price) : null,
    imageUrl:      imageUrl || null,
    brand:         brand   || null,
    suggestedRoom: guessRoom(name),
  });
}
