/**
 * POST /api/complete-home
 * Body: { rooms: Room[], items: Item[], aptSize: string }
 *
 * Critério de prioridade:
 *   high   = sem isso não dá para morar (dormir, comer, higiene básica)
 *   normal = importante mas dá para esperar algumas semanas
 *   low    = conforto e decoração, pode deixar para depois
 */

const ESSENTIALS = {
  quarto: [
    // ── High: sem isso não dá pra dormir ──
    { name: "Cama box casal",        price: 1200, priority: "high"   },
    { name: "Colchão",               price: 800,  priority: "high"   },
    { name: "Edredom casal",         price: 180,  priority: "high"   },
    { name: "Jogo de lençol",        price: 120,  priority: "high"   },
    { name: "Travesseiro",           price: 60,   priority: "high"   },
    // ── Normal: importante, mas não urgente no dia 1 ──
    { name: "Guarda-roupa 6 portas", price: 900,  priority: "normal" },
    { name: "Cabeceira",             price: 350,  priority: "normal" },
    { name: "Cômoda",                price: 450,  priority: "normal" },
    { name: "Criado-mudo",           price: 180,  priority: "normal" },
    { name: "Cortina blackout",      price: 150,  priority: "normal" },
    { name: "Espelho de parede",     price: 120,  priority: "normal" },
    // ── Low: conforto e decoração ──
    { name: "Tapete para quarto",    price: 150,  priority: "low"    },
    { name: "Abajur",                price: 80,   priority: "low"    },
    { name: "Suporte para TV",       price: 80,   priority: "low"    },
  ],
  sala: [
    // ── High: sem isso não tem onde sentar ──
    { name: "Sofá 3 lugares",        price: 1500, priority: "high"   },
    // ── Normal: importantes para o dia a dia ──
    { name: "Mesa de jantar",        price: 800,  priority: "normal" },
    { name: "Cadeiras de jantar",    price: 600,  priority: "normal" },
    { name: 'Televisão 50"',         price: 2200, priority: "normal" },
    { name: "Rack para TV",          price: 400,  priority: "normal" },
    { name: "Tapete sala",           price: 250,  priority: "normal" },
    { name: "Cortina sala",          price: 180,  priority: "normal" },
    { name: "Mesa de centro",        price: 350,  priority: "normal" },
    // ── Low: decoração e conforto extra ──
    { name: "Poltrona",              price: 600,  priority: "low"    },
    { name: "Aparador",              price: 450,  priority: "low"    },
    { name: "Estante/prateleira",    price: 300,  priority: "low"    },
    { name: "Luminária de piso",     price: 200,  priority: "low"    },
    { name: "Quadro decorativo",     price: 120,  priority: "low"    },
  ],
  cozinha: [
    // ── High: sem isso não dá pra comer/cozinhar ──
    { name: "Geladeira frost free",  price: 2500, priority: "high"   },
    { name: "Fogão 4 bocas",         price: 700,  priority: "high"   },
    { name: "Jogo de panelas",       price: 300,  priority: "high"   },
    { name: "Jogo de talheres",      price: 80,   priority: "high"   },
    { name: "Jogo de pratos",        price: 120,  priority: "high"   },
    { name: "Copos e taças",         price: 80,   priority: "high"   },
    // ── Normal: facilita muito o dia a dia ──
    { name: "Micro-ondas",           price: 450,  priority: "normal" },
    { name: "Liquidificador",        price: 150,  priority: "normal" },
    { name: "Lixeira cozinha",       price: 60,   priority: "normal" },
    { name: "Escorredor de louça",   price: 70,   priority: "normal" },
    { name: "Tábua de corte",        price: 40,   priority: "normal" },
    { name: "Pano de prato",         price: 30,   priority: "normal" },
    { name: "Rodo e vassoura",       price: 45,   priority: "normal" },
    { name: "Balde",                 price: 20,   priority: "normal" },
    // ── Low: conforto e praticidade ──
    { name: "Airfryer",              price: 350,  priority: "low"    },
    { name: "Batedeira",             price: 200,  priority: "low"    },
    { name: "Porta-temperos",        price: 50,   priority: "low"    },
  ],
  banheiro: [
    // ── High: higiene básica ──
    { name: "Jogo de toalhas de banho", price: 120, priority: "high" },
    { name: "Toalha de rosto",       price: 40,   priority: "high"   },
    { name: "Espelho",               price: 80,   priority: "high"   },
    // ── Normal: conforto diário ──
    { name: "Tapete de banheiro",    price: 50,   priority: "normal" },
    { name: "Saboneteira",           price: 30,   priority: "normal" },
    { name: "Porta papel higiênico", price: 35,   priority: "normal" },
    { name: "Lixeira banheiro",      price: 25,   priority: "normal" },
    { name: "Toalha de piso",        price: 40,   priority: "normal" },
    // ── Low: organização ──
    { name: "Porta-shampoo box",     price: 40,   priority: "low"    },
    { name: "Porta-toalha",          price: 45,   priority: "low"    },
  ],
};

function getEssentialsKey(roomName) {
  if (!roomName) return null;
  const n = roomName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (ESSENTIALS[n]) return n;
  for (const key of Object.keys(ESSENTIALS)) {
    if (n.includes(key) || key.includes(n)) return key;
  }
  return null;
}

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

  const VALID_PRIORITIES = ["high", "normal", "low"];
  const suggestions = [];

  for (const room of (rooms || [])) {
    const key = getEssentialsKey(room.name);
    if (!key) continue;

    for (const item of ESSENTIALS[key]) {
      const firstWord = item.name.toLowerCase().split(" ")[0];
      const alreadyHas = existingNames.some(name => name.includes(firstWord));
      if (alreadyHas) continue;

      // Garante que priority é sempre um valor válido
      const priority = VALID_PRIORITIES.includes(item.priority)
        ? item.priority
        : "normal";

      suggestions.push({
        name:           item.name,
        roomId:         room.id,
        estimatedPrice: item.price,
        priority,
      });
    }
  }

  const sorted = suggestions
    .sort((a, b) => {
      const p = { high: 0, normal: 1, low: 2 };
      return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
    })
    .slice(0, 20);

  console.log(`[complete-home] ${rooms?.length} cômodos → ${sorted.length} sugestões`);

  return Response.json(sorted);
}
