"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Lock, Eye, EyeOff, Loader2, Check, AlertCircle, ShieldCheck,
} from "lucide-react";
import { supabase } from "../../src/lib/supabase";

// Estados possíveis da sessão de recovery
// "checking" → verificando se o token é válido
// "valid"    → token OK, exibe o formulário
// "invalid"  → token expirado ou ausente
// "success"  → senha atualizada com sucesso
const SESSION_STATES = { CHECKING: "checking", VALID: "valid", INVALID: "invalid", SUCCESS: "success" };

export default function ResetPasswordPage() {
  const router = useRouter();
  const mountedRef = useRef(true);

  const [sessionState, setSessionState] = useState(SESSION_STATES.CHECKING);
  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPwd, setShowPwd]           = useState(false);
  const [busy, setBusy]                 = useState(false);
  const [errorMsg, setErrorMsg]         = useState("");

  // ─── Inicialização da sessão ────────────────────────────────────────────────
  // Dois caminhos para capturar a sessão de recovery:
  // A) getSession() → sessão já foi criada pelo detectSessionInUrl antes do mount
  // B) onAuthStateChange(PASSWORD_RECOVERY) → sessão criada após o subscribe
  //
  // Ambos são necessários para eliminar a race condition.
  useEffect(() => {
    mountedRef.current = true;

    const markValid   = () => mountedRef.current && setSessionState(SESSION_STATES.VALID);
    const markInvalid = () => mountedRef.current && setSessionState(SESSION_STATES.INVALID);

    // Verifica se o hash contém type=recovery (fluxo implicit)
    const isRecoveryHash = () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const params = new URLSearchParams(hash.substring(1));
      return params.get("type") === "recovery";
    };

    // Verifica se há um code na query string (fluxo PKCE)
    const hasCodeParam = () => {
      const search = typeof window !== "undefined" ? window.location.search : "";
      return new URLSearchParams(search).has("code");
    };

    // CAMINHO A: sessão já criada antes do mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;

      if (session && (isRecoveryHash() || hasCodeParam())) {
        // Token de recovery presente na URL + sessão válida
        markValid();
        return;
      }

      if (session && !isRecoveryHash() && !hasCodeParam()) {
        // Sessão existe mas não veio de recovery link → usuário já logado normalmente
        // Redireciona para o app e sai
        router.replace("/");
        return;
      }

      // Sem sessão ainda → CAMINHO B (evento assíncrono)
    });

    // CAMINHO B: evento disparado assincronamente pelo Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;

      console.log("[reset-password] auth event:", event);

      if (event === "PASSWORD_RECOVERY") {
        markValid();
        return;
      }

      // PKCE flow: em algumas versões dispara SIGNED_IN ao invés de PASSWORD_RECOVERY
      // Aceitar se tiver um code param (indica que veio do email de recovery)
      if (event === "SIGNED_IN" && session && hasCodeParam()) {
        markValid();
        return;
      }

      // Evento INITIAL_SESSION: sessão já existia quando subscrevemos
      if (event === "INITIAL_SESSION" && session && isRecoveryHash()) {
        markValid();
        return;
      }
    });

    // Timeout de segurança: se em 8s não validou, considera inválido
    const timeout = setTimeout(markInvalid, 8_000);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  // ─── Atualização da senha ───────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirm) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(
        error.message.includes("Auth session missing")
          ? "Sessão expirada. Solicite um novo link de recuperação."
          : error.message
      );
      setBusy(false);
      return;
    }

    // Senha atualizada → encerra sessão e redireciona para login
    setSessionState(SESSION_STATES.SUCCESS);
    setBusy(false);

    await supabase.auth.signOut();

    // Pequeno delay para o usuário ver a mensagem de sucesso
    setTimeout(() => {
      if (mountedRef.current) router.replace("/");
    }, 2_500);
  }, [password, confirm, router]);

  // ─── Estilos compartilhados ─────────────────────────────────────────────────
  const inputStyle = {
    width: "100%",
    padding: "11px 14px 11px 40px",
    background: "var(--bg)",
    border: "1.5px solid var(--bdr)",
    borderRadius: 9,
    fontFamily: "var(--f)",
    fontSize: 14,
    color: "var(--tx)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .2s",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 420,
    background: "var(--bg2)",
    border: "1px solid var(--bdr)",
    borderRadius: 20,
    padding: "36px 32px",
    boxShadow: "0 8px 40px rgba(0,0,0,.12)",
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: 20,
    }}>
      <div style={cardStyle}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            margin: "0 auto 14px",
            background: "linear-gradient(135deg,#1272AA,#1E90CC)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Home size={28} style={{ color: "white" }} />
          </div>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 600, color: "var(--tx)" }}>
            Meu Enxoval
          </h1>
          <p style={{ fontSize: 13, color: "var(--tx3)", marginTop: 4 }}>
            {sessionState === SESSION_STATES.CHECKING ? "Validando link..." : "Criar nova senha"}
          </p>
        </div>

        {/* ── Verificando token ── */}
        {sessionState === SESSION_STATES.CHECKING && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Loader2
              size={32}
              style={{
                color: "var(--p)",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
                display: "block",
              }}
            />
            <p style={{ fontSize: 14, color: "var(--tx2)", lineHeight: 1.6 }}>
              Validando seu link de recuperação...
            </p>
            <p style={{ fontSize: 12, color: "var(--tx3)", marginTop: 8 }}>
              Isso leva apenas alguns segundos.
            </p>
          </div>
        )}

        {/* ── Link inválido / expirado ── */}
        {sessionState === SESSION_STATES.INVALID && (
          <div style={{
            background: "var(--ra)",
            border: "1px solid rgba(217,79,92,.25)",
            borderRadius: 12,
            padding: 20,
            textAlign: "center",
          }}>
            <AlertCircle size={32} style={{ color: "var(--r)", margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontWeight: 700, color: "var(--r)", marginBottom: 8, fontSize: 15 }}>
              Link inválido ou expirado
            </p>
            <p style={{ fontSize: 13, color: "var(--tx2)", lineHeight: 1.6, marginBottom: 16 }}>
              Este link de recuperação não é mais válido. Os links expiram em 1 hora por segurança.
            </p>
            <button
              onClick={() => router.replace("/")}
              style={{
                background: "var(--p)", color: "white", border: "none",
                borderRadius: 9, padding: "10px 22px", fontFamily: "var(--f)",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              Solicitar novo link
            </button>
          </div>
        )}

        {/* ── Senha atualizada com sucesso ── */}
        {sessionState === SESSION_STATES.SUCCESS && (
          <div style={{
            background: "var(--ga)",
            border: "1px solid rgba(42,157,143,.3)",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--g)", margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Check size={28} style={{ color: "white" }} />
            </div>
            <p style={{ fontWeight: 700, color: "var(--g)", fontSize: 16, marginBottom: 8 }}>
              Senha atualizada!
            </p>
            <p style={{ fontSize: 13, color: "var(--tx2)", lineHeight: 1.6 }}>
              Sua nova senha foi salva com sucesso. Redirecionando para o login...
            </p>
            <div style={{ marginTop: 14 }}>
              <Loader2 size={16} style={{ color: "var(--g)", animation: "spin 1s linear infinite" }} />
            </div>
          </div>
        )}

        {/* ── Formulário ── */}
        {sessionState === SESSION_STATES.VALID && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--pa)", borderRadius: 9,
              padding: "10px 14px", fontSize: 12.5, color: "var(--p)",
            }}>
              <ShieldCheck size={14} style={{ flexShrink: 0 }} />
              Sessão segura verificada. Defina sua nova senha abaixo.
            </div>

            {/* Nova senha */}
            <div>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700,
                color: "var(--tx3)", textTransform: "uppercase",
                letterSpacing: ".07em", marginBottom: 6,
              }}>
                Nova senha <span style={{ fontWeight: 400, textTransform: "none" }}>(mín. 6 caracteres)</span>
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{
                  position: "absolute", left: 13, top: "50%",
                  transform: "translateY(-50%)", color: "var(--tx3)",
                }} />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoFocus
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = "var(--p)"}
                  onBlur={e  => e.target.style.borderColor = "var(--bdr)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "var(--tx3)", padding: 4,
                  }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Indicador de força da senha */}
              {password.length > 0 && (
                <PasswordStrength password={password} />
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700,
                color: "var(--tx3)", textTransform: "uppercase",
                letterSpacing: ".07em", marginBottom: 6,
              }}>
                Confirmar senha
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{
                  position: "absolute", left: 13, top: "50%",
                  transform: "translateY(-50%)", color: "var(--tx3)",
                }} />
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    ...inputStyle,
                    borderColor: confirm && confirm !== password ? "var(--r)" : undefined,
                  }}
                  onFocus={e => e.target.style.borderColor = confirm !== password ? "var(--r)" : "var(--p)"}
                  onBlur={e  => e.target.style.borderColor = confirm && confirm !== password ? "var(--r)" : "var(--bdr)"}
                />
              </div>
              {confirm && confirm !== password && (
                <p style={{
                  fontSize: 12, color: "var(--r)", marginTop: 5,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <AlertCircle size={11} /> As senhas não coincidem
                </p>
              )}
            </div>

            {errorMsg && (
              <div style={{
                background: "var(--ra)", border: "1px solid rgba(217,79,92,.2)",
                borderRadius: 9, padding: "10px 14px",
                fontSize: 13, color: "var(--r)",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || password !== confirm || password.length < 6}
              style={{
                background: "var(--p)", color: "white", border: "none",
                borderRadius: 9, padding: "13px", fontFamily: "var(--f)",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: (busy || password !== confirm || password.length < 6) ? 0.5 : 1,
                transition: "opacity .2s, transform .15s",
              }}
              onMouseEnter={e => { if (!busy) e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.transform = "none"; }}
            >
              {busy
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</>
                : <><Check size={16} /> Salvar nova senha</>
              }
            </button>

          </form>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Componente auxiliar: indicador de força ────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ["Muito fraca", "Fraca", "Regular", "Boa", "Forte"];
  const colors = ["var(--r)", "var(--r)", "var(--go)", "var(--g)", "var(--g)"];
  const color  = colors[score - 1] || "var(--bdr)";

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 99,
              background: i <= score ? color : "var(--bg3)",
              transition: "background .25s",
            }}
          />
        ))}
      </div>
      {score > 0 && (
        <p style={{ fontSize: 11, color, fontWeight: 600 }}>
          {labels[score - 1]}
        </p>
      )}
    </div>
  );
}