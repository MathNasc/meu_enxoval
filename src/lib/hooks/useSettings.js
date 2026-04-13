// src/lib/hooks/useSettings.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function useSettings(householdId) {
  const [settings, setSettings] = useState({ deliveryDate: "", budgetTotal: null });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }

    supabase
      .from("household_settings")
      .select("*")
      .eq("household_id", householdId)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== "PGRST116") {
          // PGRST116 = "row not found" — normal se ainda não existe
          console.error("[useSettings] load:", error.message);
        }
        if (data) {
          setSettings({
            deliveryDate: data.delivery_date ?? "",
            budgetTotal:  data.budget_total  ?? null,
          });
        }
        setLoading(false);
      });
  }, [householdId]);

  // FIX #4: upsert com onConflict explícito.
  // Problema anterior: RLS "FOR ALL USING" não cobria INSERT,
  // então o upsert falhava silenciosamente ao tentar criar a linha.
  // Solução: schema corrigido com WITH CHECK + onConflict no upsert.
  const saveSettings = useCallback(async (changes) => {
    if (!householdId) return;

    // Atualiza estado local imediatamente (otimista)
    setSettings(prev => ({ ...prev, ...changes }));

    const payload = {
      household_id:  householdId,
      delivery_date: changes.deliveryDate ?? null,
      budget_total:  changes.budgetTotal  !== undefined
                       ? (parseFloat(changes.budgetTotal) || null)
                       : null,
    };

    // Remove chaves undefined para não sobrescrever com null
    if (!("deliveryDate" in changes)) delete payload.delivery_date;
    if (!("budgetTotal"  in changes)) delete payload.budget_total;

    const { error } = await supabase
      .from("household_settings")
      .upsert(payload, { onConflict: "household_id" });

    if (error) {
      console.error("[useSettings] save:", error.message, error.details);
    }
  }, [householdId]);

  // Conveniência: salva apenas a data de entrega
  const setDeliveryDate = useCallback((date) => {
    return saveSettings({ deliveryDate: date });
  }, [saveSettings]);

  // Conveniência: salva apenas o orçamento
  const setBudgetTotal = useCallback((total) => {
    return saveSettings({ budgetTotal: total });
  }, [saveSettings]);

  return { settings, loading, saveSettings, setDeliveryDate, setBudgetTotal };
}
