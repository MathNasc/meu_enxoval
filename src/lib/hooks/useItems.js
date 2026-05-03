// src/lib/hooks/useItems.js
// Gerencia estado React dos items.
// Queries Supabase → src/lib/services/items.service.js
// Semana 4: hook limpo — sem chamadas supabase.from() diretas.

import { useState, useEffect, useCallback } from "react";
import {
  fetchItems, createItem, updateItem as updateItemDb,
  softDeleteItem, restoreItem as restoreItemDb,
  deleteItem, emptyTrash as emptyTrashDb,
  subscribeToItems, dbToItem,
} from "../services/items.service";

export function useItems(householdId) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch ─────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!householdId) { setItems([]); setLoading(false); return; }
    try {
      const data = await fetchItems(householdId);
      setItems(data);
    } catch (err) {
      console.error("[useItems] load:", err.message);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => { load(); }, [load]);

  // ── Realtime ──────────────────────────────────────────
  useEffect(() => {
    if (!householdId) return;
    return subscribeToItems(householdId, load);
  }, [householdId, load]);

  // ── ADD ───────────────────────────────────────────────
  const addItem = useCallback(async (item) => {
    if (!householdId) return null;
    try {
      const newItem = await createItem(item, householdId);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error("[useItems] addItem:", err.message);
      throw err;
    }
  }, [householdId]);

  // ── UPDATE ────────────────────────────────────────────
  const updateItem = useCallback(async (id, changes) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i));
    try {
      await updateItemDb(id, changes);
    } catch (err) {
      console.error("[useItems] updateItem:", err.message);
      load(); // revert
      throw err;
    }
  }, [load]);

  // ── TOGGLE STATUS ─────────────────────────────────────
  const toggleStatus = useCallback(async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    await updateItem(id, { status: item.status === "bought" ? "want" : "bought" });
  }, [items, updateItem]);

  // ── TOGGLE STARRED ────────────────────────────────────
  const toggleStar = useCallback(async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    await updateItem(id, { starred: !item.starred });
  }, [items, updateItem]);

  // ── SOFT DELETE ───────────────────────────────────────
  const softDelete = useCallback(async (id) => {
    const deletedAt = new Date().toISOString();
    setItems(prev => prev.map(i => i.id === id ? { ...i, deletedAt } : i));
    try {
      await softDeleteItem(id);
    } catch (err) {
      console.error("[useItems] softDelete:", err.message);
      load();
      throw err;
    }
  }, [load]);

  // ── RESTORE ───────────────────────────────────────────
  const restoreItem = useCallback(async (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, deletedAt: null } : i));
    try {
      await restoreItemDb(id);
    } catch (err) {
      console.error("[useItems] restoreItem:", err.message);
      load();
      throw err;
    }
  }, [load]);

  // ── PERMANENT DELETE ──────────────────────────────────
  const permanentDelete = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await deleteItem(id);
    } catch (err) {
      console.error("[useItems] permanentDelete:", err.message);
      load();
      throw err;
    }
  }, [load]);

  // ── EMPTY TRASH ───────────────────────────────────────
  const emptyTrash = useCallback(async () => {
    const ids = items.filter(i => i.deletedAt).map(i => i.id);
    if (!ids.length) return;
    setItems(prev => prev.filter(i => !i.deletedAt));
    try {
      await emptyTrashDb(ids);
    } catch (err) {
      console.error("[useItems] emptyTrash:", err.message);
      load();
      throw err;
    }
  }, [items, load]);

  // ── DUPLICATE ─────────────────────────────────────────
  const duplicateItem = useCallback(async (item) => {
    return addItem({
      ...item,
      name:         `${item.name} (cópia)`,
      status:       "want",
      starred:      false,
      priceHistory: [],
      priceOffers:  [],
      deletedAt:    null,
    });
  }, [addItem]);

  // ── UPDATE PRICE OFFERS ───────────────────────────────
  const updatePriceOffers = useCallback(async (id, offers) => {
    await updateItem(id, { priceOffers: offers });
  }, [updateItem]);

  // ── UPDATE PRICE + HISTORY ────────────────────────────
  const updateItemPrice = useCallback(async (id, newPrice) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const oldPrice = parseFloat(item.price);
    const next     = parseFloat(newPrice);
    if (!isNaN(oldPrice) && oldPrice > 0 && oldPrice !== next) {
      const entry   = { price: oldPrice, date: new Date().toISOString().slice(0, 10) };
      const history = [...(item.priceHistory || []), entry].slice(-20);
      await updateItem(id, { price: newPrice, priceHistory: history });
    } else {
      await updateItem(id, { price: newPrice });
    }
  }, [items, updateItem]);

  return {
    items, loading,
    fetchItems: load,
    addItem, updateItem, toggleStatus, toggleStar,
    softDelete, restoreItem, permanentDelete,
    emptyTrash, duplicateItem, updatePriceOffers, updateItemPrice,
  };
}
