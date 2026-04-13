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
exports.id = "app/api/extract-product/route";
exports.ids = ["app/api/extract-product/route"];
exports.modules = {

/***/ "(rsc)/./app/api/extract-product/route.js":
/*!******************************************!*\
  !*** ./app/api/extract-product/route.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! axios */ \"(rsc)/./node_modules/axios/lib/axios.js\");\n/* harmony import */ var cheerio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cheerio */ \"(rsc)/./node_modules/cheerio/dist/esm/index.js\");\n/* harmony import */ var https__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! https */ \"https\");\n/* harmony import */ var https__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(https__WEBPACK_IMPORTED_MODULE_1__);\n// app/api/extract-product/route.js\n\n\n\nconst httpsAgent = new (https__WEBPACK_IMPORTED_MODULE_1___default().Agent)({\n    rejectUnauthorized: false\n});\nconst UA_LIST = [\n    \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36\",\n    \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36\"\n];\nconst rUA = ()=>UA_LIST[Math.floor(Math.random() * UA_LIST.length)];\nconst baseHeaders = (url)=>({\n        \"User-Agent\": rUA(),\n        \"Accept\": \"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\",\n        \"Accept-Language\": \"pt-BR,pt;q=0.9,en;q=0.7\",\n        \"Accept-Encoding\": \"gzip, deflate, br\",\n        \"Cache-Control\": \"no-cache\",\n        \"Pragma\": \"no-cache\",\n        \"Referer\": new URL(url).origin,\n        \"sec-fetch-dest\": \"document\",\n        \"sec-fetch-mode\": \"navigate\",\n        \"sec-fetch-site\": \"none\",\n        \"upgrade-insecure-requests\": \"1\"\n    });\n// ── Configurações de seletores por loja ──────────────────\nconst STORES = {\n    \"amazon.com.br\": {\n        name: [\n            \"#productTitle\",\n            \"#title\"\n        ],\n        price: [\n            \".priceToPay .a-offscreen\",\n            \"#priceblock_ourprice\",\n            \".a-price-whole\"\n        ],\n        image: [\n            \"#imgTagWrapperId img\",\n            \"#landingImage\"\n        ]\n    },\n    \"mercadolivre.com.br\": {\n        name: [\n            \".ui-pdp-title\",\n            \"h1.ui-pdp-title\"\n        ],\n        price: [\n            \".ui-pdp-price__second-line .andes-money-amount__fraction\",\n            'meta[itemprop=\"price\"]'\n        ],\n        image: [\n            \".ui-pdp-gallery__figure img\"\n        ]\n    },\n    \"shopee.com.br\": {\n        // Shopee usa React/SPA; dados ficam em JSON da página ou meta tags\n        name: [\n            'meta[property=\"og:title\"]',\n            \".pdp-product-title\",\n            \"h1\"\n        ],\n        price: [\n            'meta[property=\"product:price:amount\"]',\n            \".pdp-price\",\n            \"._3n5NQx\"\n        ],\n        image: [\n            'meta[property=\"og:image\"]',\n            \".pdp-image img\"\n        ],\n        // Shopee precisa de cookie especial, tentamos o JSON embutido\n        useJsonExtraction: true\n    },\n    \"magazineluiza.com.br\": {\n        name: [\n            '[data-testid=\"heading-product-title\"]',\n            \"h1\"\n        ],\n        price: [\n            '[data-testid=\"price-value\"]'\n        ],\n        image: [\n            \"picture img\"\n        ]\n    },\n    \"casasbahia.com.br\": {\n        name: [\n            \"h1.product-title\",\n            \"h1\"\n        ],\n        price: [\n            \".product-price__value\",\n            '[class*=\"price\"]'\n        ],\n        image: [\n            \"#js-product-image\",\n            \".product-image img\"\n        ]\n    },\n    \"americanas.com.br\": {\n        name: [\n            \"h1.product-title\",\n            \"h1\"\n        ],\n        price: [\n            \".priceSales\",\n            '[class*=\"price\"]'\n        ],\n        image: [\n            \".zoom img\"\n        ]\n    },\n    \"leroymerlin.com.br\": {\n        name: [\n            \"h1.product-name\",\n            \"h1\"\n        ],\n        price: [\n            \".price-box__price\",\n            '[class*=\"price\"]'\n        ],\n        image: [\n            \"picture img\"\n        ]\n    },\n    \"tokstok.com.br\": {\n        name: [\n            \"h1\"\n        ],\n        price: [\n            '[class*=\"price\"]',\n            '[class*=\"Price\"]'\n        ],\n        image: [\n            \"picture img\",\n            \"img.product-image\"\n        ]\n    }\n};\nfunction getStore(url) {\n    try {\n        const h = new URL(url).hostname.toLowerCase();\n        for (const [d, cfg] of Object.entries(STORES)){\n            if (h.includes(d)) return cfg;\n        }\n    } catch  {}\n    return null;\n}\n// ── Shopee: extrai dados do JSON embutido no HTML ────────\nfunction extractShopeeJson(html) {\n    try {\n        // Shopee injeta dados em window.__INITIAL_STATE__ ou similar\n        const patterns = [\n            /\"name\"\\s*:\\s*\"([^\"]{5,200})\"/,\n            /\"item_name\"\\s*:\\s*\"([^\"]{5,200})\"/\n        ];\n        for (const p of patterns){\n            const m = html.match(p);\n            if (m) return {\n                name: m[1],\n                price: null,\n                imageUrl: null\n            };\n        }\n        // Tenta extrair preço do JSON\n        const priceMatch = html.match(/\"price\"\\s*:\\s*(\\d+)/);\n        const price = priceMatch ? parseInt(priceMatch[1]) / 100000 : null; // Shopee usa centavos × 1000\n        return {\n            name: null,\n            price,\n            imageUrl: null\n        };\n    } catch  {\n        return null;\n    }\n}\n// ── Extrai texto de seletores ────────────────────────────\nfunction getText($, sels) {\n    for (const s of sels || []){\n        if (s.startsWith(\"meta\")) {\n            const v = $(s).attr(\"content\");\n            if (v?.trim()) return v.trim();\n        }\n        const t = $(s).first().text().replace(/\\s+/g, \" \").trim();\n        if (t && t.length > 2) return t;\n    }\n    return null;\n}\nfunction getAttr($, sels, attr) {\n    for (const s of sels || []){\n        const v = $(s).first().attr(attr);\n        if (v?.trim() && !v.startsWith(\"data:\")) return v.trim();\n    }\n    return null;\n}\n// ── Extrai Open Graph ────────────────────────────────────\nfunction getOG($) {\n    const m = (...props)=>{\n        for (const p of props){\n            const v = $(`meta[property=\"${p}\"]`).attr(\"content\") || $(`meta[name=\"${p}\"]`).attr(\"content\");\n            if (v?.trim()) return v.trim();\n        }\n        return null;\n    };\n    return {\n        name: m(\"og:title\", \"twitter:title\"),\n        imageUrl: m(\"og:image\", \"twitter:image\", \"og:image:secure_url\"),\n        price: m(\"product:price:amount\", \"og:price:amount\", \"price\")\n    };\n}\n// ── Parse de preço ───────────────────────────────────────\nfunction parsePrice(str) {\n    if (!str) return null;\n    const c = String(str).replace(/R\\$\\s*/g, \"\").replace(/\\s/g, \"\").replace(/\\.(?=\\d{3})/g, \"\").replace(\",\", \".\");\n    const n = parseFloat(c);\n    return !isNaN(n) && n > 0 && n < 500000 ? n : null;\n}\nfunction extractPrice($, storeSels) {\n    const all = [\n        ...storeSels || [],\n        '[class*=\"price\"]',\n        '[class*=\"preco\"]',\n        '[class*=\"valor\"]',\n        \".price\"\n    ];\n    for (const s of all){\n        if (s.startsWith(\"meta\")) {\n            const n = parsePrice($(s).attr(\"content\"));\n            if (n) return n;\n            continue;\n        }\n        const text = $(s).first().text().replace(/\\s+/g, \" \").trim();\n        if (!text) continue;\n        const m = text.match(/R\\$\\s*([\\d.,]+)/) || text.match(/([\\d]{1,3}(?:\\.[\\d]{3})*,\\d{2})/) || text.match(/([\\d]+,\\d{2})/);\n        if (m) {\n            const n = parsePrice(m[0] || m[1]);\n            if (n) return n;\n        }\n    }\n    return null;\n}\nfunction guessRoom(name) {\n    if (!name) return \"outro\";\n    const n = name.toLowerCase();\n    if (/sofá|sofa|rack|tapete|poltrona|luminária|quadro|aparador|televisão/.test(n)) return \"sala\";\n    if (/cama|colchão|cabeceira|guarda.roupa|cômoda|criado.mudo|travesseiro|edredom|lençol/.test(n)) return \"quarto\";\n    if (/panela|frigideira|geladeira|fogão|micro.ondas|liquidificador|batedeira|airfryer|prato|talher|copo/.test(n)) return \"cozinha\";\n    if (/toalha|saboneteira|box|vaso sanitário|cuba|torneira/.test(n)) return \"banheiro\";\n    return \"outro\";\n}\n// ── Handler principal ────────────────────────────────────\nasync function POST(req) {\n    let url;\n    try {\n        ({ url } = await req.json());\n    } catch  {\n        return Response.json({\n            error: \"Body inválido\"\n        }, {\n            status: 400\n        });\n    }\n    if (!url?.startsWith(\"http\")) return Response.json({\n        error: \"URL inválida\"\n    }, {\n        status: 400\n    });\n    // ── Fetch HTML ───────────────────────────────────────────\n    let html = \"\";\n    try {\n        const { data } = await axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].get(url, {\n            headers: baseHeaders(url),\n            timeout: 12000,\n            maxRedirects: 5,\n            httpsAgent,\n            responseType: \"text\",\n            decompress: true\n        });\n        html = data;\n    } catch (err) {\n        console.error(\"[extract-product] fetch:\", err.message);\n        // Fallback mínimo: retorna URL como link sem dados extraídos\n        return Response.json({\n            name: null,\n            price: null,\n            imageUrl: null,\n            brand: null,\n            suggestedRoom: \"outro\",\n            error: `Não foi possível acessar o site: ${err.message}`\n        }, {\n            status: 200\n        }); // 200 para o frontend mostrar mensagem de fallback\n    }\n    const $ = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(html);\n    const cfg = getStore(url);\n    const og = getOG($);\n    // ── Shopee: tenta JSON embutido primeiro ─────────────────\n    let shopeeData = null;\n    if (cfg?.useJsonExtraction) {\n        shopeeData = extractShopeeJson(html);\n    }\n    // ── Nome ─────────────────────────────────────────────────\n    const rawName = shopeeData?.name || (cfg?.name ? getText($, cfg.name) : null) || og.name || $(\"h1\").first().text().trim() || $(\"title\").text().replace(/\\s*[-|].*$/, \"\").trim() || null;\n    // ── Preço ────────────────────────────────────────────────\n    const price = shopeeData?.price || extractPrice($, cfg?.price) || parsePrice(og.price) || null;\n    // ── Imagem ───────────────────────────────────────────────\n    const imageUrl = shopeeData?.imageUrl || (cfg?.image ? getAttr($, cfg.image, \"src\") : null) || og.imageUrl || null;\n    // ── Marca ────────────────────────────────────────────────\n    const brand = $('meta[property=\"og:brand\"]').attr(\"content\") || $('[itemprop=\"brand\"] [itemprop=\"name\"]').first().text().trim() || null;\n    const name = rawName?.replace(/\\s*[-|–]\\s*.*(Amazon|Mercado|Shopee|Magalu|Americanas|Casas Bahia).*$/i, \"\").trim().slice(0, 200) || null;\n    console.log(\"[extract-product]\", {\n        name,\n        price: !!price,\n        image: !!imageUrl\n    });\n    return Response.json({\n        name,\n        price: price != null ? String(price) : null,\n        imageUrl: imageUrl || null,\n        brand: brand || null,\n        suggestedRoom: guessRoom(name)\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2V4dHJhY3QtcHJvZHVjdC9yb3V0ZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLG1DQUFtQztBQUNUO0FBQ1M7QUFDVDtBQUUxQixNQUFNRyxhQUFhLElBQUlELG9EQUFXLENBQUM7SUFBRUcsb0JBQW9CO0FBQU07QUFFL0QsTUFBTUMsVUFBVTtJQUNkO0lBQ0E7Q0FDRDtBQUNELE1BQU1DLE1BQU0sSUFBTUQsT0FBTyxDQUFDRSxLQUFLQyxLQUFLLENBQUNELEtBQUtFLE1BQU0sS0FBS0osUUFBUUssTUFBTSxFQUFFO0FBRXJFLE1BQU1DLGNBQWMsQ0FBQ0MsTUFBUztRQUM1QixjQUE2Qk47UUFDN0IsVUFBNkI7UUFDN0IsbUJBQTZCO1FBQzdCLG1CQUE2QjtRQUM3QixpQkFBNkI7UUFDN0IsVUFBNkI7UUFDN0IsV0FBNkIsSUFBSU8sSUFBSUQsS0FBS0UsTUFBTTtRQUNoRCxrQkFBNkI7UUFDN0Isa0JBQTZCO1FBQzdCLGtCQUE2QjtRQUM3Qiw2QkFBNkI7SUFDL0I7QUFFQSw0REFBNEQ7QUFDNUQsTUFBTUMsU0FBUztJQUNiLGlCQUFpQjtRQUNmQyxNQUFPO1lBQUM7WUFBaUI7U0FBUztRQUNsQ0MsT0FBTztZQUFDO1lBQTRCO1lBQXdCO1NBQWlCO1FBQzdFQyxPQUFPO1lBQUM7WUFBd0I7U0FBZ0I7SUFDbEQ7SUFDQSx1QkFBdUI7UUFDckJGLE1BQU87WUFBQztZQUFpQjtTQUFrQjtRQUMzQ0MsT0FBTztZQUFDO1lBQ0E7U0FBeUI7UUFDakNDLE9BQU87WUFBQztTQUE4QjtJQUN4QztJQUNBLGlCQUFpQjtRQUNmLG1FQUFtRTtRQUNuRUYsTUFBTztZQUFDO1lBQTZCO1lBQXNCO1NBQUs7UUFDaEVDLE9BQU87WUFBQztZQUF5QztZQUFjO1NBQVc7UUFDMUVDLE9BQU87WUFBQztZQUE2QjtTQUFpQjtRQUN0RCw4REFBOEQ7UUFDOURDLG1CQUFtQjtJQUNyQjtJQUNBLHdCQUF3QjtRQUN0QkgsTUFBTztZQUFDO1lBQXlDO1NB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QVEsSUFDWDtJQUVGLDREQUE0RDtJQUM1RCxNQUFNOEMsUUFDSjFDLEVBQUUsNkJBQTZCSyxJQUFJLENBQUMsY0FDcENMLEVBQUUsd0NBQXdDUSxLQUFLLEdBQUdDLElBQUksR0FBR0gsSUFBSSxNQUM3RDtJQUVGLE1BQU03QixPQUFPc0UsU0FDVHJDLFFBQVEsMEVBQTBFLElBQ25GSixPQUFPMEMsTUFBTSxHQUFHLFFBQVE7SUFFM0JSLFFBQVFTLEdBQUcsQ0FBQyxxQkFBcUI7UUFBRXhFO1FBQU1DLE9BQU8sQ0FBQyxDQUFDQTtRQUFPQyxPQUFPLENBQUMsQ0FBQ2lCO0lBQVM7SUFFM0UsT0FBT2lDLFNBQVNELElBQUksQ0FBQztRQUNuQm5EO1FBQ0FDLE9BQWVBLFNBQVMsT0FBT3VDLE9BQU92QyxTQUFTO1FBQy9Da0IsVUFBZUEsWUFBWTtRQUMzQjhDLE9BQWVBLFNBQVc7UUFDMUJDLGVBQWVuQixVQUFVL0M7SUFDM0I7QUFDRiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxtYXRoZVxcZW54b3ZhbFxcYXBwXFxhcGlcXGV4dHJhY3QtcHJvZHVjdFxccm91dGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gYXBwL2FwaS9leHRyYWN0LXByb2R1Y3Qvcm91dGUuanNcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCAqIGFzIGNoZWVyaW8gZnJvbSBcImNoZWVyaW9cIjtcbmltcG9ydCBodHRwcyBmcm9tIFwiaHR0cHNcIjtcblxuY29uc3QgaHR0cHNBZ2VudCA9IG5ldyBodHRwcy5BZ2VudCh7IHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2UgfSk7XG5cbmNvbnN0IFVBX0xJU1QgPSBbXG4gIFwiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyNC4wLjAuMCBTYWZhcmkvNTM3LjM2XCIsXG4gIFwiTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyNC4wLjAuMCBTYWZhcmkvNTM3LjM2XCIsXG5dO1xuY29uc3QgclVBID0gKCkgPT4gVUFfTElTVFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBVQV9MSVNULmxlbmd0aCldO1xuXG5jb25zdCBiYXNlSGVhZGVycyA9ICh1cmwpID0+ICh7XG4gIFwiVXNlci1BZ2VudFwiOiAgICAgICAgICAgICAgICByVUEoKSxcbiAgXCJBY2NlcHRcIjogICAgICAgICAgICAgICAgICAgIFwidGV4dC9odG1sLGFwcGxpY2F0aW9uL3hodG1sK3htbCxhcHBsaWNhdGlvbi94bWw7cT0wLjksKi8qO3E9MC44XCIsXG4gIFwiQWNjZXB0LUxhbmd1YWdlXCI6ICAgICAgICAgICBcInB0LUJSLHB0O3E9MC45LGVuO3E9MC43XCIsXG4gIFwiQWNjZXB0LUVuY29kaW5nXCI6ICAgICAgICAgICBcImd6aXAsIGRlZmxhdGUsIGJyXCIsXG4gIFwiQ2FjaGUtQ29udHJvbFwiOiAgICAgICAgICAgICBcIm5vLWNhY2hlXCIsXG4gIFwiUHJhZ21hXCI6ICAgICAgICAgICAgICAgICAgICBcIm5vLWNhY2hlXCIsXG4gIFwiUmVmZXJlclwiOiAgICAgICAgICAgICAgICAgICBuZXcgVVJMKHVybCkub3JpZ2luLFxuICBcInNlYy1mZXRjaC1kZXN0XCI6ICAgICAgICAgICAgXCJkb2N1bWVudFwiLFxuICBcInNlYy1mZXRjaC1tb2RlXCI6ICAgICAgICAgICAgXCJuYXZpZ2F0ZVwiLFxuICBcInNlYy1mZXRjaC1zaXRlXCI6ICAgICAgICAgICAgXCJub25lXCIsXG4gIFwidXBncmFkZS1pbnNlY3VyZS1yZXF1ZXN0c1wiOiBcIjFcIixcbn0pO1xuXG4vLyDilIDilIAgQ29uZmlndXJhw6fDtWVzIGRlIHNlbGV0b3JlcyBwb3IgbG9qYSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmNvbnN0IFNUT1JFUyA9IHtcbiAgXCJhbWF6b24uY29tLmJyXCI6IHtcbiAgICBuYW1lOiAgW1wiI3Byb2R1Y3RUaXRsZVwiLCBcIiN0aXRsZVwiXSxcbiAgICBwcmljZTogW1wiLnByaWNlVG9QYXkgLmEtb2Zmc2NyZWVuXCIsIFwiI3ByaWNlYmxvY2tfb3VycHJpY2VcIiwgXCIuYS1wcmljZS13aG9sZVwiXSxcbiAgICBpbWFnZTogW1wiI2ltZ1RhZ1dyYXBwZXJJZCBpbWdcIiwgXCIjbGFuZGluZ0ltYWdlXCJdLFxuICB9LFxuICBcIm1lcmNhZG9saXZyZS5jb20uYnJcIjoge1xuICAgIG5hbWU6ICBbXCIudWktcGRwLXRpdGxlXCIsIFwiaDEudWktcGRwLXRpdGxlXCJdLFxuICAgIHByaWNlOiBbXCIudWktcGRwLXByaWNlX19zZWNvbmQtbGluZSAuYW5kZXMtbW9uZXktYW1vdW50X19mcmFjdGlvblwiLFxuICAgICAgICAgICAgJ21ldGFbaXRlbXByb3A9XCJwcmljZVwiXSddLFxuICAgIGltYWdlOiBbXCIudWktcGRwLWdhbGxlcnlfX2ZpZ3VyZSBpbWdcIl0sXG4gIH0sXG4gIFwic2hvcGVlLmNvbS5iclwiOiB7XG4gICAgLy8gU2hvcGVlIHVzYSBSZWFjdC9TUEE7IGRhZG9zIGZpY2FtIGVtIEpTT04gZGEgcMOhZ2luYSBvdSBtZXRhIHRhZ3NcbiAgICBuYW1lOiAgWydtZXRhW3Byb3BlcnR5PVwib2c6dGl0bGVcIl0nLCBcIi5wZHAtcHJvZHVjdC10aXRsZVwiLCBcImgxXCJdLFxuICAgIHByaWNlOiBbJ21ldGFbcHJvcGVydHk9XCJwcm9kdWN0OnByaWNlOmFtb3VudFwiXScsIFwiLnBkcC1wcmljZVwiLCBcIi5fM241TlF4XCJdLFxuICAgIGltYWdlOiBbJ21ldGFbcHJvcGVydHk9XCJvZzppbWFnZVwiXScsIFwiLnBkcC1pbWFnZSBpbWdcIl0sXG4gICAgLy8gU2hvcGVlIHByZWNpc2EgZGUgY29va2llIGVzcGVjaWFsLCB0ZW50YW1vcyBvIEpTT04gZW1idXRpZG9cbiAgICB1c2VKc29uRXh0cmFjdGlvbjogdHJ1ZSxcbiAgfSxcbiAgXCJtYWdhemluZWx1aXphLmNvbS5iclwiOiB7XG4gICAgbmFtZTogIFsnW2RhdGEtdGVzdGlkPVwiaGVhZGluZy1wcm9kdWN0LXRpdGxlXCJdJywgXCJoMVwiXSxcbiAgICBwcmljZTogWydbZGF0YS10ZXN0aWQ9XCJwcmljZS12YWx1ZVwiXSddLFxuICAgIGltYWdlOiBbXCJwaWN0dXJlIGltZ1wiXSxcbiAgfSxcbiAgXCJjYXNhc2JhaGlhLmNvbS5iclwiOiB7XG4gICAgbmFtZTogIFtcImgxLnByb2R1Y3QtdGl0bGVcIiwgXCJoMVwiXSxcbiAgICBwcmljZTogW1wiLnByb2R1Y3QtcHJpY2VfX3ZhbHVlXCIsICdbY2xhc3MqPVwicHJpY2VcIl0nXSxcbiAgICBpbWFnZTogW1wiI2pzLXByb2R1Y3QtaW1hZ2VcIiwgXCIucHJvZHVjdC1pbWFnZSBpbWdcIl0sXG4gIH0sXG4gIFwiYW1lcmljYW5hcy5jb20uYnJcIjoge1xuICAgIG5hbWU6ICBbXCJoMS5wcm9kdWN0LXRpdGxlXCIsIFwiaDFcIl0sXG4gICAgcHJpY2U6IFtcIi5wcmljZVNhbGVzXCIsICdbY2xhc3MqPVwicHJpY2VcIl0nXSxcbiAgICBpbWFnZTogW1wiLnpvb20gaW1nXCJdLFxuICB9LFxuICBcImxlcm95bWVybGluLmNvbS5iclwiOiB7XG4gICAgbmFtZTogIFtcImgxLnByb2R1Y3QtbmFtZVwiLCBcImgxXCJdLFxuICAgIHByaWNlOiBbXCIucHJpY2UtYm94X19wcmljZVwiLCAnW2NsYXNzKj1cInByaWNlXCJdJ10sXG4gICAgaW1hZ2U6IFtcInBpY3R1cmUgaW1nXCJdLFxuICB9LFxuICBcInRva3N0b2suY29tLmJyXCI6IHtcbiAgICBuYW1lOiAgW1wiaDFcIl0sXG4gICAgcHJpY2U6IFsnW2NsYXNzKj1cInByaWNlXCJdJywgJ1tjbGFzcyo9XCJQcmljZVwiXSddLFxuICAgIGltYWdlOiBbXCJwaWN0dXJlIGltZ1wiLCBcImltZy5wcm9kdWN0LWltYWdlXCJdLFxuICB9LFxufTtcblxuZnVuY3Rpb24gZ2V0U3RvcmUodXJsKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgaCA9IG5ldyBVUkwodXJsKS5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciAoY29uc3QgW2QsIGNmZ10gb2YgT2JqZWN0LmVudHJpZXMoU1RPUkVTKSkge1xuICAgICAgaWYgKGguaW5jbHVkZXMoZCkpIHJldHVybiBjZmc7XG4gICAgfVxuICB9IGNhdGNoIHt9XG4gIHJldHVybiBudWxsO1xufVxuXG4vLyDilIDilIAgU2hvcGVlOiBleHRyYWkgZGFkb3MgZG8gSlNPTiBlbWJ1dGlkbyBubyBIVE1MIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuZnVuY3Rpb24gZXh0cmFjdFNob3BlZUpzb24oaHRtbCkge1xuICB0cnkge1xuICAgIC8vIFNob3BlZSBpbmpldGEgZGFkb3MgZW0gd2luZG93Ll9fSU5JVElBTF9TVEFURV9fIG91IHNpbWlsYXJcbiAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgIC9cIm5hbWVcIlxccyo6XFxzKlwiKFteXCJdezUsMjAwfSlcIi8sXG4gICAgICAvXCJpdGVtX25hbWVcIlxccyo6XFxzKlwiKFteXCJdezUsMjAwfSlcIi8sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGF0dGVybnMpIHtcbiAgICAgIGNvbnN0IG0gPSBodG1sLm1hdGNoKHApO1xuICAgICAgaWYgKG0pIHJldHVybiB7IG5hbWU6IG1bMV0sIHByaWNlOiBudWxsLCBpbWFnZVVybDogbnVsbCB9O1xuICAgIH1cbiAgICAvLyBUZW50YSBleHRyYWlyIHByZcOnbyBkbyBKU09OXG4gICAgY29uc3QgcHJpY2VNYXRjaCA9IGh0bWwubWF0Y2goL1wicHJpY2VcIlxccyo6XFxzKihcXGQrKS8pO1xuICAgIGNvbnN0IHByaWNlID0gcHJpY2VNYXRjaCA/IHBhcnNlSW50KHByaWNlTWF0Y2hbMV0pIC8gMTAwMDAwIDogbnVsbDsgLy8gU2hvcGVlIHVzYSBjZW50YXZvcyDDlyAxMDAwXG4gICAgcmV0dXJuIHsgbmFtZTogbnVsbCwgcHJpY2UsIGltYWdlVXJsOiBudWxsIH07XG4gIH0gY2F0Y2ggeyByZXR1cm4gbnVsbDsgfVxufVxuXG4vLyDilIDilIAgRXh0cmFpIHRleHRvIGRlIHNlbGV0b3JlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmZ1bmN0aW9uIGdldFRleHQoJCwgc2Vscykge1xuICBmb3IgKGNvbnN0IHMgb2YgKHNlbHMgfHwgW10pKSB7XG4gICAgaWYgKHMuc3RhcnRzV2l0aChcIm1ldGFcIikpIHtcbiAgICAgIGNvbnN0IHYgPSAkKHMpLmF0dHIoXCJjb250ZW50XCIpO1xuICAgICAgaWYgKHY/LnRyaW0oKSkgcmV0dXJuIHYudHJpbSgpO1xuICAgIH1cbiAgICBjb25zdCB0ID0gJChzKS5maXJzdCgpLnRleHQoKS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKS50cmltKCk7XG4gICAgaWYgKHQgJiYgdC5sZW5ndGggPiAyKSByZXR1cm4gdDtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0QXR0cigkLCBzZWxzLCBhdHRyKSB7XG4gIGZvciAoY29uc3QgcyBvZiAoc2VscyB8fCBbXSkpIHtcbiAgICBjb25zdCB2ID0gJChzKS5maXJzdCgpLmF0dHIoYXR0cik7XG4gICAgaWYgKHY/LnRyaW0oKSAmJiAhdi5zdGFydHNXaXRoKFwiZGF0YTpcIikpIHJldHVybiB2LnRyaW0oKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8g4pSA4pSAIEV4dHJhaSBPcGVuIEdyYXBoIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuZnVuY3Rpb24gZ2V0T0coJCkge1xuICBjb25zdCBtID0gKC4uLnByb3BzKSA9PiB7XG4gICAgZm9yIChjb25zdCBwIG9mIHByb3BzKSB7XG4gICAgICBjb25zdCB2ID0gJChgbWV0YVtwcm9wZXJ0eT1cIiR7cH1cIl1gKS5hdHRyKFwiY29udGVudFwiKSB8fFxuICAgICAgICAgICAgICAgICQoYG1ldGFbbmFtZT1cIiR7cH1cIl1gKS5hdHRyKFwiY29udGVudFwiKTtcbiAgICAgIGlmICh2Py50cmltKCkpIHJldHVybiB2LnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIHJldHVybiB7XG4gICAgbmFtZTogICAgIG0oXCJvZzp0aXRsZVwiLCBcInR3aXR0ZXI6dGl0bGVcIiksXG4gICAgaW1hZ2VVcmw6IG0oXCJvZzppbWFnZVwiLCBcInR3aXR0ZXI6aW1hZ2VcIiwgXCJvZzppbWFnZTpzZWN1cmVfdXJsXCIpLFxuICAgIHByaWNlOiAgICBtKFwicHJvZHVjdDpwcmljZTphbW91bnRcIiwgXCJvZzpwcmljZTphbW91bnRcIiwgXCJwcmljZVwiKSxcbiAgfTtcbn1cblxuLy8g4pSA4pSAIFBhcnNlIGRlIHByZcOnbyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmZ1bmN0aW9uIHBhcnNlUHJpY2Uoc3RyKSB7XG4gIGlmICghc3RyKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgYyA9IFN0cmluZyhzdHIpXG4gICAgLnJlcGxhY2UoL1JcXCRcXHMqL2csIFwiXCIpXG4gICAgLnJlcGxhY2UoL1xccy9nLCBcIlwiKVxuICAgIC5yZXBsYWNlKC9cXC4oPz1cXGR7M30pL2csIFwiXCIpXG4gICAgLnJlcGxhY2UoXCIsXCIsIFwiLlwiKTtcbiAgY29uc3QgbiA9IHBhcnNlRmxvYXQoYyk7XG4gIHJldHVybiAoIWlzTmFOKG4pICYmIG4gPiAwICYmIG4gPCA1MDBfMDAwKSA/IG4gOiBudWxsO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0UHJpY2UoJCwgc3RvcmVTZWxzKSB7XG4gIGNvbnN0IGFsbCA9IFsuLi4oc3RvcmVTZWxzIHx8IFtdKSxcbiAgICAnW2NsYXNzKj1cInByaWNlXCJdJywgJ1tjbGFzcyo9XCJwcmVjb1wiXScsICdbY2xhc3MqPVwidmFsb3JcIl0nLCBcIi5wcmljZVwiXTtcbiAgZm9yIChjb25zdCBzIG9mIGFsbCkge1xuICAgIGlmIChzLnN0YXJ0c1dpdGgoXCJtZXRhXCIpKSB7XG4gICAgICBjb25zdCBuID0gcGFyc2VQcmljZSgkKHMpLmF0dHIoXCJjb250ZW50XCIpKTtcbiAgICAgIGlmIChuKSByZXR1cm4gbjtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCB0ZXh0ID0gJChzKS5maXJzdCgpLnRleHQoKS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKS50cmltKCk7XG4gICAgaWYgKCF0ZXh0KSBjb250aW51ZTtcbiAgICBjb25zdCBtID0gdGV4dC5tYXRjaCgvUlxcJFxccyooW1xcZC4sXSspLykgfHxcbiAgICAgICAgICAgICAgdGV4dC5tYXRjaCgvKFtcXGRdezEsM30oPzpcXC5bXFxkXXszfSkqLFxcZHsyfSkvKSB8fFxuICAgICAgICAgICAgICB0ZXh0Lm1hdGNoKC8oW1xcZF0rLFxcZHsyfSkvKTtcbiAgICBpZiAobSkge1xuICAgICAgY29uc3QgbiA9IHBhcnNlUHJpY2UobVswXSB8fCBtWzFdKTtcbiAgICAgIGlmIChuKSByZXR1cm4gbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGd1ZXNzUm9vbShuYW1lKSB7XG4gIGlmICghbmFtZSkgcmV0dXJuIFwib3V0cm9cIjtcbiAgY29uc3QgbiA9IG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgaWYgKC9zb2bDoXxzb2ZhfHJhY2t8dGFwZXRlfHBvbHRyb25hfGx1bWluw6FyaWF8cXVhZHJvfGFwYXJhZG9yfHRlbGV2aXPDo28vLnRlc3QobikpIHJldHVybiBcInNhbGFcIjtcbiAgaWYgKC9jYW1hfGNvbGNow6NvfGNhYmVjZWlyYXxndWFyZGEucm91cGF8Y8O0bW9kYXxjcmlhZG8ubXVkb3x0cmF2ZXNzZWlyb3xlZHJlZG9tfGxlbsOnb2wvLnRlc3QobikpIHJldHVybiBcInF1YXJ0b1wiO1xuICBpZiAoL3BhbmVsYXxmcmlnaWRlaXJhfGdlbGFkZWlyYXxmb2fDo298bWljcm8ub25kYXN8bGlxdWlkaWZpY2Fkb3J8YmF0ZWRlaXJhfGFpcmZyeWVyfHByYXRvfHRhbGhlcnxjb3BvLy50ZXN0KG4pKSByZXR1cm4gXCJjb3ppbmhhXCI7XG4gIGlmICgvdG9hbGhhfHNhYm9uZXRlaXJhfGJveHx2YXNvIHNhbml0w6FyaW98Y3ViYXx0b3JuZWlyYS8udGVzdChuKSkgcmV0dXJuIFwiYmFuaGVpcm9cIjtcbiAgcmV0dXJuIFwib3V0cm9cIjtcbn1cblxuLy8g4pSA4pSAIEhhbmRsZXIgcHJpbmNpcGFsIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxKSB7XG4gIGxldCB1cmw7XG4gIHRyeSB7ICh7IHVybCB9ID0gYXdhaXQgcmVxLmpzb24oKSk7IH1cbiAgY2F0Y2ggeyByZXR1cm4gUmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkJvZHkgaW52w6FsaWRvXCIgfSwgeyBzdGF0dXM6IDQwMCB9KTsgfVxuXG4gIGlmICghdXJsPy5zdGFydHNXaXRoKFwiaHR0cFwiKSlcbiAgICByZXR1cm4gUmVzcG9uc2UuanNvbih7IGVycm9yOiBcIlVSTCBpbnbDoWxpZGFcIiB9LCB7IHN0YXR1czogNDAwIH0pO1xuXG4gIC8vIOKUgOKUgCBGZXRjaCBIVE1MIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICBsZXQgaHRtbCA9IFwiXCI7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBheGlvcy5nZXQodXJsLCB7XG4gICAgICBoZWFkZXJzOiAgICAgIGJhc2VIZWFkZXJzKHVybCksXG4gICAgICB0aW1lb3V0OiAgICAgIDEyXzAwMCxcbiAgICAgIG1heFJlZGlyZWN0czogNSxcbiAgICAgIGh0dHBzQWdlbnQsXG4gICAgICByZXNwb25zZVR5cGU6IFwidGV4dFwiLFxuICAgICAgZGVjb21wcmVzczogICB0cnVlLFxuICAgIH0pO1xuICAgIGh0bWwgPSBkYXRhO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiW2V4dHJhY3QtcHJvZHVjdF0gZmV0Y2g6XCIsIGVyci5tZXNzYWdlKTtcbiAgICAvLyBGYWxsYmFjayBtw61uaW1vOiByZXRvcm5hIFVSTCBjb21vIGxpbmsgc2VtIGRhZG9zIGV4dHJhw61kb3NcbiAgICByZXR1cm4gUmVzcG9uc2UuanNvbih7XG4gICAgICBuYW1lOiBudWxsLCBwcmljZTogbnVsbCwgaW1hZ2VVcmw6IG51bGwsXG4gICAgICBicmFuZDogbnVsbCwgc3VnZ2VzdGVkUm9vbTogXCJvdXRyb1wiLFxuICAgICAgZXJyb3I6IGBOw6NvIGZvaSBwb3Nzw612ZWwgYWNlc3NhciBvIHNpdGU6ICR7ZXJyLm1lc3NhZ2V9YCxcbiAgICB9LCB7IHN0YXR1czogMjAwIH0pOyAvLyAyMDAgcGFyYSBvIGZyb250ZW5kIG1vc3RyYXIgbWVuc2FnZW0gZGUgZmFsbGJhY2tcbiAgfVxuXG4gIGNvbnN0ICQgICA9IGNoZWVyaW8ubG9hZChodG1sKTtcbiAgY29uc3QgY2ZnID0gZ2V0U3RvcmUodXJsKTtcbiAgY29uc3Qgb2cgID0gZ2V0T0coJCk7XG5cbiAgLy8g4pSA4pSAIFNob3BlZTogdGVudGEgSlNPTiBlbWJ1dGlkbyBwcmltZWlybyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgbGV0IHNob3BlZURhdGEgPSBudWxsO1xuICBpZiAoY2ZnPy51c2VKc29uRXh0cmFjdGlvbikge1xuICAgIHNob3BlZURhdGEgPSBleHRyYWN0U2hvcGVlSnNvbihodG1sKTtcbiAgfVxuXG4gIC8vIOKUgOKUgCBOb21lIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICBjb25zdCByYXdOYW1lID1cbiAgICBzaG9wZWVEYXRhPy5uYW1lIHx8XG4gICAgKGNmZz8ubmFtZSA/IGdldFRleHQoJCwgY2ZnLm5hbWUpIDogbnVsbCkgfHxcbiAgICBvZy5uYW1lIHx8XG4gICAgJChcImgxXCIpLmZpcnN0KCkudGV4dCgpLnRyaW0oKSB8fFxuICAgICQoXCJ0aXRsZVwiKS50ZXh0KCkucmVwbGFjZSgvXFxzKlstfF0uKiQvLCBcIlwiKS50cmltKCkgfHxcbiAgICBudWxsO1xuXG4gIC8vIOKUgOKUgCBQcmXDp28g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIGNvbnN0IHByaWNlID1cbiAgICBzaG9wZWVEYXRhPy5wcmljZSB8fFxuICAgIGV4dHJhY3RQcmljZSgkLCBjZmc/LnByaWNlKSB8fFxuICAgIHBhcnNlUHJpY2Uob2cucHJpY2UpIHx8XG4gICAgbnVsbDtcblxuICAvLyDilIDilIAgSW1hZ2VtIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICBjb25zdCBpbWFnZVVybCA9XG4gICAgc2hvcGVlRGF0YT8uaW1hZ2VVcmwgfHxcbiAgICAoY2ZnPy5pbWFnZSA/IGdldEF0dHIoJCwgY2ZnLmltYWdlLCBcInNyY1wiKSA6IG51bGwpIHx8XG4gICAgb2cuaW1hZ2VVcmwgfHxcbiAgICBudWxsO1xuXG4gIC8vIOKUgOKUgCBNYXJjYSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgY29uc3QgYnJhbmQgPVxuICAgICQoJ21ldGFbcHJvcGVydHk9XCJvZzpicmFuZFwiXScpLmF0dHIoXCJjb250ZW50XCIpIHx8XG4gICAgJCgnW2l0ZW1wcm9wPVwiYnJhbmRcIl0gW2l0ZW1wcm9wPVwibmFtZVwiXScpLmZpcnN0KCkudGV4dCgpLnRyaW0oKSB8fFxuICAgIG51bGw7XG5cbiAgY29uc3QgbmFtZSA9IHJhd05hbWVcbiAgICA/LnJlcGxhY2UoL1xccypbLXzigJNdXFxzKi4qKEFtYXpvbnxNZXJjYWRvfFNob3BlZXxNYWdhbHV8QW1lcmljYW5hc3xDYXNhcyBCYWhpYSkuKiQvaSwgXCJcIilcbiAgICAudHJpbSgpLnNsaWNlKDAsIDIwMCkgfHwgbnVsbDtcblxuICBjb25zb2xlLmxvZyhcIltleHRyYWN0LXByb2R1Y3RdXCIsIHsgbmFtZSwgcHJpY2U6ICEhcHJpY2UsIGltYWdlOiAhIWltYWdlVXJsIH0pO1xuXG4gIHJldHVybiBSZXNwb25zZS5qc29uKHtcbiAgICBuYW1lLFxuICAgIHByaWNlOiAgICAgICAgIHByaWNlICE9IG51bGwgPyBTdHJpbmcocHJpY2UpIDogbnVsbCxcbiAgICBpbWFnZVVybDogICAgICBpbWFnZVVybCB8fCBudWxsLFxuICAgIGJyYW5kOiAgICAgICAgIGJyYW5kICAgfHwgbnVsbCxcbiAgICBzdWdnZXN0ZWRSb29tOiBndWVzc1Jvb20obmFtZSksXG4gIH0pO1xufVxuIl0sIm5hbWVzIjpbImF4aW9zIiwiY2hlZXJpbyIsImh0dHBzIiwiaHR0cHNBZ2VudCIsIkFnZW50IiwicmVqZWN0VW5hdXRob3JpemVkIiwiVUFfTElTVCIsInJVQSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsImJhc2VIZWFkZXJzIiwidXJsIiwiVVJMIiwib3JpZ2luIiwiU1RPUkVTIiwibmFtZSIsInByaWNlIiwiaW1hZ2UiLCJ1c2VKc29uRXh0cmFjdGlvbiIsImdldFN0b3JlIiwiaCIsImhvc3RuYW1lIiwidG9Mb3dlckNhc2UiLCJkIiwiY2ZnIiwiT2JqZWN0IiwiZW50cmllcyIsImluY2x1ZGVzIiwiZXh0cmFjdFNob3BlZUpzb24iLCJodG1sIiwicGF0dGVybnMiLCJwIiwibSIsIm1hdGNoIiwiaW1hZ2VVcmwiLCJwcmljZU1hdGNoIiwicGFyc2VJbnQiLCJnZXRUZXh0IiwiJCIsInNlbHMiLCJzIiwic3RhcnRzV2l0aCIsInYiLCJhdHRyIiwidHJpbSIsInQiLCJmaXJzdCIsInRleHQiLCJyZXBsYWNlIiwiZ2V0QXR0ciIsImdldE9HIiwicHJvcHMiLCJwYXJzZVByaWNlIiwic3RyIiwiYyIsIlN0cmluZyIsIm4iLCJwYXJzZUZsb2F0IiwiaXNOYU4iLCJleHRyYWN0UHJpY2UiLCJzdG9yZVNlbHMiLCJhbGwiLCJndWVzc1Jvb20iLCJ0ZXN0IiwiUE9TVCIsInJlcSIsImpzb24iLCJSZXNwb25zZSIsImVycm9yIiwic3RhdHVzIiwiZGF0YSIsImdldCIsImhlYWRlcnMiLCJ0aW1lb3V0IiwibWF4UmVkaXJlY3RzIiwicmVzcG9uc2VUeXBlIiwiZGVjb21wcmVzcyIsImVyciIsImNvbnNvbGUiLCJtZXNzYWdlIiwiYnJhbmQiLCJzdWdnZXN0ZWRSb29tIiwibG9hZCIsIm9nIiwic2hvcGVlRGF0YSIsInJhd05hbWUiLCJzbGljZSIsImxvZyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/extract-product/route.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fextract-product%2Froute&page=%2Fapi%2Fextract-product%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fextract-product%2Froute.js&appDir=C%3A%5CUsers%5Cmathe%5Cenxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmathe%5Cenxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fextract-product%2Froute&page=%2Fapi%2Fextract-product%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fextract-product%2Froute.js&appDir=C%3A%5CUsers%5Cmathe%5Cenxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmathe%5Cenxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   handler: () => (/* binding */ handler),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/request-meta */ \"(rsc)/./node_modules/next/dist/server/request-meta.js\");\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/dist/server/lib/trace/tracer */ \"(rsc)/./node_modules/next/dist/server/lib/trace/tracer.js\");\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/shared/lib/router/utils/app-paths */ \"next/dist/shared/lib/router/utils/app-paths\");\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/base-http/node */ \"(rsc)/./node_modules/next/dist/server/base-http/node.js\");\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/dist/server/web/spec-extension/adapters/next-request */ \"(rsc)/./node_modules/next/dist/server/web/spec-extension/adapters/next-request.js\");\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! next/dist/server/lib/trace/constants */ \"(rsc)/./node_modules/next/dist/server/lib/trace/constants.js\");\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! next/dist/server/instrumentation/utils */ \"(rsc)/./node_modules/next/dist/server/instrumentation/utils.js\");\n/* harmony import */ var next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! next/dist/server/send-response */ \"(rsc)/./node_modules/next/dist/server/send-response.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! next/dist/server/web/utils */ \"(rsc)/./node_modules/next/dist/server/web/utils.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! next/dist/server/lib/cache-control */ \"(rsc)/./node_modules/next/dist/server/lib/cache-control.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! next/dist/lib/constants */ \"(rsc)/./node_modules/next/dist/lib/constants.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! next/dist/shared/lib/no-fallback-error.external */ \"next/dist/shared/lib/no-fallback-error.external\");\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__);\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! next/dist/server/response-cache */ \"(rsc)/./node_modules/next/dist/server/response-cache/index.js\");\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__);\n/* harmony import */ var C_Users_mathe_enxoval_app_api_extract_product_route_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./app/api/extract-product/route.js */ \"(rsc)/./app/api/extract-product/route.js\");\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/extract-product/route\",\n        pathname: \"/api/extract-product\",\n        filename: \"route\",\n        bundlePath: \"app/api/extract-product/route\"\n    },\n    distDir: \".next\" || 0,\n    relativeProjectDir:  false || '',\n    resolvedPagePath: \"C:\\\\Users\\\\mathe\\\\enxoval\\\\app\\\\api\\\\extract-product\\\\route.js\",\n    nextConfigOutput,\n    userland: C_Users_mathe_enxoval_app_api_extract_product_route_js__WEBPACK_IMPORTED_MODULE_16__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\nasync function handler(req, res, ctx) {\n    var _nextConfig_experimental;\n    let srcPage = \"/api/extract-product/route\";\n    // turbopack doesn't normalize `/index` in the page name\n    // so we need to to process dynamic routes properly\n    // TODO: fix turbopack providing differing value from webpack\n    if (false) {} else if (srcPage === '/index') {\n        // we always normalize /index specifically\n        srcPage = '/';\n    }\n    const multiZoneDraftMode = false;\n    const prepareResult = await routeModule.prepare(req, res, {\n        srcPage,\n        multiZoneDraftMode\n    });\n    if (!prepareResult) {\n        res.statusCode = 400;\n        res.end('Bad Request');\n        ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());\n        return null;\n    }\n    const { buildId, params, nextConfig, isDraftMode, prerenderManifest, routerServerContext, isOnDemandRevalidate, revalidateOnlyGenerated, resolvedPathname } = prepareResult;\n    const normalizedSrcPage = (0,next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__.normalizeAppPath)(srcPage);\n    let isIsr = Boolean(prerenderManifest.dynamicRoutes[normalizedSrcPage] || prerenderManifest.routes[resolvedPathname]);\n    if (isIsr && !isDraftMode) {\n        const isPrerendered = Boolean(prerenderManifest.routes[resolvedPathname]);\n        const prerenderInfo = prerenderManifest.dynamicRoutes[normalizedSrcPage];\n        if (prerenderInfo) {\n            if (prerenderInfo.fallback === false && !isPrerendered) {\n                throw new next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError();\n            }\n        }\n    }\n    let cacheKey = null;\n    if (isIsr && !routeModule.isDev && !isDraftMode) {\n        cacheKey = resolvedPathname;\n        // ensure /index and / is normalized to one key\n        cacheKey = cacheKey === '/index' ? '/' : cacheKey;\n    }\n    const supportsDynamicResponse = // If we're in development, we always support dynamic HTML\n    routeModule.isDev === true || // If this is not SSG or does not have static paths, then it supports\n    // dynamic HTML.\n    !isIsr;\n    // This is a revalidation request if the request is for a static\n    // page and it is not being resumed from a postponed render and\n    // it is not a dynamic RSC request then it is a revalidation\n    // request.\n    const isRevalidate = isIsr && !supportsDynamicResponse;\n    const method = req.method || 'GET';\n    const tracer = (0,next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.getTracer)();\n    const activeSpan = tracer.getActiveScopeSpan();\n    const context = {\n        params,\n        prerenderManifest,\n        renderOpts: {\n            experimental: {\n                cacheComponents: Boolean(nextConfig.experimental.cacheComponents),\n                authInterrupts: Boolean(nextConfig.experimental.authInterrupts)\n            },\n            supportsDynamicResponse,\n            incrementalCache: (0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'incrementalCache'),\n            cacheLifeProfiles: (_nextConfig_experimental = nextConfig.experimental) == null ? void 0 : _nextConfig_experimental.cacheLife,\n            isRevalidate,\n            waitUntil: ctx.waitUntil,\n            onClose: (cb)=>{\n                res.on('close', cb);\n            },\n            onAfterTaskError: undefined,\n            onInstrumentationRequestError: (error, _request, errorContext)=>routeModule.onRequestError(req, error, errorContext, routerServerContext)\n        },\n        sharedContext: {\n            buildId\n        }\n    };\n    const nodeNextReq = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextRequest(req);\n    const nodeNextRes = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextResponse(res);\n    const nextReq = next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.NextRequestAdapter.fromNodeNextRequest(nodeNextReq, (0,next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.signalFromNodeResponse)(res));\n    try {\n        const invokeRouteModule = async (span)=>{\n            return routeModule.handle(nextReq, context).finally(()=>{\n                if (!span) return;\n                span.setAttributes({\n                    'http.status_code': res.statusCode,\n                    'next.rsc': false\n                });\n                const rootSpanAttributes = tracer.getRootSpanAttributes();\n                // We were unable to get attributes, probably OTEL is not enabled\n                if (!rootSpanAttributes) {\n                    return;\n                }\n                if (rootSpanAttributes.get('next.span_type') !== next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest) {\n                    console.warn(`Unexpected root span type '${rootSpanAttributes.get('next.span_type')}'. Please report this Next.js issue https://github.com/vercel/next.js`);\n                    return;\n                }\n                const route = rootSpanAttributes.get('next.route');\n                if (route) {\n                    const name = `${method} ${route}`;\n                    span.setAttributes({\n                        'next.route': route,\n                        'http.route': route,\n                        'next.span_name': name\n                    });\n                    span.updateName(name);\n                } else {\n                    span.updateName(`${method} ${req.url}`);\n                }\n            });\n        };\n        const handleResponse = async (currentSpan)=>{\n            var _cacheEntry_value;\n            const responseGenerator = async ({ previousCacheEntry })=>{\n                try {\n                    if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isOnDemandRevalidate && revalidateOnlyGenerated && !previousCacheEntry) {\n                        res.statusCode = 404;\n                        // on-demand revalidate always sets this header\n                        res.setHeader('x-nextjs-cache', 'REVALIDATED');\n                        res.end('This page could not be found');\n                        return null;\n                    }\n                    const response = await invokeRouteModule(currentSpan);\n                    req.fetchMetrics = context.renderOpts.fetchMetrics;\n                    let pendingWaitUntil = context.renderOpts.pendingWaitUntil;\n                    // Attempt using provided waitUntil if available\n                    // if it's not we fallback to sendResponse's handling\n                    if (pendingWaitUntil) {\n                        if (ctx.waitUntil) {\n                            ctx.waitUntil(pendingWaitUntil);\n                            pendingWaitUntil = undefined;\n                        }\n                    }\n                    const cacheTags = context.renderOpts.collectedTags;\n                    // If the request is for a static response, we can cache it so long\n                    // as it's not edge.\n                    if (isIsr) {\n                        const blob = await response.blob();\n                        // Copy the headers from the response.\n                        const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.toNodeOutgoingHttpHeaders)(response.headers);\n                        if (cacheTags) {\n                            headers[next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER] = cacheTags;\n                        }\n                        if (!headers['content-type'] && blob.type) {\n                            headers['content-type'] = blob.type;\n                        }\n                        const revalidate = typeof context.renderOpts.collectedRevalidate === 'undefined' || context.renderOpts.collectedRevalidate >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? false : context.renderOpts.collectedRevalidate;\n                        const expire = typeof context.renderOpts.collectedExpire === 'undefined' || context.renderOpts.collectedExpire >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? undefined : context.renderOpts.collectedExpire;\n                        // Create the cache entry for the response.\n                        const cacheEntry = {\n                            value: {\n                                kind: next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE,\n                                status: response.status,\n                                body: Buffer.from(await blob.arrayBuffer()),\n                                headers\n                            },\n                            cacheControl: {\n                                revalidate,\n                                expire\n                            }\n                        };\n                        return cacheEntry;\n                    } else {\n                        // send response without caching if not ISR\n                        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, response, context.renderOpts.pendingWaitUntil);\n                        return null;\n                    }\n                } catch (err) {\n                    // if this is a background revalidate we need to report\n                    // the request error here as it won't be bubbled\n                    if (previousCacheEntry == null ? void 0 : previousCacheEntry.isStale) {\n                        await routeModule.onRequestError(req, err, {\n                            routerKind: 'App Router',\n                            routePath: srcPage,\n                            routeType: 'route',\n                            revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                                isRevalidate,\n                                isOnDemandRevalidate\n                            })\n                        }, routerServerContext);\n                    }\n                    throw err;\n                }\n            };\n            const cacheEntry = await routeModule.handleResponse({\n                req,\n                nextConfig,\n                cacheKey,\n                routeKind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n                isFallback: false,\n                prerenderManifest,\n                isRoutePPREnabled: false,\n                isOnDemandRevalidate,\n                revalidateOnlyGenerated,\n                responseGenerator,\n                waitUntil: ctx.waitUntil\n            });\n            // we don't create a cacheEntry for ISR\n            if (!isIsr) {\n                return null;\n            }\n            if ((cacheEntry == null ? void 0 : (_cacheEntry_value = cacheEntry.value) == null ? void 0 : _cacheEntry_value.kind) !== next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE) {\n                var _cacheEntry_value1;\n                throw Object.defineProperty(new Error(`Invariant: app-route received invalid cache entry ${cacheEntry == null ? void 0 : (_cacheEntry_value1 = cacheEntry.value) == null ? void 0 : _cacheEntry_value1.kind}`), \"__NEXT_ERROR_CODE\", {\n                    value: \"E701\",\n                    enumerable: false,\n                    configurable: true\n                });\n            }\n            if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode')) {\n                res.setHeader('x-nextjs-cache', isOnDemandRevalidate ? 'REVALIDATED' : cacheEntry.isMiss ? 'MISS' : cacheEntry.isStale ? 'STALE' : 'HIT');\n            }\n            // Draft mode should never be cached\n            if (isDraftMode) {\n                res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');\n            }\n            const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.fromNodeOutgoingHttpHeaders)(cacheEntry.value.headers);\n            if (!((0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isIsr)) {\n                headers.delete(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER);\n            }\n            // If cache control is already set on the response we don't\n            // override it to allow users to customize it via next.config\n            if (cacheEntry.cacheControl && !res.getHeader('Cache-Control') && !headers.get('Cache-Control')) {\n                headers.set('Cache-Control', (0,next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__.getCacheControlHeader)(cacheEntry.cacheControl));\n            }\n            await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(cacheEntry.value.body, {\n                headers,\n                status: cacheEntry.value.status || 200\n            }));\n            return null;\n        };\n        // TODO: activeSpan code path is for when wrapped by\n        // next-server can be removed when this is no longer used\n        if (activeSpan) {\n            await handleResponse(activeSpan);\n        } else {\n            await tracer.withPropagatedContext(req.headers, ()=>tracer.trace(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest, {\n                    spanName: `${method} ${req.url}`,\n                    kind: next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.SpanKind.SERVER,\n                    attributes: {\n                        'http.method': method,\n                        'http.target': req.url\n                    }\n                }, handleResponse));\n        }\n    } catch (err) {\n        if (!(err instanceof next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError)) {\n            await routeModule.onRequestError(req, err, {\n                routerKind: 'App Router',\n                routePath: normalizedSrcPage,\n                routeType: 'route',\n                revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                    isRevalidate,\n                    isOnDemandRevalidate\n                })\n            });\n        }\n        // rethrow so that we can handle serving error page\n        // If this is during static generation, throw the error again.\n        if (isIsr) throw err;\n        // Otherwise, send a 500 response.\n        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(null, {\n            status: 500\n        }));\n        return null;\n    }\n}\n\n//# sourceMappingURL=app-route.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZleHRyYWN0LXByb2R1Y3QlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmV4dHJhY3QtcHJvZHVjdCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmV4dHJhY3QtcHJvZHVjdCUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNtYXRoZSU1Q2VueG92YWwlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q21hdGhlJTVDZW54b3ZhbCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCZpc0dsb2JhbE5vdEZvdW5kRW5hYmxlZD0hIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2Q7QUFDUztBQUNPO0FBQ0s7QUFDbUM7QUFDakQ7QUFDTztBQUNmO0FBQ3NDO0FBQ3pCO0FBQ007QUFDQztBQUNoQjtBQUN5QjtBQUMzRjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxhQUFhLE9BQW9DLElBQUksQ0FBRTtBQUN2RCx3QkFBd0IsTUFBdUM7QUFDL0Q7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7QUFDbkY7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxLQUFxQixFQUFFLEVBRTFCLENBQUM7QUFDTjtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsS0FBd0M7QUFDdkU7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksb0pBQW9KO0FBQ2hLLDhCQUE4Qiw2RkFBZ0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLDZGQUFlO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDRFQUFTO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSw4QkFBOEIsNkVBQWM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLDRFQUFlO0FBQzNDLDRCQUE0Qiw2RUFBZ0I7QUFDNUMsb0JBQW9CLHlHQUFrQixrQ0FBa0MsaUhBQXNCO0FBQzlGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUUsZ0ZBQWM7QUFDL0UsK0RBQStELHlDQUF5QztBQUN4RztBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxRQUFRLEVBQUUsTUFBTTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLGtCQUFrQjtBQUNsQix1Q0FBdUMsUUFBUSxFQUFFLFFBQVE7QUFDekQ7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLG9CQUFvQjtBQUNuRTtBQUNBLHlCQUF5Qiw2RUFBYztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLHNGQUF5QjtBQUNqRTtBQUNBLG9DQUFvQyw0RUFBc0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzSkFBc0osb0VBQWM7QUFDcEssMElBQTBJLG9FQUFjO0FBQ3hKO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyw2RUFBZTtBQUNyRDtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0EsOEJBQThCLDZFQUFZO0FBQzFDO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsMkZBQW1CO0FBQ2pFO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsa0VBQVM7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxSUFBcUksNkVBQWU7QUFDcEo7QUFDQSwyR0FBMkcsaUhBQWlIO0FBQzVOO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGlCQUFpQiw2RUFBYztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsd0ZBQTJCO0FBQ3ZELGtCQUFrQiw2RUFBYztBQUNoQywrQkFBK0IsNEVBQXNCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLDBGQUFxQjtBQUNsRTtBQUNBLGtCQUFrQiw2RUFBWTtBQUM5QjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDViw2RUFBNkUsZ0ZBQWM7QUFDM0YsaUNBQWlDLFFBQVEsRUFBRSxRQUFRO0FBQ25ELDBCQUEwQix1RUFBUTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLE1BQU07QUFDTiw2QkFBNkIsNkZBQWU7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsMkZBQW1CO0FBQ3JEO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLDZFQUFZO0FBQzFCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCB7IGdldFJlcXVlc3RNZXRhIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcmVxdWVzdC1tZXRhXCI7XG5pbXBvcnQgeyBnZXRUcmFjZXIsIFNwYW5LaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3RyYWNlL3RyYWNlclwiO1xuaW1wb3J0IHsgbm9ybWFsaXplQXBwUGF0aCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2hhcmVkL2xpYi9yb3V0ZXIvdXRpbHMvYXBwLXBhdGhzXCI7XG5pbXBvcnQgeyBOb2RlTmV4dFJlcXVlc3QsIE5vZGVOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9iYXNlLWh0dHAvbm9kZVwiO1xuaW1wb3J0IHsgTmV4dFJlcXVlc3RBZGFwdGVyLCBzaWduYWxGcm9tTm9kZVJlc3BvbnNlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL3NwZWMtZXh0ZW5zaW9uL2FkYXB0ZXJzL25leHQtcmVxdWVzdFwiO1xuaW1wb3J0IHsgQmFzZVNlcnZlclNwYW4gfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvdHJhY2UvY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBnZXRSZXZhbGlkYXRlUmVhc29uIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvaW5zdHJ1bWVudGF0aW9uL3V0aWxzXCI7XG5pbXBvcnQgeyBzZW5kUmVzcG9uc2UgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9zZW5kLXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBmcm9tTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMsIHRvTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvdXRpbHNcIjtcbmltcG9ydCB7IGdldENhY2hlQ29udHJvbEhlYWRlciB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9jYWNoZS1jb250cm9sXCI7XG5pbXBvcnQgeyBJTkZJTklURV9DQUNIRSwgTkVYVF9DQUNIRV9UQUdTX0hFQURFUiB9IGZyb20gXCJuZXh0L2Rpc3QvbGliL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgTm9GYWxsYmFja0Vycm9yIH0gZnJvbSBcIm5leHQvZGlzdC9zaGFyZWQvbGliL25vLWZhbGxiYWNrLWVycm9yLmV4dGVybmFsXCI7XG5pbXBvcnQgeyBDYWNoZWRSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yZXNwb25zZS1jYWNoZVwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXG1hdGhlXFxcXGVueG92YWxcXFxcYXBwXFxcXGFwaVxcXFxleHRyYWN0LXByb2R1Y3RcXFxccm91dGUuanNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2V4dHJhY3QtcHJvZHVjdC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2V4dHJhY3QtcHJvZHVjdFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvZXh0cmFjdC1wcm9kdWN0L3JvdXRlXCJcbiAgICB9LFxuICAgIGRpc3REaXI6IHByb2Nlc3MuZW52Ll9fTkVYVF9SRUxBVElWRV9ESVNUX0RJUiB8fCAnJyxcbiAgICByZWxhdGl2ZVByb2plY3REaXI6IHByb2Nlc3MuZW52Ll9fTkVYVF9SRUxBVElWRV9QUk9KRUNUX0RJUiB8fCAnJyxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXG1hdGhlXFxcXGVueG92YWxcXFxcYXBwXFxcXGFwaVxcXFxleHRyYWN0LXByb2R1Y3RcXFxccm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcywgY3R4KSB7XG4gICAgdmFyIF9uZXh0Q29uZmlnX2V4cGVyaW1lbnRhbDtcbiAgICBsZXQgc3JjUGFnZSA9IFwiL2FwaS9leHRyYWN0LXByb2R1Y3Qvcm91dGVcIjtcbiAgICAvLyB0dXJib3BhY2sgZG9lc24ndCBub3JtYWxpemUgYC9pbmRleGAgaW4gdGhlIHBhZ2UgbmFtZVxuICAgIC8vIHNvIHdlIG5lZWQgdG8gdG8gcHJvY2VzcyBkeW5hbWljIHJvdXRlcyBwcm9wZXJseVxuICAgIC8vIFRPRE86IGZpeCB0dXJib3BhY2sgcHJvdmlkaW5nIGRpZmZlcmluZyB2YWx1ZSBmcm9tIHdlYnBhY2tcbiAgICBpZiAocHJvY2Vzcy5lbnYuVFVSQk9QQUNLKSB7XG4gICAgICAgIHNyY1BhZ2UgPSBzcmNQYWdlLnJlcGxhY2UoL1xcL2luZGV4JC8sICcnKSB8fCAnLyc7XG4gICAgfSBlbHNlIGlmIChzcmNQYWdlID09PSAnL2luZGV4Jykge1xuICAgICAgICAvLyB3ZSBhbHdheXMgbm9ybWFsaXplIC9pbmRleCBzcGVjaWZpY2FsbHlcbiAgICAgICAgc3JjUGFnZSA9ICcvJztcbiAgICB9XG4gICAgY29uc3QgbXVsdGlab25lRHJhZnRNb2RlID0gcHJvY2Vzcy5lbnYuX19ORVhUX01VTFRJX1pPTkVfRFJBRlRfTU9ERTtcbiAgICBjb25zdCBwcmVwYXJlUmVzdWx0ID0gYXdhaXQgcm91dGVNb2R1bGUucHJlcGFyZShyZXEsIHJlcywge1xuICAgICAgICBzcmNQYWdlLFxuICAgICAgICBtdWx0aVpvbmVEcmFmdE1vZGVcbiAgICB9KTtcbiAgICBpZiAoIXByZXBhcmVSZXN1bHQpIHtcbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XG4gICAgICAgIHJlcy5lbmQoJ0JhZCBSZXF1ZXN0Jyk7XG4gICAgICAgIGN0eC53YWl0VW50aWwgPT0gbnVsbCA/IHZvaWQgMCA6IGN0eC53YWl0VW50aWwuY2FsbChjdHgsIFByb21pc2UucmVzb2x2ZSgpKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHsgYnVpbGRJZCwgcGFyYW1zLCBuZXh0Q29uZmlnLCBpc0RyYWZ0TW9kZSwgcHJlcmVuZGVyTWFuaWZlc3QsIHJvdXRlclNlcnZlckNvbnRleHQsIGlzT25EZW1hbmRSZXZhbGlkYXRlLCByZXZhbGlkYXRlT25seUdlbmVyYXRlZCwgcmVzb2x2ZWRQYXRobmFtZSB9ID0gcHJlcGFyZVJlc3VsdDtcbiAgICBjb25zdCBub3JtYWxpemVkU3JjUGFnZSA9IG5vcm1hbGl6ZUFwcFBhdGgoc3JjUGFnZSk7XG4gICAgbGV0IGlzSXNyID0gQm9vbGVhbihwcmVyZW5kZXJNYW5pZmVzdC5keW5hbWljUm91dGVzW25vcm1hbGl6ZWRTcmNQYWdlXSB8fCBwcmVyZW5kZXJNYW5pZmVzdC5yb3V0ZXNbcmVzb2x2ZWRQYXRobmFtZV0pO1xuICAgIGlmIChpc0lzciAmJiAhaXNEcmFmdE1vZGUpIHtcbiAgICAgICAgY29uc3QgaXNQcmVyZW5kZXJlZCA9IEJvb2xlYW4ocHJlcmVuZGVyTWFuaWZlc3Qucm91dGVzW3Jlc29sdmVkUGF0aG5hbWVdKTtcbiAgICAgICAgY29uc3QgcHJlcmVuZGVySW5mbyA9IHByZXJlbmRlck1hbmlmZXN0LmR5bmFtaWNSb3V0ZXNbbm9ybWFsaXplZFNyY1BhZ2VdO1xuICAgICAgICBpZiAocHJlcmVuZGVySW5mbykge1xuICAgICAgICAgICAgaWYgKHByZXJlbmRlckluZm8uZmFsbGJhY2sgPT09IGZhbHNlICYmICFpc1ByZXJlbmRlcmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE5vRmFsbGJhY2tFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBjYWNoZUtleSA9IG51bGw7XG4gICAgaWYgKGlzSXNyICYmICFyb3V0ZU1vZHVsZS5pc0RldiAmJiAhaXNEcmFmdE1vZGUpIHtcbiAgICAgICAgY2FjaGVLZXkgPSByZXNvbHZlZFBhdGhuYW1lO1xuICAgICAgICAvLyBlbnN1cmUgL2luZGV4IGFuZCAvIGlzIG5vcm1hbGl6ZWQgdG8gb25lIGtleVxuICAgICAgICBjYWNoZUtleSA9IGNhY2hlS2V5ID09PSAnL2luZGV4JyA/ICcvJyA6IGNhY2hlS2V5O1xuICAgIH1cbiAgICBjb25zdCBzdXBwb3J0c0R5bmFtaWNSZXNwb25zZSA9IC8vIElmIHdlJ3JlIGluIGRldmVsb3BtZW50LCB3ZSBhbHdheXMgc3VwcG9ydCBkeW5hbWljIEhUTUxcbiAgICByb3V0ZU1vZHVsZS5pc0RldiA9PT0gdHJ1ZSB8fCAvLyBJZiB0aGlzIGlzIG5vdCBTU0cgb3IgZG9lcyBub3QgaGF2ZSBzdGF0aWMgcGF0aHMsIHRoZW4gaXQgc3VwcG9ydHNcbiAgICAvLyBkeW5hbWljIEhUTUwuXG4gICAgIWlzSXNyO1xuICAgIC8vIFRoaXMgaXMgYSByZXZhbGlkYXRpb24gcmVxdWVzdCBpZiB0aGUgcmVxdWVzdCBpcyBmb3IgYSBzdGF0aWNcbiAgICAvLyBwYWdlIGFuZCBpdCBpcyBub3QgYmVpbmcgcmVzdW1lZCBmcm9tIGEgcG9zdHBvbmVkIHJlbmRlciBhbmRcbiAgICAvLyBpdCBpcyBub3QgYSBkeW5hbWljIFJTQyByZXF1ZXN0IHRoZW4gaXQgaXMgYSByZXZhbGlkYXRpb25cbiAgICAvLyByZXF1ZXN0LlxuICAgIGNvbnN0IGlzUmV2YWxpZGF0ZSA9IGlzSXNyICYmICFzdXBwb3J0c0R5bmFtaWNSZXNwb25zZTtcbiAgICBjb25zdCBtZXRob2QgPSByZXEubWV0aG9kIHx8ICdHRVQnO1xuICAgIGNvbnN0IHRyYWNlciA9IGdldFRyYWNlcigpO1xuICAgIGNvbnN0IGFjdGl2ZVNwYW4gPSB0cmFjZXIuZ2V0QWN0aXZlU2NvcGVTcGFuKCk7XG4gICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBwcmVyZW5kZXJNYW5pZmVzdCxcbiAgICAgICAgcmVuZGVyT3B0czoge1xuICAgICAgICAgICAgZXhwZXJpbWVudGFsOiB7XG4gICAgICAgICAgICAgICAgY2FjaGVDb21wb25lbnRzOiBCb29sZWFuKG5leHRDb25maWcuZXhwZXJpbWVudGFsLmNhY2hlQ29tcG9uZW50cyksXG4gICAgICAgICAgICAgICAgYXV0aEludGVycnVwdHM6IEJvb2xlYW4obmV4dENvbmZpZy5leHBlcmltZW50YWwuYXV0aEludGVycnVwdHMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VwcG9ydHNEeW5hbWljUmVzcG9uc2UsXG4gICAgICAgICAgICBpbmNyZW1lbnRhbENhY2hlOiBnZXRSZXF1ZXN0TWV0YShyZXEsICdpbmNyZW1lbnRhbENhY2hlJyksXG4gICAgICAgICAgICBjYWNoZUxpZmVQcm9maWxlczogKF9uZXh0Q29uZmlnX2V4cGVyaW1lbnRhbCA9IG5leHRDb25maWcuZXhwZXJpbWVudGFsKSA9PSBudWxsID8gdm9pZCAwIDogX25leHRDb25maWdfZXhwZXJpbWVudGFsLmNhY2hlTGlmZSxcbiAgICAgICAgICAgIGlzUmV2YWxpZGF0ZSxcbiAgICAgICAgICAgIHdhaXRVbnRpbDogY3R4LndhaXRVbnRpbCxcbiAgICAgICAgICAgIG9uQ2xvc2U6IChjYik9PntcbiAgICAgICAgICAgICAgICByZXMub24oJ2Nsb3NlJywgY2IpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQWZ0ZXJUYXNrRXJyb3I6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9uSW5zdHJ1bWVudGF0aW9uUmVxdWVzdEVycm9yOiAoZXJyb3IsIF9yZXF1ZXN0LCBlcnJvckNvbnRleHQpPT5yb3V0ZU1vZHVsZS5vblJlcXVlc3RFcnJvcihyZXEsIGVycm9yLCBlcnJvckNvbnRleHQsIHJvdXRlclNlcnZlckNvbnRleHQpXG4gICAgICAgIH0sXG4gICAgICAgIHNoYXJlZENvbnRleHQ6IHtcbiAgICAgICAgICAgIGJ1aWxkSWRcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgbm9kZU5leHRSZXEgPSBuZXcgTm9kZU5leHRSZXF1ZXN0KHJlcSk7XG4gICAgY29uc3Qgbm9kZU5leHRSZXMgPSBuZXcgTm9kZU5leHRSZXNwb25zZShyZXMpO1xuICAgIGNvbnN0IG5leHRSZXEgPSBOZXh0UmVxdWVzdEFkYXB0ZXIuZnJvbU5vZGVOZXh0UmVxdWVzdChub2RlTmV4dFJlcSwgc2lnbmFsRnJvbU5vZGVSZXNwb25zZShyZXMpKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpbnZva2VSb3V0ZU1vZHVsZSA9IGFzeW5jIChzcGFuKT0+e1xuICAgICAgICAgICAgcmV0dXJuIHJvdXRlTW9kdWxlLmhhbmRsZShuZXh0UmVxLCBjb250ZXh0KS5maW5hbGx5KCgpPT57XG4gICAgICAgICAgICAgICAgaWYgKCFzcGFuKSByZXR1cm47XG4gICAgICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAgICAgJ2h0dHAuc3RhdHVzX2NvZGUnOiByZXMuc3RhdHVzQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgJ25leHQucnNjJzogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCByb290U3BhbkF0dHJpYnV0ZXMgPSB0cmFjZXIuZ2V0Um9vdFNwYW5BdHRyaWJ1dGVzKCk7XG4gICAgICAgICAgICAgICAgLy8gV2Ugd2VyZSB1bmFibGUgdG8gZ2V0IGF0dHJpYnV0ZXMsIHByb2JhYmx5IE9URUwgaXMgbm90IGVuYWJsZWRcbiAgICAgICAgICAgICAgICBpZiAoIXJvb3RTcGFuQXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyb290U3BhbkF0dHJpYnV0ZXMuZ2V0KCduZXh0LnNwYW5fdHlwZScpICE9PSBCYXNlU2VydmVyU3Bhbi5oYW5kbGVSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgVW5leHBlY3RlZCByb290IHNwYW4gdHlwZSAnJHtyb290U3BhbkF0dHJpYnV0ZXMuZ2V0KCduZXh0LnNwYW5fdHlwZScpfScuIFBsZWFzZSByZXBvcnQgdGhpcyBOZXh0LmpzIGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZXJjZWwvbmV4dC5qc2ApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gcm9vdFNwYW5BdHRyaWJ1dGVzLmdldCgnbmV4dC5yb3V0ZScpO1xuICAgICAgICAgICAgICAgIGlmIChyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYCR7bWV0aG9kfSAke3JvdXRlfWA7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbmV4dC5yb3V0ZSc6IHJvdXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHAucm91dGUnOiByb3V0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICduZXh0LnNwYW5fbmFtZSc6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNwYW4udXBkYXRlTmFtZShuYW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzcGFuLnVwZGF0ZU5hbWUoYCR7bWV0aG9kfSAke3JlcS51cmx9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGhhbmRsZVJlc3BvbnNlID0gYXN5bmMgKGN1cnJlbnRTcGFuKT0+e1xuICAgICAgICAgICAgdmFyIF9jYWNoZUVudHJ5X3ZhbHVlO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VHZW5lcmF0b3IgPSBhc3luYyAoeyBwcmV2aW91c0NhY2hlRW50cnkgfSk9PntcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWdldFJlcXVlc3RNZXRhKHJlcSwgJ21pbmltYWxNb2RlJykgJiYgaXNPbkRlbWFuZFJldmFsaWRhdGUgJiYgcmV2YWxpZGF0ZU9ubHlHZW5lcmF0ZWQgJiYgIXByZXZpb3VzQ2FjaGVFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvbi1kZW1hbmQgcmV2YWxpZGF0ZSBhbHdheXMgc2V0cyB0aGlzIGhlYWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcigneC1uZXh0anMtY2FjaGUnLCAnUkVWQUxJREFURUQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoJ1RoaXMgcGFnZSBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaW52b2tlUm91dGVNb2R1bGUoY3VycmVudFNwYW4pO1xuICAgICAgICAgICAgICAgICAgICByZXEuZmV0Y2hNZXRyaWNzID0gY29udGV4dC5yZW5kZXJPcHRzLmZldGNoTWV0cmljcztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBlbmRpbmdXYWl0VW50aWwgPSBjb250ZXh0LnJlbmRlck9wdHMucGVuZGluZ1dhaXRVbnRpbDtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXR0ZW1wdCB1c2luZyBwcm92aWRlZCB3YWl0VW50aWwgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0J3Mgbm90IHdlIGZhbGxiYWNrIHRvIHNlbmRSZXNwb25zZSdzIGhhbmRsaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZW5kaW5nV2FpdFVudGlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3R4LndhaXRVbnRpbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC53YWl0VW50aWwocGVuZGluZ1dhaXRVbnRpbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1dhaXRVbnRpbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYWNoZVRhZ3MgPSBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkVGFncztcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJlcXVlc3QgaXMgZm9yIGEgc3RhdGljIHJlc3BvbnNlLCB3ZSBjYW4gY2FjaGUgaXQgc28gbG9uZ1xuICAgICAgICAgICAgICAgICAgICAvLyBhcyBpdCdzIG5vdCBlZGdlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJc3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXNwb25zZS5ibG9iKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHRoZSBoZWFkZXJzIGZyb20gdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IHRvTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMocmVzcG9uc2UuaGVhZGVycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGVUYWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1tORVhUX0NBQ0hFX1RBR1NfSEVBREVSXSA9IGNhY2hlVGFncztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaGVhZGVyc1snY29udGVudC10eXBlJ10gJiYgYmxvYi50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snY29udGVudC10eXBlJ10gPSBibG9iLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXZhbGlkYXRlID0gdHlwZW9mIGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRSZXZhbGlkYXRlID09PSAndW5kZWZpbmVkJyB8fCBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkUmV2YWxpZGF0ZSA+PSBJTkZJTklURV9DQUNIRSA/IGZhbHNlIDogY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZFJldmFsaWRhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBpcmUgPSB0eXBlb2YgY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZEV4cGlyZSA9PT0gJ3VuZGVmaW5lZCcgfHwgY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZEV4cGlyZSA+PSBJTkZJTklURV9DQUNIRSA/IHVuZGVmaW5lZCA6IGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRFeHBpcmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIGNhY2hlIGVudHJ5IGZvciB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYWNoZUVudHJ5ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IENhY2hlZFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBCdWZmZXIuZnJvbShhd2FpdCBibG9iLmFycmF5QnVmZmVyKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZUNvbnRyb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV2YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZUVudHJ5O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCByZXNwb25zZSB3aXRob3V0IGNhY2hpbmcgaWYgbm90IElTUlxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2VuZFJlc3BvbnNlKG5vZGVOZXh0UmVxLCBub2RlTmV4dFJlcywgcmVzcG9uc2UsIGNvbnRleHQucmVuZGVyT3B0cy5wZW5kaW5nV2FpdFVudGlsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgYSBiYWNrZ3JvdW5kIHJldmFsaWRhdGUgd2UgbmVlZCB0byByZXBvcnRcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHJlcXVlc3QgZXJyb3IgaGVyZSBhcyBpdCB3b24ndCBiZSBidWJibGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c0NhY2hlRW50cnkgPT0gbnVsbCA/IHZvaWQgMCA6IHByZXZpb3VzQ2FjaGVFbnRyeS5pc1N0YWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByb3V0ZU1vZHVsZS5vblJlcXVlc3RFcnJvcihyZXEsIGVyciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlcktpbmQ6ICdBcHAgUm91dGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVBhdGg6IHNyY1BhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVUeXBlOiAncm91dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldmFsaWRhdGVSZWFzb246IGdldFJldmFsaWRhdGVSZWFzb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JldmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT25EZW1hbmRSZXZhbGlkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHJvdXRlclNlcnZlckNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgY2FjaGVFbnRyeSA9IGF3YWl0IHJvdXRlTW9kdWxlLmhhbmRsZVJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICByZXEsXG4gICAgICAgICAgICAgICAgbmV4dENvbmZpZyxcbiAgICAgICAgICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgICAgICAgICByb3V0ZUtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgICAgICAgICAgaXNGYWxsYmFjazogZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJlcmVuZGVyTWFuaWZlc3QsXG4gICAgICAgICAgICAgICAgaXNSb3V0ZVBQUkVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGlzT25EZW1hbmRSZXZhbGlkYXRlLFxuICAgICAgICAgICAgICAgIHJldmFsaWRhdGVPbmx5R2VuZXJhdGVkLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlR2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgIHdhaXRVbnRpbDogY3R4LndhaXRVbnRpbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyB3ZSBkb24ndCBjcmVhdGUgYSBjYWNoZUVudHJ5IGZvciBJU1JcbiAgICAgICAgICAgIGlmICghaXNJc3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgoY2FjaGVFbnRyeSA9PSBudWxsID8gdm9pZCAwIDogKF9jYWNoZUVudHJ5X3ZhbHVlID0gY2FjaGVFbnRyeS52YWx1ZSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9jYWNoZUVudHJ5X3ZhbHVlLmtpbmQpICE9PSBDYWNoZWRSb3V0ZUtpbmQuQVBQX1JPVVRFKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9jYWNoZUVudHJ5X3ZhbHVlMTtcbiAgICAgICAgICAgICAgICB0aHJvdyBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3IEVycm9yKGBJbnZhcmlhbnQ6IGFwcC1yb3V0ZSByZWNlaXZlZCBpbnZhbGlkIGNhY2hlIGVudHJ5ICR7Y2FjaGVFbnRyeSA9PSBudWxsID8gdm9pZCAwIDogKF9jYWNoZUVudHJ5X3ZhbHVlMSA9IGNhY2hlRW50cnkudmFsdWUpID09IG51bGwgPyB2b2lkIDAgOiBfY2FjaGVFbnRyeV92YWx1ZTEua2luZH1gKSwgXCJfX05FWFRfRVJST1JfQ09ERVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIkU3MDFcIixcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFnZXRSZXF1ZXN0TWV0YShyZXEsICdtaW5pbWFsTW9kZScpKSB7XG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcigneC1uZXh0anMtY2FjaGUnLCBpc09uRGVtYW5kUmV2YWxpZGF0ZSA/ICdSRVZBTElEQVRFRCcgOiBjYWNoZUVudHJ5LmlzTWlzcyA/ICdNSVNTJyA6IGNhY2hlRW50cnkuaXNTdGFsZSA/ICdTVEFMRScgOiAnSElUJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEcmFmdCBtb2RlIHNob3VsZCBuZXZlciBiZSBjYWNoZWRcbiAgICAgICAgICAgIGlmIChpc0RyYWZ0TW9kZSkge1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAncHJpdmF0ZSwgbm8tY2FjaGUsIG5vLXN0b3JlLCBtYXgtYWdlPTAsIG11c3QtcmV2YWxpZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IGZyb21Ob2RlT3V0Z29pbmdIdHRwSGVhZGVycyhjYWNoZUVudHJ5LnZhbHVlLmhlYWRlcnMpO1xuICAgICAgICAgICAgaWYgKCEoZ2V0UmVxdWVzdE1ldGEocmVxLCAnbWluaW1hbE1vZGUnKSAmJiBpc0lzcikpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLmRlbGV0ZShORVhUX0NBQ0hFX1RBR1NfSEVBREVSKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIGNhY2hlIGNvbnRyb2wgaXMgYWxyZWFkeSBzZXQgb24gdGhlIHJlc3BvbnNlIHdlIGRvbid0XG4gICAgICAgICAgICAvLyBvdmVycmlkZSBpdCB0byBhbGxvdyB1c2VycyB0byBjdXN0b21pemUgaXQgdmlhIG5leHQuY29uZmlnXG4gICAgICAgICAgICBpZiAoY2FjaGVFbnRyeS5jYWNoZUNvbnRyb2wgJiYgIXJlcy5nZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnKSAmJiAhaGVhZGVycy5nZXQoJ0NhY2hlLUNvbnRyb2wnKSkge1xuICAgICAgICAgICAgICAgIGhlYWRlcnMuc2V0KCdDYWNoZS1Db250cm9sJywgZ2V0Q2FjaGVDb250cm9sSGVhZGVyKGNhY2hlRW50cnkuY2FjaGVDb250cm9sKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBzZW5kUmVzcG9uc2Uobm9kZU5leHRSZXEsIG5vZGVOZXh0UmVzLCBuZXcgUmVzcG9uc2UoY2FjaGVFbnRyeS52YWx1ZS5ib2R5LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IGNhY2hlRW50cnkudmFsdWUuc3RhdHVzIHx8IDIwMFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFRPRE86IGFjdGl2ZVNwYW4gY29kZSBwYXRoIGlzIGZvciB3aGVuIHdyYXBwZWQgYnlcbiAgICAgICAgLy8gbmV4dC1zZXJ2ZXIgY2FuIGJlIHJlbW92ZWQgd2hlbiB0aGlzIGlzIG5vIGxvbmdlciB1c2VkXG4gICAgICAgIGlmIChhY3RpdmVTcGFuKSB7XG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVSZXNwb25zZShhY3RpdmVTcGFuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHRyYWNlci53aXRoUHJvcGFnYXRlZENvbnRleHQocmVxLmhlYWRlcnMsICgpPT50cmFjZXIudHJhY2UoQmFzZVNlcnZlclNwYW4uaGFuZGxlUmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICBzcGFuTmFtZTogYCR7bWV0aG9kfSAke3JlcS51cmx9YCxcbiAgICAgICAgICAgICAgICAgICAga2luZDogU3BhbktpbmQuU0VSVkVSLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaHR0cC5tZXRob2QnOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaHR0cC50YXJnZXQnOiByZXEudXJsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBoYW5kbGVSZXNwb25zZSkpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmICghKGVyciBpbnN0YW5jZW9mIE5vRmFsbGJhY2tFcnJvcikpIHtcbiAgICAgICAgICAgIGF3YWl0IHJvdXRlTW9kdWxlLm9uUmVxdWVzdEVycm9yKHJlcSwgZXJyLCB7XG4gICAgICAgICAgICAgICAgcm91dGVyS2luZDogJ0FwcCBSb3V0ZXInLFxuICAgICAgICAgICAgICAgIHJvdXRlUGF0aDogbm9ybWFsaXplZFNyY1BhZ2UsXG4gICAgICAgICAgICAgICAgcm91dGVUeXBlOiAncm91dGUnLFxuICAgICAgICAgICAgICAgIHJldmFsaWRhdGVSZWFzb246IGdldFJldmFsaWRhdGVSZWFzb24oe1xuICAgICAgICAgICAgICAgICAgICBpc1JldmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgICAgIGlzT25EZW1hbmRSZXZhbGlkYXRlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJldGhyb3cgc28gdGhhdCB3ZSBjYW4gaGFuZGxlIHNlcnZpbmcgZXJyb3IgcGFnZVxuICAgICAgICAvLyBJZiB0aGlzIGlzIGR1cmluZyBzdGF0aWMgZ2VuZXJhdGlvbiwgdGhyb3cgdGhlIGVycm9yIGFnYWluLlxuICAgICAgICBpZiAoaXNJc3IpIHRocm93IGVycjtcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBzZW5kIGEgNTAwIHJlc3BvbnNlLlxuICAgICAgICBhd2FpdCBzZW5kUmVzcG9uc2Uobm9kZU5leHRSZXEsIG5vZGVOZXh0UmVzLCBuZXcgUmVzcG9uc2UobnVsbCwge1xuICAgICAgICAgICAgc3RhdHVzOiA1MDBcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXBcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fextract-product%2Froute&page=%2Fapi%2Fextract-product%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fextract-product%2Froute.js&appDir=C%3A%5CUsers%5Cmathe%5Cenxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmathe%5Cenxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/undici","vendor-chunks/cheerio","vendor-chunks/axios","vendor-chunks/cheerio-select","vendor-chunks/parse5-htmlparser2-tree-adapter","vendor-chunks/iconv-lite","vendor-chunks/parse5-parser-stream","vendor-chunks/asynckit","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/encoding-sniffer","vendor-chunks/call-bind-apply-helpers","vendor-chunks/nth-check","vendor-chunks/get-proto","vendor-chunks/mime-db","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/function-bind","vendor-chunks/follow-redirects","vendor-chunks/css-what","vendor-chunks/proxy-from-env","vendor-chunks/domelementtype","vendor-chunks/safer-buffer","vendor-chunks/mime-types","vendor-chunks/hasown","vendor-chunks/has-tostringtag","vendor-chunks/get-intrinsic","vendor-chunks/es-set-tostringtag","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/delayed-stream","vendor-chunks/combined-stream","vendor-chunks/boolbase"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fextract-product%2Froute&page=%2Fapi%2Fextract-product%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fextract-product%2Froute.js&appDir=C%3A%5CUsers%5Cmathe%5Cenxoval%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cmathe%5Cenxoval&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!")));
module.exports = __webpack_exports__;

})();