// lib/product-detection/resolveUrl.js
// Resolve chains de redirect (301/302/307/308) usando HEAD requests.
// Funciona com qualquer encurtador: br.shp.ee, bit.ly, amzn.to, etc.

import https from "https";
import http from "http";

const MAX_REDIRECTS = 10;
const TIMEOUT_MS = 8_000;

/**
 * Domínios conhecidos como encurtadores/redirectores.
 * A detecção é usada para forçar resolução mesmo em attempt > 0.
 */
const KNOWN_SHORTENERS = new Set([
  // Shopee
  "br.shp.ee", "shp.ee",
  // Genéricos
  "bit.ly", "tinyurl.com", "t.co", "goo.gl",
  "ow.ly", "rb.gy", "cutt.ly", "s.id",
  "short.link", "tiny.cc", "is.gd", "buff.ly",
  // Brasil
  "qr.io",
  // E-commerce
  "amzn.to", "meli.me",
]);

/**
 * Verifica se o hostname é um encurtador/redirector.
 * Inclui sufixos dinâmicos como *.page.link (Firebase Dynamic Links).
 */
function isShortener(hostname) {
  const h = hostname.toLowerCase().replace(/^www\./, "");
  return KNOWN_SHORTENERS.has(h) || h.endsWith(".page.link");
}

/**
 * Faz uma requisição HEAD e retorna o Location header se for redirect,
 * ou a própria URL se for 200.
 * Fallback para GET se HEAD retornar 405 (Method Not Allowed).
 */
function headRequest(rawUrl) {
  return new Promise((resolve) => {
    const url = new URL(rawUrl);
    const client = url.protocol === "https:" ? https : http;

    const makeRequest = (method) => {
      const req = client.request(
        rawUrl,
        {
          method,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            Accept: "*/*",
            "Accept-Language": "pt-BR,pt;q=0.9",
          },
          timeout: TIMEOUT_MS,
        },
        (res) => {
          const { statusCode, headers } = res;
          res.resume(); // descarta body — não precisamos dele

          if ([301, 302, 307, 308].includes(statusCode) && headers.location) {
            try {
              const next = new URL(headers.location, rawUrl).toString();
              resolve({ type: "redirect", url: next });
            } catch {
              resolve({ type: "final", url: rawUrl });
            }
          } else if (statusCode === 405 && method === "HEAD") {
            // Servidor não suporta HEAD — tenta GET
            resolve({ type: "retry_get" });
          } else {
            resolve({ type: "final", url: rawUrl });
          }
        }
      );

      req.on("timeout", () => {
        req.destroy();
        resolve({ type: "final", url: rawUrl }); // timeout: retorna URL atual
      });

      req.on("error", () => {
        resolve({ type: "final", url: rawUrl }); // erro de rede: retorna URL atual
      });

      req.end();
    };

    makeRequest("HEAD");
  });
}

/**
 * Resolve uma URL seguindo redirects até a URL final.
 * Suporta qualquer encurtador/redirector de forma genérica.
 *
 * @param {string} rawUrl - URL original (pode ser encurtada)
 * @param {number} attempt - Contador interno de tentativas
 * @returns {Promise<string>} URL final resolvida
 */
export async function resolveUrl(rawUrl, attempt = 0) {
  if (attempt >= MAX_REDIRECTS) {
    console.warn("[resolveUrl] Limite de redirects atingido:", rawUrl);
    return rawUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error(`URL inválida: ${rawUrl}`);
  }

  // Se não é encurtador e já passamos pelo menos uma vez, URL já está resolvida
  if (attempt > 0 && !isShortener(parsedUrl.hostname)) {
    return rawUrl;
  }

  const result = await headRequest(rawUrl);

  if (result.type === "redirect") {
    return resolveUrl(result.url, attempt + 1);
  }

  if (result.type === "retry_get") {
    // Fallback: GET request para o mesmo URL
    const getResult = await headRequest(rawUrl); // headRequest já lida com 405 internamente
    if (getResult.type === "redirect") {
      return resolveUrl(getResult.url, attempt + 1);
    }
    return rawUrl;
  }

  return result.url;
}
