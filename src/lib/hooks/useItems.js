// src/lib/hooks/useItems.js
// CRUD de itens com Supabase + Realtime para sincronização casal

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

const TODAY = () => new Date().toISOString().slice(0, 10);

// Converte snake_case do banco → camelCase do frontend
function dbToItem(row) {
  return {
    id:           row.id,
    name:         row.name,
    price:        row.price != null ? String(row.price) : "",
    link:         row.link        ?? "",
    imageUrl:     row.image_url   ?? "",
    notes:        row.notes       ?? "",
    status:       row.status,
    priority:     row.priority,
    starred:      row.starred,
    roomId:       row.room_id     ?? "",
    deletedAt:    row.deleted_at  ?? null,
    priceHistory: row.price_history ?? [],
    priceOffers:  row.price_offers  ?? [],
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

// Converte camelCase → snake_case para salvar no banco
function itemToDb(item, householdId) {
  return {
    household_id:  householdId,
    room_id:       item.roomId   || null,
    name:          item.name,
    price:         item.price    ? parseFloat(item.price) : null,
    link:          item.link     || null,
    image_url:     item.imageUrl || null,
    notes:         item.notes    || null,
    status:        item.status   ?? "want",
    priority:      item.priority ?? "normal",
    starred:       item.starred  ?? false,
    deleted_at:    item.deletedAt ?? null,
    price_history: item.priceHistory ?? [],
    price_offers:  item.priceOffers  ?? [],
  };
}

export function useItems(householdId) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Carrega todos os itens do household ─────────────────
  const fetchItems = useCallback(async () => {
    if (!householdId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true });

    if (!error && data) setItems(data.map(dbToItem));
    setLoading(false);
  }, [householdId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Realtime: escuta mudanças de outros usuários ────────
  useEffect(() => {
    if (!householdId) return;

    const channel = supabase
      .channel(`items:${householdId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "items",
          filter: `household_id=eq.${householdId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setItems(prev => {
              if (prev.some(i => i.id === payload.new.id)) return prev;
              return [...prev, dbToItem(payload.new)];
            });
          } else if (payload.eventType === "UPDATE") {
            setItems(prev => prev.map(i =>
              i.id === payload.new.id ? dbToItem(payload.new) : i
            ));
          } else if (payload.eventType === "DELETE") {
            setItems(prev => prev.filter(i => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [householdId]);

  // ── Adicionar item ───────────────────────────────────────
  const addItem = useCallback(async (item) => {
    if (!householdId) return null;
    const db = itemToDb(item, householdId);
    if (item.price) {
      db.price_history = [{ price: parseFloat(item.price), date: TODAY(), source: "manual" }];
    }
    const { data, error } = await supabase
      .from("items").insert(db).select().single();
    if (error) { console.error("addItem:", error); return null; }
    const newItem = dbToItem(data);
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, [householdId]);

  // ── Atualizar item ───────────────────────────────────────
  const updateItem = useCallback(async (id, changes) => {
    const dbChanges = {};
    if (changes.name      != null) dbChanges.name      = changes.name;
    if (changes.price     != null) dbChanges.price     = parseFloat(changes.price) || null;
    if (changes.link      != null) dbChanges.link      = changes.link;
    if (changes.imageUrl  != null) dbChanges.image_url = changes.imageUrl;
    if (changes.notes     != null) dbChanges.notes     = changes.notes;
    if (changes.status    != null) dbChanges.status    = changes.status;
    if (changes.priority  != null) dbChanges.priority  = changes.priority;
    if (changes.starred   != null) dbChanges.starred   = changes.starred;
    if (changes.roomId    != null) dbChanges.room_id   = changes.roomId;
    if (changes.deletedAt != null) dbChanges.deleted_at  = changes.deletedAt;
    if (changes.priceHistory) dbChanges.price_history = changes.priceHistory;
    if (changes.priceOffers)  dbChanges.price_offers  = changes.priceOffers;

    // Otimista: atualiza UI antes da resposta
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i));

    const { error } = await supabase.from("items").update(dbChanges).eq("id", id);
    if (error) {
      console.error("updateItem:", error);
      fetchItems(); // reverte se deu erro
    }
  }, [fetchItems]);

  // ── Soft delete ──────────────────────────────────────────
  const softDelete = useCallback((id) => {
    return updateItem(id, { deletedAt: new Date().toISOString() });
  }, [updateItem]);

  // ── Restaurar da lixeira ─────────────────────────────────
  const restoreItem = useCallback((id) => {
    return updateItem(id, { deletedAt: null });
  }, [updateItem]);

  // ── Excluir permanentemente ──────────────────────────────
  const permanentDelete = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) { console.error("permanentDelete:", error); fetchItems(); }
  }, [fetchItems]);

  // ── Toggle status (want ↔ bought) ────────────────────────
  const toggleStatus = useCallback((item) => {
    return updateItem(item.id, {
      status: item.status === "bought" ? "want" : "bought",
    });
  }, [updateItem]);

  // ── Toggle favorito ──────────────────────────────────────
  const toggleStar = useCallback((item) => {
    return updateItem(item.id, { starred: !item.starred });
  }, [updateItem]);

  // ── Duplicar ─────────────────────────────────────────────
  const duplicateItem = useCallback((item) => {
    return addItem({ ...item, status: "want", deletedAt: null, priceOffers: [] });
  }, [addItem]);

  // ── Atualizar preços encontrados na comparação ───────────
  const updatePriceOffers = useCallback((id, offers) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const curPrice  = parseFloat(item.price);
    const bestPrice = offers[0]?.price ?? 0;
    const changes   = { priceOffers: offers };

    // Só atualiza preço se achou mais barato
    if (bestPrice > 0 && (!item.price || bestPrice < curPrice)) {
      const history = [...(item.priceHistory || []),
        { price: bestPrice, date: TODAY(), source: "comparison" }];
      changes.price         = String(bestPrice);
      changes.priceHistory  = history;
    }
    return updateItem(id, changes);
  }, [items, updateItem]);

  // ── Esvaziar lixeira ─────────────────────────────────────
  const emptyTrash = useCallback(async () => {
    const trashIds = items.filter(i => i.deletedAt).map(i => i.id);
    if (!trashIds.length) return;
    setItems(prev => prev.filter(i => !i.deletedAt));
    await supabase.from("items").delete().in("id", trashIds);
  }, [items]);

  return {
    items, loading, fetchItems,
    addItem, updateItem, softDelete, restoreItem,
    permanentDelete, toggleStatus, toggleStar,
    duplicateItem, updatePriceOffers, emptyTrash,
  };
}
