/**
 * POST /api/complete-home
 * Body: { rooms: Room[], items: Item[], aptSize: string }
 *
 * Gera sugestões de itens faltantes baseado em listas predefinidas
 * por cômodo. 100% grátis, sem IA, sem API key.
 */

/* ─── Base de dados de itens essenciais por cômodo ─── */
const ESSENTIALS = {
  quarto: [
    { name: "Cama box casal",       price: 1200, priority: "high" },
    { name: "Colchão",              price: 800,  priority: "high" },
    { name: "Cabeceira",            price: 350,  priority: "normal" },
    { name: "Guarda-roupa 6 portas",price: 900,  priority: "high" },
    { name: "Cômoda",               price: 450,  priority: "normal" },
    { name: "Criado-mudo",          price: 180,  priority: "normal" },
    { name: "Espelho de parede",    price: 120,  priority: "normal" },
    { name: "Cortina blackout",     price: 150,  priority: "normal" },
    { name: "Edredom casal",        price: 180,  priority: "high" },
    { name: "Jogo de lençol",       price: 120,  priority: "high" },
    { name: "Travesseiro",          price: 60,   priority: "high" },
    { name: "Abajur",               price: 80,   priority: "low" },
    { name: "Tapete para quarto",   price: 150,  priority: "low" },
    { name: "Suporte para TV",      price: 80,   priority: "low" },
  ],
  sala: [
    { name: "Sofá 3 lugares",       price: 1500, priority: "high" },
    { name: "Mesa de centro",       price: 350,  priority: "normal" },
    { name: "Rack para TV",         price: 400,  priority: "high" },
    { name: "Televisão 50\"",       price: 2200, priority: "high" },
    { name: "Tapete sala",          price: 250,  priority: "normal" },
    { name: "Luminária de piso",    price: 200,  priority: "low" },
    { name: "Quadro decorativo",    price: 120,  priority: "low" },
    { name: "Poltrona",             price: 600,  priority: "low" },
    { name: "Aparador",             price: 450,  priority: "low" },
    { name: "Cortina sala",         price: 180,  priority: "normal" },
    { name: "Estante/prateleira",   price: 300,  priority: "low" },
    { name: "Mesa de jantar",       price: 800,  priority: "normal" },
    { name: "Cadeiras de jantar",   price: 600,  priority: "normal" },
  ],
  cozinha: [
    { name: "Geladeira frost free", price: 2500, priority: "high" },
    { name: "Fogão 4 bocas",        price: 700,  priority: "high" },
    { name: "Micro-ondas",          price: 450,  priority: "high" },
    { name: "Jogo de panelas",      price: 300,  priority: "high" },
    { name: "Jogo de talheres",     price: 80,   priority: "high" },
    { name: "Jogo de pratos",       price: 120,  priority: "high" },
    { name: "Copos e taças",        price: 80,   priority: "high" },
    { name: "Liquidificador",       price: 150,  priority: "normal" },
    { name: "Batedeira",            price: 200,  priority: "low" },
    { name: "Airfryer",             price: 350,  priority: "low" },
    { name: "Lixeira cozinha",      price: 60,   priority: "normal" },
    { name: "Escorredor de louça",  price: 70,   priority: "normal" },
    { name: "Tábua de corte",       price: 40,   priority: "normal" },
    { name: "Porta-temperos",       price: 50,   priority: "low" },
    { name: "Pano de prato",        price: 30,   priority: "high" },
    { name: "Rodo e vassoura",      price: 45,   priority: "high" },
    { name: "Balde",                price: 20,   priority: "normal" },
  ],
  banheiro: [
    { name: "Jogo de toalhas de banho", price: 120, priority: "high" },
    { name: "Toalha de rosto",      price: 40,   priority: "high" },
    { name: "Tapete de banheiro",   price: 50,   priority: "normal" },
    { name: "Porta-shampoo box",    price: 40,   priority: "normal" },
    { name: "Saboneteira",          price: 30,   priority: "normal" },
    { name: "Porta papel higiênico",price: 35,   priority: "normal" },
    { name: "Lixeira banheiro",     price: 25,   priority: "normal" },
    { name: "Espelho",              price: 80,   priority: "high" },
    { name: "Toalha de piso",       price: 40,   priority: "normal" },
    { name: "Porta-toalha",         price: 45,   priority: "low" },
  ],
};

/* ─── Multiplicadores por tamanho do apê ─── */
const SIZE_MULTIPLIERS = {
  "Studio":     { multiplier: 0.6, extraRooms: [] },
  "1 quarto":   { multiplier: 0.8, extraRooms: [] },
  "2 quartos":  { multiplier: 1.0, extraRooms: [] },
  "3 quartos":  { multiplier: 1.0, extraRooms: ["quarto"] },
  "4+ quartos": { multiplier: 1.0, extraRooms: ["quarto", "quarto"] },
};

export async function POST(req) {
  let rooms, items, aptSize;
  try {
    ({ rooms, items, aptSize } = await req.json());
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const existingNames = (items || [])
    .map(i => i.name?.toLowerCase().trim())
    .filter(Boolean);

  const suggestions = [];

  for (const room of (rooms || [])) {
    const essentials = ESSENTIALS[room.id] || [];

    for (const item of essentials) {
      // Pula se já existe item similar na lista
      const alreadyHas = existingNames.some(
        name => name.includes(item.name.toLowerCase().split(" ")[0])
      );
      if (alreadyHas) continue;

      suggestions.push({
        name:           item.name,
        roomId:         room.id,
        estimatedPrice: item.price,
        priority:       item.priority,
      });
    }
  }

  // Limita a 20 sugestões, priorizando alta prioridade
  const sorted = suggestions.sort((a, b) => {
    const p = { high: 0, normal: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  }).slice(0, 20);

  return Response.json(sorted);
}
