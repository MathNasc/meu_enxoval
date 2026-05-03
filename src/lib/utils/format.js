// src/lib/utils/format.js
// Funções utilitárias puras — sem dependência de React ou Supabase.
// Podem ser testadas unitariamente e reutilizadas em qualquer componente.

/** Formata número como moeda BRL. Retorna "—" para valores inválidos. */
export const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n)
    ? "—"
    : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

/** Dias até uma data (string YYYY-MM-DD). Negativo = já passou. Null = sem data. */
export const daysLeft = (d) => {
  if (!d) return null;
  try {
    const target = new Date(d + "T00:00:00");
    const today  = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86_400_000);
  } catch {
    return null;
  }
};

/** ID único curto para toasts, keys temporárias, etc. */
export const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Data de hoje como string YYYY-MM-DD. */
export const todayStr = () => new Date().toISOString().slice(0, 10);

/** Predicado: item está ativo (não deletado). */
export const isActive = (item) => !item?.deletedAt;

/** Predicado: item está na lixeira. */
export const isDeleted = (item) => !!item?.deletedAt;

/** Dias restantes na lixeira antes de purga automática. */
export const TRASH_DAYS = 30;

export const trashDaysLeft = (item) => {
  if (!item?.deletedAt) return null;
  try {
    const deleted  = new Date(item.deletedAt);
    const expires  = new Date(deleted.getTime() + TRASH_DAYS * 86_400_000);
    return Math.max(0, Math.ceil((expires - new Date()) / 86_400_000));
  } catch {
    return null;
  }
};

/**
 * Detecta promoção comparando o preço atual com o histórico.
 * Retorna { discount: number, originalPrice: number } ou null.
 * Threshold: >= 10% de desconto.
 */
export const getPromoInfo = (item) => {
  const cur = parseFloat(item?.price);
  if (!item?.price || isNaN(cur) || cur <= 0) return null;

  const prices = (item.priceHistory || [])
    .map((h) => parseFloat(h.price))
    .filter((p) => !isNaN(p) && p > 0);

  if (!prices.length) return null;

  const ref  = Math.max(...prices);
  if (ref <= cur) return null;

  const disc = Math.round(((ref - cur) / ref) * 100);
  return disc >= 10 ? { discount: disc, originalPrice: ref } : null;
};
