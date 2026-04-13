// src/lib/hooks/useRooms.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

function dbToRoom(row) {
  return { id: row.id, name: row.name, icon: row.icon, color: row.color };
}

export function useRooms(householdId) {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    if (!householdId) { setRooms([]); setLoading(false); return; }
    const { data } = await supabase
      .from("rooms").select("*").eq("household_id", householdId)
      .order("created_at");
    if (data) setRooms(data.map(dbToRoom));
    setLoading(false);
  }, [householdId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // Realtime para cômodos
  useEffect(() => {
    if (!householdId) return;
    const ch = supabase.channel(`rooms:${householdId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "rooms",
          filter: `household_id=eq.${householdId}` },
        () => fetchRooms()
      ).subscribe();
    return () => supabase.removeChannel(ch);
  }, [householdId, fetchRooms]);

  const addRoom = useCallback(async ({ name, icon, color }) => {
    const { data } = await supabase.from("rooms")
      .insert({ household_id: householdId, name, icon, color })
      .select().single();
    if (data) setRooms(prev => [...prev, dbToRoom(data)]);
  }, [householdId]);

  const deleteRoom = useCallback(async (id) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    await supabase.from("rooms").delete().eq("id", id);
  }, []);

  return { rooms, loading, addRoom, deleteRoom };
}
