import { detectProduct } from "../../../lib/product-detection/index.js";

export async function POST(req) {
  let url;
  try {
    ({ url } = await req.json());
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!url?.trim()) {
    return Response.json({ error: "URL obrigatória" }, { status: 400 });
  }

  try {
    const result = await detectProduct(url.trim());

    if (!result) {
      return Response.json({
        name: null,
        price: null,
        imageUrl: null,
        brand: null,
        suggestedRoom: "outro",
        warning:
          "Não conseguimos detectar o produto automaticamente. Preencha os dados manualmente.",
      });
    }

    console.log("[detect-product]", {
      original: url,
      resolved: result.resolvedUrl,
      name: result.name?.slice(0, 40),
      store: result.store,
    });

    return Response.json(result);
  } catch (err) {
    console.error("[detect-product] error:", err.message);
    return Response.json(
      {
        name: null,
        price: null,
        imageUrl: null,
        brand: null,
        suggestedRoom: "outro",
        warning: "Erro ao detectar produto. Tente novamente ou preencha manualmente.",
      },
      { status: 200 } // 200 intencional: não quebra o fluxo do cliente
    );
  }
}