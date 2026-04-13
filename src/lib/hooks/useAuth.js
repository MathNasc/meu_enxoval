// src/lib/hooks/useAuth.js
// Gerencia autenticação: login, registro, logout, sessão persistente

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);  // inclui household_id
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // ── Carrega perfil (household_id, email) ────────────────
  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*, households(id, name, invite_code)")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  }, []);

  // ── Inicializa sessão ────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) loadProfile(session.user.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ── Criar conta ─────────────────────────────────────────
  const signUp = useCallback(async (email, password) => {
    setError("");
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(err.message); return false; }
    return true;
  }, []);

  // ── Login ────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); return false; }
    return true;
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  // ── Gerar convite casal ──────────────────────────────────
  // Retorna o invite_code do household do usuário atual
  const getInviteCode = useCallback(() => {
    return profile?.households?.invite_code ?? null;
  }, [profile]);

  // ── Entrar no household de outro usuário via código ──────
  const joinHousehold = useCallback(async (code) => {
    setError("");
    // 1. Encontra o household pelo código
    const { data: household, error: findErr } = await supabase
      .from("households")
      .select("id, name")
      .eq("invite_code", code.trim().toUpperCase())
      .single();

    if (findErr || !household) {
      setError("Código inválido. Verifique e tente novamente.");
      return false;
    }

    if (household.id === profile?.household_id) {
      setError("Você já está neste household.");
      return false;
    }

    // 2. Atualiza o perfil do usuário
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ household_id: household.id })
      .eq("id", user.id);

    if (updateErr) { setError(updateErr.message); return false; }

    // 3. Recarrega o perfil
    await loadProfile(user.id);
    return true;
  }, [user, profile, loadProfile]);

  // ── Sair do household compartilhado (cria um novo) ───────
  const leaveHousehold = useCallback(async () => {
    setError("");
    // Cria novo household para o usuário
    const { data: newHousehold } = await supabase
      .from("households")
      .insert({ name: "Meu Enxoval" })
      .select()
      .single();

    if (!newHousehold) return false;

    // Cria cômodos padrão
    await supabase.from("rooms").insert([
      { household_id: newHousehold.id, name:"Quarto",   icon:"bed",      color:"#D4875A" },
      { household_id: newHousehold.id, name:"Sala",     icon:"sofa",     color:"#2A9D8F" },
      { household_id: newHousehold.id, name:"Cozinha",  icon:"utensils", color:"#E9A830" },
      { household_id: newHousehold.id, name:"Banheiro", icon:"bath",     color:"#1272AA" },
    ]);

    await supabase.from("household_settings").insert({ household_id: newHousehold.id });

    await supabase.from("profiles")
      .update({ household_id: newHousehold.id })
      .eq("id", user.id);

    await loadProfile(user.id);
    return true;
  }, [user, loadProfile]);

  return {
    user, profile, loading, error, setError,
    signUp, signIn, signOut,
    getInviteCode, joinHousehold, leaveHousehold,
    householdId: profile?.household_id ?? null,
    isCouple: false, // será true quando dois usuários estiverem no mesmo household
  };
}
