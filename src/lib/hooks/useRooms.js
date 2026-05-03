// src/lib/hooks/useRooms.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

function dbToRoom(row) {
  return {
    id:    row.id,
    name:  row.name,
    icon:  row.icon  || "home",
    color: row.color || "#1272AA",
  };
}

export function useRooms(householdId) {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    if (!householdId) { setRooms([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[useRooms] fetch:", error.message, error.details);
    }
    if (data) setRooms(data.map(dbToRoom));
    setLoading(false);
  }, [householdId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // Realtime: sincroniza entre dispositivos do casal
  useEffect(() => {
    if (!householdId) return;

    const channel = supabase
      .channel(`rooms:${householdId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "rooms",
          filter: `household_id=eq.${householdId}` },
        () => fetchRooms() // re-fetch on any change
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [householdId, fetchRooms]);

  const addRoom = useCallback(async ({ name, icon, color }) => {
    if (!householdId) return null;

    const { data, error } = await supabase
      .from("rooms")
      .insert({ household_id: householdId, name, icon, color })
      .select()
      .single();

    if (error) {
      console.error("[useRooms] addRoom:", error.message, error.details);
      return null;
    }

    const room = dbToRoom(data);
    setRooms(prev => [...prev, room]);
    return room;
  }, [householdId]);

  const deleteRoom = useCallback(async (id) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) {
      console.error("[useRooms] deleteRoom:", error.message);
      fetchRooms(); // reverte se falhou
    }
  }, [fetchRooms]);

  return { rooms, loading, fetchRooms, addRoom, deleteRoom };
}
