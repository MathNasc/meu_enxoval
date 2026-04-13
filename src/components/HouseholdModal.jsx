// src/components/HouseholdModal.jsx
"use client";
import { useState } from "react";
import { X, Heart, Copy, Check, LogOut, Loader2, Link2 } from "lucide-react";

export default function HouseholdModal({ auth, onClose }) {
  const [tab,    setTab]    = useState("invite"); // invite | join
  const [code,   setCode]   = useState("");
  const [copied, setCopied] = useState(false);
  const [busy,   setBusy]   = useState(false);
  const [success,setSuccess]= useState("");

  const inviteCode = auth.getInviteCode();

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setBusy(true);
    const ok = await auth.joinHousehold(code);
    if (ok) setSuccess("Vinculado com sucesso! Agora vocês compartilham a mesma lista. 🎉");
    setBusy(false);
  };

  const handleLeave = async () => {
    setBusy(true);
    await auth.leaveHousehold();
    onClose();
    setBusy(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(12,28,40,.6)",
      backdropFilter: "blur(6px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "var(--bg)", border: "1px solid var(--bdr)",
        borderRadius: 20, width: "100%", maxWidth: 440,
        padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,.22)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Heart size={20} style={{ color: "var(--p)" }}/>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 600 }}>Modo casal</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--tx3)" }}>
            <X size={18}/>
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <p style={{ fontSize: 15, color: "var(--g)", fontWeight: 700, marginBottom: 8 }}>✓ {success}</p>
            <button onClick={onClose} style={{
              background: "var(--p)", color: "white", border: "none",
              borderRadius: 9, padding: "10px 22px", fontFamily: "var(--f)",
              fontWeight: 600, cursor: "pointer",
            }}>Fechar</button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
              {[
                { k: "invite", l: "Convidar parceiro(a)" },
                { k: "join",   l: "Entrar numa lista" },
              ].map(t => (
                <button key={t.k} onClick={() => setTab(t.k)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 9,
                  border: `1.5px solid ${tab === t.k ? "var(--p)" : "var(--bdr)"}`,
                  background: tab === t.k ? "var(--pa)" : "transparent",
                  color: tab === t.k ? "var(--p)" : "var(--tx3)",
                  fontFamily: "var(--f)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>{t.l}</button>
              ))}
            </div>

            {/* Invite tab */}
            {tab === "invite" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontSize: 13, color: "var(--tx2)", lineHeight: 1.6 }}>
                  Compartilhe este código com seu parceiro(a). Ele(a) deve ir em
                  <b> "Entrar numa lista"</b> e digitar o código abaixo.
                </p>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "var(--bg3)", borderRadius: 10, padding: "12px 16px",
                }}>
                  <span style={{
                    flex: 1, fontFamily: "monospace", fontSize: 28, fontWeight: 800,
                    color: "var(--p)", letterSpacing: "0.15em",
                  }}>
                    {inviteCode ?? "..."}
                  </span>
                  <button onClick={copyCode} style={{
                    background: copied ? "var(--ga)" : "var(--pa)",
                    border: "none", borderRadius: 8, padding: "8px 14px",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 5, color: copied ? "var(--g)" : "var(--p)",
                    fontFamily: "var(--f)", fontWeight: 700, fontSize: 12,
                  }}>
                    {copied ? <><Check size={13}/>Copiado</> : <><Copy size={13}/>Copiar</>}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "var(--tx3)" }}>
                  Após o vínculo, vocês verão a mesma lista em tempo real em qualquer dispositivo.
                </p>

                {/* Leave household */}
                {auth.profile?.households && (
                  <div style={{ paddingTop: 14, borderTop: "1px solid var(--bdr)", marginTop: 4 }}>
                    <p style={{ fontSize: 12, color: "var(--tx3)", marginBottom: 10 }}>
                      Está numa lista compartilhada e quer sair?
                    </p>
                    <button onClick={handleLeave} disabled={busy}
                      style={{
                        background: "var(--ra)", color: "var(--r)", border: "1px solid rgba(184,50,50,.25)",
                        borderRadius: 8, padding: "8px 14px", fontFamily: "var(--f)", fontWeight: 600,
                        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      }}>
                      <LogOut size={13}/>Sair e criar lista própria
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Join tab */}
            {tab === "join" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontSize: 13, color: "var(--tx2)", lineHeight: 1.6 }}>
                  Digite o código que seu parceiro(a) compartilhou para entrar na lista dele(a).
                  <b style={{ color: "var(--r)" }}> Atenção: seus itens atuais não serão transferidos.</b>
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: A1B2C3D4" maxLength={8}
                    style={{
                      flex: 1, padding: "11px 14px", background: "var(--bg)",
                      border: "1.5px solid var(--bdr)", borderRadius: 9,
                      fontFamily: "monospace", fontSize: 18, fontWeight: 700,
                      color: "var(--tx)", outline: "none", letterSpacing: "0.1em",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--p)"}
                    onBlur={e  => e.target.style.borderColor = "var(--bdr)"}
                  />
                  <button onClick={handleJoin} disabled={busy || !code.trim()}
                    style={{
                      background: "var(--p)", color: "white", border: "none",
                      borderRadius: 9, padding: "11px 18px", fontFamily: "var(--f)",
                      fontWeight: 700, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      opacity: (!code.trim() || busy) ? .5 : 1,
                    }}>
                    {busy
                      ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }}/>
                      : <Link2 size={14}/>}
                    Vincular
                  </button>
                </div>
                {auth.error && (
                  <p style={{ fontSize: 13, color: "var(--r)", background: "var(--ra)",
                    padding: "8px 12px", borderRadius: 8 }}>
                    {auth.error}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
