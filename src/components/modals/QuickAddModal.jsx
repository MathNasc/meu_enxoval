"use client";
// src/components/modals/QuickAddModal.jsx

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check,
  Plus, Sparkles, X, Zap,
} from "lucide-react";
import { fmt, todayStr } from "../../lib/utils/format";
import { getIcon, getRoomSuggestions } from "../../lib/constants/index";
import { AI } from "../../lib/services/api";
import Sk from "../ui/Sk";

function QuickAddModal({ rooms = [], items = [], onSave, onClose }) {
  const [url, setUrl]           = useState("");
  const [name, setName]         = useState("");
  const [roomId, setRoomId]     = useState(rooms[0]?.id || "");
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(1);
  const [detected, setDetected] = useState(null);
  const [error, setError]       = useState("");
  const urlRef                  = useRef(null);

  useEffect(() => {
    setTimeout(() => urlRef.current?.focus(), 80);
  }, []);

  const doDetect = useCallback(async (target) => {
    const u = (target || url).trim();
    if (!u || !u.startsWith("http")) return;

    setLoading(true);
    setError("");
    setStep(2);

    try {
      const info = await AI.detectProduct(u);
      setDetected(info || {});
      if (info?.name) setName(info.name);
      if (info?.suggestedRoom && info.suggestedRoom !== "outro") {
        const match = rooms.find((r) => r.id === info.suggestedRoom);
        if (match) setRoomId(match.id);
      }
    } catch (e) {
      setError(
        "Não consegui detectar automaticamente. Preencha manualmente. (" + e.message + ")"
      );
    } finally {
      setLoading(false);
    }
  }, [url, rooms]);

  const handlePaste = useCallback((e) => {
    const text = e.clipboardData?.getData("text") || "";
    if (text.startsWith("http")) {
      e.preventDefault();
      setUrl(text);
      setTimeout(() => doDetect(text), 80);
    } else if (text.length > 2) {
      setName(text);
      setStep(2);
    }
  }, [doDetect]);

  const handleSave = () => {
    if (!name.trim() || !roomId) return;
    const priceStr = detected?.price ? String(detected.price) : "";
    onSave({
      name:         name.trim(),
      link:         url.trim(),
      price:        priceStr,
      imageUrl:     detected?.imageUrl || "",
      status:       "want",
      priority:     "normal",
      roomId,
      notes:        detected?.brand ? "Marca: " + detected.brand : "",
      starred:      false,
      priceHistory: priceStr
        ? [{ price: parseFloat(priceStr), date: todayStr(), source: "auto" }]
        : [],
      priceOffers: [],
    });
  };

  const suggs          = getRoomSuggestions(roomId, rooms, items || []);
  const hasDetectedData = detected?.name && !detected?.warning;
  const hasWarning      = detected?.warning || error;

  const RoomPicker = () => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {rooms.map((r) => {
        const Icon = getIcon(r.icon);
        const on   = roomId === r.id;
        return (
          <button
            key={r.id}
            onClick={() => setRoomId(r.id)}
            style={{
              padding: "7px 12px", borderRadius: 9, cursor: "pointer",
              fontFamily: "var(--f)", fontSize: 12.5, fontWeight: 600,
              border: "1.5px solid " + (on ? r.color : "var(--bdr)"),
              background: on ? r.color + "18" : "transparent",
              color: on ? r.color : "var(--tx3)",
              transition: "all .18s",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <Icon size={12} />{r.name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mbk" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: "26px", maxWidth: 480 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 className="fd" style={{ fontSize: 21, fontWeight: 600 }}>
              Importar produto
            </h2>
            <span className="aitag" style={{ marginTop: 4, display: "inline-flex" }}>
              <Sparkles size={9} />Detecção inteligente
            </span>
          </div>
          <button className="btn btn-g bico" onClick={onClose}><X size={18} /></button>
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="lbl">Cole o link ou escreva o nome</label>
              <div style={{ position: "relative" }}>
                <input
                  ref={urlRef}
                  className="inp"
                  placeholder="https://... ou nome do produto"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => e.key === "Enter" && url.startsWith("http") && doDetect()}
                  style={{ paddingRight: url ? 110 : 14 }}
                />
                {url && (
                  <button
                    className="btn btn-p"
                    onClick={() => doDetect()}
                    style={{
                      position: "absolute", right: 6,
                      top: "50%", transform: "translateY(-50%)",
                      padding: "6px 11px", fontSize: 12,
                    }}
                  >
                    <Zap size={12} />Detectar
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11.5, color: "var(--tx3)", marginTop: 6, lineHeight: 1.5 }}>
                🔗 Cole qualquer link — funciona com encurtados (br.shp.ee, amzn.to, etc.)
              </p>
            </div>

            <div>
              <label className="lbl">Cômodo</label>
              <RoomPicker />
            </div>

            {suggs.length > 0 && (
              <div>
                <label className="lbl">Sugestões rápidas</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {suggs.map((s) => (
                    <button key={s} className="sch" onClick={() => { setName(s); setStep(2); }}>
                      <Plus size={9} />{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button className="btn btn-s" onClick={onClose}><X size={13} />Cancelar</button>
              <button
                className="btn btn-p"
                onClick={() => setStep(2)}
                disabled={!url.trim() && !name.trim()}
                style={(!url.trim() && !name.trim()) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                Continuar<ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {loading && (
              <>
                <Sk h={54} w="100%" />
                <Sk h={14} w="80%" />
                <Sk h={11} w="40%" />
                <p style={{ fontSize: 12, color: "var(--tx3)", textAlign: "center" }}>
                  Detectando produto...
                </p>
              </>
            )}

            {!loading && hasDetectedData && (
              <div style={{
                background: "var(--ga)", border: "1px solid rgba(42,157,143,.3)",
                borderRadius: 10, padding: "12px 14px", display: "flex", gap: 12,
              }}>
                {detected.imageUrl && (
                  <img
                    src={detected.imageUrl} alt=""
                    style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 10.5, fontWeight: 700, color: "var(--g)",
                    textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3,
                  }}>
                    {"✓ Produto detectado" + (detected.store ? " · " + detected.store : "")}
                  </p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>
                    {detected.name}
                  </p>
                  {detected.price && (
                    <p style={{ fontSize: 13, fontWeight: 800, color: "var(--g)", marginTop: 3 }}>
                      {fmt(detected.price)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!loading && hasWarning && (
              <div style={{
                background: "var(--goa)", border: "1px solid rgba(233,168,48,.3)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "var(--go)", display: "flex", gap: 7,
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {detected?.warning || error}
              </div>
            )}

            {!loading && (
              <>
                <div>
                  <label className="lbl">Nome *</label>
                  <input
                    className="inp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome do produto"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="lbl">Cômodo *</label>
                  <RoomPicker />
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 4 }}>
              <button className="btn btn-g" onClick={() => { setStep(1); setDetected(null); setError(""); }}>
                <ArrowLeft size={13} />Voltar
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-s" onClick={onClose}><X size={13} />Cancelar</button>
                <button
                  className="btn btn-p"
                  onClick={handleSave}
                  disabled={!name.trim() || !roomId || loading}
                  style={(!name.trim() || loading) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  <Check size={14} />Salvar item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickAddModal;
