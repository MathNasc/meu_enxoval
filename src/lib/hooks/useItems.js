// src/lib/hooks/useItems.js
// Hook de estado dos itens. Queries Supabase isoladas aqui —
// componentes nunca chamam supabase.from() diretamente.
// Semana 3: try/catch em TODOS os métodos, erro propagado via throw
// para que App.js possa exibir toast de erro ao usuário.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

const TRASH_DAYS = 30;

// ── DB ↔ App transforms ──────────────────────────────────
function dbToItem(row) {
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

function itemToDb(item, householdId) {
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

export function useItems(householdId) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all items (active + soft-deleted) ─────────────
  const fetchItems = useCallback(async () => {
    if (!householdId) { setItems([]); setLoading(false); return; }
    try {
      const cutoff = new Date(Date.now() - TRASH_DAYS * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("household_id", householdId)
        .or(`deleted_at.is.null,deleted_at.gte.${cutoff}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data || []).map(dbToItem));
    } catch (err) {
      console.error("[useItems] fetchItems:", err.message);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Realtime sync ────────────────────────────────────────
  useEffect(() => {
    if (!householdId) return;
    const channel = supabase
      .channel(`items:${householdId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "items",
          filter: `household_id=eq.${householdId}` },
        () => fetchItems()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [householdId, fetchItems]);

  // ── ADD ──────────────────────────────────────────────────
  const addItem = useCallback(async (item) => {
    if (!householdId) return null;
    try {
      const { data, error } = await supabase
        .from("items")
        .insert(itemToDb(item, householdId))
        .select()
        .single();
      if (error) throw error;
      const newItem = dbToItem(data);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error("[useItems] addItem:", err.message);
      throw err; // propagate to App.js for toast
    }
  }, [householdId]);

  // ── UPDATE ───────────────────────────────────────────────
  const updateItem = useCallback(async (id, changes) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i));
    try {
      const dbChanges = {};
      if ("roomId"   in changes) dbChanges.room_id    = changes.roomId   || null;
      if ("name"     in changes) dbChanges.name        = changes.name;
      if ("price"    in changes) dbChanges.price       = changes.price !== "" ? parseFloat(changes.price) || null : null;
      if ("link"     in changes) dbChanges.link        = changes.link    || null;
      if ("imageUrl" in changes) dbChanges.image_url   = changes.imageUrl || null;
      if ("notes"    in changes) dbChanges.notes       = changes.notes   || null;
      if ("status"   in changes) dbChanges.status      = changes.status;
      if ("priority" in changes) dbChanges.priority    = changes.priority;
      if ("starred"  in changes) dbChanges.starred     = changes.starred;
      if ("priceHistory" in changes) dbChanges.price_history = changes.priceHistory;
      if ("priceOffers"  in changes) dbChanges.price_offers  = changes.priceOffers;

      const { error } = await supabase
        .from("items")
        .update(dbChanges)
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("[useItems] updateItem:", err.message);
      fetchItems(); // revert optimistic update
      throw err;
    }
  }, [fetchItems]);

  // ── TOGGLE STATUS ────────────────────────────────────────
  const toggleStatus = useCallback(async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newStatus = item.status === "bought" ? "want" : "bought";
    await updateItem(id, { status: newStatus });
  }, [items, updateItem]);

  // ── TOGGLE STARRED ───────────────────────────────────────
  const toggleStar = useCallback(async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    await updateItem(id, { starred: !item.starred });
  }, [items, updateItem]);

  // ── SOFT DELETE (lixeira) ────────────────────────────────
  const softDelete = useCallback(async (id) => {
    const deletedAt = new Date().toISOString();
    setItems(prev => prev.map(i => i.id === id ? { ...i, deletedAt } : i));
    try {
      const { error } = await supabase
        .from("items")
        .update({ deleted_at: deletedAt })
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("[useItems] softDelete:", err.message);
      fetchItems();
      throw err;
    }
  }, [fetchItems]);

  // ── RESTORE FROM TRASH ───────────────────────────────────
  const restoreItem = useCallback(async (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, deletedAt: null } : i));
    try {
      const { error } = await supabase
        .from("items")
        .update({ deleted_at: null })
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("[useItems] restoreItem:", err.message);
      fetchItems();
      throw err;
    }
  }, [fetchItems]);

  // ── PERMANENT DELETE ─────────────────────────────────────
  const permanentDelete = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("[useItems] permanentDelete:", err.message);
      fetchItems();
      throw err;
    }
  }, [fetchItems]);

  // ── EMPTY TRASH ──────────────────────────────────────────
  const emptyTrash = useCallback(async () => {
    const trashIds = items.filter(i => i.deletedAt).map(i => i.id);
    if (!trashIds.length) return;
    setItems(prev => prev.filter(i => !i.deletedAt));
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .in("id", trashIds);
      if (error) throw error;
    } catch (err) {
      console.error("[useItems] emptyTrash:", err.message);
      fetchItems();
      throw err;
    }
  }, [items, fetchItems]);

  // ── DUPLICATE ────────────────────────────────────────────
  const duplicateItem = useCallback(async (item) => {
    const copy = {
      ...item,
      name: `${item.name} (cópia)`,
      status: "want",
      starred: false,
      priceHistory: [],
      priceOffers:  [],
      deletedAt: null,
    };
    return addItem(copy);
  }, [addItem]);

  // ── UPDATE PRICE OFFERS (comparação) ────────────────────
  const updatePriceOffers = useCallback(async (id, offers) => {
    await updateItem(id, { priceOffers: offers });
  }, [updateItem]);

  // ── UPDATE PRICE HISTORY (ao editar preço manualmente) ──
  const updateItemPrice = useCallback(async (id, newPrice) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const oldPrice = parseFloat(item.price);
    const next     = parseFloat(newPrice);
    if (!isNaN(oldPrice) && oldPrice > 0 && oldPrice !== next) {
      const entry = { price: oldPrice, date: new Date().toISOString().slice(0, 10) };
      const history = [...(item.priceHistory || []), entry].slice(-20);
      await updateItem(id, { price: newPrice, priceHistory: history });
    } else {
      await updateItem(id, { price: newPrice });
    }
  }, [items, updateItem]);

  return {
    items,
    loading,
    fetchItems,
    addItem,
    updateItem,
    toggleStatus,
    toggleStar,
    softDelete,
    restoreItem,
    permanentDelete,
    emptyTrash,
    duplicateItem,
    updatePriceOffers,
    updateItemPrice,
  };
}
