// src/lib/hooks/useSettings.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function useSettings(householdId) {
  const [settings, setSettings] = useState({ deliveryDate: "", budgetTotal: null });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    supabase.from("household_settings")
      .select("*").eq("household_id", householdId).single()
      .then(({ data }) => {
        if (data) setSettings({
          deliveryDate: data.delivery_date ?? "",
          budgetTotal:  data.budget_total  ?? null,
        });
        setLoading(false);
      });
  }, [householdId]);

  const saveSettings = useCallback(async (changes) => {
    setSettings(prev => ({ ...prev, ...changes }));
    await supabase.from("household_settings").upsert({
      household_id:  householdId,
      delivery_date: changes.deliveryDate ?? settings.deliveryDate ?? null,
      budget_total:  changes.budgetTotal  ?? settings.budgetTotal  ?? null,
    });
  }, [householdId, settings]);

  return { settings, loading, saveSettings };
}
