// app/api/detect-product/route.js
// Handler da feature "Detecção inteligente de produtos".
// Substitui /api/extract-product com arquitetura modular e suporte a encurtadores.
//
// NOTA: usa caminho relativo (../../../lib) porque @/ aponta para src/,
// não para a raiz do projeto.

import { detectProduct } from "../../../lib/product-detection/index.js";

/**
 * POST /api/detect-product
 * Body: { url: string }
 *
 * Detecta automaticamente nome, preço e imagem de qualquer produto
 * a partir de uma URL de e-commerce — incluindo links encurtados como:
 * br.shp.ee, amzn.to, mercadolivre.page.link, bit.ly, etc.
 *
 * Retorna sempre HTTP 200 para não quebrar o fluxo do cliente.
 * Em caso de falha, retorna um objeto com `warning` e campos nulos.
 */
export async function POST(req) {
  let url;
  try {
    ({ url } = await req.json());
  } catch {
    return Response.json(
      { error: "Body inválido — envie { url: string }" },
      { status: 400 }
    );
  }

  if (!url?.trim()) {
    return Response.json(
      { error: "Campo 'url' é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const result = await detectProduct(url.trim());

    if (!result) {
      return Response.json({
        name:         null,
        price:        null,
        imageUrl:     null,
        brand:        null,
        store:        null,
        suggestedRoom: "outro",
        warning:
          "Não conseguimos detectar o produto automaticamente. Preencha os dados manualmente.",
      });
    }

    return Response.json(result);
  } catch (err) {
    const isSecurityError =
      err.message?.includes("não permitida") ||
      err.message?.includes("SSRF") ||
      err.message?.includes("inválida");

    if (isSecurityError) {
      return Response.json({ error: err.message }, { status: 400 });
    }

    console.error("[detect-product] Erro inesperado:", err.message);
    return Response.json({
      name:         null,
      price:        null,
      imageUrl:     null,
      brand:        null,
      store:        null,
      suggestedRoom: "outro",
      warning:
        "Erro ao detectar o produto. Tente novamente ou preencha manualmente.",
    });
  }
}
