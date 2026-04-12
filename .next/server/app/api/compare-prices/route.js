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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ \"(rsc)/./node_modules/axios/lib/axios.js\");\n/* harmony import */ var cheerio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cheerio */ \"(rsc)/./node_modules/cheerio/dist/esm/index.js\");\n/**\n * POST /api/compare-prices\n * Body: { productName: string }\n *\n * Busca preços em múltiplas fontes GRATUITAS e sem API key:\n *  1. API pública do Mercado Livre (oficial, estável)\n *  2. API pública do Buscapé (JSON endpoint)\n *  3. Scraping do Zoom.com.br como fallback\n */ \n\nconst TIMEOUT = 10000;\nconst UA = \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36\";\n/* ════════════════════════════════════════\n   FONTE 1 — Mercado Livre API (gratuita, oficial)\n   Docs: https://developers.mercadolivre.com.br/\n════════════════════════════════════════ */ async function searchMercadoLivre(productName) {\n    const q = encodeURIComponent(productName);\n    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${q}&limit=6`;\n    const { data } = await axios__WEBPACK_IMPORTED_MODULE_1__[\"default\"].get(url, {\n        timeout: TIMEOUT,\n        headers: {\n            \"Accept\": \"application/json\"\n        }\n    });\n    return (data.results || []).filter((item)=>item.price > 0 && item.condition !== \"used\").slice(0, 4).map((item)=>({\n            store: \"Mercado Livre\",\n            price: item.price,\n            url: item.permalink,\n            image: item.thumbnail?.replace(\"I.jpg\", \"O.jpg\") || item.thumbnail,\n            inStock: item.available_quantity > 0,\n            source: \"mercadolivre\"\n        }));\n}\n/* ════════════════════════════════════════\n   FONTE 2 — Amazon BR via scraping\n════════════════════════════════════════ */ async function searchAmazon(productName) {\n    const q = encodeURIComponent(productName);\n    const url = `https://www.amazon.com.br/s?k=${q}&language=pt_BR`;\n    const { data: html } = await axios__WEBPACK_IMPORTED_MODULE_1__[\"default\"].get(url, {\n        timeout: TIMEOUT,\n        headers: {\n            \"User-Agent\": UA,\n            \"Accept-Language\": \"pt-BR,pt;q=0.9\",\n            \"Accept\": \"text/html\"\n        }\n    });\n    const $ = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(html);\n    const offers = [];\n    $('[data-component-type=\"s-search-result\"]').each((i, el)=>{\n        if (i >= 3) return;\n        const card = $(el);\n        const title = card.find(\"h2 span\").first().text().trim();\n        if (!title) return;\n        // Preço: tenta formato \"R$ XX,XX\"\n        const wholeText = card.find(\".a-price-whole\").first().text().replace(/\\D/g, \"\");\n        const fracText = card.find(\".a-price-fraction\").first().text().replace(/\\D/g, \"\");\n        const priceStr = wholeText && fracText ? `${wholeText}.${fracText}` : wholeText;\n        const price = parseFloat(priceStr);\n        const relUrl = card.find(\"h2 a\").first().attr(\"href\");\n        const imgUrl = card.find(\"img.s-image\").first().attr(\"src\");\n        if (price > 0 && relUrl) {\n            offers.push({\n                store: \"Amazon\",\n                price,\n                url: `https://www.amazon.com.br${relUrl}`,\n                image: imgUrl || null,\n                inStock: true,\n                source: \"amazon\"\n            });\n        }\n    });\n    return offers;\n}\n/* ════════════════════════════════════════\n   FONTE 3 — Zoom.com.br (JSON embutido na página)\n════════════════════════════════════════ */ async function searchZoom(productName) {\n    const q = encodeURIComponent(productName);\n    const url = `https://www.zoom.com.br/search?q=${q}`;\n    const { data: html } = await axios__WEBPACK_IMPORTED_MODULE_1__[\"default\"].get(url, {\n        timeout: TIMEOUT,\n        headers: {\n            \"User-Agent\": UA,\n            \"Accept-Language\": \"pt-BR,pt;q=0.9\",\n            \"Accept\": \"text/html\"\n        }\n    });\n    const $ = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(html);\n    const offers = [];\n    // Zoom injeta dados em JSON dentro de __NEXT_DATA__\n    const nextDataScript = $(\"#__NEXT_DATA__\").html();\n    if (nextDataScript) {\n        try {\n            const json = JSON.parse(nextDataScript);\n            // Navega pela estrutura do Next.js data\n            const products = json?.props?.pageProps?.results || json?.props?.pageProps?.initialState?.search?.results || json?.props?.pageProps?.data?.products || [];\n            for (const p of products.slice(0, 4)){\n                const price = parseFloat(p.minPrice || p.price || p.bestPrice || 0);\n                if (price > 0) {\n                    offers.push({\n                        store: p.storeName || p.store?.name || \"Zoom\",\n                        price,\n                        url: p.url ? `https://www.zoom.com.br${p.url}` : url,\n                        image: p.image || p.thumbnail || null,\n                        inStock: true,\n                        source: \"zoom\"\n                    });\n                }\n            }\n        } catch  {}\n    }\n    // Fallback: scraping visual\n    if (!offers.length) {\n        // Tenta encontrar preços em elementos comuns\n        $(\"[class*='Price'], [class*='price']\").each((i, el)=>{\n            if (i >= 6 || offers.length >= 3) return;\n            const text = $(el).text().trim();\n            const match = text.match(/R\\$\\s*([\\d.,]+)/);\n            if (match) {\n                const price = parseFloat(match[1].replace(/\\./g, \"\").replace(\",\", \".\"));\n                if (price > 0) {\n                    offers.push({\n                        store: \"Zoom\",\n                        price,\n                        url,\n                        image: null,\n                        inStock: true,\n                        source: \"zoom-fallback\"\n                    });\n                }\n            }\n        });\n    }\n    return offers;\n}\n/* ════════════════════════════════════════\n   FONTE 4 — Google Shopping scraping\n════════════════════════════════════════ */ async function searchGoogleShopping(productName) {\n    const q = encodeURIComponent(`${productName} comprar Brasil`);\n    const url = `https://www.google.com.br/search?q=${q}&tbm=shop&gl=br&hl=pt-BR&num=6`;\n    const { data: html } = await axios__WEBPACK_IMPORTED_MODULE_1__[\"default\"].get(url, {\n        timeout: TIMEOUT,\n        headers: {\n            \"User-Agent\": UA,\n            \"Accept-Language\": \"pt-BR,pt;q=0.9\",\n            \"Accept\": \"text/html\"\n        }\n    });\n    const $ = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(html);\n    const offers = [];\n    // Google Shopping — estrutura de resultados\n    $(\".sh-dgr__content, .KZmu8e, .mnIHsc\").each((i, el)=>{\n        if (i >= 4) return;\n        const card = $(el);\n        const priceText = card.find(\".HRLxBb, .a8Pemb, [class*='price']\").first().text();\n        const store = card.find(\".aULzUe, .E5ocAb, .LbUacb\").first().text().trim();\n        const match = priceText.match(/R\\$\\s*([\\d.,]+)/);\n        if (!match) return;\n        const price = parseFloat(match[1].replace(/\\./g, \"\").replace(\",\", \".\"));\n        if (price > 0 && store) {\n            offers.push({\n                store,\n                price,\n                url: url,\n                image: null,\n                inStock: true,\n                source: \"google\"\n            });\n        }\n    });\n    return offers;\n}\n/* ════════════════════════════════════════\n   DEDUPLICAR E ORDENAR\n════════════════════════════════════════ */ function dedupeAndSort(offers) {\n    const seen = new Set();\n    return offers.filter((o)=>{\n        if (!o.price || o.price <= 0) return false;\n        const key = `${o.store.toLowerCase()}-${Math.round(o.price)}`;\n        if (seen.has(key)) return false;\n        seen.add(key);\n        return true;\n    }).sort((a, b)=>a.price - b.price).slice(0, 6);\n}\n/* ════════════════════════════════════════\n   HANDLER PRINCIPAL\n════════════════════════════════════════ */ async function POST(req) {\n    let productName;\n    try {\n        ({ productName } = await req.json());\n    } catch  {\n        return Response.json({\n            error: \"Body inválido\"\n        }, {\n            status: 400\n        });\n    }\n    if (!productName?.trim()) {\n        return Response.json({\n            error: \"Nome obrigatório\"\n        }, {\n            status: 400\n        });\n    }\n    const allOffers = [];\n    const errors = [];\n    // Executa todas as fontes em paralelo\n    const results = await Promise.allSettled([\n        searchMercadoLivre(productName),\n        searchAmazon(productName),\n        searchZoom(productName),\n        searchGoogleShopping(productName)\n    ]);\n    const labels = [\n        \"MercadoLivre\",\n        \"Amazon\",\n        \"Zoom\",\n        \"Google\"\n    ];\n    results.forEach((r, i)=>{\n        if (r.status === \"fulfilled\") {\n            allOffers.push(...r.value);\n        } else {\n            errors.push(`${labels[i]}: ${r.reason?.message}`);\n            console.warn(`[compare-prices] ${labels[i]} falhou:`, r.reason?.message);\n        }\n    });\n    const offers = dedupeAndSort(allOffers);\n    console.log(`[compare-prices] \"${productName}\" → ${offers.length} ofertas (${allOffers.length} brutas)`);\n    return Response.json({\n        offers,\n        ... true && {\n            debug: {\n                errors,\n                total: allOffers.length\n            }\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFlBQVksSUFBSSxFQUFFMkIsT0FBT2lDLE1BQU0sQ0FBQyxVQUFVLEVBQUVzQixVQUFVdEIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUV2RyxPQUFPbUIsU0FBU2hDLElBQUksQ0FBQztRQUNuQnBCO1FBQ0EsR0FBSW9FLEtBQXNDLElBQUk7WUFBRUMsT0FBTztnQkFBRWI7Z0JBQVFjLE9BQU9mLFVBQVV0QixNQUFNO1lBQUM7UUFBRSxDQUFDO0lBQzlGO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbWF0aGVcXGVueG92YWxcXGFwcFxcYXBpXFxjb21wYXJlLXByaWNlc1xccm91dGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBQT1NUIC9hcGkvY29tcGFyZS1wcmljZXNcbiAqIEJvZHk6IHsgcHJvZHVjdE5hbWU6IHN0cmluZyB9XG4gKlxuICogQnVzY2EgcHJlw6dvcyBlbSBtw7psdGlwbGFzIGZvbnRlcyBHUkFUVUlUQVMgZSBzZW0gQVBJIGtleTpcbiAqICAxLiBBUEkgcMO6YmxpY2EgZG8gTWVyY2FkbyBMaXZyZSAob2ZpY2lhbCwgZXN0w6F2ZWwpXG4gKiAgMi4gQVBJIHDDumJsaWNhIGRvIEJ1c2NhcMOpIChKU09OIGVuZHBvaW50KVxuICogIDMuIFNjcmFwaW5nIGRvIFpvb20uY29tLmJyIGNvbW8gZmFsbGJhY2tcbiAqL1xuXG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQgKiBhcyBjaGVlcmlvIGZyb20gXCJjaGVlcmlvXCI7XG5cbmNvbnN0IFRJTUVPVVQgPSAxMF8wMDA7XG5jb25zdCBVQSA9IFwiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyNC4wLjAuMCBTYWZhcmkvNTM3LjM2XCI7XG5cbi8qIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkFxuICAgRk9OVEUgMSDigJQgTWVyY2FkbyBMaXZyZSBBUEkgKGdyYXR1aXRhLCBvZmljaWFsKVxuICAgRG9jczogaHR0cHM6Ly9kZXZlbG9wZXJzLm1lcmNhZG9saXZyZS5jb20uYnIvXG7ilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaE1lcmNhZG9MaXZyZShwcm9kdWN0TmFtZSkge1xuICBjb25zdCBxID0gZW5jb2RlVVJJQ29tcG9uZW50KHByb2R1Y3ROYW1lKTtcbiAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBpLm1lcmNhZG9saWJyZS5jb20vc2l0ZXMvTUxCL3NlYXJjaD9xPSR7cX0mbGltaXQ9NmA7XG5cbiAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBheGlvcy5nZXQodXJsLCB7XG4gICAgdGltZW91dDogVElNRU9VVCxcbiAgICBoZWFkZXJzOiB7IFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gIH0pO1xuXG4gIHJldHVybiAoZGF0YS5yZXN1bHRzIHx8IFtdKVxuICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtLnByaWNlID4gMCAmJiBpdGVtLmNvbmRpdGlvbiAhPT0gXCJ1c2VkXCIpXG4gICAgLnNsaWNlKDAsIDQpXG4gICAgLm1hcChpdGVtID0+ICh7XG4gICAgICBzdG9yZTogICBcIk1lcmNhZG8gTGl2cmVcIixcbiAgICAgIHByaWNlOiAgIGl0ZW0ucHJpY2UsXG4gICAgICB1cmw6ICAgICBpdGVtLnBlcm1hbGluayxcbiAgICAgIGltYWdlOiAgIGl0ZW0udGh1bWJuYWlsPy5yZXBsYWNlKFwiSS5qcGdcIiwgXCJPLmpwZ1wiKSB8fCBpdGVtLnRodW1ibmFpbCxcbiAgICAgIGluU3RvY2s6IGl0ZW0uYXZhaWxhYmxlX3F1YW50aXR5ID4gMCxcbiAgICAgIHNvdXJjZTogIFwibWVyY2Fkb2xpdnJlXCIsXG4gICAgfSkpO1xufVxuXG4vKiDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZBcbiAgIEZPTlRFIDIg4oCUIEFtYXpvbiBCUiB2aWEgc2NyYXBpbmdcbuKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkCAqL1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoQW1hem9uKHByb2R1Y3ROYW1lKSB7XG4gIGNvbnN0IHEgPSBlbmNvZGVVUklDb21wb25lbnQocHJvZHVjdE5hbWUpO1xuICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuYW1hem9uLmNvbS5ici9zP2s9JHtxfSZsYW5ndWFnZT1wdF9CUmA7XG5cbiAgY29uc3QgeyBkYXRhOiBodG1sIH0gPSBhd2FpdCBheGlvcy5nZXQodXJsLCB7XG4gICAgdGltZW91dDogVElNRU9VVCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICBcIlVzZXItQWdlbnRcIjogVUEsXG4gICAgICBcIkFjY2VwdC1MYW5ndWFnZVwiOiBcInB0LUJSLHB0O3E9MC45XCIsXG4gICAgICBcIkFjY2VwdFwiOiBcInRleHQvaHRtbFwiLFxuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0ICQgPSBjaGVlcmlvLmxvYWQoaHRtbCk7XG4gIGNvbnN0IG9mZmVycyA9IFtdO1xuXG4gICQoJ1tkYXRhLWNvbXBvbmVudC10eXBlPVwicy1zZWFyY2gtcmVzdWx0XCJdJykuZWFjaCgoaSwgZWwpID0+IHtcbiAgICBpZiAoaSA+PSAzKSByZXR1cm47XG4gICAgY29uc3QgY2FyZCA9ICQoZWwpO1xuXG4gICAgY29uc3QgdGl0bGUgPSBjYXJkLmZpbmQoXCJoMiBzcGFuXCIpLmZpcnN0KCkudGV4dCgpLnRyaW0oKTtcbiAgICBpZiAoIXRpdGxlKSByZXR1cm47XG5cbiAgICAvLyBQcmXDp286IHRlbnRhIGZvcm1hdG8gXCJSJCBYWCxYWFwiXG4gICAgY29uc3Qgd2hvbGVUZXh0ID0gY2FyZC5maW5kKFwiLmEtcHJpY2Utd2hvbGVcIikuZmlyc3QoKS50ZXh0KCkucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgIGNvbnN0IGZyYWNUZXh0ICA9IGNhcmQuZmluZChcIi5hLXByaWNlLWZyYWN0aW9uXCIpLmZpcnN0KCkudGV4dCgpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICBjb25zdCBwcmljZVN0ciAgPSB3aG9sZVRleHQgJiYgZnJhY1RleHQgPyBgJHt3aG9sZVRleHR9LiR7ZnJhY1RleHR9YCA6IHdob2xlVGV4dDtcbiAgICBjb25zdCBwcmljZSAgICAgPSBwYXJzZUZsb2F0KHByaWNlU3RyKTtcblxuICAgIGNvbnN0IHJlbFVybCA9IGNhcmQuZmluZChcImgyIGFcIikuZmlyc3QoKS5hdHRyKFwiaHJlZlwiKTtcbiAgICBjb25zdCBpbWdVcmwgPSBjYXJkLmZpbmQoXCJpbWcucy1pbWFnZVwiKS5maXJzdCgpLmF0dHIoXCJzcmNcIik7XG5cbiAgICBpZiAocHJpY2UgPiAwICYmIHJlbFVybCkge1xuICAgICAgb2ZmZXJzLnB1c2goe1xuICAgICAgICBzdG9yZTogICBcIkFtYXpvblwiLFxuICAgICAgICBwcmljZSxcbiAgICAgICAgdXJsOiAgICAgYGh0dHBzOi8vd3d3LmFtYXpvbi5jb20uYnIke3JlbFVybH1gLFxuICAgICAgICBpbWFnZTogICBpbWdVcmwgfHwgbnVsbCxcbiAgICAgICAgaW5TdG9jazogdHJ1ZSxcbiAgICAgICAgc291cmNlOiAgXCJhbWF6b25cIixcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9mZmVycztcbn1cblxuLyog4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQXG4gICBGT05URSAzIOKAlCBab29tLmNvbS5iciAoSlNPTiBlbWJ1dGlkbyBuYSBww6FnaW5hKVxu4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hab29tKHByb2R1Y3ROYW1lKSB7XG4gIGNvbnN0IHEgPSBlbmNvZGVVUklDb21wb25lbnQocHJvZHVjdE5hbWUpO1xuICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuem9vbS5jb20uYnIvc2VhcmNoP3E9JHtxfWA7XG5cbiAgY29uc3QgeyBkYXRhOiBodG1sIH0gPSBhd2FpdCBheGlvcy5nZXQodXJsLCB7XG4gICAgdGltZW91dDogVElNRU9VVCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICBcIlVzZXItQWdlbnRcIjogVUEsXG4gICAgICBcIkFjY2VwdC1MYW5ndWFnZVwiOiBcInB0LUJSLHB0O3E9MC45XCIsXG4gICAgICBcIkFjY2VwdFwiOiBcInRleHQvaHRtbFwiLFxuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0ICQgPSBjaGVlcmlvLmxvYWQoaHRtbCk7XG4gIGNvbnN0IG9mZmVycyA9IFtdO1xuXG4gIC8vIFpvb20gaW5qZXRhIGRhZG9zIGVtIEpTT04gZGVudHJvIGRlIF9fTkVYVF9EQVRBX19cbiAgY29uc3QgbmV4dERhdGFTY3JpcHQgPSAkKFwiI19fTkVYVF9EQVRBX19cIikuaHRtbCgpO1xuICBpZiAobmV4dERhdGFTY3JpcHQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobmV4dERhdGFTY3JpcHQpO1xuICAgICAgLy8gTmF2ZWdhIHBlbGEgZXN0cnV0dXJhIGRvIE5leHQuanMgZGF0YVxuICAgICAgY29uc3QgcHJvZHVjdHMgPVxuICAgICAgICBqc29uPy5wcm9wcz8ucGFnZVByb3BzPy5yZXN1bHRzIHx8XG4gICAgICAgIGpzb24/LnByb3BzPy5wYWdlUHJvcHM/LmluaXRpYWxTdGF0ZT8uc2VhcmNoPy5yZXN1bHRzIHx8XG4gICAgICAgIGpzb24/LnByb3BzPy5wYWdlUHJvcHM/LmRhdGE/LnByb2R1Y3RzIHx8XG4gICAgICAgIFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IHAgb2YgcHJvZHVjdHMuc2xpY2UoMCwgNCkpIHtcbiAgICAgICAgY29uc3QgcHJpY2UgPSBwYXJzZUZsb2F0KHAubWluUHJpY2UgfHwgcC5wcmljZSB8fCBwLmJlc3RQcmljZSB8fCAwKTtcbiAgICAgICAgaWYgKHByaWNlID4gMCkge1xuICAgICAgICAgIG9mZmVycy5wdXNoKHtcbiAgICAgICAgICAgIHN0b3JlOiAgIHAuc3RvcmVOYW1lIHx8IHAuc3RvcmU/Lm5hbWUgfHwgXCJab29tXCIsXG4gICAgICAgICAgICBwcmljZSxcbiAgICAgICAgICAgIHVybDogICAgIHAudXJsID8gYGh0dHBzOi8vd3d3Lnpvb20uY29tLmJyJHtwLnVybH1gIDogdXJsLFxuICAgICAgICAgICAgaW1hZ2U6ICAgcC5pbWFnZSB8fCBwLnRodW1ibmFpbCB8fCBudWxsLFxuICAgICAgICAgICAgaW5TdG9jazogdHJ1ZSxcbiAgICAgICAgICAgIHNvdXJjZTogIFwiem9vbVwiLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7IC8qIEpTT04gaW52w6FsaWRvLCB0ZW50YSBzY3JhcGluZyBub3JtYWwgKi8gfVxuICB9XG5cbiAgLy8gRmFsbGJhY2s6IHNjcmFwaW5nIHZpc3VhbFxuICBpZiAoIW9mZmVycy5sZW5ndGgpIHtcbiAgICAvLyBUZW50YSBlbmNvbnRyYXIgcHJlw6dvcyBlbSBlbGVtZW50b3MgY29tdW5zXG4gICAgJChcIltjbGFzcyo9J1ByaWNlJ10sIFtjbGFzcyo9J3ByaWNlJ11cIikuZWFjaCgoaSwgZWwpID0+IHtcbiAgICAgIGlmIChpID49IDYgfHwgb2ZmZXJzLmxlbmd0aCA+PSAzKSByZXR1cm47XG4gICAgICBjb25zdCB0ZXh0ID0gJChlbCkudGV4dCgpLnRyaW0oKTtcbiAgICAgIGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaCgvUlxcJFxccyooW1xcZC4sXSspLyk7XG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgY29uc3QgcHJpY2UgPSBwYXJzZUZsb2F0KFxuICAgICAgICAgIG1hdGNoWzFdLnJlcGxhY2UoL1xcLi9nLCBcIlwiKS5yZXBsYWNlKFwiLFwiLCBcIi5cIilcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHByaWNlID4gMCkge1xuICAgICAgICAgIG9mZmVycy5wdXNoKHtcbiAgICAgICAgICAgIHN0b3JlOiAgIFwiWm9vbVwiLFxuICAgICAgICAgICAgcHJpY2UsXG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBpbWFnZTogICBudWxsLFxuICAgICAgICAgICAgaW5TdG9jazogdHJ1ZSxcbiAgICAgICAgICAgIHNvdXJjZTogIFwiem9vbS1mYWxsYmFja1wiLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gb2ZmZXJzO1xufVxuXG4vKiDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZBcbiAgIEZPTlRFIDQg4oCUIEdvb2dsZSBTaG9wcGluZyBzY3JhcGluZ1xu4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQICovXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hHb29nbGVTaG9wcGluZyhwcm9kdWN0TmFtZSkge1xuICBjb25zdCBxID0gZW5jb2RlVVJJQ29tcG9uZW50KGAke3Byb2R1Y3ROYW1lfSBjb21wcmFyIEJyYXNpbGApO1xuICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS5ici9zZWFyY2g/cT0ke3F9JnRibT1zaG9wJmdsPWJyJmhsPXB0LUJSJm51bT02YDtcblxuICBjb25zdCB7IGRhdGE6IGh0bWwgfSA9IGF3YWl0IGF4aW9zLmdldCh1cmwsIHtcbiAgICB0aW1lb3V0OiBUSU1FT1VULFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIFwiVXNlci1BZ2VudFwiOiBVQSxcbiAgICAgIFwiQWNjZXB0LUxhbmd1YWdlXCI6IFwicHQtQlIscHQ7cT0wLjlcIixcbiAgICAgIFwiQWNjZXB0XCI6IFwidGV4dC9odG1sXCIsXG4gICAgfSxcbiAgfSk7XG5cbiAgY29uc3QgJCA9IGNoZWVyaW8ubG9hZChodG1sKTtcbiAgY29uc3Qgb2ZmZXJzID0gW107XG5cbiAgLy8gR29vZ2xlIFNob3BwaW5nIOKAlCBlc3RydXR1cmEgZGUgcmVzdWx0YWRvc1xuICAkKFwiLnNoLWRncl9fY29udGVudCwgLktabXU4ZSwgLm1uSUhzY1wiKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgIGlmIChpID49IDQpIHJldHVybjtcbiAgICBjb25zdCBjYXJkID0gJChlbCk7XG5cbiAgICBjb25zdCBwcmljZVRleHQgPSBjYXJkLmZpbmQoXCIuSFJMeEJiLCAuYThQZW1iLCBbY2xhc3MqPSdwcmljZSddXCIpLmZpcnN0KCkudGV4dCgpO1xuICAgIGNvbnN0IHN0b3JlICAgICA9IGNhcmQuZmluZChcIi5hVUx6VWUsIC5FNW9jQWIsIC5MYlVhY2JcIikuZmlyc3QoKS50ZXh0KCkudHJpbSgpO1xuXG4gICAgY29uc3QgbWF0Y2ggPSBwcmljZVRleHQubWF0Y2goL1JcXCRcXHMqKFtcXGQuLF0rKS8pO1xuICAgIGlmICghbWF0Y2gpIHJldHVybjtcblxuICAgIGNvbnN0IHByaWNlID0gcGFyc2VGbG9hdChcbiAgICAgIG1hdGNoWzFdLnJlcGxhY2UoL1xcLi9nLCBcIlwiKS5yZXBsYWNlKFwiLFwiLCBcIi5cIilcbiAgICApO1xuXG4gICAgaWYgKHByaWNlID4gMCAmJiBzdG9yZSkge1xuICAgICAgb2ZmZXJzLnB1c2goe1xuICAgICAgICBzdG9yZSxcbiAgICAgICAgcHJpY2UsXG4gICAgICAgIHVybDogICAgIHVybCxcbiAgICAgICAgaW1hZ2U6ICAgbnVsbCxcbiAgICAgICAgaW5TdG9jazogdHJ1ZSxcbiAgICAgICAgc291cmNlOiAgXCJnb29nbGVcIixcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9mZmVycztcbn1cblxuLyog4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQXG4gICBERURVUExJQ0FSIEUgT1JERU5BUlxu4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQICovXG5mdW5jdGlvbiBkZWR1cGVBbmRTb3J0KG9mZmVycykge1xuICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuICByZXR1cm4gb2ZmZXJzXG4gICAgLmZpbHRlcihvID0+IHtcbiAgICAgIGlmICghby5wcmljZSB8fCBvLnByaWNlIDw9IDApIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IGtleSA9IGAke28uc3RvcmUudG9Mb3dlckNhc2UoKX0tJHtNYXRoLnJvdW5kKG8ucHJpY2UpfWA7XG4gICAgICBpZiAoc2Vlbi5oYXMoa2V5KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgc2Vlbi5hZGQoa2V5KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pXG4gICAgLnNvcnQoKGEsIGIpID0+IGEucHJpY2UgLSBiLnByaWNlKVxuICAgIC5zbGljZSgwLCA2KTtcbn1cblxuLyog4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQXG4gICBIQU5ETEVSIFBSSU5DSVBBTFxu4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXEpIHtcbiAgbGV0IHByb2R1Y3ROYW1lO1xuICB0cnkgeyAoeyBwcm9kdWN0TmFtZSB9ID0gYXdhaXQgcmVxLmpzb24oKSk7IH1cbiAgY2F0Y2ggeyByZXR1cm4gUmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkJvZHkgaW52w6FsaWRvXCIgfSwgeyBzdGF0dXM6IDQwMCB9KTsgfVxuXG4gIGlmICghcHJvZHVjdE5hbWU/LnRyaW0oKSkge1xuICAgIHJldHVybiBSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiTm9tZSBvYnJpZ2F0w7NyaW9cIiB9LCB7IHN0YXR1czogNDAwIH0pO1xuICB9XG5cbiAgY29uc3QgYWxsT2ZmZXJzID0gW107XG4gIGNvbnN0IGVycm9ycyAgICA9IFtdO1xuXG4gIC8vIEV4ZWN1dGEgdG9kYXMgYXMgZm9udGVzIGVtIHBhcmFsZWxvXG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQoW1xuICAgIHNlYXJjaE1lcmNhZG9MaXZyZShwcm9kdWN0TmFtZSksXG4gICAgc2VhcmNoQW1hem9uKHByb2R1Y3ROYW1lKSxcbiAgICBzZWFyY2hab29tKHByb2R1Y3ROYW1lKSxcbiAgICBzZWFyY2hHb29nbGVTaG9wcGluZyhwcm9kdWN0TmFtZSksXG4gIF0pO1xuXG4gIGNvbnN0IGxhYmVscyA9IFtcIk1lcmNhZG9MaXZyZVwiLCBcIkFtYXpvblwiLCBcIlpvb21cIiwgXCJHb29nbGVcIl07XG4gIHJlc3VsdHMuZm9yRWFjaCgociwgaSkgPT4ge1xuICAgIGlmIChyLnN0YXR1cyA9PT0gXCJmdWxmaWxsZWRcIikge1xuICAgICAgYWxsT2ZmZXJzLnB1c2goLi4uci52YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9ycy5wdXNoKGAke2xhYmVsc1tpXX06ICR7ci5yZWFzb24/Lm1lc3NhZ2V9YCk7XG4gICAgICBjb25zb2xlLndhcm4oYFtjb21wYXJlLXByaWNlc10gJHtsYWJlbHNbaV19IGZhbGhvdTpgLCByLnJlYXNvbj8ubWVzc2FnZSk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBvZmZlcnMgPSBkZWR1cGVBbmRTb3J0KGFsbE9mZmVycyk7XG5cbiAgY29uc29sZS5sb2coYFtjb21wYXJlLXByaWNlc10gXCIke3Byb2R1Y3ROYW1lfVwiIOKGkiAke29mZmVycy5sZW5ndGh9IG9mZXJ0YXMgKCR7YWxsT2ZmZXJzLmxlbmd0aH0gYnJ1dGFzKWApO1xuXG4gIHJldHVybiBSZXNwb25zZS5qc29uKHtcbiAgICBvZmZlcnMsXG4gICAgLi4uKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcImRldmVsb3BtZW50XCIgJiYgeyBkZWJ1ZzogeyBlcnJvcnMsIHRvdGFsOiBhbGxPZmZlcnMubGVuZ3RoIH0gfSksXG4gIH0pO1xufVxuIl0sIm5hbWVzIjpbImF4aW9zIiwiY2hlZXJpbyIsIlRJTUVPVVQiLCJVQSIsInNlYXJjaE1lcmNhZG9MaXZyZSIsInByb2R1Y3ROYW1lIiwicSIsImVuY29kZVVSSUNvbXBvbmVudCIsInVybCIsImRhdGEiLCJnZXQiLCJ0aW1lb3V0IiwiaGVhZGVycyIsInJlc3VsdHMiLCJmaWx0ZXIiLCJpdGVtIiwicHJpY2UiLCJjb25kaXRpb24iLCJzbGljZSIsIm1hcCIsInN0b3JlIiwicGVybWFsaW5rIiwiaW1hZ2UiLCJ0aHVtYm5haWwiLCJyZXBsYWNlIiwiaW5TdG9jayIsImF2YWlsYWJsZV9xdWFudGl0eSIsInNvdXJjZSIsInNlYXJjaEFtYXpvbiIsImh0bWwiLCIkIiwibG9hZCIsIm9mZmVycyIsImVhY2giLCJpIiwiZWwiLCJjYXJkIiwidGl0bGUiLCJmaW5kIiwiZmlyc3QiLCJ0ZXh0IiwidHJpbSIsIndob2xlVGV4dCIsImZyYWNUZXh0IiwicHJpY2VTdHIiLCJwYXJzZUZsb2F0IiwicmVsVXJsIiwiYXR0ciIsImltZ1VybCIsInB1c2giLCJzZWFyY2hab29tIiwibmV4dERhdGFTY3JpcHQiLCJqc29uIiwiSlNPTiIsInBhcnNlIiwicHJvZHVjdHMiLCJwcm9wcyIsInBhZ2VQcm9wcyIsImluaXRpYWxTdGF0ZSIsInNlYXJjaCIsInAiLCJtaW5QcmljZSIsImJlc3RQcmljZSIsInN0b3JlTmFtZSIsIm5hbWUiLCJsZW5ndGgiLCJtYXRjaCIsInNlYXJjaEdvb2dsZVNob3BwaW5nIiwicHJpY2VUZXh0IiwiZGVkdXBlQW5kU29ydCIsInNlZW4iLCJTZXQiLCJvIiwia2V5IiwidG9Mb3dlckNhc2UiLCJNYXRoIiwicm91bmQiLCJoYXMiLCJhZGQiLCJzb3J0IiwiYSIsImIiLCJQT1NUIiwicmVxIiwiUmVzcG9uc2UiLCJlcnJvciIsInN0YXR1cyIsImFsbE9mZmVycyIsImVycm9ycyIsIlByb21pc2UiLCJhbGxTZXR0bGVkIiwibGFiZWxzIiwiZm9yRWFjaCIsInIiLCJ2YWx1ZSIsInJlYXNvbiIsIm1lc3NhZ2UiLCJjb25zb2xlIiwid2FybiIsImxvZyIsInByb2Nlc3MiLCJkZWJ1ZyIsInRvdGFsIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/compare-prices/route.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompare-prices%2Froute&page=%2Fapi%2Fcompare-prices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompare-prices%2Froute.js&appDir=C%3A%5CUsers%5Cmathe%5Cenxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmathe%5Cenxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompare-prices%2Froute&page=%2Fapi%2Fcompare-prices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompare-prices%2Froute.js&appDir=C%3A%5CUsers%5Cmathe%5Cenxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmathe%5Cenxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   handler: () => (/* binding */ handler),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/request-meta */ \"(rsc)/./node_modules/next/dist/server/request-meta.js\");\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/dist/server/lib/trace/tracer */ \"(rsc)/./node_modules/next/dist/server/lib/trace/tracer.js\");\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/shared/lib/router/utils/app-paths */ \"next/dist/shared/lib/router/utils/app-paths\");\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/base-http/node */ \"(rsc)/./node_modules/next/dist/server/base-http/node.js\");\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/dist/server/web/spec-extension/adapters/next-request */ \"(rsc)/./node_modules/next/dist/server/web/spec-extension/adapters/next-request.js\");\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! next/dist/server/lib/trace/constants */ \"(rsc)/./node_modules/next/dist/server/lib/trace/constants.js\");\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! next/dist/server/instrumentation/utils */ \"(rsc)/./node_modules/next/dist/server/instrumentation/utils.js\");\n/* harmony import */ var next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! next/dist/server/send-response */ \"(rsc)/./node_modules/next/dist/server/send-response.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! next/dist/server/web/utils */ \"(rsc)/./node_modules/next/dist/server/web/utils.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! next/dist/server/lib/cache-control */ \"(rsc)/./node_modules/next/dist/server/lib/cache-control.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! next/dist/lib/constants */ \"(rsc)/./node_modules/next/dist/lib/constants.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! next/dist/shared/lib/no-fallback-error.external */ \"next/dist/shared/lib/no-fallback-error.external\");\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__);\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! next/dist/server/response-cache */ \"(rsc)/./node_modules/next/dist/server/response-cache/index.js\");\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__);\n/* harmony import */ var C_Users_mathe_enxoval_app_api_compare_prices_route_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./app/api/compare-prices/route.js */ \"(rsc)/./app/api/compare-prices/route.js\");\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/compare-prices/route\",\n        pathname: \"/api/compare-prices\",\n        filename: \"route\",\n        bundlePath: \"app/api/compare-prices/route\"\n    },\n    distDir: \".next\" || 0,\n    relativeProjectDir:  false || '',\n    resolvedPagePath: \"C:\\\\Users\\\\mathe\\\\enxoval\\\\app\\\\api\\\\compare-prices\\\\route.js\",\n    nextConfigOutput,\n    userland: C_Users_mathe_enxoval_app_api_compare_prices_route_js__WEBPACK_IMPORTED_MODULE_16__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\nasync function handler(req, res, ctx) {\n    var _nextConfig_experimental;\n    let srcPage = \"/api/compare-prices/route\";\n    // turbopack doesn't normalize `/index` in the page name\n    // so we need to to process dynamic routes properly\n    // TODO: fix turbopack providing differing value from webpack\n    if (false) {} else if (srcPage === '/index') {\n        // we always normalize /index specifically\n        srcPage = '/';\n    }\n    const multiZoneDraftMode = false;\n    const prepareResult = await routeModule.prepare(req, res, {\n        srcPage,\n        multiZoneDraftMode\n    });\n    if (!prepareResult) {\n        res.statusCode = 400;\n        res.end('Bad Request');\n        ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());\n        return null;\n    }\n    const { buildId, params, nextConfig, isDraftMode, prerenderManifest, routerServerContext, isOnDemandRevalidate, revalidateOnlyGenerated, resolvedPathname } = prepareResult;\n    const normalizedSrcPage = (0,next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__.normalizeAppPath)(srcPage);\n    let isIsr = Boolean(prerenderManifest.dynamicRoutes[normalizedSrcPage] || prerenderManifest.routes[resolvedPathname]);\n    if (isIsr && !isDraftMode) {\n        const isPrerendered = Boolean(prerenderManifest.routes[resolvedPathname]);\n        const prerenderInfo = prerenderManifest.dynamicRoutes[normalizedSrcPage];\n        if (prerenderInfo) {\n            if (prerenderInfo.fallback === false && !isPrerendered) {\n                throw new next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError();\n            }\n        }\n    }\n    let cacheKey = null;\n    if (isIsr && !routeModule.isDev && !isDraftMode) {\n        cacheKey = resolvedPathname;\n        // ensure /index and / is normalized to one key\n        cacheKey = cacheKey === '/index' ? '/' : cacheKey;\n    }\n    const supportsDynamicResponse = // If we're in development, we always support dynamic HTML\n    routeModule.isDev === true || // If this is not SSG or does not have static paths, then it supports\n    // dynamic HTML.\n    !isIsr;\n    // This is a revalidation request if the request is for a static\n    // page and it is not being resumed from a postponed render and\n    // it is not a dynamic RSC request then it is a revalidation\n    // request.\n    const isRevalidate = isIsr && !supportsDynamicResponse;\n    const method = req.method || 'GET';\n    const tracer = (0,next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.getTracer)();\n    const activeSpan = tracer.getActiveScopeSpan();\n    const context = {\n        params,\n        prerenderManifest,\n        renderOpts: {\n            experimental: {\n                cacheComponents: Boolean(nextConfig.experimental.cacheComponents),\n                authInterrupts: Boolean(nextConfig.experimental.authInterrupts)\n            },\n            supportsDynamicResponse,\n            incrementalCache: (0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'incrementalCache'),\n            cacheLifeProfiles: (_nextConfig_experimental = nextConfig.experimental) == null ? void 0 : _nextConfig_experimental.cacheLife,\n            isRevalidate,\n            waitUntil: ctx.waitUntil,\n            onClose: (cb)=>{\n                res.on('close', cb);\n            },\n            onAfterTaskError: undefined,\n            onInstrumentationRequestError: (error, _request, errorContext)=>routeModule.onRequestError(req, error, errorContext, routerServerContext)\n        },\n        sharedContext: {\n            buildId\n        }\n    };\n    const nodeNextReq = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextRequest(req);\n    const nodeNextRes = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextResponse(res);\n    const nextReq = next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.NextRequestAdapter.fromNodeNextRequest(nodeNextReq, (0,next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.signalFromNodeResponse)(res));\n    try {\n        const invokeRouteModule = async (span)=>{\n            return routeModule.handle(nextReq, context).finally(()=>{\n                if (!span) return;\n                span.setAttributes({\n                    'http.status_code': res.statusCode,\n                    'next.rsc': false\n                });\n                const rootSpanAttributes = tracer.getRootSpanAttributes();\n                // We were unable to get attributes, probably OTEL is not enabled\n                if (!rootSpanAttributes) {\n                    return;\n                }\n                if (rootSpanAttributes.get('next.span_type') !== next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest) {\n                    console.warn(`Unexpected root span type '${rootSpanAttributes.get('next.span_type')}'. Please report this Next.js issue https://github.com/vercel/next.js`);\n                    return;\n                }\n                const route = rootSpanAttributes.get('next.route');\n                if (route) {\n                    const name = `${method} ${route}`;\n                    span.setAttributes({\n                        'next.route': route,\n                        'http.route': route,\n                        'next.span_name': name\n                    });\n                    span.updateName(name);\n                } else {\n                    span.updateName(`${method} ${req.url}`);\n                }\n            });\n        };\n        const handleResponse = async (currentSpan)=>{\n            var _cacheEntry_value;\n            const responseGenerator = async ({ previousCacheEntry })=>{\n                try {\n                    if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isOnDemandRevalidate && revalidateOnlyGenerated && !previousCacheEntry) {\n                        res.statusCode = 404;\n                        // on-demand revalidate always sets this header\n                        res.setHeader('x-nextjs-cache', 'REVALIDATED');\n                        res.end('This page could not be found');\n                        return null;\n                    }\n                    const response = await invokeRouteModule(currentSpan);\n                    req.fetchMetrics = context.renderOpts.fetchMetrics;\n                    let pendingWaitUntil = context.renderOpts.pendingWaitUntil;\n                    // Attempt using provided waitUntil if available\n                    // if it's not we fallback to sendResponse's handling\n                    if (pendingWaitUntil) {\n                        if (ctx.waitUntil) {\n                            ctx.waitUntil(pendingWaitUntil);\n                            pendingWaitUntil = undefined;\n                        }\n                    }\n                    const cacheTags = context.renderOpts.collectedTags;\n                    // If the request is for a static response, we can cache it so long\n                    // as it's not edge.\n                    if (isIsr) {\n                        const blob = await response.blob();\n                        // Copy the headers from the response.\n                        const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.toNodeOutgoingHttpHeaders)(response.headers);\n                        if (cacheTags) {\n                            headers[next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER] = cacheTags;\n                        }\n                        if (!headers['content-type'] && blob.type) {\n                            headers['content-type'] = blob.type;\n                        }\n                        const revalidate = typeof context.renderOpts.collectedRevalidate === 'undefined' || context.renderOpts.collectedRevalidate >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? false : context.renderOpts.collectedRevalidate;\n                        const expire = typeof context.renderOpts.collectedExpire === 'undefined' || context.renderOpts.collectedExpire >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? undefined : context.renderOpts.collectedExpire;\n                        // Create the cache entry for the response.\n                        const cacheEntry = {\n                            value: {\n                                kind: next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE,\n                                status: response.status,\n                                body: Buffer.from(await blob.arrayBuffer()),\n                                headers\n                            },\n                            cacheControl: {\n                                revalidate,\n                                expire\n                            }\n                        };\n                        return cacheEntry;\n                    } else {\n                        // send response without caching if not ISR\n                        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, response, context.renderOpts.pendingWaitUntil);\n                        return null;\n                    }\n                } catch (err) {\n                    // if this is a background revalidate we need to report\n                    // the request error here as it won't be bubbled\n                    if (previousCacheEntry == null ? void 0 : previousCacheEntry.isStale) {\n                        await routeModule.onRequestError(req, err, {\n                            routerKind: 'App Router',\n                            routePath: srcPage,\n                            routeType: 'route',\n                            revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                                isRevalidate,\n                                isOnDemandRevalidate\n                            })\n                        }, routerServerContext);\n                    }\n                    throw err;\n                }\n            };\n            const cacheEntry = await routeModule.handleResponse({\n                req,\n                nextConfig,\n                cacheKey,\n                routeKind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n                isFallback: false,\n                prerenderManifest,\n                isRoutePPREnabled: false,\n                isOnDemandRevalidate,\n                revalidateOnlyGenerated,\n                responseGenerator,\n                waitUntil: ctx.waitUntil\n            });\n            // we don't create a cacheEntry for ISR\n            if (!isIsr) {\n                return null;\n            }\n            if ((cacheEntry == null ? void 0 : (_cacheEntry_value = cacheEntry.value) == null ? void 0 : _cacheEntry_value.kind) !== next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE) {\n                var _cacheEntry_value1;\n                throw Object.defineProperty(new Error(`Invariant: app-route received invalid cache entry ${cacheEntry == null ? void 0 : (_cacheEntry_value1 = cacheEntry.value) == null ? void 0 : _cacheEntry_value1.kind}`), \"__NEXT_ERROR_CODE\", {\n                    value: \"E701\",\n                    enumerable: false,\n                    configurable: true\n                });\n            }\n            if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode')) {\n                res.setHeader('x-nextjs-cache', isOnDemandRevalidate ? 'REVALIDATED' : cacheEntry.isMiss ? 'MISS' : cacheEntry.isStale ? 'STALE' : 'HIT');\n            }\n            // Draft mode should never be cached\n            if (isDraftMode) {\n                res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');\n            }\n            const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.fromNodeOutgoingHttpHeaders)(cacheEntry.value.headers);\n            if (!((0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isIsr)) {\n                headers.delete(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER);\n            }\n            // If cache control is already set on the response we don't\n            // override it to allow users to customize it via next.config\n            if (cacheEntry.cacheControl && !res.getHeader('Cache-Control') && !headers.get('Cache-Control')) {\n                headers.set('Cache-Control', (0,next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__.getCacheControlHeader)(cacheEntry.cacheControl));\n            }\n            await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(cacheEntry.value.body, {\n                headers,\n                status: cacheEntry.value.status || 200\n            }));\n            return null;\n        };\n        // TODO: activeSpan code path is for when wrapped by\n        // next-server can be removed when this is no longer used\n        if (activeSpan) {\n            await handleResponse(activeSpan);\n        } else {\n            await tracer.withPropagatedContext(req.headers, ()=>tracer.trace(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest, {\n                    spanName: `${method} ${req.url}`,\n                    kind: next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.SpanKind.SERVER,\n                    attributes: {\n                        'http.method': method,\n                        'http.target': req.url\n                    }\n                }, handleResponse));\n        }\n    } catch (err) {\n        if (!(err instanceof next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError)) {\n            await routeModule.onRequestError(req, err, {\n                routerKind: 'App Router',\n                routePath: normalizedSrcPage,\n                routeType: 'route',\n                revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                    isRevalidate,\n                    isOnDemandRevalidate\n                })\n            });\n        }\n        // rethrow so that we can handle serving error page\n        // If this is during static generation, throw the error again.\n        if (isIsr) throw err;\n        // Otherwise, send a 500 response.\n        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(null, {\n            status: 500\n        }));\n        return null;\n    }\n}\n\n//# sourceMappingURL=app-route.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjb21wYXJlLXByaWNlcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY29tcGFyZS1wcmljZXMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjb21wYXJlLXByaWNlcyUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNtYXRoZSU1Q2VueG92YWwlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q21hdGhlJTVDZW54b3ZhbCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCZpc0dsb2JhbE5vdEZvdW5kRW5hYmxlZD0hIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2Q7QUFDUztBQUNPO0FBQ0s7QUFDbUM7QUFDakQ7QUFDTztBQUNmO0FBQ3NDO0FBQ3pCO0FBQ007QUFDQztBQUNoQjtBQUN3QjtBQUMxRjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxhQUFhLE9BQW9DLElBQUksQ0FBRTtBQUN2RCx3QkFBd0IsTUFBdUM7QUFDL0Q7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDViw2RUFBNkUsZ0ZBQWM7QUFDM0YsaUNBQWlDLFFBQVEsRUFBRSxRQUFRO0FBQ25ELDBCQUEwQix1RUFBUTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLE1BQU07QUFDTiw2QkFBNkIsNkZBQWU7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsMkZBQW1CO0FBQ3JEO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLDZFQUFZO0FBQzFCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCB7IGdldFJlcXVlc3RNZXRhIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcmVxdWVzdC1tZXRhXCI7XG5pbXBvcnQgeyBnZXRUcmFjZXIsIFNwYW5LaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3RyYWNlL3RyYWNlclwiO1xuaW1wb3J0IHsgbm9ybWFsaXplQXBwUGF0aCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2hhcmVkL2xpYi9yb3V0ZXIvdXRpbHMvYXBwLXBhdGhzXCI7XG5pbXBvcnQgeyBOb2RlTmV4dFJlcXVlc3QsIE5vZGVOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9iYXNlLWh0dHAvbm9kZVwiO1xuaW1wb3J0IHsgTmV4dFJlcXVlc3RBZGFwdGVyLCBzaWduYWxGcm9tTm9kZVJlc3BvbnNlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL3NwZWMtZXh0ZW5zaW9uL2FkYXB0ZXJzL25leHQtcmVxdWVzdFwiO1xuaW1wb3J0IHsgQmFzZVNlcnZlclNwYW4gfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvdHJhY2UvY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBnZXRSZXZhbGlkYXRlUmVhc29uIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvaW5zdHJ1bWVudGF0aW9uL3V0aWxzXCI7XG5pbXBvcnQgeyBzZW5kUmVzcG9uc2UgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9zZW5kLXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBmcm9tTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMsIHRvTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvdXRpbHNcIjtcbmltcG9ydCB7IGdldENhY2hlQ29udHJvbEhlYWRlciB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9jYWNoZS1jb250cm9sXCI7XG5pbXBvcnQgeyBJTkZJTklURV9DQUNIRSwgTkVYVF9DQUNIRV9UQUdTX0hFQURFUiB9IGZyb20gXCJuZXh0L2Rpc3QvbGliL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgTm9GYWxsYmFja0Vycm9yIH0gZnJvbSBcIm5leHQvZGlzdC9zaGFyZWQvbGliL25vLWZhbGxiYWNrLWVycm9yLmV4dGVybmFsXCI7XG5pbXBvcnQgeyBDYWNoZWRSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yZXNwb25zZS1jYWNoZVwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXG1hdGhlXFxcXGVueG92YWxcXFxcYXBwXFxcXGFwaVxcXFxjb21wYXJlLXByaWNlc1xcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvY29tcGFyZS1wcmljZXMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9jb21wYXJlLXByaWNlc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvY29tcGFyZS1wcmljZXMvcm91dGVcIlxuICAgIH0sXG4gICAgZGlzdERpcjogcHJvY2Vzcy5lbnYuX19ORVhUX1JFTEFUSVZFX0RJU1RfRElSIHx8ICcnLFxuICAgIHJlbGF0aXZlUHJvamVjdERpcjogcHJvY2Vzcy5lbnYuX19ORVhUX1JFTEFUSVZFX1BST0pFQ1RfRElSIHx8ICcnLFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcbWF0aGVcXFxcZW54b3ZhbFxcXFxhcHBcXFxcYXBpXFxcXGNvbXBhcmUtcHJpY2VzXFxcXHJvdXRlLmpzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMsIGN0eCkge1xuICAgIHZhciBfbmV4dENvbmZpZ19leHBlcmltZW50YWw7XG4gICAgbGV0IHNyY1BhZ2UgPSBcIi9hcGkvY29tcGFyZS1wcmljZXMvcm91dGVcIjtcbiAgICAvLyB0dXJib3BhY2sgZG9lc24ndCBub3JtYWxpemUgYC9pbmRleGAgaW4gdGhlIHBhZ2UgbmFtZVxuICAgIC8vIHNvIHdlIG5lZWQgdG8gdG8gcHJvY2VzcyBkeW5hbWljIHJvdXRlcyBwcm9wZXJseVxuICAgIC8vIFRPRE86IGZpeCB0dXJib3BhY2sgcHJvdmlkaW5nIGRpZmZlcmluZyB2YWx1ZSBmcm9tIHdlYnBhY2tcbiAgICBpZiAocHJvY2Vzcy5lbnYuVFVSQk9QQUNLKSB7XG4gICAgICAgIHNyY1BhZ2UgPSBzcmNQYWdlLnJlcGxhY2UoL1xcL2luZGV4JC8sICcnKSB8fCAnLyc7XG4gICAgfSBlbHNlIGlmIChzcmNQYWdlID09PSAnL2luZGV4Jykge1xuICAgICAgICAvLyB3ZSBhbHdheXMgbm9ybWFsaXplIC9pbmRleCBzcGVjaWZpY2FsbHlcbiAgICAgICAgc3JjUGFnZSA9ICcvJztcbiAgICB9XG4gICAgY29uc3QgbXVsdGlab25lRHJhZnRNb2RlID0gcHJvY2Vzcy5lbnYuX19ORVhUX01VTFRJX1pPTkVfRFJBRlRfTU9ERTtcbiAgICBjb25zdCBwcmVwYXJlUmVzdWx0ID0gYXdhaXQgcm91dGVNb2R1bGUucHJlcGFyZShyZXEsIHJlcywge1xuICAgICAgICBzcmNQYWdlLFxuICAgICAgICBtdWx0aVpvbmVEcmFmdE1vZGVcbiAgICB9KTtcbiAgICBpZiAoIXByZXBhcmVSZXN1bHQpIHtcbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XG4gICAgICAgIHJlcy5lbmQoJ0JhZCBSZXF1ZXN0Jyk7XG4gICAgICAgIGN0eC53YWl0VW50aWwgPT0gbnVsbCA/IHZvaWQgMCA6IGN0eC53YWl0VW50aWwuY2FsbChjdHgsIFByb21pc2UucmVzb2x2ZSgpKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHsgYnVpbGRJZCwgcGFyYW1zLCBuZXh0Q29uZmlnLCBpc0RyYWZ0TW9kZSwgcHJlcmVuZGVyTWFuaWZlc3QsIHJvdXRlclNlcnZlckNvbnRleHQsIGlzT25EZW1hbmRSZXZhbGlkYXRlLCByZXZhbGlkYXRlT25seUdlbmVyYXRlZCwgcmVzb2x2ZWRQYXRobmFtZSB9ID0gcHJlcGFyZVJlc3VsdDtcbiAgICBjb25zdCBub3JtYWxpemVkU3JjUGFnZSA9IG5vcm1hbGl6ZUFwcFBhdGgoc3JjUGFnZSk7XG4gICAgbGV0IGlzSXNyID0gQm9vbGVhbihwcmVyZW5kZXJNYW5pZmVzdC5keW5hbWljUm91dGVzW25vcm1hbGl6ZWRTcmNQYWdlXSB8fCBwcmVyZW5kZXJNYW5pZmVzdC5yb3V0ZXNbcmVzb2x2ZWRQYXRobmFtZV0pO1xuICAgIGlmIChpc0lzciAmJiAhaXNEcmFmdE1vZGUpIHtcbiAgICAgICAgY29uc3QgaXNQcmVyZW5kZXJlZCA9IEJvb2xlYW4ocHJlcmVuZGVyTWFuaWZlc3Qucm91dGVzW3Jlc29sdmVkUGF0aG5hbWVdKTtcbiAgICAgICAgY29uc3QgcHJlcmVuZGVySW5mbyA9IHByZXJlbmRlck1hbmlmZXN0LmR5bmFtaWNSb3V0ZXNbbm9ybWFsaXplZFNyY1BhZ2VdO1xuICAgICAgICBpZiAocHJlcmVuZGVySW5mbykge1xuICAgICAgICAgICAgaWYgKHByZXJlbmRlckluZm8uZmFsbGJhY2sgPT09IGZhbHNlICYmICFpc1ByZXJlbmRlcmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE5vRmFsbGJhY2tFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBjYWNoZUtleSA9IG51bGw7XG4gICAgaWYgKGlzSXNyICYmICFyb3V0ZU1vZHVsZS5pc0RldiAmJiAhaXNEcmFmdE1vZGUpIHtcbiAgICAgICAgY2FjaGVLZXkgPSByZXNvbHZlZFBhdGhuYW1lO1xuICAgICAgICAvLyBlbnN1cmUgL2luZGV4IGFuZCAvIGlzIG5vcm1hbGl6ZWQgdG8gb25lIGtleVxuICAgICAgICBjYWNoZUtleSA9IGNhY2hlS2V5ID09PSAnL2luZGV4JyA/ICcvJyA6IGNhY2hlS2V5O1xuICAgIH1cbiAgICBjb25zdCBzdXBwb3J0c0R5bmFtaWNSZXNwb25zZSA9IC8vIElmIHdlJ3JlIGluIGRldmVsb3BtZW50LCB3ZSBhbHdheXMgc3VwcG9ydCBkeW5hbWljIEhUTUxcbiAgICByb3V0ZU1vZHVsZS5pc0RldiA9PT0gdHJ1ZSB8fCAvLyBJZiB0aGlzIGlzIG5vdCBTU0cgb3IgZG9lcyBub3QgaGF2ZSBzdGF0aWMgcGF0aHMsIHRoZW4gaXQgc3VwcG9ydHNcbiAgICAvLyBkeW5hbWljIEhUTUwuXG4gICAgIWlzSXNyO1xuICAgIC8vIFRoaXMgaXMgYSByZXZhbGlkYXRpb24gcmVxdWVzdCBpZiB0aGUgcmVxdWVzdCBpcyBmb3IgYSBzdGF0aWNcbiAgICAvLyBwYWdlIGFuZCBpdCBpcyBub3QgYmVpbmcgcmVzdW1lZCBmcm9tIGEgcG9zdHBvbmVkIHJlbmRlciBhbmRcbiAgICAvLyBpdCBpcyBub3QgYSBkeW5hbWljIFJTQyByZXF1ZXN0IHRoZW4gaXQgaXMgYSByZXZhbGlkYXRpb25cbiAgICAvLyByZXF1ZXN0LlxuICAgIGNvbnN0IGlzUmV2YWxpZGF0ZSA9IGlzSXNyICYmICFzdXBwb3J0c0R5bmFtaWNSZXNwb25zZTtcbiAgICBjb25zdCBtZXRob2QgPSByZXEubWV0aG9kIHx8ICdHRVQnO1xuICAgIGNvbnN0IHRyYWNlciA9IGdldFRyYWNlcigpO1xuICAgIGNvbnN0IGFjdGl2ZVNwYW4gPSB0cmFjZXIuZ2V0QWN0aXZlU2NvcGVTcGFuKCk7XG4gICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBwcmVyZW5kZXJNYW5pZmVzdCxcbiAgICAgICAgcmVuZGVyT3B0czoge1xuICAgICAgICAgICAgZXhwZXJpbWVudGFsOiB7XG4gICAgICAgICAgICAgICAgY2FjaGVDb21wb25lbnRzOiBCb29sZWFuKG5leHRDb25maWcuZXhwZXJpbWVudGFsLmNhY2hlQ29tcG9uZW50cyksXG4gICAgICAgICAgICAgICAgYXV0aEludGVycnVwdHM6IEJvb2xlYW4obmV4dENvbmZpZy5leHBlcmltZW50YWwuYXV0aEludGVycnVwdHMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VwcG9ydHNEeW5hbWljUmVzcG9uc2UsXG4gICAgICAgICAgICBpbmNyZW1lbnRhbENhY2hlOiBnZXRSZXF1ZXN0TWV0YShyZXEsICdpbmNyZW1lbnRhbENhY2hlJyksXG4gICAgICAgICAgICBjYWNoZUxpZmVQcm9maWxlczogKF9uZXh0Q29uZmlnX2V4cGVyaW1lbnRhbCA9IG5leHRDb25maWcuZXhwZXJpbWVudGFsKSA9PSBudWxsID8gdm9pZCAwIDogX25leHRDb25maWdfZXhwZXJpbWVudGFsLmNhY2hlTGlmZSxcbiAgICAgICAgICAgIGlzUmV2YWxpZGF0ZSxcbiAgICAgICAgICAgIHdhaXRVbnRpbDogY3R4LndhaXRVbnRpbCxcbiAgICAgICAgICAgIG9uQ2xvc2U6IChjYik9PntcbiAgICAgICAgICAgICAgICByZXMub24oJ2Nsb3NlJywgY2IpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQWZ0ZXJUYXNrRXJyb3I6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9uSW5zdHJ1bWVudGF0aW9uUmVxdWVzdEVycm9yOiAoZXJyb3IsIF9yZXF1ZXN0LCBlcnJvckNvbnRleHQpPT5yb3V0ZU1vZHVsZS5vblJlcXVlc3RFcnJvcihyZXEsIGVycm9yLCBlcnJvckNvbnRleHQsIHJvdXRlclNlcnZlckNvbnRleHQpXG4gICAgICAgIH0sXG4gICAgICAgIHNoYXJlZENvbnRleHQ6IHtcbiAgICAgICAgICAgIGJ1aWxkSWRcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgbm9kZU5leHRSZXEgPSBuZXcgTm9kZU5leHRSZXF1ZXN0KHJlcSk7XG4gICAgY29uc3Qgbm9kZU5leHRSZXMgPSBuZXcgTm9kZU5leHRSZXNwb25zZShyZXMpO1xuICAgIGNvbnN0IG5leHRSZXEgPSBOZXh0UmVxdWVzdEFkYXB0ZXIuZnJvbU5vZGVOZXh0UmVxdWVzdChub2RlTmV4dFJlcSwgc2lnbmFsRnJvbU5vZGVSZXNwb25zZShyZXMpKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpbnZva2VSb3V0ZU1vZHVsZSA9IGFzeW5jIChzcGFuKT0+e1xuICAgICAgICAgICAgcmV0dXJuIHJvdXRlTW9kdWxlLmhhbmRsZShuZXh0UmVxLCBjb250ZXh0KS5maW5hbGx5KCgpPT57XG4gICAgICAgICAgICAgICAgaWYgKCFzcGFuKSByZXR1cm47XG4gICAgICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgJ2h0dHAuc3RhdHVzX2NvZGUnOiByZXMuc3RhdHVzQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgJ25leHQucnNjJzogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCByb290U3BhbkF0dHJpYnV0ZXMgPSB0cmFjZXIuZ2V0Um9vdFNwYW5BdHRyaWJ1dGVzKCk7XG4gICAgICAgICAgICAgICAgLy8gV2Ugd2VyZSB1bmFibGUgdG8gZ2V0IGF0dHJpYnV0ZXMsIHByb2JhYmx5IE9URUwgaXMgbm90IGVuYWJsZWRcbiAgICAgICAgICAgICAgICBpZiAoIXJvb3RTcGFuQXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyb290U3BhbkF0dHJpYnV0ZXMuZ2V0KCduZXh0LnNwYW5fdHlwZScpICE9PSBCYXNlU2VydmVyU3Bhbi5oYW5kbGVSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgVW5leHBlY3RlZCByb290IHNwYW4gdHlwZSAnJHtyb290U3BhbkF0dHJpYnV0ZXMuZ2V0KCduZXh0LnNwYW5fdHlwZScpfScuIFBsZWFzZSByZXBvcnQgdGhpcyBOZXh0LmpzIGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZXJjZWwvbmV4dC5qc2ApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gcm9vdFNwYW5BdHRyaWJ1dGVzLmdldCgnbmV4dC5yb3V0ZScpO1xuICAgICAgICAgICAgICAgIGlmIChyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYCR7bWV0aG9kfSAke3JvdXRlfWA7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbmV4dC5yb3V0ZSc6IHJvdXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHAucm91dGUnOiByb3V0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICduZXh0LnNwYW5fbmFtZSc6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4udXBkYXRlTmFtZShuYW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzcGFuLnVwZGF0ZU5hbWUoYCR7bWV0aG9kfSAke3JlcS51cmx9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGhhbmRsZVJlc3BvbnNlID0gYXN5bmMgKGN1cnJlbnRTcGFuKT0+e1xuICAgICAgICAgICAgdmFyIF9jYWNoZUVudHJ5X3ZhbHVlO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VHZW5lcmF0b3IgPSBhc3luYyAoeyBwcmV2aW91c0NhY2hlRW50cnkgfSk9PntcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWdldFJlcXVlc3RNZXRhKHJlcSwgJ21pbmltYWxNb2RlJykgJiYgaXNPbkRlbWFuZFJldmFsaWRhdGUgJiYgcmV2YWxpZGF0ZU9ubHlHZW5lcmF0ZWQgJiYgIXByZXZpb3VzQ2FjaGVFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvbi1kZW1hbmQgcmV2YWxpZGF0ZSBhbHdheXMgc2V0cyB0aGlzIGhlYWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcigneC1uZXh0anMtY2FjaGUnLCAnUkVWQUxJREFURUQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoJ1RoaXMgcGFnZSBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaW52b2tlUm91dGVNb2R1bGUoY3VycmVudFNwYW4pO1xuICAgICAgICAgICAgICAgICAgICByZXEuZmV0Y2hNZXRyaWNzID0gY29udGV4dC5yZW5kZXJPcHRzLmZldGNoTWV0cmljcztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBlbmRpbmdXYWl0VW50aWwgPSBjb250ZXh0LnJlbmRlck9wdHMucGVuZGluZ1dhaXRVbnRpbDtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXR0ZW1wdCB1c2luZyBwcm92aWRlZCB3YWl0VW50aWwgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0J3Mgbm90IHdlIGZhbGxiYWNrIHRvIHNlbmRSZXNwb25zZSdzIGhhbmRsaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZW5kaW5nV2FpdFVudGlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3R4LndhaXRVbnRpbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC53YWl0VW50aWwocGVuZGluZ1dhaXRVbnRpbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1dhaXRVbnRpbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYWNoZVRhZ3MgPSBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkVGFncztcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJlcXVlc3QgaXMgZm9yIGEgc3RhdGljIHJlc3BvbnNlLCB3ZSBjYW4gY2FjaGUgaXQgc28gbG9uZ1xuICAgICAgICAgICAgICAgICAgICAvLyBhcyBpdCdzIG5vdCBlZGdlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJc3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXNwb25zZS5ibG9iKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBoZWFkZXJzIGZyb20gdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IHRvTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMocmVzcG9uc2UuaGVhZGVycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGVUYWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1tORVhUX0NBQ0hFX1RBR1NfSEVBREVSXSA9IGNhY2hlVGFncztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaGVhZGVyc1snY29udGVudC10eXBlJ10gJiYgYmxvYi50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snY29udGVudC10eXBlJ10gPSBibG9iLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXZhbGlkYXRlID0gdHlwZW9mIGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRSZXZhbGlkYXRlID09PSAndW5kZWZpbmVkJyB8fCBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkUmV2YWxpZGF0ZSA+PSBJTkZJTklURV9DQUNIRSA/IGZhbHNlIDogY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZFJldmFsaWRhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBpcmUgPSB0eXBlb2YgY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZEV4cGlyZSA9PT0gJ3VuZGVmaW5lZCcgfHwgY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZEV4cGlyZSA+PSBJTkZJTklURV9DQUNIRSA/IHVuZGVmaW5lZCA6IGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRFeHBpcmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIGNhY2hlIGVudHJ5IGZvciB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYWNoZUVudHJ5ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IENhY2hlZFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBCdWZmZXIuZnJvbShhd2FpdCBibG9iLmFycmF5QnVmZmVyKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZUNvbnRyb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV2YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZUVudHJ5O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCByZXNwb25zZSB3aXRob3V0IGNhY2hpbmcgaWYgbm90IElTUlxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2VuZFJlc3BvbnNlKG5vZGVOZXh0UmVxLCBub2RlTmV4dFJlcywgcmVzcG9uc2UsIGNvbnRleHQucmVuZGVyT3B0cy5wZW5kaW5nV2FpdFVudGlsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgYSBiYWNrZ3JvdW5kIHJldmFsaWRhdGUgd2UgbmVlZCB0byByZXBvcnRcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHJlcXVlc3QgZXJyb3IgaGVyZSBhcyBpdCB3b24ndCBiZSBidWJibGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c0NhY2hlRW50cnkgPT0gbnVsbCA/IHZvaWQgMCA6IHByZXZpb3VzQ2FjaGVFbnRyeS5pc1N0YWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByb3V0ZU1vZHVsZS5vblJlcXVlc3RFcnJvcihyZXEsIGVyciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlcktpbmQ6ICdBcHAgUm91dGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVBhdGg6IHNyY1BhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVUeXBlOiAncm91dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldmFsaWRhdGVSZWFzb246IGdldFJldmFsaWRhdGVSZWFzb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JldmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT25EZW1hbmRSZXZhbGlkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHJvdXRlclNlcnZlckNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgY2FjaGVFbnRyeSA9IGF3YWl0IHJvdXRlTW9kdWxlLmhhbmRsZVJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICByZXEsXG4gICAgICAgICAgICAgICAgbmV4dENvbmZpZyxcbiAgICAgICAgICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgICAgICAgICByb3V0ZUtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgICAgICAgICAgaXNGYWxsYmFjazogZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJlcmVuZGVyTWFuaWZlc3QsXG4gICAgICAgICAgICAgICAgaXNSb3V0ZVBQUkVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGlzT25EZW1hbmRSZXZhbGlkYXRlLFxuICAgICAgICAgICAgICAgIHJldmFsaWRhdGVPbmx5R2VuZXJhdGVkLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlR2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgIHdhaXRVbnRpbDogY3R4LndhaXRVbnRpbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyB3ZSBkb24ndCBjcmVhdGUgYSBjYWNoZUVudHJ5IGZvciBJU1JcbiAgICAgICAgICAgIGlmICghaXNJc3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgoY2FjaGVFbnRyeSA9PSBudWxsID8gdm9pZCAwIDogKF9jYWNoZUVudHJ5X3ZhbHVlID0gY2FjaGVFbnRyeS52YWx1ZSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9jYWNoZUVudHJ5X3ZhbHVlLmtpbmQpICE9PSBDYWNoZWRSb3V0ZUtpbmQuQVBQX1JPVVRFKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9jYWNoZUVudHJ5X3ZhbHVlMTtcbiAgICAgICAgICAgICAgICB0aHJvdyBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3IEVycm9yKGBJbnZhcmlhbnQ6IGFwcC1yb3V0ZSByZWNlaXZlZCBpbnZhbGlkIGNhY2hlIGVudHJ5ICR7Y2FjaGVFbnRyeSA9PSBudWxsID8gdm9pZCAwIDogKF9jYWNoZUVudHJ5X3ZhbHVlMSA9IGNhY2hlRW50cnkudmFsdWUpID09IG51bGwgPyB2b2lkIDAgOiBfY2FjaGVFbnRyeV92YWx1ZTEua2luZH1gKSwgXCJfX05FWFRfRVJST1JfQ09ERVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIkU3MDFcIixcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFnZXRSZXF1ZXN0TWV0YShyZXEsICdtaW5pbWFsTW9kZScpKSB7XG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcigneC1uZXh0anMtY2FjaGUnLCBpc09uRGVtYW5kUmV2YWxpZGF0ZSA/ICdSRVZBTElEQVRFRCcgOiBjYWNoZUVudHJ5LmlzTWlzcyA/ICdNSVNTJyA6IGNhY2hlRW50cnkuaXNTdGFsZSA/ICdTVEFMRScgOiAnSElUJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEcmFmdCBtb2RlIHNob3VsZCBuZXZlciBiZSBjYWNoZWRcbiAgICAgICAgICAgIGlmIChpc0RyYWZ0TW9kZSkge1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAncHJpdmF0ZSwgbm8tY2FjaGUsIG5vLXN0b3JlLCBtYXgtYWdlPTAsIG11c3QtcmV2YWxpZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IGZyb21Ob2RlT3V0Z29pbmdIdHRwSGVhZGVycyhjYWNoZUVudHJ5LnZhbHVlLmhlYWRlcnMpO1xuICAgICAgICAgICAgaWYgKCEoZ2V0UmVxdWVzdE1ldGEocmVxLCAnbWluaW1hbE1vZGUnKSAmJiBpc0lzcikpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLmRlbGV0ZShORVhUX0NBQ0hFX1RBR1NfSEVBREVSKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIGNhY2hlIGNvbnRyb2wgaXMgYWxyZWFkeSBzZXQgb24gdGhlIHJlc3BvbnNlIHdlIGRvbid0XG4gICAgICAgICAgICAvLyBvdmVycmlkZSBpdCB0byBhbGxvdyB1c2VycyB0byBjdXN0b21pemUgaXQgdmlhIG5leHQuY29uZmlnXG4gICAgICAgICAgICBpZiAoY2FjaGVFbnRyeS5jYWNoZUNvbnRyb2wgJiYgIXJlcy5nZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnKSAmJiAhaGVhZGVycy5nZXQoJ0NhY2hlLUNvbnRyb2wnKSkge1xuICAgICAgICAgICAgICAgIGhlYWRlcnMuc2V0KCdDYWNoZS1Db250cm9sJywgZ2V0Q2FjaGVDb250cm9sSGVhZGVyKGNhY2hlRW50cnkuY2FjaGVDb250cm9sKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBzZW5kUmVzcG9uc2Uobm9kZU5leHRSZXEsIG5vZGVOZXh0UmVzLCBuZXcgUmVzcG9uc2UoY2FjaGVFbnRyeS52YWx1ZS5ib2R5LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IGNhY2hlRW50cnkudmFsdWUuc3RhdHVzIHx8IDIwMFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFRPRE86IGFjdGl2ZVNwYW4gY29kZSBwYXRoIGlzIGZvciB3aGVuIHdyYXBwZWQgYnlcbiAgICAgICAgLy8gbmV4dC1zZXJ2ZXIgY2FuIGJlIHJlbW92ZWQgd2hlbiB0aGlzIGlzIG5vIGxvbmdlciB1c2VkXG4gICAgICAgIGlmIChhY3RpdmVTcGFuKSB7XG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVSZXNwb25zZShhY3RpdmVTcGFuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHRyYWNlci53aXRoUHJvcGFnYXRlZENvbnRleHQocmVxLmhlYWRlcnMsICgpPT50cmFjZXIudHJhY2UoQmFzZVNlcnZlclNwYW4uaGFuZGxlUmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICBzcGFuTmFtZTogYCR7bWV0aG9kfSAke3JlcS51cmx9YCxcbiAgICAgICAgICAgICAgICAgICAga2luZDogU3BhbktpbmQuU0VSVkVSLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaHR0cC5tZXRob2QnOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaHR0cC50YXJnZXQnOiByZXEudXJsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBoYW5kbGVSZXNwb25zZSkpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmICghKGVyciBpbnN0YW5jZW9mIE5vRmFsbGJhY2tFcnJvcikpIHtcbiAgICAgICAgICAgIGF3YWl0IHJvdXRlTW9kdWxlLm9uUmVxdWVzdEVycm9yKHJlcSwgZXJyLCB7XG4gICAgICAgICAgICAgICAgcm91dGVyS2luZDogJ0FwcCBSb3V0ZXInLFxuICAgICAgICAgICAgICAgIHJvdXRlUGF0aDogbm9ybWFsaXplZFNyY1BhZ2UsXG4gICAgICAgICAgICAgICAgcm91dGVUeXBlOiAncm91dGUnLFxuICAgICAgICAgICAgICAgIHJldmFsaWRhdGVSZWFzb246IGdldFJldmFsaWRhdGVSZWFzb24oe1xuICAgICAgICAgICAgICAgICAgICBpc1JldmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgICAgIGlzT25EZW1hbmRSZXZhbGlkYXRlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJldGhyb3cgc28gdGhhdCB3ZSBjYW4gaGFuZGxlIHNlcnZpbmcgZXJyb3IgcGFnZVxuICAgICAgICAvLyBJZiB0aGlzIGlzIGR1cmluZyBzdGF0aWMgZ2VuZXJhdGlvbiwgdGhyb3cgdGhlIGVycm9yIGFnYWluLlxuICAgICAgICBpZiAoaXNJc3IpIHRocm93IGVycjtcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBzZW5kIGEgNTAwIHJlc3BvbnNlLlxuICAgICAgICBhd2FpdCBzZW5kUmVzcG9uc2Uobm9kZU5leHRSZXEsIG5vZGVOZXh0UmVzLCBuZXcgUmVzcG9uc2UobnVsbCwge1xuICAgICAgICAgICAgc3RhdHVzOiA1MDBcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXBcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompare-prices%2Froute&page=%2Fapi%2Fcompare-prices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompare-prices%2Froute.js&appDir=C%3A%5CUsers%5Cmathe%5Cenxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmathe%5Cenxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/undici","vendor-chunks/cheerio","vendor-chunks/parse5-htmlparser2-tree-adapter","vendor-chunks/parse5-parser-stream","vendor-chunks/cheerio-select","vendor-chunks/iconv-lite","vendor-chunks/axios","vendor-chunks/mime-db","vendor-chunks/encoding-sniffer","vendor-chunks/follow-redirects","vendor-chunks/css-what","vendor-chunks/get-intrinsic","vendor-chunks/asynckit","vendor-chunks/nth-check","vendor-chunks/combined-stream","vendor-chunks/mime-types","vendor-chunks/proxy-from-env","vendor-chunks/has-symbols","vendor-chunks/delayed-stream","vendor-chunks/function-bind","vendor-chunks/safer-buffer","vendor-chunks/domelementtype","vendor-chunks/es-set-tostringtag","vendor-chunks/get-proto","vendor-chunks/call-bind-apply-helpers","vendor-chunks/dunder-proto","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/gopd","vendor-chunks/es-define-property","vendor-chunks/hasown","vendor-chunks/has-tostringtag","vendor-chunks/boolbase","vendor-chunks/es-object-atoms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompare-prices%2Froute&page=%2Fapi%2Fcompare-prices%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompare-prices%2Froute.js&appDir=C%3A%5CUsers%5Cmathe%5Cenxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmathe%5Cenxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!")));
module.exports = __webpack_exports__;

})();