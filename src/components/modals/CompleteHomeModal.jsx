"use client";
import { useState } from "react";
import { ArrowLeft, Check, Flame, Home, Loader2, Plus, Sparkles, X } from "lucide-react";
import { fmt } from "../../lib/utils/format";
import { getIcon } from "../../lib/constants/index";
import { AI } from "../../lib/services/api";

function CompleteHomeModal({ rooms=[], items=[], onAddItems, onClose }) {
  const [aptSize,     setAptSize]     = useState("2 quartos");
  const [loading,     setLoading]     = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected,    setSelected]    = useState(new Set());
  const [error,       setError]       = useState("");
  const [step,        setStep]        = useState(1);

  const handleGenerate = async () => {
    setLoading(true); setError("");
    try {
      const result = await AI.completeHome(rooms, items, aptSize);
      const arr    = Array.isArray(result) ? result : (result?.items || []);
      const valid  = arr.filter(i => rooms.some(r => r.id === i.roomId));
      setSuggestions(valid);
      setSelected(new Set(valid.map((_, i) => i)));
      setStep(2);
    } catch (e) {
      setError("Erro ao gerar sugestões. Tente novamente. (" + e.message + ")");
    } finally { setLoading(false); }
  };

  const toggle = (idx) => setSelected(s => {
    const n = new Set(s);
    n.has(idx) ? n.delete(idx) : n.add(idx);
    return n;
  });

  const handleAdd = () => {
    const toAdd = suggestions
      .filter((_, i) => selected.has(i))
      .map(s => ({
        name:         s.name,
        roomId:       s.roomId,
        price:        s.estimatedPrice?.toString() || "",
        priority:     s.priority || "normal",
        status:       "want",
        notes:        "",
        starred:      false,
        imageUrl:     "",
        link:         "",
        priceHistory: s.estimatedPrice
          ? [{ price: s.estimatedPrice, date: new Date().toISOString().slice(0,10), source: "estimate" }]
          : [],
        priceOffers: [],
      }));
    onAddItems(toAdd);
  };

  const sizes = ["Studio", "1 quarto", "2 quartos", "3 quartos", "4+ quartos"];

  return (
    <div className="mbk" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding:"26px" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h2 className="fd" style={{ fontSize:21, fontWeight:600 }}>Completar minha casa</h2>
            <span className="aitag" style={{ marginTop:4, display:"inline-flex" }}>
              <Sparkles size={9}/>Sugestões automáticas por cômodo
            </span>
          </div>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>

        {/* Step 1: escolher tamanho */}
        {step === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <label className="lbl">Tamanho do apartamento</label>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {sizes.map(o => (
                  <button key={o} onClick={() => setAptSize(o)} style={{
                    padding:"8px 14px", borderRadius:9, cursor:"pointer",
                    fontFamily:"var(--f)", fontSize:13, fontWeight:600,
                    border:`1.5px solid ${aptSize===o?"var(--p)":"var(--bdr)"}`,
                    background:aptSize===o?"var(--pa)":"transparent",
                    color:aptSize===o?"var(--p)":"var(--tx3)", transition:"all .18s",
                  }}>{o}</button>
                ))}
              </div>
            </div>
            <div style={{ background:"var(--pa)", border:"1px solid rgba(18,114,170,.2)", borderRadius:10, padding:"12px 14px", fontSize:13, color:"var(--tx2)" }}>
              <p style={{ fontWeight:700, marginBottom:4, color:"var(--p)" }}>Como funciona?</p>
              <p style={{ lineHeight:1.55 }}>
                Analisa os {items.length} itens já na sua lista e sugere o que está faltando
                para um enxoval completo de {aptSize}.
              </p>
            </div>
            {error && (
              <div style={{ color:"var(--r)", fontSize:13, background:"var(--ra)", padding:"10px 12px", borderRadius:9 }}>
                {error}
              </div>
            )}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
              <button className="btn btn-p" onClick={handleGenerate} disabled={loading}>
                {loading
                  ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/>Gerando...</>
                  : <><Sparkles size={14}/>Gerar sugestões</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: selecionar itens */}
        {step === 2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontSize:14, color:"var(--tx2)" }}>
                <b style={{ color:"var(--tx)" }}>{selected.size}</b> de {suggestions.length} selecionados
              </p>
              <button className="btn btn-g" onClick={() =>
                selected.size === suggestions.length
                  ? setSelected(new Set())
                  : setSelected(new Set(suggestions.map((_, i) => i)))
              } style={{ fontSize:12 }}>
                {selected.size === suggestions.length ? "Desmarcar todos" : "Marcar todos"}
              </button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:7, maxHeight:360, overflowY:"auto" }}>
              {suggestions.map((s, i) => {
                const room = rooms.find(r => r.id === s.roomId);
                const Icon = room ? getIcon(room.icon) : Home;
                const on   = selected.has(i);
                return (
                  <div key={i} onClick={() => toggle(i)} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    borderRadius:9, cursor:"pointer",
                    border:`1.5px solid ${on?"var(--p)":"var(--bdr)"}`,
                    background:on?"var(--pa)":"transparent", transition:"all .18s",
                  }}>
                    <div style={{
                      width:20, height:20, borderRadius:5, flexShrink:0, transition:"all .18s",
                      border:`2px solid ${on?"var(--p)":"var(--bdr2)"}`,
                      background:on?"var(--p)":"transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      {on && <Check size={12} style={{ color:"white" }}/>}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, fontSize:13.5 }}>{s.name}</p>
                      <p style={{ fontSize:11, color:"var(--tx3)", display:"flex", alignItems:"center", gap:4, marginTop:1, flexWrap:"wrap" }}>
                        <Icon size={9}/>{room?.name}
                        {s.priority === "high"   && <span className="bdg bh" style={{ fontSize:9 }}><Flame size={7}/>Essencial</span>}
                        {s.priority === "normal" && <span className="bdg bw" style={{ fontSize:9 }}>Normal</span>}
                        {s.priority === "low"    && <span style={{ fontSize:9, background:"var(--bg3)", color:"var(--tx3)", padding:"1px 6px", borderRadius:99, fontWeight:700 }}>Opcional</span>}
                      </p>
                    </div>
                    {s.estimatedPrice && (
                      <span style={{ fontSize:12.5, fontWeight:700, color:"var(--tx2)", whiteSpace:"nowrap" }}>
                        {fmt(s.estimatedPrice)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display:"flex", gap:8, justifyContent:"space-between", paddingTop:6, borderTop:"1px solid var(--bdr)" }}>
              <button className="btn btn-g" onClick={() => { setStep(1); setSuggestions([]); setError(""); }}>
                <ArrowLeft size={13}/>Refazer
              </button>
              <button className="btn btn-p" onClick={handleAdd}
                disabled={selected.size === 0}
                style={selected.size === 0 ? { opacity:.5, cursor:"not-allowed" } : {}}>
                <Plus size={14}/>Adicionar {selected.size} {selected.size === 1 ? "item" : "itens"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompleteHomeModal;
