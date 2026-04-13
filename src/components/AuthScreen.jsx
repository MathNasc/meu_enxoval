// src/components/AuthScreen.jsx
"use client";
import { useState } from "react";
import { Home, Mail, Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function AuthScreen({ onSignIn, onSignUp, loading, error, setError }) {
  const [mode,     setMode]     = useState("login"); // login | register | confirm
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [busy,     setBusy]     = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setError("");

    if (mode === "login") {
      await onSignIn(email, password);
    } else {
      const ok = await onSignUp(email, password);
      if (ok) setMode("confirm");
    }
    setBusy(false);
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
          <p style={{ fontSize: 13, color: "var(--tx3)", marginTop: 4 }}>
            {mode === "login"    ? "Entre na sua conta" :
             mode === "register" ? "Crie sua conta gratuita" :
             "Confirme seu e-mail"}
          </p>
        </div>

        {/* Confirmation message */}
        {mode === "confirm" && (
          <div style={{
            background: "var(--ga)", border: "1px solid rgba(42,157,143,.3)",
            borderRadius: 12, padding: "16px", textAlign: "center",
          }}>
            <Check size={28} style={{ color: "var(--g)", margin: "0 auto 10px", display:"block" }}/>
            <p style={{ fontWeight: 700, color: "var(--g)", marginBottom: 6 }}>Conta criada!</p>
            <p style={{ fontSize: 13, color: "var(--tx2)", lineHeight: 1.55 }}>
              Enviamos um link de confirmação para <b>{email}</b>.
              Clique no link e depois faça login.
            </p>
            <button
              onClick={() => setMode("login")}
              style={{
                marginTop: 14, background: "var(--p)", color: "white",
                border: "none", borderRadius: 9, padding: "9px 20px",
                fontFamily: "var(--f)", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>
              Ir para o login
            </button>
          </div>
        )}

        {/* Form */}
        {mode !== "confirm" && (
          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700,
                color: "var(--tx3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 5 }}>
                E-mail
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--tx3)",
                }}/>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required autoFocus
                  style={{
                    width: "100%", padding: "10px 14px 10px 36px",
                    background: "var(--bg)", border: "1.5px solid var(--bdr)",
                    borderRadius: 9, fontFamily: "var(--f)", fontSize: 14,
                    color: "var(--tx)", outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--p)"}
                  onBlur={e  => e.target.style.borderColor = "var(--bdr)"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700,
                color: "var(--tx3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 5 }}>
                Senha {mode === "register" && <span style={{ fontWeight: 400 }}>(mín. 6 caracteres)</span>}
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--tx3)",
                }}/>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  style={{
                    width: "100%", padding: "10px 40px 10px 36px",
                    background: "var(--bg)", border: "1.5px solid var(--bdr)",
                    borderRadius: 9, fontFamily: "var(--f)", fontSize: 14,
                    color: "var(--tx)", outline: "none", boxSizing: "border-box",
                  }}
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

            {/* Error */}
            {error && (
              <p style={{ fontSize: 13, color: "var(--r)", background: "var(--ra)",
                padding: "8px 12px", borderRadius: 8, margin: 0 }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button type="submit" disabled={busy || loading}
              style={{
                background: "var(--p)", color: "white", border: "none",
                borderRadius: 9, padding: "12px", fontFamily: "var(--f)",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                opacity: busy ? .7 : 1,
              }}>
              {busy
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }}/> Aguarde...</>
                : mode === "login" ? "Entrar" : "Criar conta"}
            </button>

            {/* Toggle login/register */}
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--tx3)", margin: 0 }}>
              {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
              <button type="button"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                style={{ background: "none", border: "none", cursor: "pointer",
                  color: "var(--p)", fontWeight: 700, fontSize: 13, fontFamily: "var(--f)" }}>
                {mode === "login" ? "Criar conta" : "Fazer login"}
              </button>
            </p>
          </form>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
