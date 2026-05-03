/**
 * POST /api/compare-prices
 * Body: { productName: string }
 *
 * Busca preços em múltiplas fontes GRATUITAS e sem API key:
 *  1. API pública do Mercado Livre (oficial, estável)
 *  2. API pública do Buscapé (JSON endpoint)
 *  3. Scraping do Zoom.com.br como fallback
 */

import axios from "axios";
import * as cheerio from "cheerio";

const TIMEOUT = 10_000;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/* ════════════════════════════════════════
   FONTE 1 — Mercado Livre API (gratuita, oficial)
   Docs: https://developers.mercadolivre.com.br/
════════════════════════════════════════ */
async function searchMercadoLivre(productName) {
  const q = encodeURIComponent(productName);
  const url = `https://api.mercadolibre.com/sites/MLB/search?q=${q}&limit=6`;

  const { data } = await axios.get(url, {
    timeout: TIMEOUT,
    headers: { "Accept": "application/json" },
  });

  return (data.results || [])
    .filter(item => item.price > 0 && item.condition !== "used")
    .slice(0, 4)
    .map(item => ({
      store:   "Mercado Livre",
      price:   item.price,
      url:     item.permalink,
      image:   item.thumbnail?.replace("I.jpg", "O.jpg") || item.thumbnail,
      inStock: item.available_quantity > 0,
      source:  "mercadolivre",
    }));
}

/* ════════════════════════════════════════
   FONTE 2 — Amazon BR via scraping
════════════════════════════════════════ */
async function searchAmazon(productName) {
  const q = encodeURIComponent(productName);
  const url = `https://www.amazon.com.br/s?k=${q}&language=pt_BR`;

  const { data: html } = await axios.get(url, {
    timeout: TIMEOUT,
    headers: {
      "User-Agent": UA,
      "Accept-Language": "pt-BR,pt;q=0.9",
      "Accept": "text/html",
    },
  });

  const $ = cheerio.load(html);
  const offers = [];

  $('[data-component-type="s-search-result"]').each((i, el) => {
    if (i >= 3) return;
    const card = $(el);

    const title = card.find("h2 span").first().text().trim();
    if (!title) return;

    // Preço: tenta formato "R$ XX,XX"
    const wholeText = card.find(".a-price-whole").first().text().replace(/\D/g, "");
    const fracText  = card.find(".a-price-fraction").first().text().replace(/\D/g, "");
    const priceStr  = wholeText && fracText ? `${wholeText}.${fracText}` : wholeText;
    const price     = parseFloat(priceStr);

    const relUrl = card.find("h2 a").first().attr("href");
    const imgUrl = card.find("img.s-image").first().attr("src");

    if (price > 0 && relUrl) {
      offers.push({
        store:   "Amazon",
        price,
        url:     `https://www.amazon.com.br${relUrl}`,
        image:   imgUrl || null,
        inStock: true,
        source:  "amazon",
      });
    }
  });

  return offers;
}

/* ════════════════════════════════════════
   FONTE 3 — Zoom.com.br (JSON embutido na página)
════════════════════════════════════════ */
async function searchZoom(productName) {
  const q = encodeURIComponent(productName);
  const url = `https://www.zoom.com.br/search?q=${q}`;

  const { data: html } = await axios.get(url, {
    timeout: TIMEOUT,
    headers: {
      "User-Agent": UA,
      "Accept-Language": "pt-BR,pt;q=0.9",
      "Accept": "text/html",
    },
  });

  const $ = cheerio.load(html);
  const offers = [];

  // Zoom injeta dados em JSON dentro de __NEXT_DATA__
  const nextDataScript = $("#__NEXT_DATA__").html();
  if (nextDataScript) {
    try {
      const json = JSON.parse(nextDataScript);
      // Navega pela estrutura do Next.js data
      const products =
        json?.props?.pageProps?.results ||
        json?.props?.pageProps?.initialState?.search?.results ||
        json?.props?.pageProps?.data?.products ||
        [];

      for (const p of products.slice(0, 4)) {
        const price = parseFloat(p.minPrice || p.price || p.bestPrice || 0);
        if (price > 0) {
          offers.push({
            store:   p.storeName || p.store?.name || "Zoom",
            price,
            url:     p.url ? `https://www.zoom.com.br${p.url}` : url,
            image:   p.image || p.thumbnail || null,
            inStock: true,
            source:  "zoom",
          });
        }
      }
    } catch { /* JSON inválido, tenta scraping normal */ }
  }

  // Fallback: scraping visual
  if (!offers.length) {
    // Tenta encontrar preços em elementos comuns
    $("[class*='Price'], [class*='price']").each((i, el) => {
      if (i >= 6 || offers.length >= 3) return;
      const text = $(el).text().trim();
      const match = text.match(/R\$\s*([\d.,]+)/);
      if (match) {
        const price = parseFloat(
          match[1].replace(/\./g, "").replace(",", ".")
        );
        if (price > 0) {
          offers.push({
            store:   "Zoom",
            price,
            url,
            image:   null,
            inStock: true,
            source:  "zoom-fallback",
          });
        }
      }
    });
  }

  return offers;
}

/* ════════════════════════════════════════
   FONTE 4 — Google Shopping scraping
════════════════════════════════════════ */
async function searchGoogleShopping(productName) {
  const q = encodeURIComponent(`${productName} comprar Brasil`);
  const url = `https://www.google.com.br/search?q=${q}&tbm=shop&gl=br&hl=pt-BR&num=6`;

  const { data: html } = await axios.get(url, {
    timeout: TIMEOUT,
    headers: {
      "User-Agent": UA,
      "Accept-Language": "pt-BR,pt;q=0.9",
      "Accept": "text/html",
    },
  });

  const $ = cheerio.load(html);
  const offers = [];

  // Google Shopping — estrutura de resultados
  $(".sh-dgr__content, .KZmu8e, .mnIHsc").each((i, el) => {
    if (i >= 4) return;
    const card = $(el);

    const priceText = card.find(".HRLxBb, .a8Pemb, [class*='price']").first().text();
    const store     = card.find(".aULzUe, .E5ocAb, .LbUacb").first().text().trim();

    const match = priceText.match(/R\$\s*([\d.,]+)/);
    if (!match) return;

    const price = parseFloat(
      match[1].replace(/\./g, "").replace(",", ".")
    );

    if (price > 0 && store) {
      offers.push({
        store,
        price,
        url:     url,
        image:   null,
        inStock: true,
        source:  "google",
      });
    }
  });

  return offers;
}

/* ════════════════════════════════════════
   DEDUPLICAR E ORDENAR
════════════════════════════════════════ */
function dedupeAndSort(offers) {
  const seen = new Set();
  return offers
    .filter(o => {
      if (!o.price || o.price <= 0) return false;
      const key = `${o.store.toLowerCase()}-${Math.round(o.price)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.price - b.price)
    .slice(0, 6);
}

/* ════════════════════════════════════════
   HANDLER PRINCIPAL
════════════════════════════════════════ */
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
  let productName;
  try { ({ productName } = await req.json()); }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }); }

  if (!productName?.trim()) {
    return Response.json({ error: "Nome obrigatório" }, { status: 400 });
  }

  const allOffers = [];
  const errors    = [];

  // Executa todas as fontes em paralelo
  const results = await Promise.allSettled([
    searchMercadoLivre(productName),
    searchAmazon(productName),
    searchZoom(productName),
    searchGoogleShopping(productName),
  ]);

  const labels = ["MercadoLivre", "Amazon", "Zoom", "Google"];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      allOffers.push(...r.value);
    } else {
      errors.push(`${labels[i]}: ${r.reason?.message}`);
      console.warn(`[compare-prices] ${labels[i]} falhou:`, r.reason?.message);
    }
  });

  const offers = dedupeAndSort(allOffers);

  console.log(`[compare-prices] "${productName}" → ${offers.length} ofertas (${allOffers.length} brutas)`);

  return Response.json({
    offers,
    ...(process.env.NODE_ENV === "development" && { debug: { errors, total: allOffers.length } }),
  });
}
