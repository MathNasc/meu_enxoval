// src/lib/services/items.service.js
// Todas as queries Supabase de items em um único lugar.
// Motivos:
//   1. useItems.js fica responsável apenas por estado React
//   2. Queries podem ser testadas sem montar componentes
//   3. Troca de backend (ex: REST → RPC) afeta só este arquivo
//
// Regras:
//   - Cada função lança o erro original (throw error) — quem chama decide como tratar
//   - Transformações DB ↔ App ficam aqui (dbToItem / itemToDb)
//   - Nunca importar hooks React aqui

import { supabase } from "../supabase";

const TRASH_DAYS = 30;

// ── Transforms ───────────────────────────────────────────
export function dbToItem(row) {
  return {
    id:           row.id,
    householdId:  row.household_id,
    roomId:       row.room_id,
    name:         row.name,
    price:        row.price ?? "",
    link:         row.link ?? "",
    imageUrl:     row.image_url ?? "",
    notes:        row.notes ?? "",
    status:       row.status,
    priority:     row.priority,
    starred:      row.starred ?? false,
    deletedAt:    row.deleted_at ?? null,
    priceHistory: Array.isArray(row.price_history) ? row.price_history : [],
    priceOffers:  Array.isArray(row.price_offers)  ? row.price_offers  : [],
    createdAt:    row.created_at,
  };
}

export function itemToDb(item, householdId) {
  return {
    household_id:  householdId,
    room_id:       item.roomId    || null,
    name:          item.name,
    price:         item.price !== "" ? parseFloat(item.price) || null : null,
    link:          item.link      || null,
    image_url:     item.imageUrl  || null,
    notes:         item.notes     || null,
    status:        item.status    || "want",
    priority:      item.priority  || "normal",
    starred:       item.starred   ?? false,
    price_history: item.priceHistory ?? [],
    price_offers:  item.priceOffers  ?? [],
  };
}

// ── Queries ───────────────────────────────────────────────

/** Busca todos os items ativos + lixeira recente do household */
export async function fetchItems(householdId) {
  const cutoff = new Date(Date.now() - TRASH_DAYS * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("household_id", householdId)
    .or(`deleted_at.is.null,deleted_at.gte.${cutoff}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(dbToItem);
}

/** Insere um novo item e retorna o registro criado */
export async function createItem(item, householdId) {
  const { data, error } = await supabase
    .from("items")
    .insert(itemToDb(item, householdId))
    .select()
    .single();

  if (error) throw error;
  return dbToItem(data);
}

/** Atualiza campos específicos de um item */
export async function updateItem(id, changes) {
  const dbChanges = {};
  if ("roomId"       in changes) dbChanges.room_id       = changes.roomId       || null;
  if ("name"         in changes) dbChanges.name           = changes.name;
  if ("price"        in changes) dbChanges.price          = changes.price !== "" ? parseFloat(changes.price) || null : null;
  if ("link"         in changes) dbChanges.link           = changes.link         || null;
  if ("imageUrl"     in changes) dbChanges.image_url      = changes.imageUrl     || null;
  if ("notes"        in changes) dbChanges.notes          = changes.notes        || null;
  if ("status"       in changes) dbChanges.status         = changes.status;
  if ("priority"     in changes) dbChanges.priority       = changes.priority;
  if ("starred"      in changes) dbChanges.starred        = changes.starred;
  if ("deletedAt"    in changes) dbChanges.deleted_at     = changes.deletedAt;
  if ("priceHistory" in changes) dbChanges.price_history  = changes.priceHistory;
  if ("priceOffers"  in changes) dbChanges.price_offers   = changes.priceOffers;

  const { error } = await supabase
    .from("items")
    .update(dbChanges)
    .eq("id", id);

  if (error) throw error;
}

/** Move item para a lixeira (soft delete) */
export async function softDeleteItem(id) {
  const deletedAt = new Date().toISOString();
  const { error } = await supabase
    .from("items")
    .update({ deleted_at: deletedAt })
    .eq("id", id);

  if (error) throw error;
  return deletedAt;
}

/** Restaura item da lixeira */
export async function restoreItem(id) {
  const { error } = await supabase
    .from("items")
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) throw error;
}

/** Deleta permanentemente um item */
export async function deleteItem(id) {
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/** Esvazia a lixeira (deleta todos os items com deleted_at) */
export async function emptyTrash(ids) {
  if (!ids.length) return;
  const { error } = await supabase
    .from("items")
    .delete()
    .in("id", ids);

  if (error) throw error;
}

/** Canal Realtime — chama onUpdate a cada mudança */
export function subscribeToItems(householdId, onUpdate) {
  const channel = supabase
    .channel(`items:${householdId}`)
    .on("postgres_changes",
      { event: "*", schema: "public", table: "items",
        filter: `household_id=eq.${householdId}` },
      onUpdate
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
