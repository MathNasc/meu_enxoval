/**
 * POST /api/extract-product
 * Body: { url: string }
 *
 * Extrai nome, preço e imagem de e-commerces brasileiros
 * usando Open Graph + seletores específicos por loja.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

/* ─── Agente HTTPS tolerante a certs inválidos ─── */
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/* ─── Conjunto de User-Agents para rotacionar ─── */
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const makeHeaders = (url) => {
  const origin = new URL(url).origin;
  return {
    "User-Agent": randomUA(),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Referer": origin,
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "upgrade-insecure-requests": "1",
  };
};

/* ─── Seletores específicos por loja ─── */
const STORE_CONFIGS = {
  "amazon.com.br": {
    name:  ["#productTitle", "#title"],
    price: [
      ".priceToPay .a-offscreen",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      ".a-price[data-a-color='price'] .a-offscreen",
      ".a-price-whole",
    ],
    image: ["#imgTagWrapperId img", "#landingImage"],
  },
  "mercadolivre.com.br": {
    name:  [".ui-pdp-title", "h1.ui-pdp-title"],
    price: [
      ".ui-pdp-price__second-line .andes-money-amount__fraction",
      ".ui-pdp-price .andes-money-amount__fraction",
      'meta[itemprop="price"]',
    ],
    image: [".ui-pdp-gallery__figure img"],
  },
  "magazineluiza.com.br": {
    name:  ['[data-testid="heading-product-title"]', "h1"],
    price: ['[data-testid="price-value"]', "p[data-testid='price-value']"],
    image: ["picture img", "img[data-testid]"],
  },
  "shopee.com.br": {
    name:  [".pdp-product-title", "h1"],
    price: [".pdp-price", "._3n5NQx"],
    image: [".pdp-image img"],
  },
  "casasbahia.com.br": {
    name:  ["h1.product-title", "#js-product-title", "h1"],
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
    image: ["picture img", ".product-gallery__main-image img"],
  },
  "tokstok.com.br": {
    name:  ["h1.product-name", "h1"],
    price: ['[class*="price"]', '[class*="Price"]'],
    image: ["picture img"],
  },
};

function getStoreConfig(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [domain, config] of Object.entries(STORE_CONFIGS)) {
      if (host.includes(domain)) return config;
    }
  } catch {}
  return null;
}

function getOG($) {
  const m = (props) => {
    for (const p of props) {
      const v = $(`meta[property="${p}"]`).attr("content") || $(`meta[name="${p}"]`).attr("content");
      if (v?.trim()) return v.trim();
    }
    return null;
  };
  return {
    name:     m(["og:title", "twitter:title"]),
    imageUrl: m(["og:image", "twitter:image", "og:image:secure_url"]),
    priceStr: m(["product:price:amount", "og:price:amount", "price", "itemprop:price"]),
  };
}

function getText($, sels) {
  for (const s of sels) {
    if (s.startsWith("meta")) {
      const v = $(s).attr("content");
      if (v?.trim()) return v.trim();
    }
    const t = $(s).first().text().replace(/\s+/g, " ").trim();
    if (t) return t;
  }
  return null;
}

function getAttr($, sels, attr) {
  for (const s of sels) {
    const v = $(s).first().attr(attr);
    if (v?.trim() && !v.startsWith("data:")) return v.trim();
  }
  return null;
}

function parsePrice(str) {
  if (!str) return null;
  const cleaned = String(str)
    .replace(/R\$\s*/g, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3})/g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return (!isNaN(n) && n > 0 && n < 500_000) ? n : null;
}

function extractPrice($, storeSels) {
  const all = [
    ...(storeSels || []),
    '[class*="price"]', '[class*="preco"]', '[class*="valor"]', '[id*="price"]', ".price",
  ];
  for (const s of all) {
    if (s.startsWith("meta")) {
      const n = parsePrice($(s).attr("content"));
      if (n) return n;
      continue;
    }
    const text = $(s).first().text().replace(/\s+/g, " ").trim();
    if (!text) continue;
    const match = text.match(/R\$\s*([\d.,]+)/) ||
                  text.match(/([\d]{1,3}(?:\.[\d]{3})*,\d{2})/) ||
                  text.match(/([\d]+,\d{2})/);
    if (match) {
      const n = parsePrice(match[0] || match[1]);
      if (n) return n;
    }
  }
  return null;
}

function guessRoom(name) {
  if (!name) return "outro";
  const n = name.toLowerCase();
  if (/sofá|sofa|rack|tapete|poltrona|luminária|quadro|aparador|televisão|home theater/.test(n)) return "sala";
  if (/cama|colchão|cabeceira|guarda.roupa|cômoda|criado.mudo|travesseiro|edredom|lençol/.test(n)) return "quarto";
  if (/panela|frigideira|geladeira|fogão|micro.ondas|liquidificador|batedeira|airfryer|escorredor|prato|talher|copo|tábua/.test(n)) return "cozinha";
  if (/toalha|tapete.*banh|saboneteira|box|vaso sanitário|cuba|torneira|espelho.*banh/.test(n)) return "banheiro";
  return "outro";
}

export async function POST(req) {
  let url;
  try { ({ url } = await req.json()); }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }); }

  if (!url?.startsWith("http")) {
    return Response.json({ error: "URL inválida" }, { status: 400 });
  }

  let html;
  try {
    const res = await axios.get(url, {
      headers: makeHeaders(url),
      timeout: 12_000,
      maxRedirects: 5,
      httpsAgent,
      responseType: "text",
      decompress: true,
    });
    html = res.data;
  } catch (err) {
    console.error("[extract-product]", err.message);
    return Response.json({ error: "Não foi possível acessar o produto", detail: err.message }, { status: 502 });
  }

  const $ = cheerio.load(html);
  const cfg = getStoreConfig(url);
  const og  = getOG($);

  const rawName =
    (cfg?.name ? getText($, cfg.name) : null) ||
    og.name ||
    $("h1").first().text().trim() ||
    $("title").text().replace(/\s*[-|].*$/, "").trim() ||
    null;

  const price =
    extractPrice($, cfg?.price) ||
    parsePrice(og.priceStr) ||
    null;

  const imageUrl =
    (cfg?.image ? getAttr($, cfg.image, "src") : null) ||
    og.imageUrl ||
    null;

  const brand =
    $('meta[property="og:brand"]').attr("content") ||
    $('[itemprop="brand"] [itemprop="name"]').first().text().trim() ||
    null;

  const name = rawName
    ? rawName.replace(/\s*[-|–]\s*.*(Amazon|Mercado|Shopee|Magalu|Americanas|Casas Bahia|Extra).*$/i, "").trim().slice(0, 200)
    : null;

  console.log("[extract-product]", { name, price, hasImage: !!imageUrl });

  return Response.json({
    name,
    price:         price != null ? String(price) : null,
    imageUrl:      imageUrl || null,
    brand:         brand || null,
    suggestedRoom: guessRoom(name),
  });
}
