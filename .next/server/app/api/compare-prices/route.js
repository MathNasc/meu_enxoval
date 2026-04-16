/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/compare-prices/route";
exports.ids = ["app/api/compare-prices/route"];
exports.modules = {

/***/ "(rsc)/./app/api/compare-prices/route.js":
/*!*****************************************!*\
  !*** ./app/api/compare-prices/route.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ \"(rsc)/./node_modules/axios/lib/axios.js\");\n/* harmony import */ var cheerio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cheerio */ \"(rsc)/./node_modules/cheerio/dist/esm/index.js\");\n/**\n * POST /api/compare-prices\n * Body: { productName: string }\n *\n * Busca preços em múltiplas fontes GRATUITAS e sem API key:\n *  1. API pública do Mercado Livre (oficial, estável)\n *  2. API pública do Buscapé (JSON endpoint)\n *  3. Scraping do Zoom.com.br como fallback\n */ \n\nconst TIMEOUT = 10000;\nconst UA = \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36\";\n/* ════════════════════════════════════════\n   FONTE 1 — Mercado Livre API (gratuita, oficial)\n   Docs: https://developers.mercadolivre.com.br/\n════════════════════════════════════════ */ async function searchMercadoLivre(productName) {\n    const q = encodeURIComponent(productName);\n    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${q}&limit=6`;\n    const { data } = await axios__WEBPACK_IMPORTED_MODULE_1__[\"default\"].get(url, {\n        timeout: TIMEOUT,\n        headers: {\n            \"Accept\": \"application/json\"\n        }\n    });\n    return (data.results || []).filter((item)=>item.price > 0 && item.condition !== \"used\").slice(0, 4).map((item)=>({\n            store: \"Mercado Livre\",\n            price: item.price,\n            url: item.permalink,\n            image: item.thumbnail?.replace(\"I.jpg\", \"O.jpg\") || item.thumbnail,\n            inStock: item.available_quantity > 0,\n            source: \"mercadolivre\"\n        }));\n}\n/* ════════════════════════════════════════\n   FONTE 2 — Amazon BR via scraping\n════════════════════════════════════════ */ async function searchAmazon(productName) {\n    const q = encodeURIComponent(productName);\n    const url = `https://www.amazon.com.br/s?k=${q}&language=pt_BR`;\n    const { data: html } = await axios__WEBPACK_IMPORTED_MODULE_1__[\"default\"].get(url, {\n        timeout: TIMEOUT,\n        headers: {\n            \"User-Agent\": UA,\n            \"Accept-Language\": \"pt-BR,pt;q=0.9\",\n            \"Accept\": \"text/html\"\n        }\n    });\n    const $ = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(html);\n    const offers = [];\n    $('[data-component-type=\"s-search-result\"]').each((i, el)=>{\n        if (i >= 3) return;\n        const card = $(el);\n        const title = card.find(\"h2 span\").first().text().trim();\n        if (!title) return;\n        // Preço: tenta formato \"R$ XX,XX\"\n        const wholeText = card.find(\".a-price-whole\").first().text().replace(/\\D/g, \"\");\n        const fracText = card.find(\".a-price-fraction\").first().text().replace(/\\D/g, \"\");\n        const priceStr = wholeText && fracText ? `${wholeText}.${fracText}` : wholeText;\n        const price = parseFloat(priceStr);\n        const relUrl = card.find(\"h2 a\").first().attr(\"href\");\n        const imgUrl = card.find(\"img.s-image\").first().attr(\"src\");\n        if (price > 0 && relUrl) {\n            offers.push({\n                store: \"Amazon\",\n                price,\n                url: `https://www.amazon.com.br${relUrl}`,\n                image: imgUrl || null,\n                inStock: true,\n                source: \"amazon\"\n            });\n        }\n    });\n    return offers;\n}\n/* ════════════════════════════════════════\n   FONTE 3 — Zoom.com.br (JSON embutido na página)\n════════════════════════════════════════ */ async function searchZoom(productName) {\n    const q = encodeURIComponent(productName);\n    const url = `https://www.zoom.com.br/search?q=${q}`;\n    const { data: html } = await axios__WEBPACK_IMPORTED_MODULE_1__[\"default\"].get(url, {\n        timeout: TIMEOUT,\n        headers: {\n            \"User-Agent\": UA,\n            \"Accept-Language\": \"pt-BR,pt;q=0.9\",\n            \"Accept\": \"text/html\"\n        }\n    });\n    const $ = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(html);\n    const offers = [];\n    // Zoom injeta dados em JSON dentro de __NEXT_DATA__\n    const nextDataScript = $(\"#__NEXT_DATA__\").html();\n    if (nextDataScript) {\n        try {\n            const json = JSON.parse(nextDataScript);\n            // Navega pela estrutura do Next.js data\n            const products = json?.props?.pageProps?.results || json?.props?.pageProps?.initialState?.search?.results || json?.props?.pageProps?.data?.products || [];\n            for (const p of products.slice(0, 4)){\n                const price = parseFloat(p.minPrice || p.price || p.bestPrice || 0);\n                if (price > 0) {\n                    offers.push({\n                        store: p.storeName || p.store?.name || \"Zoom\",\n                        price,\n                        url: p.url ? `https://www.zoom.com.br${p.url}` : url,\n                        image: p.image || p.thumbnail || null,\n                        inStock: true,\n                        source: \"zoom\"\n                    });\n                }\n            }\n        } catch  {}\n    }\n    // Fallback: scraping visual\n    if (!offers.length) {\n        // Tenta encontrar preços em elementos comuns\n        $(\"[class*='Price'], [class*='price']\").each((i, el)=>{\n            if (i >= 6 || offers.length >= 3) return;\n            const text = $(el).text().trim();\n            const match = text.match(/R\\$\\s*([\\d.,]+)/);\n            if (match) {\n                const price = parseFloat(match[1].replace(/\\./g, \"\").replace(\",\", \".\"));\n                if (price > 0) {\n                    offers.push({\n                        store: \"Zoom\",\n                        price,\n                        url,\n                        image: null,\n                        inStock: true,\n                        source: \"zoom-fallback\"\n                    });\n                }\n            }\n        });\n    }\n    return offers;\n}\n/* ════════════════════════════════════════\n   FONTE 4 — Google Shopping scraping\n════════════════════════════════════════ */ async function searchGoogleShopping(productName) {\n    const q = encodeURIComponent(`${productName} comprar Brasil`);\n    const url = `https://www.google.com.br/search?q=${q}&tbm=shop&gl=br&hl=pt-BR&num=6`;\n    const { data: html } = await axios__WEBPACK_IMPORTED_MODULE_1__[\"default\"].get(url, {\n        timeout: TIMEOUT,\n        headers: {\n            \"User-Agent\": UA,\n            \"Accept-Language\": \"pt-BR,pt;q=0.9\",\n            \"Accept\": \"text/html\"\n        }\n    });\n    const $ = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(html);\n    const offers = [];\n    // Google Shopping — estrutura de resultados\n    $(\".sh-dgr__content, .KZmu8e, .mnIHsc\").each((i, el)=>{\n        if (i >= 4) return;\n        const card = $(el);\n        const priceText = card.find(\".HRLxBb, .a8Pemb, [class*='price']\").first().text();\n        const store = card.find(\".aULzUe, .E5ocAb, .LbUacb\").first().text().trim();\n        const match = priceText.match(/R\\$\\s*([\\d.,]+)/);\n        if (!match) return;\n        const price = parseFloat(match[1].replace(/\\./g, \"\").replace(\",\", \".\"));\n        if (price > 0 && store) {\n            offers.push({\n                store,\n                price,\n                url: url,\n                image: null,\n                inStock: true,\n                source: \"google\"\n            });\n        }\n    });\n    return offers;\n}\n/* ════════════════════════════════════════\n   DEDUPLICAR E ORDENAR\n════════════════════════════════════════ */ function dedupeAndSort(offers) {\n    const seen = new Set();\n    return offers.filter((o)=>{\n        if (!o.price || o.price <= 0) return false;\n        const key = `${o.store.toLowerCase()}-${Math.round(o.price)}`;\n        if (seen.has(key)) return false;\n        seen.add(key);\n        return true;\n    }).sort((a, b)=>a.price - b.price).slice(0, 6);\n}\n/* ════════════════════════════════════════\n   HANDLER PRINCIPAL\n════════════════════════════════════════ */ async function POST(req) {\n    let productName;\n    try {\n        ({ productName } = await req.json());\n    } catch  {\n        return Response.json({\n            error: \"Body inválido\"\n        }, {\n            status: 400\n        });\n    }\n    if (!productName?.trim()) {\n        return Response.json({\n            error: \"Nome obrigatório\"\n        }, {\n            status: 400\n        });\n    }\n    const allOffers = [];\n    const errors = [];\n    // Executa todas as fontes em paralelo\n    const results = await Promise.allSettled([\n        searchMercadoLivre(productName),\n        searchAmazon(productName),\n        searchZoom(productName),\n        searchGoogleShopping(productName)\n    ]);\n    const labels = [\n        \"MercadoLivre\",\n        \"Amazon\",\n        \"Zoom\",\n        \"Google\"\n    ];\n    results.forEach((r, i)=>{\n        if (r.status === \"fulfilled\") {\n            allOffers.push(...r.value);\n        } else {\n            errors.push(`${labels[i]}: ${r.reason?.message}`);\n            console.warn(`[compare-prices] ${labels[i]} falhou:`, r.reason?.message);\n        }\n    });\n    const offers = dedupeAndSort(allOffers);\n    console.log(`[compare-prices] \"${productName}\" → ${offers.length} ofertas (${allOffers.length} brutas)`);\n    return Response.json({\n        offers,\n        ... true && {\n            debug: {\n                errors,\n                total: allOffers.length\n            }\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFlBQVksSUFBSSxFQUFFMkIsT0FBT2lDLE1BQU0sQ0FBQyxVQUFVLEVBQUVzQixVQUFVdEIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUV2RyxPQUFPbUIsU0FBU2hDLElBQUksQ0FBQztRQUNuQnBCO1FBQ0EsR0FBSW9FLEtBQXNDLElBQUk7WUFBRUMsT0FBTztnQkFBRWI7Z0JBQVFjLE9BQU9mLFVBQVV0QixNQUFNO1lBQUM7UUFBRSxDQUFDO0lBQzlGO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcTWFyY2VfY2NkM216dFxcRW54b3ZhbFxcYXBwXFxhcGlcXGNvbXBhcmUtcHJpY2VzXFxyb3V0ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFBPU1QgL2FwaS9jb21wYXJlLXByaWNlc1xuICogQm9keTogeyBwcm9kdWN0TmFtZTogc3RyaW5nIH1cbiAqXG4gKiBCdXNjYSBwcmXDp29zIGVtIG3Dumx0aXBsYXMgZm9udGVzIEdSQVRVSVRBUyBlIHNlbSBBUEkga2V5OlxuICogIDEuIEFQSSBww7pibGljYSBkbyBNZXJjYWRvIExpdnJlIChvZmljaWFsLCBlc3TDoXZlbClcbiAqICAyLiBBUEkgcMO6YmxpY2EgZG8gQnVzY2Fww6kgKEpTT04gZW5kcG9pbnQpXG4gKiAgMy4gU2NyYXBpbmcgZG8gWm9vbS5jb20uYnIgY29tbyBmYWxsYmFja1xuICovXG5cbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCAqIGFzIGNoZWVyaW8gZnJvbSBcImNoZWVyaW9cIjtcblxuY29uc3QgVElNRU9VVCA9IDEwXzAwMDtcbmNvbnN0IFVBID0gXCJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTI0LjAuMC4wIFNhZmFyaS81MzcuMzZcIjtcblxuLyog4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQXG4gICBGT05URSAxIOKAlCBNZXJjYWRvIExpdnJlIEFQSSAoZ3JhdHVpdGEsIG9maWNpYWwpXG4gICBEb2NzOiBodHRwczovL2RldmVsb3BlcnMubWVyY2Fkb2xpdnJlLmNvbS5ici9cbuKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkCAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoTWVyY2Fkb0xpdnJlKHByb2R1Y3ROYW1lKSB7XG4gIGNvbnN0IHEgPSBlbmNvZGVVUklDb21wb25lbnQocHJvZHVjdE5hbWUpO1xuICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkubWVyY2Fkb2xpYnJlLmNvbS9zaXRlcy9NTEIvc2VhcmNoP3E9JHtxfSZsaW1pdD02YDtcblxuICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IGF4aW9zLmdldCh1cmwsIHtcbiAgICB0aW1lb3V0OiBUSU1FT1VULFxuICAgIGhlYWRlcnM6IHsgXCJBY2NlcHRcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIChkYXRhLnJlc3VsdHMgfHwgW10pXG4gICAgLmZpbHRlcihpdGVtID0+IGl0ZW0ucHJpY2UgPiAwICYmIGl0ZW0uY29uZGl0aW9uICE9PSBcInVzZWRcIilcbiAgICAuc2xpY2UoMCwgNClcbiAgICAubWFwKGl0ZW0gPT4gKHtcbiAgICAgIHN0b3JlOiAgIFwiTWVyY2FkbyBMaXZyZVwiLFxuICAgICAgcHJpY2U6ICAgaXRlbS5wcmljZSxcbiAgICAgIHVybDogICAgIGl0ZW0ucGVybWFsaW5rLFxuICAgICAgaW1hZ2U6ICAgaXRlbS50aHVtYm5haWw/LnJlcGxhY2UoXCJJLmpwZ1wiLCBcIk8uanBnXCIpIHx8IGl0ZW0udGh1bWJuYWlsLFxuICAgICAgaW5TdG9jazogaXRlbS5hdmFpbGFibGVfcXVhbnRpdHkgPiAwLFxuICAgICAgc291cmNlOiAgXCJtZXJjYWRvbGl2cmVcIixcbiAgICB9KSk7XG59XG5cbi8qIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkFxuICAgRk9OVEUgMiDigJQgQW1hem9uIEJSIHZpYSBzY3JhcGluZ1xu4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hBbWF6b24ocHJvZHVjdE5hbWUpIHtcbiAgY29uc3QgcSA9IGVuY29kZVVSSUNvbXBvbmVudChwcm9kdWN0TmFtZSk7XG4gIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5hbWF6b24uY29tLmJyL3M/az0ke3F9Jmxhbmd1YWdlPXB0X0JSYDtcblxuICBjb25zdCB7IGRhdGE6IGh0bWwgfSA9IGF3YWl0IGF4aW9zLmdldCh1cmwsIHtcbiAgICB0aW1lb3V0OiBUSU1FT1VULFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIFwiVXNlci1BZ2VudFwiOiBVQSxcbiAgICAgIFwiQWNjZXB0LUxhbmd1YWdlXCI6IFwicHQtQlIscHQ7cT0wLjlcIixcbiAgICAgIFwiQWNjZXB0XCI6IFwidGV4dC9odG1sXCIsXG4gICAgfSxcbiAgfSk7XG5cbiAgY29uc3QgJCA9IGNoZWVyaW8ubG9hZChodG1sKTtcbiAgY29uc3Qgb2ZmZXJzID0gW107XG5cbiAgJCgnW2RhdGEtY29tcG9uZW50LXR5cGU9XCJzLXNlYXJjaC1yZXN1bHRcIl0nKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgIGlmIChpID49IDMpIHJldHVybjtcbiAgICBjb25zdCBjYXJkID0gJChlbCk7XG5cbiAgICBjb25zdCB0aXRsZSA9IGNhcmQuZmluZChcImgyIHNwYW5cIikuZmlyc3QoKS50ZXh0KCkudHJpbSgpO1xuICAgIGlmICghdGl0bGUpIHJldHVybjtcblxuICAgIC8vIFByZcOnbzogdGVudGEgZm9ybWF0byBcIlIkIFhYLFhYXCJcbiAgICBjb25zdCB3aG9sZVRleHQgPSBjYXJkLmZpbmQoXCIuYS1wcmljZS13aG9sZVwiKS5maXJzdCgpLnRleHQoKS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgY29uc3QgZnJhY1RleHQgID0gY2FyZC5maW5kKFwiLmEtcHJpY2UtZnJhY3Rpb25cIikuZmlyc3QoKS50ZXh0KCkucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgIGNvbnN0IHByaWNlU3RyICA9IHdob2xlVGV4dCAmJiBmcmFjVGV4dCA/IGAke3dob2xlVGV4dH0uJHtmcmFjVGV4dH1gIDogd2hvbGVUZXh0O1xuICAgIGNvbnN0IHByaWNlICAgICA9IHBhcnNlRmxvYXQocHJpY2VTdHIpO1xuXG4gICAgY29uc3QgcmVsVXJsID0gY2FyZC5maW5kKFwiaDIgYVwiKS5maXJzdCgpLmF0dHIoXCJocmVmXCIpO1xuICAgIGNvbnN0IGltZ1VybCA9IGNhcmQuZmluZChcImltZy5zLWltYWdlXCIpLmZpcnN0KCkuYXR0cihcInNyY1wiKTtcblxuICAgIGlmIChwcmljZSA+IDAgJiYgcmVsVXJsKSB7XG4gICAgICBvZmZlcnMucHVzaCh7XG4gICAgICAgIHN0b3JlOiAgIFwiQW1hem9uXCIsXG4gICAgICAgIHByaWNlLFxuICAgICAgICB1cmw6ICAgICBgaHR0cHM6Ly93d3cuYW1hem9uLmNvbS5iciR7cmVsVXJsfWAsXG4gICAgICAgIGltYWdlOiAgIGltZ1VybCB8fCBudWxsLFxuICAgICAgICBpblN0b2NrOiB0cnVlLFxuICAgICAgICBzb3VyY2U6ICBcImFtYXpvblwiLFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb2ZmZXJzO1xufVxuXG4vKiDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZBcbiAgIEZPTlRFIDMg4oCUIFpvb20uY29tLmJyIChKU09OIGVtYnV0aWRvIG5hIHDDoWdpbmEpXG7ilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaFpvb20ocHJvZHVjdE5hbWUpIHtcbiAgY29uc3QgcSA9IGVuY29kZVVSSUNvbXBvbmVudChwcm9kdWN0TmFtZSk7XG4gIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy56b29tLmNvbS5ici9zZWFyY2g/cT0ke3F9YDtcblxuICBjb25zdCB7IGRhdGE6IGh0bWwgfSA9IGF3YWl0IGF4aW9zLmdldCh1cmwsIHtcbiAgICB0aW1lb3V0OiBUSU1FT1VULFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIFwiVXNlci1BZ2VudFwiOiBVQSxcbiAgICAgIFwiQWNjZXB0LUxhbmd1YWdlXCI6IFwicHQtQlIscHQ7cT0wLjlcIixcbiAgICAgIFwiQWNjZXB0XCI6IFwidGV4dC9odG1sXCIsXG4gICAgfSxcbiAgfSk7XG5cbiAgY29uc3QgJCA9IGNoZWVyaW8ubG9hZChodG1sKTtcbiAgY29uc3Qgb2ZmZXJzID0gW107XG5cbiAgLy8gWm9vbSBpbmpldGEgZGFkb3MgZW0gSlNPTiBkZW50cm8gZGUgX19ORVhUX0RBVEFfX1xuICBjb25zdCBuZXh0RGF0YVNjcmlwdCA9ICQoXCIjX19ORVhUX0RBVEFfX1wiKS5odG1sKCk7XG4gIGlmIChuZXh0RGF0YVNjcmlwdCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShuZXh0RGF0YVNjcmlwdCk7XG4gICAgICAvLyBOYXZlZ2EgcGVsYSBlc3RydXR1cmEgZG8gTmV4dC5qcyBkYXRhXG4gICAgICBjb25zdCBwcm9kdWN0cyA9XG4gICAgICAgIGpzb24/LnByb3BzPy5wYWdlUHJvcHM/LnJlc3VsdHMgfHxcbiAgICAgICAganNvbj8ucHJvcHM/LnBhZ2VQcm9wcz8uaW5pdGlhbFN0YXRlPy5zZWFyY2g/LnJlc3VsdHMgfHxcbiAgICAgICAganNvbj8ucHJvcHM/LnBhZ2VQcm9wcz8uZGF0YT8ucHJvZHVjdHMgfHxcbiAgICAgICAgW107XG5cbiAgICAgIGZvciAoY29uc3QgcCBvZiBwcm9kdWN0cy5zbGljZSgwLCA0KSkge1xuICAgICAgICBjb25zdCBwcmljZSA9IHBhcnNlRmxvYXQocC5taW5QcmljZSB8fCBwLnByaWNlIHx8IHAuYmVzdFByaWNlIHx8IDApO1xuICAgICAgICBpZiAocHJpY2UgPiAwKSB7XG4gICAgICAgICAgb2ZmZXJzLnB1c2goe1xuICAgICAgICAgICAgc3RvcmU6ICAgcC5zdG9yZU5hbWUgfHwgcC5zdG9yZT8ubmFtZSB8fCBcIlpvb21cIixcbiAgICAgICAgICAgIHByaWNlLFxuICAgICAgICAgICAgdXJsOiAgICAgcC51cmwgPyBgaHR0cHM6Ly93d3cuem9vbS5jb20uYnIke3AudXJsfWAgOiB1cmwsXG4gICAgICAgICAgICBpbWFnZTogICBwLmltYWdlIHx8IHAudGh1bWJuYWlsIHx8IG51bGwsXG4gICAgICAgICAgICBpblN0b2NrOiB0cnVlLFxuICAgICAgICAgICAgc291cmNlOiAgXCJ6b29tXCIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHsgLyogSlNPTiBpbnbDoWxpZG8sIHRlbnRhIHNjcmFwaW5nIG5vcm1hbCAqLyB9XG4gIH1cblxuICAvLyBGYWxsYmFjazogc2NyYXBpbmcgdmlzdWFsXG4gIGlmICghb2ZmZXJzLmxlbmd0aCkge1xuICAgIC8vIFRlbnRhIGVuY29udHJhciBwcmXDp29zIGVtIGVsZW1lbnRvcyBjb211bnNcbiAgICAkKFwiW2NsYXNzKj0nUHJpY2UnXSwgW2NsYXNzKj0ncHJpY2UnXVwiKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgaWYgKGkgPj0gNiB8fCBvZmZlcnMubGVuZ3RoID49IDMpIHJldHVybjtcbiAgICAgIGNvbnN0IHRleHQgPSAkKGVsKS50ZXh0KCkudHJpbSgpO1xuICAgICAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9SXFwkXFxzKihbXFxkLixdKykvKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBwcmljZSA9IHBhcnNlRmxvYXQoXG4gICAgICAgICAgbWF0Y2hbMV0ucmVwbGFjZSgvXFwuL2csIFwiXCIpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKVxuICAgICAgICApO1xuICAgICAgICBpZiAocHJpY2UgPiAwKSB7XG4gICAgICAgICAgb2ZmZXJzLnB1c2goe1xuICAgICAgICAgICAgc3RvcmU6ICAgXCJab29tXCIsXG4gICAgICAgICAgICBwcmljZSxcbiAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgIGltYWdlOiAgIG51bGwsXG4gICAgICAgICAgICBpblN0b2NrOiB0cnVlLFxuICAgICAgICAgICAgc291cmNlOiAgXCJ6b29tLWZhbGxiYWNrXCIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBvZmZlcnM7XG59XG5cbi8qIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkFxuICAgRk9OVEUgNCDigJQgR29vZ2xlIFNob3BwaW5nIHNjcmFwaW5nXG7ilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEdvb2dsZVNob3BwaW5nKHByb2R1Y3ROYW1lKSB7XG4gIGNvbnN0IHEgPSBlbmNvZGVVUklDb21wb25lbnQoYCR7cHJvZHVjdE5hbWV9IGNvbXByYXIgQnJhc2lsYCk7XG4gIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5nb29nbGUuY29tLmJyL3NlYXJjaD9xPSR7cX0mdGJtPXNob3AmZ2w9YnImaGw9cHQtQlImbnVtPTZgO1xuXG4gIGNvbnN0IHsgZGF0YTogaHRtbCB9ID0gYXdhaXQgYXhpb3MuZ2V0KHVybCwge1xuICAgIHRpbWVvdXQ6IFRJTUVPVVQsXG4gICAgaGVhZGVyczoge1xuICAgICAgXCJVc2VyLUFnZW50XCI6IFVBLFxuICAgICAgXCJBY2NlcHQtTGFuZ3VhZ2VcIjogXCJwdC1CUixwdDtxPTAuOVwiLFxuICAgICAgXCJBY2NlcHRcIjogXCJ0ZXh0L2h0bWxcIixcbiAgICB9LFxuICB9KTtcblxuICBjb25zdCAkID0gY2hlZXJpby5sb2FkKGh0bWwpO1xuICBjb25zdCBvZmZlcnMgPSBbXTtcblxuICAvLyBHb29nbGUgU2hvcHBpbmcg4oCUIGVzdHJ1dHVyYSBkZSByZXN1bHRhZG9zXG4gICQoXCIuc2gtZGdyX19jb250ZW50LCAuS1ptdThlLCAubW5JSHNjXCIpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgaWYgKGkgPj0gNCkgcmV0dXJuO1xuICAgIGNvbnN0IGNhcmQgPSAkKGVsKTtcblxuICAgIGNvbnN0IHByaWNlVGV4dCA9IGNhcmQuZmluZChcIi5IUkx4QmIsIC5hOFBlbWIsIFtjbGFzcyo9J3ByaWNlJ11cIikuZmlyc3QoKS50ZXh0KCk7XG4gICAgY29uc3Qgc3RvcmUgICAgID0gY2FyZC5maW5kKFwiLmFVTHpVZSwgLkU1b2NBYiwgLkxiVWFjYlwiKS5maXJzdCgpLnRleHQoKS50cmltKCk7XG5cbiAgICBjb25zdCBtYXRjaCA9IHByaWNlVGV4dC5tYXRjaCgvUlxcJFxccyooW1xcZC4sXSspLyk7XG4gICAgaWYgKCFtYXRjaCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcHJpY2UgPSBwYXJzZUZsb2F0KFxuICAgICAgbWF0Y2hbMV0ucmVwbGFjZSgvXFwuL2csIFwiXCIpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKVxuICAgICk7XG5cbiAgICBpZiAocHJpY2UgPiAwICYmIHN0b3JlKSB7XG4gICAgICBvZmZlcnMucHVzaCh7XG4gICAgICAgIHN0b3JlLFxuICAgICAgICBwcmljZSxcbiAgICAgICAgdXJsOiAgICAgdXJsLFxuICAgICAgICBpbWFnZTogICBudWxsLFxuICAgICAgICBpblN0b2NrOiB0cnVlLFxuICAgICAgICBzb3VyY2U6ICBcImdvb2dsZVwiLFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb2ZmZXJzO1xufVxuXG4vKiDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZBcbiAgIERFRFVQTElDQVIgRSBPUkRFTkFSXG7ilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgKi9cbmZ1bmN0aW9uIGRlZHVwZUFuZFNvcnQob2ZmZXJzKSB7XG4gIGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XG4gIHJldHVybiBvZmZlcnNcbiAgICAuZmlsdGVyKG8gPT4ge1xuICAgICAgaWYgKCFvLnByaWNlIHx8IG8ucHJpY2UgPD0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3Qga2V5ID0gYCR7by5zdG9yZS50b0xvd2VyQ2FzZSgpfS0ke01hdGgucm91bmQoby5wcmljZSl9YDtcbiAgICAgIGlmIChzZWVuLmhhcyhrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgICBzZWVuLmFkZChrZXkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSlcbiAgICAuc29ydCgoYSwgYikgPT4gYS5wcmljZSAtIGIucHJpY2UpXG4gICAgLnNsaWNlKDAsIDYpO1xufVxuXG4vKiDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZBcbiAgIEhBTkRMRVIgUFJJTkNJUEFMXG7ilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcSkge1xuICBsZXQgcHJvZHVjdE5hbWU7XG4gIHRyeSB7ICh7IHByb2R1Y3ROYW1lIH0gPSBhd2FpdCByZXEuanNvbigpKTsgfVxuICBjYXRjaCB7IHJldHVybiBSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiQm9keSBpbnbDoWxpZG9cIiB9LCB7IHN0YXR1czogNDAwIH0pOyB9XG5cbiAgaWYgKCFwcm9kdWN0TmFtZT8udHJpbSgpKSB7XG4gICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJOb21lIG9icmlnYXTDs3Jpb1wiIH0sIHsgc3RhdHVzOiA0MDAgfSk7XG4gIH1cblxuICBjb25zdCBhbGxPZmZlcnMgPSBbXTtcbiAgY29uc3QgZXJyb3JzICAgID0gW107XG5cbiAgLy8gRXhlY3V0YSB0b2RhcyBhcyBmb250ZXMgZW0gcGFyYWxlbG9cbiAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChbXG4gICAgc2VhcmNoTWVyY2Fkb0xpdnJlKHByb2R1Y3ROYW1lKSxcbiAgICBzZWFyY2hBbWF6b24ocHJvZHVjdE5hbWUpLFxuICAgIHNlYXJjaFpvb20ocHJvZHVjdE5hbWUpLFxuICAgIHNlYXJjaEdvb2dsZVNob3BwaW5nKHByb2R1Y3ROYW1lKSxcbiAgXSk7XG5cbiAgY29uc3QgbGFiZWxzID0gW1wiTWVyY2Fkb0xpdnJlXCIsIFwiQW1hem9uXCIsIFwiWm9vbVwiLCBcIkdvb2dsZVwiXTtcbiAgcmVzdWx0cy5mb3JFYWNoKChyLCBpKSA9PiB7XG4gICAgaWYgKHIuc3RhdHVzID09PSBcImZ1bGZpbGxlZFwiKSB7XG4gICAgICBhbGxPZmZlcnMucHVzaCguLi5yLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JzLnB1c2goYCR7bGFiZWxzW2ldfTogJHtyLnJlYXNvbj8ubWVzc2FnZX1gKTtcbiAgICAgIGNvbnNvbGUud2FybihgW2NvbXBhcmUtcHJpY2VzXSAke2xhYmVsc1tpXX0gZmFsaG91OmAsIHIucmVhc29uPy5tZXNzYWdlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IG9mZmVycyA9IGRlZHVwZUFuZFNvcnQoYWxsT2ZmZXJzKTtcblxuICBjb25zb2xlLmxvZyhgW2NvbXBhcmUtcHJpY2VzXSBcIiR7cHJvZHVjdE5hbWV9XCIg4oaSICR7b2ZmZXJzLmxlbmd0aH0gb2ZlcnRhcyAoJHthbGxPZmZlcnMubGVuZ3RofSBicnV0YXMpYCk7XG5cbiAgcmV0dXJuIFJlc3BvbnNlLmpzb24oe1xuICAgIG9mZmVycyxcbiAgICAuLi4ocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiB7IGRlYnVnOiB7IGVycm9ycywgdG90YWw6IGFsbE9mZmVycy5sZW5ndGggfSB9KSxcbiAgfSk7XG59XG4iXSwibmFtZXMiOlsiYXhpb3MiLCJjaGVlcmlvIiwiVElNRU9VVCIsIlVBIiwic2VhcmNoTWVyY2Fkb0xpdnJlIiwicHJvZHVjdE5hbWUiLCJxIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwidXJsIiwiZGF0YSIsImdldCIsInRpbWVvdXQiLCJoZWFkZXJzIiwicmVzdWx0cyIsImZpbHRlciIsIml0ZW0iLCJwcmljZSIsImNvbmRpdGlvbiIsInNsaWNlIiwibWFwIiwic3RvcmUiLCJwZXJtYWxpbmsiLCJpbWFnZSIsInRodW1ibmFpbCIsInJlcGxhY2UiLCJpblN0b2NrIiwiYXZhaWxhYmxlX3F1YW50aXR5Iiwic291cmNlIiwic2VhcmNoQW1hem9uIiwiaHRtbCIsIiQiLCJsb2FkIiwib2ZmZXJzIiwiZWFjaCIsImkiLCJlbCIsImNhcmQiLCJ0aXRsZSIsImZpbmQiLCJmaXJzdCIsInRleHQiLCJ0cmltIiwid2hvbGVUZXh0IiwiZnJhY1RleHQiLCJwcmljZVN0ciIsInBhcnNlRmxvYXQiLCJyZWxVcmwiLCJhdHRyIiwiaW1nVXJsIiwicHVzaCIsInNlYXJjaFpvb20iLCJuZXh0RGF0YVNjcmlwdCIsImpzb24iLCJKU09OIiwicGFyc2UiLCJwcm9kdWN0cyIsInByb3BzIiwicGFnZVByb3BzIiwiaW5pdGlhbFN0YXRlIiwic2VhcmNoIiwicCIsIm1pblByaWNlIiwiYmVzdFByaWNlIiwic3RvcmVOYW1lIiwibmFtZSIsImxlbmd0aCIsIm1hdGNoIiwic2VhcmNoR29vZ2xlU2hvcHBpbmciLCJwcmljZVRleHQiLCJkZWR1cGVBbmRTb3J0Iiwic2VlbiIsIlNldCIsIm8iLCJrZXkiLCJ0b0xvd2VyQ2FzZSIsIk1hdGgiLCJyb3VuZCIsImhhcyIsImFkZCIsInNvcnQiLCJhIiwiYiIsIlBPU1QiLCJyZXEiLCJSZXNwb25zZSIsImVycm9yIiwic3RhdHVzIiwiYWxsT2ZmZXJzIiwiZXJyb3JzIiwiUHJvbWlzZSIsImFsbFNldHRsZWQiLCJsYWJlbHMiLCJmb3JFYWNoIiwiciIsInZhbHVlIiwicmVhc29uIiwibWVzc2FnZSIsImNvbnNvbGUiLCJ3YXJuIiwibG9nIiwicHJvY2VzcyIsImRlYnVnIiwidG90YWwiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/compare-prices/route.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompare-prices%2Froute&page=%2Fapi%2Fcompare-prices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompare-prices%2Froute.js&appDir=C%3A%5CUsers%5CMarce_ccd3mzt%5CEnxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMarce_ccd3mzt%5CEnxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompare-prices%2Froute&page=%2Fapi%2Fcompare-prices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompare-prices%2Froute.js&appDir=C%3A%5CUsers%5CMarce_ccd3mzt%5CEnxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMarce_ccd3mzt%5CEnxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   handler: () => (/* binding */ handler),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/request-meta */ \"(rsc)/./node_modules/next/dist/server/request-meta.js\");\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/dist/server/lib/trace/tracer */ \"(rsc)/./node_modules/next/dist/server/lib/trace/tracer.js\");\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/shared/lib/router/utils/app-paths */ \"next/dist/shared/lib/router/utils/app-paths\");\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/base-http/node */ \"(rsc)/./node_modules/next/dist/server/base-http/node.js\");\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/dist/server/web/spec-extension/adapters/next-request */ \"(rsc)/./node_modules/next/dist/server/web/spec-extension/adapters/next-request.js\");\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! next/dist/server/lib/trace/constants */ \"(rsc)/./node_modules/next/dist/server/lib/trace/constants.js\");\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! next/dist/server/instrumentation/utils */ \"(rsc)/./node_modules/next/dist/server/instrumentation/utils.js\");\n/* harmony import */ var next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! next/dist/server/send-response */ \"(rsc)/./node_modules/next/dist/server/send-response.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! next/dist/server/web/utils */ \"(rsc)/./node_modules/next/dist/server/web/utils.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! next/dist/server/lib/cache-control */ \"(rsc)/./node_modules/next/dist/server/lib/cache-control.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! next/dist/lib/constants */ \"(rsc)/./node_modules/next/dist/lib/constants.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! next/dist/shared/lib/no-fallback-error.external */ \"next/dist/shared/lib/no-fallback-error.external\");\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__);\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! next/dist/server/response-cache */ \"(rsc)/./node_modules/next/dist/server/response-cache/index.js\");\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__);\n/* harmony import */ var C_Users_Marce_ccd3mzt_Enxoval_app_api_compare_prices_route_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./app/api/compare-prices/route.js */ \"(rsc)/./app/api/compare-prices/route.js\");\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/compare-prices/route\",\n        pathname: \"/api/compare-prices\",\n        filename: \"route\",\n        bundlePath: \"app/api/compare-prices/route\"\n    },\n    distDir: \".next\" || 0,\n    relativeProjectDir:  false || '',\n    resolvedPagePath: \"C:\\\\Users\\\\Marce_ccd3mzt\\\\Enxoval\\\\app\\\\api\\\\compare-prices\\\\route.js\",\n    nextConfigOutput,\n    userland: C_Users_Marce_ccd3mzt_Enxoval_app_api_compare_prices_route_js__WEBPACK_IMPORTED_MODULE_16__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\nasync function handler(req, res, ctx) {\n    var _nextConfig_experimental;\n    let srcPage = \"/api/compare-prices/route\";\n    // turbopack doesn't normalize `/index` in the page name\n    // so we need to to process dynamic routes properly\n    // TODO: fix turbopack providing differing value from webpack\n    if (false) {} else if (srcPage === '/index') {\n        // we always normalize /index specifically\n        srcPage = '/';\n    }\n    const multiZoneDraftMode = false;\n    const prepareResult = await routeModule.prepare(req, res, {\n        srcPage,\n        multiZoneDraftMode\n    });\n    if (!prepareResult) {\n        res.statusCode = 400;\n        res.end('Bad Request');\n        ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());\n        return null;\n    }\n    const { buildId, params, nextConfig, isDraftMode, prerenderManifest, routerServerContext, isOnDemandRevalidate, revalidateOnlyGenerated, resolvedPathname } = prepareResult;\n    const normalizedSrcPage = (0,next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__.normalizeAppPath)(srcPage);\n    let isIsr = Boolean(prerenderManifest.dynamicRoutes[normalizedSrcPage] || prerenderManifest.routes[resolvedPathname]);\n    if (isIsr && !isDraftMode) {\n        const isPrerendered = Boolean(prerenderManifest.routes[resolvedPathname]);\n        const prerenderInfo = prerenderManifest.dynamicRoutes[normalizedSrcPage];\n        if (prerenderInfo) {\n            if (prerenderInfo.fallback === false && !isPrerendered) {\n                throw new next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError();\n            }\n        }\n    }\n    let cacheKey = null;\n    if (isIsr && !routeModule.isDev && !isDraftMode) {\n        cacheKey = resolvedPathname;\n        // ensure /index and / is normalized to one key\n        cacheKey = cacheKey === '/index' ? '/' : cacheKey;\n    }\n    const supportsDynamicResponse = // If we're in development, we always support dynamic HTML\n    routeModule.isDev === true || // If this is not SSG or does not have static paths, then it supports\n    // dynamic HTML.\n    !isIsr;\n    // This is a revalidation request if the request is for a static\n    // page and it is not being resumed from a postponed render and\n    // it is not a dynamic RSC request then it is a revalidation\n    // request.\n    const isRevalidate = isIsr && !supportsDynamicResponse;\n    const method = req.method || 'GET';\n    const tracer = (0,next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.getTracer)();\n    const activeSpan = tracer.getActiveScopeSpan();\n    const context = {\n        params,\n        prerenderManifest,\n        renderOpts: {\n            experimental: {\n                cacheComponents: Boolean(nextConfig.experimental.cacheComponents),\n                authInterrupts: Boolean(nextConfig.experimental.authInterrupts)\n            },\n            supportsDynamicResponse,\n            incrementalCache: (0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'incrementalCache'),\n            cacheLifeProfiles: (_nextConfig_experimental = nextConfig.experimental) == null ? void 0 : _nextConfig_experimental.cacheLife,\n            isRevalidate,\n            waitUntil: ctx.waitUntil,\n            onClose: (cb)=>{\n                res.on('close', cb);\n            },\n            onAfterTaskError: undefined,\n            onInstrumentationRequestError: (error, _request, errorContext)=>routeModule.onRequestError(req, error, errorContext, routerServerContext)\n        },\n        sharedContext: {\n            buildId\n        }\n    };\n    const nodeNextReq = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextRequest(req);\n    const nodeNextRes = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextResponse(res);\n    const nextReq = next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.NextRequestAdapter.fromNodeNextRequest(nodeNextReq, (0,next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.signalFromNodeResponse)(res));\n    try {\n        const invokeRouteModule = async (span)=>{\n            return routeModule.handle(nextReq, context).finally(()=>{\n                if (!span) return;\n                span.setAttributes({\n                    'http.status_code': res.statusCode,\n                    'next.rsc': false\n                });\n                const rootSpanAttributes = tracer.getRootSpanAttributes();\n                // We were unable to get attributes, probably OTEL is not enabled\n                if (!rootSpanAttributes) {\n                    return;\n                }\n                if (rootSpanAttributes.get('next.span_type') !== next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest) {\n                    console.warn(`Unexpected root span type '${rootSpanAttributes.get('next.span_type')}'. Please report this Next.js issue https://github.com/vercel/next.js`);\n                    return;\n                }\n                const route = rootSpanAttributes.get('next.route');\n                if (route) {\n                    const name = `${method} ${route}`;\n                    span.setAttributes({\n                        'next.route': route,\n                        'http.route': route,\n                        'next.span_name': name\n                    });\n                    span.updateName(name);\n                } else {\n                    span.updateName(`${method} ${req.url}`);\n                }\n            });\n        };\n        const handleResponse = async (currentSpan)=>{\n            var _cacheEntry_value;\n            const responseGenerator = async ({ previousCacheEntry })=>{\n                try {\n                    if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isOnDemandRevalidate && revalidateOnlyGenerated && !previousCacheEntry) {\n                        res.statusCode = 404;\n                        // on-demand revalidate always sets this header\n                        res.setHeader('x-nextjs-cache', 'REVALIDATED');\n                        res.end('This page could not be found');\n                        return null;\n                    }\n                    const response = await invokeRouteModule(currentSpan);\n                    req.fetchMetrics = context.renderOpts.fetchMetrics;\n                    let pendingWaitUntil = context.renderOpts.pendingWaitUntil;\n                    // Attempt using provided waitUntil if available\n                    // if it's not we fallback to sendResponse's handling\n                    if (pendingWaitUntil) {\n                        if (ctx.waitUntil) {\n                            ctx.waitUntil(pendingWaitUntil);\n                            pendingWaitUntil = undefined;\n                        }\n                    }\n                    const cacheTags = context.renderOpts.collectedTags;\n                    // If the request is for a static response, we can cache it so long\n                    // as it's not edge.\n                    if (isIsr) {\n                        const blob = await response.blob();\n                        // Copy the headers from the response.\n                        const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.toNodeOutgoingHttpHeaders)(response.headers);\n                        if (cacheTags) {\n                            headers[next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER] = cacheTags;\n                        }\n                        if (!headers['content-type'] && blob.type) {\n                            headers['content-type'] = blob.type;\n                        }\n                        const revalidate = typeof context.renderOpts.collectedRevalidate === 'undefined' || context.renderOpts.collectedRevalidate >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? false : context.renderOpts.collectedRevalidate;\n                        const expire = typeof context.renderOpts.collectedExpire === 'undefined' || context.renderOpts.collectedExpire >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? undefined : context.renderOpts.collectedExpire;\n                        // Create the cache entry for the response.\n                        const cacheEntry = {\n                            value: {\n                                kind: next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE,\n                                status: response.status,\n                                body: Buffer.from(await blob.arrayBuffer()),\n                                headers\n                            },\n                            cacheControl: {\n                                revalidate,\n                                expire\n                            }\n                        };\n                        return cacheEntry;\n                    } else {\n                        // send response without caching if not ISR\n                        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, response, context.renderOpts.pendingWaitUntil);\n                        return null;\n                    }\n                } catch (err) {\n                    // if this is a background revalidate we need to report\n                    // the request error here as it won't be bubbled\n                    if (previousCacheEntry == null ? void 0 : previousCacheEntry.isStale) {\n                        await routeModule.onRequestError(req, err, {\n                            routerKind: 'App Router',\n                            routePath: srcPage,\n                            routeType: 'route',\n                            revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                                isRevalidate,\n                                isOnDemandRevalidate\n                            })\n                        }, routerServerContext);\n                    }\n                    throw err;\n                }\n            };\n            const cacheEntry = await routeModule.handleResponse({\n                req,\n                nextConfig,\n                cacheKey,\n                routeKind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n                isFallback: false,\n                prerenderManifest,\n                isRoutePPREnabled: false,\n                isOnDemandRevalidate,\n                revalidateOnlyGenerated,\n                responseGenerator,\n                waitUntil: ctx.waitUntil\n            });\n            // we don't create a cacheEntry for ISR\n            if (!isIsr) {\n                return null;\n            }\n            if ((cacheEntry == null ? void 0 : (_cacheEntry_value = cacheEntry.value) == null ? void 0 : _cacheEntry_value.kind) !== next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE) {\n                var _cacheEntry_value1;\n                throw Object.defineProperty(new Error(`Invariant: app-route received invalid cache entry ${cacheEntry == null ? void 0 : (_cacheEntry_value1 = cacheEntry.value) == null ? void 0 : _cacheEntry_value1.kind}`), \"__NEXT_ERROR_CODE\", {\n                    value: \"E701\",\n                    enumerable: false,\n                    configurable: true\n                });\n            }\n            if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode')) {\n                res.setHeader('x-nextjs-cache', isOnDemandRevalidate ? 'REVALIDATED' : cacheEntry.isMiss ? 'MISS' : cacheEntry.isStale ? 'STALE' : 'HIT');\n            }\n            // Draft mode should never be cached\n            if (isDraftMode) {\n                res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');\n            }\n            const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.fromNodeOutgoingHttpHeaders)(cacheEntry.value.headers);\n            if (!((0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isIsr)) {\n                headers.delete(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER);\n            }\n            // If cache control is already set on the response we don't\n            // override it to allow users to customize it via next.config\n            if (cacheEntry.cacheControl && !res.getHeader('Cache-Control') && !headers.get('Cache-Control')) {\n                headers.set('Cache-Control', (0,next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__.getCacheControlHeader)(cacheEntry.cacheControl));\n            }\n            await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(cacheEntry.value.body, {\n                headers,\n                status: cacheEntry.value.status || 200\n            }));\n            return null;\n        };\n        // TODO: activeSpan code path is for when wrapped by\n        // next-server can be removed when this is no longer used\n        if (activeSpan) {\n            await handleResponse(activeSpan);\n        } else {\n            await tracer.withPropagatedContext(req.headers, ()=>tracer.trace(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest, {\n                    spanName: `${method} ${req.url}`,\n                    kind: next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.SpanKind.SERVER,\n                    attributes: {\n                        'http.method': method,\n                        'http.target': req.url\n                    }\n                }, handleResponse));\n        }\n    } catch (err) {\n        if (!(err instanceof next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError)) {\n            await routeModule.onRequestError(req, err, {\n                routerKind: 'App Router',\n                routePath: normalizedSrcPage,\n                routeType: 'route',\n                revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                    isRevalidate,\n                    isOnDemandRevalidate\n                })\n            });\n        }\n        // rethrow so that we can handle serving error page\n        // If this is during static generation, throw the error again.\n        if (isIsr) throw err;\n        // Otherwise, send a 500 response.\n        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(null, {\n            status: 500\n        }));\n        return null;\n    }\n}\n\n//# sourceMappingURL=app-route.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjb21wYXJlLXByaWNlcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY29tcGFyZS1wcmljZXMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjb21wYXJlLXByaWNlcyUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNNYXJjZV9jY2QzbXp0JTVDRW54b3ZhbCU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDTWFyY2VfY2NkM216dCU1Q0VueG92YWwmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QmaXNHbG9iYWxOb3RGb3VuZEVuYWJsZWQ9ISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNkO0FBQ1M7QUFDTztBQUNLO0FBQ21DO0FBQ2pEO0FBQ087QUFDZjtBQUNzQztBQUN6QjtBQUNNO0FBQ0M7QUFDaEI7QUFDZ0M7QUFDbEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsYUFBYSxPQUFvQyxJQUFJLENBQUU7QUFDdkQsd0JBQXdCLE1BQXVDO0FBQy9EO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFB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LGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1YsNkVBQTZFLGdGQUFjO0FBQzNGLGlDQUFpQyxRQUFRLEVBQUUsUUFBUTtBQUNuRCwwQkFBMEIsdUVBQVE7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxNQUFNO0FBQ04sNkJBQTZCLDZGQUFlO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLDJGQUFtQjtBQUNyRDtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyw2RUFBWTtBQUMxQjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUEiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgeyBnZXRSZXF1ZXN0TWV0YSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JlcXVlc3QtbWV0YVwiO1xuaW1wb3J0IHsgZ2V0VHJhY2VyLCBTcGFuS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi90cmFjZS90cmFjZXJcIjtcbmltcG9ydCB7IG5vcm1hbGl6ZUFwcFBhdGggfSBmcm9tIFwibmV4dC9kaXN0L3NoYXJlZC9saWIvcm91dGVyL3V0aWxzL2FwcC1wYXRoc1wiO1xuaW1wb3J0IHsgTm9kZU5leHRSZXF1ZXN0LCBOb2RlTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvYmFzZS1odHRwL25vZGVcIjtcbmltcG9ydCB7IE5leHRSZXF1ZXN0QWRhcHRlciwgc2lnbmFsRnJvbU5vZGVSZXNwb25zZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3dlYi9zcGVjLWV4dGVuc2lvbi9hZGFwdGVycy9uZXh0LXJlcXVlc3RcIjtcbmltcG9ydCB7IEJhc2VTZXJ2ZXJTcGFuIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3RyYWNlL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZ2V0UmV2YWxpZGF0ZVJlYXNvbiB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2luc3RydW1lbnRhdGlvbi91dGlsc1wiO1xuaW1wb3J0IHsgc2VuZFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvc2VuZC1yZXNwb25zZVwiO1xuaW1wb3J0IHsgZnJvbU5vZGVPdXRnb2luZ0h0dHBIZWFkZXJzLCB0b05vZGVPdXRnb2luZ0h0dHBIZWFkZXJzIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL3V0aWxzXCI7XG5pbXBvcnQgeyBnZXRDYWNoZUNvbnRyb2xIZWFkZXIgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvY2FjaGUtY29udHJvbFwiO1xuaW1wb3J0IHsgSU5GSU5JVEVfQ0FDSEUsIE5FWFRfQ0FDSEVfVEFHU19IRUFERVIgfSBmcm9tIFwibmV4dC9kaXN0L2xpYi9jb25zdGFudHNcIjtcbmltcG9ydCB7IE5vRmFsbGJhY2tFcnJvciB9IGZyb20gXCJuZXh0L2Rpc3Qvc2hhcmVkL2xpYi9uby1mYWxsYmFjay1lcnJvci5leHRlcm5hbFwiO1xuaW1wb3J0IHsgQ2FjaGVkUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcmVzcG9uc2UtY2FjaGVcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxNYXJjZV9jY2QzbXp0XFxcXEVueG92YWxcXFxcYXBwXFxcXGFwaVxcXFxjb21wYXJlLXByaWNlc1xcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvY29tcGFyZS1wcmljZXMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9jb21wYXJlLXByaWNlc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvY29tcGFyZS1wcmljZXMvcm91dGVcIlxuICAgIH0sXG4gICAgZGlzdERpcjogcHJvY2Vzcy5lbnYuX19ORVhUX1JFTEFUSVZFX0RJU1RfRElSIHx8ICcnLFxuICAgIHJlbGF0aXZlUHJvamVjdERpcjogcHJvY2Vzcy5lbnYuX19ORVhUX1JFTEFUSVZFX1BST0pFQ1RfRElSIHx8ICcnLFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcTWFyY2VfY2NkM216dFxcXFxFbnhvdmFsXFxcXGFwcFxcXFxhcGlcXFxcY29tcGFyZS1wcmljZXNcXFxccm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcywgY3R4KSB7XG4gICAgdmFyIF9uZXh0Q29uZmlnX2V4cGVyaW1lbnRhbDtcbiAgICBsZXQgc3JjUGFnZSA9IFwiL2FwaS9jb21wYXJlLXByaWNlcy9yb3V0ZVwiO1xuICAgIC8vIHR1cmJvcGFjayBkb2Vzbid0IG5vcm1hbGl6ZSBgL2luZGV4YCBpbiB0aGUgcGFnZSBuYW1lXG4gICAgLy8gc28gd2UgbmVlZCB0byB0byBwcm9jZXNzIGR5bmFtaWMgcm91dGVzIHByb3Blcmx5XG4gICAgLy8gVE9ETzogZml4IHR1cmJvcGFjayBwcm92aWRpbmcgZGlmZmVyaW5nIHZhbHVlIGZyb20gd2VicGFja1xuICAgIGlmIChwcm9jZXNzLmVudi5UVVJCT1BBQ0spIHtcbiAgICAgICAgc3JjUGFnZSA9IHNyY1BhZ2UucmVwbGFjZSgvXFwvaW5kZXgkLywgJycpIHx8ICcvJztcbiAgICB9IGVsc2UgaWYgKHNyY1BhZ2UgPT09ICcvaW5kZXgnKSB7XG4gICAgICAgIC8vIHdlIGFsd2F5cyBub3JtYWxpemUgL2luZGV4IHNwZWNpZmljYWxseVxuICAgICAgICBzcmNQYWdlID0gJy8nO1xuICAgIH1cbiAgICBjb25zdCBtdWx0aVpvbmVEcmFmdE1vZGUgPSBwcm9jZXNzLmVudi5fX05FWFRfTVVMVElfWk9ORV9EUkFGVF9NT0RFO1xuICAgIGNvbnN0IHByZXBhcmVSZXN1bHQgPSBhd2FpdCByb3V0ZU1vZHVsZS5wcmVwYXJlKHJlcSwgcmVzLCB7XG4gICAgICAgIHNyY1BhZ2UsXG4gICAgICAgIG11bHRpWm9uZURyYWZ0TW9kZVxuICAgIH0pO1xuICAgIGlmICghcHJlcGFyZVJlc3VsdCkge1xuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcbiAgICAgICAgcmVzLmVuZCgnQmFkIFJlcXVlc3QnKTtcbiAgICAgICAgY3R4LndhaXRVbnRpbCA9PSBudWxsID8gdm9pZCAwIDogY3R4LndhaXRVbnRpbC5jYWxsKGN0eCwgUHJvbWlzZS5yZXNvbHZlKCkpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeyBidWlsZElkLCBwYXJhbXMsIG5leHRDb25maWcsIGlzRHJhZnRNb2RlLCBwcmVyZW5kZXJNYW5pZmVzdCwgcm91dGVyU2VydmVyQ29udGV4dCwgaXNPbkRlbWFuZFJldmFsaWRhdGUsIHJldmFsaWRhdGVPbmx5R2VuZXJhdGVkLCByZXNvbHZlZFBhdGhuYW1lIH0gPSBwcmVwYXJlUmVzdWx0O1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRTcmNQYWdlID0gbm9ybWFsaXplQXBwUGF0aChzcmNQYWdlKTtcbiAgICBsZXQgaXNJc3IgPSBCb29sZWFuKHByZXJlbmRlck1hbmlmZXN0LmR5bmFtaWNSb3V0ZXNbbm9ybWFsaXplZFNyY1BhZ2VdIHx8IHByZXJlbmRlck1hbmlmZXN0LnJvdXRlc1tyZXNvbHZlZFBhdGhuYW1lXSk7XG4gICAgaWYgKGlzSXNyICYmICFpc0RyYWZ0TW9kZSkge1xuICAgICAgICBjb25zdCBpc1ByZXJlbmRlcmVkID0gQm9vbGVhbihwcmVyZW5kZXJNYW5pZmVzdC5yb3V0ZXNbcmVzb2x2ZWRQYXRobmFtZV0pO1xuICAgICAgICBjb25zdCBwcmVyZW5kZXJJbmZvID0gcHJlcmVuZGVyTWFuaWZlc3QuZHluYW1pY1JvdXRlc1tub3JtYWxpemVkU3JjUGFnZV07XG4gICAgICAgIGlmIChwcmVyZW5kZXJJbmZvKSB7XG4gICAgICAgICAgICBpZiAocHJlcmVuZGVySW5mby5mYWxsYmFjayA9PT0gZmFsc2UgJiYgIWlzUHJlcmVuZGVyZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTm9GYWxsYmFja0Vycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IGNhY2hlS2V5ID0gbnVsbDtcbiAgICBpZiAoaXNJc3IgJiYgIXJvdXRlTW9kdWxlLmlzRGV2ICYmICFpc0RyYWZ0TW9kZSkge1xuICAgICAgICBjYWNoZUtleSA9IHJlc29sdmVkUGF0aG5hbWU7XG4gICAgICAgIC8vIGVuc3VyZSAvaW5kZXggYW5kIC8gaXMgbm9ybWFsaXplZCB0byBvbmUga2V5XG4gICAgICAgIGNhY2hlS2V5ID0gY2FjaGVLZXkgPT09ICcvaW5kZXgnID8gJy8nIDogY2FjaGVLZXk7XG4gICAgfVxuICAgIGNvbnN0IHN1cHBvcnRzRHluYW1pY1Jlc3BvbnNlID0gLy8gSWYgd2UncmUgaW4gZGV2ZWxvcG1lbnQsIHdlIGFsd2F5cyBzdXBwb3J0IGR5bmFtaWMgSFRNTFxuICAgIHJvdXRlTW9kdWxlLmlzRGV2ID09PSB0cnVlIHx8IC8vIElmIHRoaXMgaXMgbm90IFNTRyBvciBkb2VzIG5vdCBoYXZlIHN0YXRpYyBwYXRocywgdGhlbiBpdCBzdXBwb3J0c1xuICAgIC8vIGR5bmFtaWMgSFRNTC5cbiAgICAhaXNJc3I7XG4gICAgLy8gVGhpcyBpcyBhIHJldmFsaWRhdGlvbiByZXF1ZXN0IGlmIHRoZSByZXF1ZXN0IGlzIGZvciBhIHN0YXRpY1xuICAgIC8vIHBhZ2UgYW5kIGl0IGlzIG5vdCBiZWluZyByZXN1bWVkIGZyb20gYSBwb3N0cG9uZWQgcmVuZGVyIGFuZFxuICAgIC8vIGl0IGlzIG5vdCBhIGR5bmFtaWMgUlNDIHJlcXVlc3QgdGhlbiBpdCBpcyBhIHJldmFsaWRhdGlvblxuICAgIC8vIHJlcXVlc3QuXG4gICAgY29uc3QgaXNSZXZhbGlkYXRlID0gaXNJc3IgJiYgIXN1cHBvcnRzRHluYW1pY1Jlc3BvbnNlO1xuICAgIGNvbnN0IG1ldGhvZCA9IHJlcS5tZXRob2QgfHwgJ0dFVCc7XG4gICAgY29uc3QgdHJhY2VyID0gZ2V0VHJhY2VyKCk7XG4gICAgY29uc3QgYWN0aXZlU3BhbiA9IHRyYWNlci5nZXRBY3RpdmVTY29wZVNwYW4oKTtcbiAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHByZXJlbmRlck1hbmlmZXN0LFxuICAgICAgICByZW5kZXJPcHRzOiB7XG4gICAgICAgICAgICBleHBlcmltZW50YWw6IHtcbiAgICAgICAgICAgICAgICBjYWNoZUNvbXBvbmVudHM6IEJvb2xlYW4obmV4dENvbmZpZy5leHBlcmltZW50YWwuY2FjaGVDb21wb25lbnRzKSxcbiAgICAgICAgICAgICAgICBhdXRoSW50ZXJydXB0czogQm9vbGVhbihuZXh0Q29uZmlnLmV4cGVyaW1lbnRhbC5hdXRoSW50ZXJydXB0cylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdXBwb3J0c0R5bmFtaWNSZXNwb25zZSxcbiAgICAgICAgICAgIGluY3JlbWVudGFsQ2FjaGU6IGdldFJlcXVlc3RNZXRhKHJlcSwgJ2luY3JlbWVudGFsQ2FjaGUnKSxcbiAgICAgICAgICAgIGNhY2hlTGlmZVByb2ZpbGVzOiAoX25leHRDb25maWdfZXhwZXJpbWVudGFsID0gbmV4dENvbmZpZy5leHBlcmltZW50YWwpID09IG51bGwgPyB2b2lkIDAgOiBfbmV4dENvbmZpZ19leHBlcmltZW50YWwuY2FjaGVMaWZlLFxuICAgICAgICAgICAgaXNSZXZhbGlkYXRlLFxuICAgICAgICAgICAgd2FpdFVudGlsOiBjdHgud2FpdFVudGlsLFxuICAgICAgICAgICAgb25DbG9zZTogKGNiKT0+e1xuICAgICAgICAgICAgICAgIHJlcy5vbignY2xvc2UnLCBjYik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BZnRlclRhc2tFcnJvcjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgb25JbnN0cnVtZW50YXRpb25SZXF1ZXN0RXJyb3I6IChlcnJvciwgX3JlcXVlc3QsIGVycm9yQ29udGV4dCk9PnJvdXRlTW9kdWxlLm9uUmVxdWVzdEVycm9yKHJlcSwgZXJyb3IsIGVycm9yQ29udGV4dCwgcm91dGVyU2VydmVyQ29udGV4dClcbiAgICAgICAgfSxcbiAgICAgICAgc2hhcmVkQ29udGV4dDoge1xuICAgICAgICAgICAgYnVpbGRJZFxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBub2RlTmV4dFJlcSA9IG5ldyBOb2RlTmV4dFJlcXVlc3QocmVxKTtcbiAgICBjb25zdCBub2RlTmV4dFJlcyA9IG5ldyBOb2RlTmV4dFJlc3BvbnNlKHJlcyk7XG4gICAgY29uc3QgbmV4dFJlcSA9IE5leHRSZXF1ZXN0QWRhcHRlci5mcm9tTm9kZU5leHRSZXF1ZXN0KG5vZGVOZXh0UmVxLCBzaWduYWxGcm9tTm9kZVJlc3BvbnNlKHJlcykpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGludm9rZVJvdXRlTW9kdWxlID0gYXN5bmMgKHNwYW4pPT57XG4gICAgICAgICAgICByZXR1cm4gcm91dGVNb2R1bGUuaGFuZGxlKG5leHRSZXEsIGNvbnRleHQpLmZpbmFsbHkoKCk9PntcbiAgICAgICAgICAgICAgICBpZiAoIXNwYW4pIHJldHVybjtcbiAgICAgICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAnaHR0cC5zdGF0dXNfY29kZSc6IHJlcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgICAgICAgICAnbmV4dC5yc2MnOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3RTcGFuQXR0cmlidXRlcyA9IHRyYWNlci5nZXRSb290U3BhbkF0dHJpYnV0ZXMoKTtcbiAgICAgICAgICAgICAgICAvLyBXZSB3ZXJlIHVuYWJsZSB0byBnZXQgYXR0cmlidXRlcywgcHJvYmFibHkgT1RFTCBpcyBub3QgZW5hYmxlZFxuICAgICAgICAgICAgICAgIGlmICghcm9vdFNwYW5BdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJvb3RTcGFuQXR0cmlidXRlcy5nZXQoJ25leHQuc3Bhbl90eXBlJykgIT09IEJhc2VTZXJ2ZXJTcGFuLmhhbmRsZVJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmV4cGVjdGVkIHJvb3Qgc3BhbiB0eXBlICcke3Jvb3RTcGFuQXR0cmlidXRlcy5nZXQoJ25leHQuc3Bhbl90eXBlJyl9Jy4gUGxlYXNlIHJlcG9ydCB0aGlzIE5leHQuanMgaXNzdWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlcmNlbC9uZXh0LmpzYCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgcm91dGUgPSByb290U3BhbkF0dHJpYnV0ZXMuZ2V0KCduZXh0LnJvdXRlJyk7XG4gICAgICAgICAgICAgICAgaWYgKHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBgJHttZXRob2R9ICR7cm91dGV9YDtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICduZXh0LnJvdXRlJzogcm91dGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaHR0cC5yb3V0ZSc6IHJvdXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ25leHQuc3Bhbl9uYW1lJzogbmFtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbi51cGRhdGVOYW1lKG5hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4udXBkYXRlTmFtZShgJHttZXRob2R9ICR7cmVxLnVybH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaGFuZGxlUmVzcG9uc2UgPSBhc3luYyAoY3VycmVudFNwYW4pPT57XG4gICAgICAgICAgICB2YXIgX2NhY2hlRW50cnlfdmFsdWU7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZUdlbmVyYXRvciA9IGFzeW5jICh7IHByZXZpb3VzQ2FjaGVFbnRyeSB9KT0+e1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZ2V0UmVxdWVzdE1ldGEocmVxLCAnbWluaW1hbE1vZGUnKSAmJiBpc09uRGVtYW5kUmV2YWxpZGF0ZSAmJiByZXZhbGlkYXRlT25seUdlbmVyYXRlZCAmJiAhcHJldmlvdXNDYWNoZUVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9uLWRlbWFuZCByZXZhbGlkYXRlIGFsd2F5cyBzZXRzIHRoaXMgaGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCd4LW5leHRqcy1jYWNoZScsICdSRVZBTElEQVRFRCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgnVGhpcyBwYWdlIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBpbnZva2VSb3V0ZU1vZHVsZShjdXJyZW50U3Bhbik7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5mZXRjaE1ldHJpY3MgPSBjb250ZXh0LnJlbmRlck9wdHMuZmV0Y2hNZXRyaWNzO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGVuZGluZ1dhaXRVbnRpbCA9IGNvbnRleHQucmVuZGVyT3B0cy5wZW5kaW5nV2FpdFVudGlsO1xuICAgICAgICAgICAgICAgICAgICAvLyBBdHRlbXB0IHVzaW5nIHByb3ZpZGVkIHdhaXRVbnRpbCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQncyBub3Qgd2UgZmFsbGJhY2sgdG8gc2VuZFJlc3BvbnNlJ3MgaGFuZGxpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdXYWl0VW50aWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdHgud2FpdFVudGlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LndhaXRVbnRpbChwZW5kaW5nV2FpdFVudGlsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nV2FpdFVudGlsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlVGFncyA9IGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRUYWdzO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcmVxdWVzdCBpcyBmb3IgYSBzdGF0aWMgcmVzcG9uc2UsIHdlIGNhbiBjYWNoZSBpdCBzbyBsb25nXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzIGl0J3Mgbm90IGVkZ2UuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0lzcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvcHkgdGhlIGhlYWRlcnMgZnJvbSB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gdG9Ob2RlT3V0Z29pbmdIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZVRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzW05FWFRfQ0FDSEVfVEFHU19IRUFERVJdID0gY2FjaGVUYWdzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFoZWFkZXJzWydjb250ZW50LXR5cGUnXSAmJiBibG9iLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IGJsb2IudHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJldmFsaWRhdGUgPSB0eXBlb2YgY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZFJldmFsaWRhdGUgPT09ICd1bmRlZmluZWQnIHx8IGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRSZXZhbGlkYXRlID49IElORklOSVRFX0NBQ0hFID8gZmFsc2UgOiBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkUmV2YWxpZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4cGlyZSA9IHR5cGVvZiBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkRXhwaXJlID09PSAndW5kZWZpbmVkJyB8fCBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkRXhwaXJlID49IElORklOSVRFX0NBQ0hFID8gdW5kZWZpbmVkIDogY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZEV4cGlyZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgY2FjaGUgZW50cnkgZm9yIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlRW50cnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogQ2FjaGVkUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEJ1ZmZlci5mcm9tKGF3YWl0IGJsb2IuYXJyYXlCdWZmZXIoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlQ29udHJvbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXZhbGlkYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBpcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlRW50cnk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIHJlc3BvbnNlIHdpdGhvdXQgY2FjaGluZyBpZiBub3QgSVNSXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzZW5kUmVzcG9uc2Uobm9kZU5leHRSZXEsIG5vZGVOZXh0UmVzLCByZXNwb25zZSwgY29udGV4dC5yZW5kZXJPcHRzLnBlbmRpbmdXYWl0VW50aWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhpcyBpcyBhIGJhY2tncm91bmQgcmV2YWxpZGF0ZSB3ZSBuZWVkIHRvIHJlcG9ydFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcmVxdWVzdCBlcnJvciBoZXJlIGFzIGl0IHdvbid0IGJlIGJ1YmJsZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzQ2FjaGVFbnRyeSA9PSBudWxsID8gdm9pZCAwIDogcHJldmlvdXNDYWNoZUVudHJ5LmlzU3RhbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJvdXRlTW9kdWxlLm9uUmVxdWVzdEVycm9yKHJlcSwgZXJyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVyS2luZDogJ0FwcCBSb3V0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlUGF0aDogc3JjUGFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVR5cGU6ICdyb3V0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV2YWxpZGF0ZVJlYXNvbjogZ2V0UmV2YWxpZGF0ZVJlYXNvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmV2YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNPbkRlbWFuZFJldmFsaWRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgcm91dGVyU2VydmVyQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBjYWNoZUVudHJ5ID0gYXdhaXQgcm91dGVNb2R1bGUuaGFuZGxlUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgIHJlcSxcbiAgICAgICAgICAgICAgICBuZXh0Q29uZmlnLFxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxuICAgICAgICAgICAgICAgIHJvdXRlS2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgICAgICAgICBpc0ZhbGxiYWNrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcmVyZW5kZXJNYW5pZmVzdCxcbiAgICAgICAgICAgICAgICBpc1JvdXRlUFBSRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNPbkRlbWFuZFJldmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgcmV2YWxpZGF0ZU9ubHlHZW5lcmF0ZWQsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VHZW5lcmF0b3IsXG4gICAgICAgICAgICAgICAgd2FpdFVudGlsOiBjdHgud2FpdFVudGlsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IGNyZWF0ZSBhIGNhY2hlRW50cnkgZm9yIElTUlxuICAgICAgICAgICAgaWYgKCFpc0lzcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKChjYWNoZUVudHJ5ID09IG51bGwgPyB2b2lkIDAgOiAoX2NhY2hlRW50cnlfdmFsdWUgPSBjYWNoZUVudHJ5LnZhbHVlKSA9PSBudWxsID8gdm9pZCAwIDogX2NhY2hlRW50cnlfdmFsdWUua2luZCkgIT09IENhY2hlZFJvdXRlS2luZC5BUFBfUk9VVEUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2NhY2hlRW50cnlfdmFsdWUxO1xuICAgICAgICAgICAgICAgIHRocm93IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXcgRXJyb3IoYEludmFyaWFudDogYXBwLXJvdXRlIHJlY2VpdmVkIGludmFsaWQgY2FjaGUgZW50cnkgJHtjYWNoZUVudHJ5ID09IG51bGwgPyB2b2lkIDAgOiAoX2NhY2hlRW50cnlfdmFsdWUxID0gY2FjaGVFbnRyeS52YWx1ZSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9jYWNoZUVudHJ5X3ZhbHVlMS5raW5kfWApLCBcIl9fTkVYVF9FUlJPUl9DT0RFXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiRTcwMVwiLFxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWdldFJlcXVlc3RNZXRhKHJlcSwgJ21pbmltYWxNb2RlJykpIHtcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCd4LW5leHRqcy1jYWNoZScsIGlzT25EZW1hbmRSZXZhbGlkYXRlID8gJ1JFVkFMSURBVEVEJyA6IGNhY2hlRW50cnkuaXNNaXNzID8gJ01JU1MnIDogY2FjaGVFbnRyeS5pc1N0YWxlID8gJ1NUQUxFJyA6ICdISVQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIERyYWZ0IG1vZGUgc2hvdWxkIG5ldmVyIGJlIGNhY2hlZFxuICAgICAgICAgICAgaWYgKGlzRHJhZnRNb2RlKSB7XG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsICdwcml2YXRlLCBuby1jYWNoZSwgbm8tc3RvcmUsIG1heC1hZ2U9MCwgbXVzdC1yZXZhbGlkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gZnJvbU5vZGVPdXRnb2luZ0h0dHBIZWFkZXJzKGNhY2hlRW50cnkudmFsdWUuaGVhZGVycyk7XG4gICAgICAgICAgICBpZiAoIShnZXRSZXF1ZXN0TWV0YShyZXEsICdtaW5pbWFsTW9kZScpICYmIGlzSXNyKSkge1xuICAgICAgICAgICAgICAgIGhlYWRlcnMuZGVsZXRlKE5FWFRfQ0FDSEVfVEFHU19IRUFERVIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgY2FjaGUgY29udHJvbCBpcyBhbHJlYWR5IHNldCBvbiB0aGUgcmVzcG9uc2Ugd2UgZG9uJ3RcbiAgICAgICAgICAgIC8vIG92ZXJyaWRlIGl0IHRvIGFsbG93IHVzZXJzIHRvIGN1c3RvbWl6ZSBpdCB2aWEgbmV4dC5jb25maWdcbiAgICAgICAgICAgIGlmIChjYWNoZUVudHJ5LmNhY2hlQ29udHJvbCAmJiAhcmVzLmdldEhlYWRlcignQ2FjaGUtQ29udHJvbCcpICYmICFoZWFkZXJzLmdldCgnQ2FjaGUtQ29udHJvbCcpKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5zZXQoJ0NhY2hlLUNvbnRyb2wnLCBnZXRDYWNoZUNvbnRyb2xIZWFkZXIoY2FjaGVFbnRyeS5jYWNoZUNvbnRyb2wpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHNlbmRSZXNwb25zZShub2RlTmV4dFJlcSwgbm9kZU5leHRSZXMsIG5ldyBSZXNwb25zZShjYWNoZUVudHJ5LnZhbHVlLmJvZHksIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgICAgIHN0YXR1czogY2FjaGVFbnRyeS52YWx1ZS5zdGF0dXMgfHwgMjAwXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVE9ETzogYWN0aXZlU3BhbiBjb2RlIHBhdGggaXMgZm9yIHdoZW4gd3JhcHBlZCBieVxuICAgICAgICAvLyBuZXh0LXNlcnZlciBjYW4gYmUgcmVtb3ZlZCB3aGVuIHRoaXMgaXMgbm8gbG9uZ2VyIHVzZWRcbiAgICAgICAgaWYgKGFjdGl2ZVNwYW4pIHtcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZVJlc3BvbnNlKGFjdGl2ZVNwYW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdHJhY2VyLndpdGhQcm9wYWdhdGVkQ29udGV4dChyZXEuaGVhZGVycywgKCk9PnRyYWNlci50cmFjZShCYXNlU2VydmVyU3Bhbi5oYW5kbGVSZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHNwYW5OYW1lOiBgJHttZXRob2R9ICR7cmVxLnVybH1gLFxuICAgICAgICAgICAgICAgICAgICBraW5kOiBTcGFuS2luZC5TRVJWRVIsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdodHRwLm1ldGhvZCc6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdodHRwLnRhcmdldCc6IHJlcS51cmxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGhhbmRsZVJlc3BvbnNlKSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgTm9GYWxsYmFja0Vycm9yKSkge1xuICAgICAgICAgICAgYXdhaXQgcm91dGVNb2R1bGUub25SZXF1ZXN0RXJyb3IocmVxLCBlcnIsIHtcbiAgICAgICAgICAgICAgICByb3V0ZXJLaW5kOiAnQXBwIFJvdXRlcicsXG4gICAgICAgICAgICAgICAgcm91dGVQYXRoOiBub3JtYWxpemVkU3JjUGFnZSxcbiAgICAgICAgICAgICAgICByb3V0ZVR5cGU6ICdyb3V0ZScsXG4gICAgICAgICAgICAgICAgcmV2YWxpZGF0ZVJlYXNvbjogZ2V0UmV2YWxpZGF0ZVJlYXNvbih7XG4gICAgICAgICAgICAgICAgICAgIGlzUmV2YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgaXNPbkRlbWFuZFJldmFsaWRhdGVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmV0aHJvdyBzbyB0aGF0IHdlIGNhbiBoYW5kbGUgc2VydmluZyBlcnJvciBwYWdlXG4gICAgICAgIC8vIElmIHRoaXMgaXMgZHVyaW5nIHN0YXRpYyBnZW5lcmF0aW9uLCB0aHJvdyB0aGUgZXJyb3IgYWdhaW4uXG4gICAgICAgIGlmIChpc0lzcikgdGhyb3cgZXJyO1xuICAgICAgICAvLyBPdGhlcndpc2UsIHNlbmQgYSA1MDAgcmVzcG9uc2UuXG4gICAgICAgIGF3YWl0IHNlbmRSZXNwb25zZShub2RlTmV4dFJlcSwgbm9kZU5leHRSZXMsIG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICAgICAgICBzdGF0dXM6IDUwMFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcFxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompare-prices%2Froute&page=%2Fapi%2Fcompare-prices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompare-prices%2Froute.js&appDir=C%3A%5CUsers%5CMarce_ccd3mzt%5CEnxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMarce_ccd3mzt%5CEnxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "./work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "?4c03":
/*!***********************!*\
  !*** debug (ignored) ***!
  \***********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "http2":
/*!************************!*\
  !*** external "http2" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("http2");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "next/dist/shared/lib/no-fallback-error.external":
/*!******************************************************************!*\
  !*** external "next/dist/shared/lib/no-fallback-error.external" ***!
  \******************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/no-fallback-error.external");

/***/ }),

/***/ "next/dist/shared/lib/router/utils/app-paths":
/*!**************************************************************!*\
  !*** external "next/dist/shared/lib/router/utils/app-paths" ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/app-paths");

/***/ }),

/***/ "node:assert":
/*!******************************!*\
  !*** external "node:assert" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:assert");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:async_hooks");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:buffer");

/***/ }),

/***/ "node:console":
/*!*******************************!*\
  !*** external "node:console" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:console");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:crypto");

/***/ }),

/***/ "node:diagnostics_channel":
/*!*******************************************!*\
  !*** external "node:diagnostics_channel" ***!
  \*******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:diagnostics_channel");

/***/ }),

/***/ "node:dns":
/*!***************************!*\
  !*** external "node:dns" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:dns");

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ "node:fs/promises":
/*!***********************************!*\
  !*** external "node:fs/promises" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs/promises");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http");

/***/ }),

/***/ "node:http2":
/*!*****************************!*\
  !*** external "node:http2" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http2");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:net");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "node:perf_hooks":
/*!**********************************!*\
  !*** external "node:perf_hooks" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:perf_hooks");

/***/ }),

/***/ "node:querystring":
/*!***********************************!*\
  !*** external "node:querystring" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:querystring");

/***/ }),

/***/ "node:sqlite":
/*!******************************!*\
  !*** external "node:sqlite" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:sqlite");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream");

/***/ }),

/***/ "node:timers":
/*!******************************!*\
  !*** external "node:timers" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:timers");

/***/ }),

/***/ "node:tls":
/*!***************************!*\
  !*** external "node:tls" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:tls");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "node:util/types":
/*!**********************************!*\
  !*** external "node:util/types" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util/types");

/***/ }),

/***/ "node:worker_threads":
/*!**************************************!*\
  !*** external "node:worker_threads" ***!
  \**************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:worker_threads");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:zlib");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "string_decoder":
/*!*********************************!*\
  !*** external "string_decoder" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("string_decoder");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/undici","vendor-chunks/cheerio","vendor-chunks/axios","vendor-chunks/cheerio-select","vendor-chunks/parse5-htmlparser2-tree-adapter","vendor-chunks/iconv-lite","vendor-chunks/parse5-parser-stream","vendor-chunks/asynckit","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/encoding-sniffer","vendor-chunks/call-bind-apply-helpers","vendor-chunks/nth-check","vendor-chunks/get-proto","vendor-chunks/mime-db","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/function-bind","vendor-chunks/follow-redirects","vendor-chunks/css-what","vendor-chunks/proxy-from-env","vendor-chunks/domelementtype","vendor-chunks/safer-buffer","vendor-chunks/mime-types","vendor-chunks/hasown","vendor-chunks/has-tostringtag","vendor-chunks/get-intrinsic","vendor-chunks/es-set-tostringtag","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/delayed-stream","vendor-chunks/combined-stream","vendor-chunks/boolbase"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompare-prices%2Froute&page=%2Fapi%2Fcompare-prices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompare-prices%2Froute.js&appDir=C%3A%5CUsers%5CMarce_ccd3mzt%5CEnxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMarce_ccd3mzt%5CEnxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!")));
module.exports = __webpack_exports__;

})();