// src/lib/constants/index.js
// Constantes da aplicação centralizadas.
// Importar daqui garante um único ponto de manutenção.

import {
  Home, Star, Zap, Heart, Target, Package, ShoppingBag,
  DollarSign, Layers, Boxes, Wallet, Sparkles, Bell, Award,
  Sofa, Bath, UtensilsCrossed, BedDouble,
} from "lucide-react";

// ── Ícones de cômodos ────────────────────────────────────
export const ICONS_MAP = {
  bed:      BedDouble,
  sofa:     Sofa,
  utensils: UtensilsCrossed,
  bath:     Bath,
  home:     Home,
  star:     Star,
  zap:      Zap,
  heart:    Heart,
  target:   Target,
  package:  Package,
  shopping: ShoppingBag,
  dollar:   DollarSign,
  layers:   Layers,
  boxes:    Boxes,
  wallet:   Wallet,
  sparkles: Sparkles,
  bell:     Bell,
  award:    Award,
};

/** Retorna o componente de ícone para uma chave, ou Home como fallback. */
export const getIcon = (key) => ICONS_MAP[key] || Home;

// ── Paleta de cores para cômodos ─────────────────────────
export const PALETTE = [
  "#1272AA",
  "#2A9D8F",
  "#E9A830",
  "#7058C8",
  "#D4875A",
  "#D94F7A",
  "#20B2AA",
  "#5D9E3A",
];

// ── Lojas com cores de badge ─────────────────────────────
export const STORE_MAP = [
  { p: "amazon.com.br",        n: "Amazon",       bg: "#FF9900", fg: "#000" },
  { p: "mercadolivre.com.br",  n: "Mercado Livre", bg: "#FFE600", fg: "#333" },
  { p: "shopee.com.br",        n: "Shopee",        bg: "#EE4D2D", fg: "#fff" },
  { p: "magazineluiza.com.br", n: "Magalu",        bg: "#0066CC", fg: "#fff" },
  { p: "casasbahia.com.br",    n: "Casas Bahia",   bg: "#F7941D", fg: "#fff" },
  { p: "americanas.com.br",    n: "Americanas",    bg: "#E8192C", fg: "#fff" },
  { p: "leroymerlin.com.br",   n: "Leroy Merlin",  bg: "#78BE1F", fg: "#fff" },
];

/**
 * Retorna os dados da loja a partir de uma URL de produto.
 * Retorna null se a URL não for de nenhuma loja conhecida.
 */
export const getStore = (url) => {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return STORE_MAP.find((s) => host.includes(s.p)) || null;
  } catch {
    return null;
  }
};

// ── Sugestões de itens por cômodo ────────────────────────
// Chave: nome normalizado (sem acentos, lowercase)
// Usado em: getRoomSuggestions(), QuickAddModal, ItemsSimple
export const ROOM_SUGGESTIONS_BY_NAME = {
  quarto: [
    "Cama box", "Colchão", "Cabeceira", "Guarda-roupa", "Cômoda",
    "Criado-mudo", "Espelho", "Cortina", "Edredom", "Travesseiro", "Abajur",
  ],
  sala: [
    "Sofá", "Mesa de centro", "Rack TV", "Televisão", "Tapete",
    "Luminária", "Quadro", "Poltrona", "Prateleira", "Cortina", "Aparador",
  ],
  cozinha: [
    "Geladeira", "Fogão", "Micro-ondas", "Panelas", "Talheres",
    "Pratos", "Copos", "Liquidificador", "Lixeira", "Escorredor", "Tábua de corte",
  ],
  banheiro: [
    "Toalha de banho", "Toalha de rosto", "Tapete", "Espelho",
    "Porta-shampoo", "Saboneteira", "Suporte papel", "Lixeira",
  ],
};

/**
 * Retorna sugestões de itens para um cômodo, excluindo os que já existem.
 * Faz match por nome normalizado (sem acentos) para suportar cômodos
 * com nomes customizados como "Quarto Casal" ou "Sala de Estar".
 */
export function getRoomSuggestions(roomId, rooms, existingItems) {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return [];

  const key = room.name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos

  const list =
    ROOM_SUGGESTIONS_BY_NAME[key] ||
    Object.entries(ROOM_SUGGESTIONS_BY_NAME).find(([k]) => key.includes(k))?.[1] ||
    [];

  return list
    .filter((s) => !existingItems.some((i) => i?.name?.toLowerCase() === s.toLowerCase()))
    .slice(0, 6);
}
