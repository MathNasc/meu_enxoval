// src/lib/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // ── Carrega perfil + household com invite_code ───────────
  const loadProfile = useCallback(async (userId) => {
    const { data, error: err } = await supabase
      .from("profiles")
      .select("*, households(id, name, invite_code)")
      .eq("id", userId)
      .single();

    if (err) console.error("[useAuth] loadProfile:", err.message);
    if (data) setProfile(data);
    return data;
  }, []);

  // ── Inicializa sessão (com tratamento de token inválido) ─
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // Token inválido no Vercel — limpa e deixa o usuário logar de novo
      if (error?.message?.includes("Refresh Token")) {
        console.warn("[useAuth] Stale token detected, clearing session");
        supabase.auth.signOut();
        setLoading(false);
        return;
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // TOKEN_REFRESH_FAILED = token expirado/inválido, força logout limpo
        if (event === "TOKEN_REFRESH_FAILED") {
          console.warn("[useAuth] Token refresh failed, signing out");
          supabase.auth.signOut();
          return;
        }
        setUser(session?.user ?? null);
        if (session?.user) loadProfile(session.user.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ── Criar conta ──────────────────────────────────────────
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

  // ── Retorna o invite_code do household ──────────────────
  const getInviteCode = useCallback(() => {
    // profile.households é o objeto relacionado (join do SELECT)
    return profile?.households?.invite_code ?? null;
  }, [profile]);

  // ── FIX #5: usa a função RPC que ignora RLS ─────────────
  // Antes: tentava SELECT em households diretamente (bloqueado pelo RLS)
  // Agora: chama join_household_by_code() que é SECURITY DEFINER
  const joinHousehold = useCallback(async (code) => {
    setError("");
    if (!code?.trim()) { setError("Digite o código."); return false; }

    const { data, error: rpcErr } = await supabase
      .rpc("join_household_by_code", { p_code: code.trim().toUpperCase() });

    if (rpcErr) {
      console.error("[useAuth] joinHousehold rpc:", rpcErr.message);
      setError("Erro ao processar o código. Tente novamente.");
      return false;
    }

    if (data?.error) {
      setError(data.error);
      return false;
    }

    // Recarrega perfil com novo household_id
    await loadProfile(user.id);
    return true;
  }, [user, loadProfile]);

  // ── Sair do casal: cria um household novo ────────────────
  const leaveHousehold = useCallback(async () => {
    setError("");
    if (!user) return false;

    // 1. Novo household
    const { data: newHousehold, error: hErr } = await supabase
      .from("households")
      .insert({ name: "Meu Enxoval" })
      .select()
      .single();

    if (hErr || !newHousehold) {
      console.error("[useAuth] leaveHousehold:", hErr?.message);
      setError("Não foi possível criar a nova lista.");
      return false;
    }

    // 2. Cômodos padrão
    await supabase.from("rooms").insert([
      { household_id: newHousehold.id, name: "Quarto",   icon: "bed",      color: "#D4875A" },
      { household_id: newHousehold.id, name: "Sala",     icon: "sofa",     color: "#2A9D8F" },
      { household_id: newHousehold.id, name: "Cozinha",  icon: "utensils", color: "#E9A830" },
      { household_id: newHousehold.id, name: "Banheiro", icon: "bath",     color: "#1272AA" },
    ]);

    await supabase
      .from("household_settings")
      .insert({ household_id: newHousehold.id });

    // 3. Atualiza profile
    await supabase
      .from("profiles")
      .update({ household_id: newHousehold.id })
      .eq("id", user.id);

    await loadProfile(user.id);
    return true;
  }, [user, loadProfile]);

  return {
    user,
    profile,
    loading,
    error,
    setError,
    signUp,
    signIn,
    signOut,
    getInviteCode,
    joinHousehold,
    leaveHousehold,
    householdId: profile?.household_id ?? null,
  };
}
