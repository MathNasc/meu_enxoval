"use client";
import { useState, useEffect } from "react";
import { Home, Lock, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { supabase } from "../../src/lib/supabase";

// Página para redefinir senha após clicar no link do e-mail
// Supabase redireciona para /reset-password com tokens na URL
export default function ResetPasswordPage() {
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [busy,        setBusy]        = useState(false);
  const [status,      setStatus]      = useState("idle"); // idle | success | error
  const [errorMsg,    setErrorMsg]    = useState("");
  const [sessionOk,   setSessionOk]   = useState(false);

  // Supabase injeta a sessão via URL hash — esperamos ela carregar
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionOk(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handle = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg("As senhas não coincidem."); return; }
    if (password.length < 6)  { setErrorMsg("Mínimo 6 caracteres."); return; }

    setBusy(true);
    setErrorMsg("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
    }
    setBusy(false);
  };

  const inp = {
    width: "100%", padding: "10px 40px",
    background: "var(--bg)", border: "1.5px solid var(--bdr)",
    borderRadius: 9, fontFamily: "var(--f)", fontSize: 14,
    color: "var(--tx)", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--bg2)", border: "1px solid var(--bdr)",
        borderRadius: 20, padding: "36px 32px",
        boxShadow: "0 8px 40px rgba(0,0,0,.12)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 14px",
            background: "linear-gradient(135deg,#1272AA,#1E90CC)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Home size={28} style={{ color: "white" }}/>
          </div>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: 26, fontWeight: 600, color: "var(--tx)" }}>
            Meu Enxoval
          </h1>
          <p style={{ fontSize: 13, color: "var(--tx3)", marginTop: 4 }}>Criar nova senha</p>
        </div>

        {/* Sucesso */}
        {status === "success" && (
          <div style={{
            background: "var(--ga)", border: "1px solid rgba(42,157,143,.3)",
            borderRadius: 12, padding: 16, textAlign: "center",
          }}>
            <Check size={28} style={{ color: "var(--g)", margin: "0 auto 10px", display: "block" }}/>
            <p style={{ fontWeight: 700, color: "var(--g)", marginBottom: 6 }}>Senha atualizada!</p>
            <p style={{ fontSize: 13, color: "var(--tx2)", lineHeight: 1.55, marginBottom: 14 }}>
              Sua senha foi redefinida com sucesso.
            </p>
            <a href="/" style={{
              display: "inline-block", background: "var(--p)", color: "white",
              borderRadius: 9, padding: "9px 20px", fontFamily: "var(--f)",
              fontWeight: 600, fontSize: 13, textDecoration: "none",
            }}>
              Ir para o app
            </a>
          </div>
        )}

        {/* Aguardando sessão */}
        {status !== "success" && !sessionOk && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--tx3)", fontSize: 14 }}>
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 12, display: "block", margin: "0 auto 12px" }}/>
            Validando link de recuperação...
            <p style={{ fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
              Se demorar muito, o link pode ter expirado.
              <br/>
              <a href="/" style={{ color: "var(--p)", fontWeight: 600 }}>Solicitar novo link</a>
            </p>
          </div>
        )}

        {/* Formulário */}
        {status !== "success" && sessionOk && (
          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Nova senha */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700,
                color: "var(--tx3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 5 }}>
                Nova senha <span style={{ fontWeight: 400 }}>(mín. 6 caracteres)</span>
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--tx3)",
                }}/>
                <input type={showPwd ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = "var(--p)"}
                  onBlur={e  => e.target.style.borderColor = "var(--bdr)"}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--tx3)", padding: 4 }}>
                  {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Confirmar */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700,
                color: "var(--tx3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 5 }}>
                Confirmar senha
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--tx3)",
                }}/>
                <input type={showPwd ? "text" : "password"} value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  style={{
                    ...inp,
                    borderColor: confirm && confirm !== password ? "var(--r)" : undefined,
                  }}
                  onFocus={e => e.target.style.borderColor = confirm !== password ? "var(--r)" : "var(--p)"}
                  onBlur={e  => e.target.style.borderColor = confirm !== password ? "var(--r)" : "var(--bdr)"}
                />
              </div>
              {confirm && confirm !== password && (
                <p style={{ fontSize: 12, color: "var(--r)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertCircle size={11}/>As senhas não coincidem
                </p>
              )}
            </div>

            {errorMsg && (
              <p style={{ fontSize: 13, color: "var(--r)", background: "var(--ra)",
                padding: "8px 12px", borderRadius: 8, margin: 0 }}>
                {errorMsg}
              </p>
            )}

            <button type="submit" disabled={busy || password !== confirm || password.length < 6}
              style={{
                background: "var(--p)", color: "white", border: "none",
                borderRadius: 9, padding: "12px", fontFamily: "var(--f)",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                opacity: (busy || password !== confirm || password.length < 6) ? .5 : 1,
              }}>
              {busy
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }}/> Salvando...</>
                : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
