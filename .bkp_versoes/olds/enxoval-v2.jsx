import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  Home, Plus, Trash2, ExternalLink, Check, Search, Moon, Sun, Package,
  ShoppingBag, DollarSign, Clock, X, Edit3, Filter, Layers, Tag,
  Loader2, Sofa, Bath, UtensilsCrossed, BedDouble, Star, Grid3X3, List,
  AlertCircle, Download, Share2, Zap, TrendingUp, Wallet, Users,
  ArrowUpRight, Sparkles, ChevronRight, Heart, Target, Bell, LayoutDashboard,
  BarChart2, Link2, CheckCircle2, Circle, Flame
} from "lucide-react";

/* ══════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #F5F1EB;
      --bg2: #EDE8DF;
      --bg3: #E4DDCF;
      --border: #D8D0C2;
      --border2: #C9BFB0;
      --primary: #C4623A;
      --primary-h: #AD5231;
      --primary-s: #D4845A;
      --primary-bg: rgba(196,98,58,0.1);
      --green: #4D9E6F;
      --green-bg: rgba(77,158,111,0.12);
      --gold: #C49A3C;
      --gold-bg: rgba(196,154,60,0.12);
      --red: #C44A4A;
      --red-bg: rgba(196,74,74,0.1);
      --blue: #4A7EC4;
      --text: #1E1A16;
      --text2: #5C5549;
      --text3: #8C8278;
      --shadow: 0 2px 8px rgba(30,26,22,0.08);
      --shadow-lg: 0 8px 32px rgba(30,26,22,0.12);
      --radius: 14px;
      --radius-sm: 9px;
      --font: 'Plus Jakarta Sans', sans-serif;
      --font-display: 'Fraunces', serif;
    }
    .dark {
      --bg: #181510;
      --bg2: #1F1B14;
      --bg3: #26211A;
      --border: #332D23;
      --border2: #3D3628;
      --primary: #D4845A;
      --primary-h: #E09A72;
      --primary-s: #C4623A;
      --primary-bg: rgba(212,132,90,0.12);
      --green: #5DB882;
      --green-bg: rgba(93,184,130,0.12);
      --gold: #D4AA4C;
      --gold-bg: rgba(212,170,76,0.12);
      --red: #D46060;
      --red-bg: rgba(212,96,96,0.12);
      --text: #F2EDE4;
      --text2: #B5AEA4;
      --text3: #6E665C;
    }

    body { font-family: var(--font); background: var(--bg); color: var(--text); transition: background 0.3s, color 0.3s; }
    .fd { font-family: var(--font-display); }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

    /* ── Animations ── */
    @keyframes slideUp    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideDown  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn     { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn    { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
    @keyframes spin       { to { transform:rotate(360deg); } }
    @keyframes buyPop     { 0%{transform:scale(1)} 35%{transform:scale(1.03)} 100%{transform:scale(1)} }
    @keyframes successFlash { 0%{background:var(--green-bg)} 100%{background:transparent} }
    @keyframes shimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes countUp    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
    @keyframes pulseRing  { 0%{box-shadow:0 0 0 0 rgba(196,98,58,0.3)} 70%{box-shadow:0 0 0 8px rgba(196,98,58,0)} 100%{box-shadow:0 0 0 0 rgba(196,98,58,0)} }

    .anim-slide-up  { animation: slideUp  0.35s ease both; }
    .anim-fade-in   { animation: fadeIn   0.25s ease both; }
    .anim-scale-in  { animation: scaleIn  0.28s ease both; }
    .anim-buy-pop   { animation: buyPop   0.45s ease, successFlash 0.6s ease; }
    .shimmer-loading {
      background: linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    /* ── Card ── */
    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    }
    .card:hover { border-color: var(--border2); }
    .card-hover:hover { border-color: var(--primary-s) !important; box-shadow: var(--shadow-lg); transform: translateY(-2px); }

    /* ── Item Card ── */
    .item-card {
      background: var(--bg2);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      transition: all 0.22s ease;
      position: relative;
      overflow: hidden;
    }
    .item-card::before {
      content: '';
      position: absolute; left:0; top:0; bottom:0; width:3px;
      background: var(--primary);
      opacity: 0;
      transition: opacity 0.2s;
    }
    .item-card:hover { border-color: var(--primary-s); box-shadow: var(--shadow-lg); transform: translateY(-1px); }
    .item-card:hover::before { opacity: 1; }
    .item-card.bought { opacity: 0.6; }
    .item-card.bought::before { background: var(--green); opacity: 1; }
    .item-card.priority-high::before { background: var(--red); opacity: 1; }

    /* ── Buttons ── */
    .btn { display:inline-flex; align-items:center; gap:6px; font-family:var(--font); font-size:13px; font-weight:600; border:none; cursor:pointer; transition:all 0.18s ease; border-radius:var(--radius-sm); }
    .btn-primary { background:var(--primary); color:#fff; padding:10px 18px; }
    .btn-primary:hover { background:var(--primary-h); transform:translateY(-1px); box-shadow:0 4px 14px rgba(196,98,58,0.35); }
    .btn-primary:active { transform:translateY(0); }
    .btn-secondary { background:var(--bg3); color:var(--text); padding:10px 18px; border:1px solid var(--border); }
    .btn-secondary:hover { border-color:var(--primary); color:var(--primary); }
    .btn-ghost { background:transparent; color:var(--text3); padding:6px 8px; border-radius:8px; border:none; }
    .btn-ghost:hover { background:var(--bg3); color:var(--text); }
    .btn-icon { width:36px; height:36px; border-radius:9px; display:inline-flex; align-items:center; justify-content:center; }
    .btn-danger:hover { color:var(--red) !important; background: var(--red-bg) !important; }

    /* ── Inputs ── */
    .input { font-family:var(--font); font-size:14px; color:var(--text); background:var(--bg); border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:10px 14px; width:100%; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
    .input:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-bg); }
    .input::placeholder { color:var(--text3); }
    .label { font-size:11.5px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:0.07em; display:block; margin-bottom:5px; }

    /* ── Badges ── */
    .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:99px; font-size:11px; font-weight:700; }
    .badge-want { background:var(--primary-bg); color:var(--primary); }
    .badge-bought { background:var(--green-bg); color:var(--green); }
    .badge-high { background:var(--red-bg); color:var(--red); }
    .badge-gold { background:var(--gold-bg); color:var(--gold); }

    /* ── Chips (filter) ── */
    .chip { padding:6px 14px; border-radius:99px; font-size:12.5px; font-weight:600; cursor:pointer; border:1.5px solid var(--border); background:transparent; color:var(--text3); transition:all 0.18s; white-space:nowrap; font-family:var(--font); }
    .chip:hover { border-color:var(--primary); color:var(--primary); }
    .chip.active { background:var(--primary); border-color:var(--primary); color:#fff; }

    /* ── Suggestion chip ── */
    .suggest-chip { padding:5px 12px; border-radius:99px; font-size:12px; font-weight:500; cursor:pointer; border:1px dashed var(--border2); background:transparent; color:var(--text2); transition:all 0.18s; font-family:var(--font); display:inline-flex; align-items:center; gap:5px; }
    .suggest-chip:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-bg); }

    /* ── Progress ── */
    .progress-track { height:7px; background:var(--bg3); border-radius:99px; overflow:hidden; }
    .progress-fill { height:100%; border-radius:99px; transition:width 0.7s cubic-bezier(0.4,0,0.2,1); }

    /* ── Modal ── */
    .modal-backdrop { position:fixed; inset:0; background:rgba(20,16,12,0.55); backdrop-filter:blur(5px); z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn 0.2s ease; }
    .modal { background:var(--bg); border:1px solid var(--border); border-radius:20px; width:100%; max-width:520px; max-height:92vh; overflow-y:auto; animation:scaleIn 0.25s ease; box-shadow:0 24px 80px rgba(0,0,0,0.2); }

    /* ── Nav ── */
    .nav-btn { display:flex; align-items:center; gap:10px; padding:9px 13px; border-radius:10px; cursor:pointer; font-size:13.5px; font-weight:600; color:var(--text3); border:none; background:transparent; width:100%; text-align:left; transition:all 0.18s; font-family:var(--font); }
    .nav-btn:hover { background:var(--bg3); color:var(--text); }
    .nav-btn.active { background:var(--primary); color:#fff; }
    .nav-btn .nav-count { margin-left:auto; background:rgba(255,255,255,0.22); border-radius:99px; padding:1px 7px; font-size:11px; }
    .nav-btn:not(.active) .nav-count { background:var(--bg3); color:var(--text3); }

    /* ── Stat card ── */
    .stat-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; animation:slideUp 0.35s ease both; }

    /* ── Sidebar mobile ── */
    .sidebar { position:fixed; top:0; left:0; bottom:0; z-index:100; transition:transform 0.3s ease; }
    @media(max-width:768px) { .sidebar { transform:translateX(-100%); } .sidebar.open { transform:translateX(0); } }
    @media(min-width:769px) { .sidebar { position:sticky; } }

    /* ── Topbar ── */
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; background:var(--bg2); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:50; }

    /* ── Tooltip custom ── */
    .recharts-tooltip-wrapper .recharts-default-tooltip { background:var(--bg2) !important; border:1px solid var(--border) !important; border-radius:10px !important; font-family:var(--font) !important; font-size:13px !important; color:var(--text) !important; box-shadow:var(--shadow-lg) !important; }

    /* ── Empty state ── */
    .empty-state { text-align:center; padding:64px 24px; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .empty-icon { width:72px; height:72px; border-radius:20px; background:var(--bg3); display:flex; align-items:center; justify-content:center; margin-bottom:4px; }

    /* ── Pulse CTA ── */
    .pulse-cta { animation: pulseRing 2s infinite; }

    /* ── AI badge ── */
    .ai-badge { display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:99px; background:linear-gradient(135deg,#7c4aff22,#c4623a22); color:var(--primary); border:1px solid var(--primary-bg); }
  `}</style>
);

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const DEFAULT_ROOMS = [
  { id:"quarto",   name:"Quarto",   icon:"bed",      color:"#C4623A" },
  { id:"sala",     name:"Sala",     icon:"sofa",     color:"#4D9E6F" },
  { id:"cozinha",  name:"Cozinha",  icon:"utensils", color:"#C49A3C" },
  { id:"banheiro", name:"Banheiro", icon:"bath",     color:"#4A7EC4" },
];

const ROOM_SUGGESTIONS = {
  quarto:   ["Cama box","Colchão","Cabeceira","Guarda-roupa","Cômoda","Criado-mudo","Espelho","Cortina","Abajur","Travesseiro","Edredom"],
  sala:     ["Sofá","Mesa de centro","Rack TV","Televisão","Tapete","Luminária","Quadro decorativo","Poltrona","Prateleira","Cortina"],
  cozinha:  ["Geladeira","Fogão","Micro-ondas","Panelas","Talheres","Pratos","Copos","Liquidificador","Processador","Lixeira","Escorredor"],
  banheiro: ["Toalha de banho","Toalha de rosto","Tapete","Espelho","Porta-shampoo","Saboneteira","Suporte papel","Lixeira","Box"],
};

const ICONS_MAP = { bed:BedDouble, sofa:Sofa, utensils:UtensilsCrossed, bath:Bath, home:Home, star:Star, zap:Zap, heart:Heart, target:Target, package:Package };
const COLORS = ["#C4623A","#4D9E6F","#C49A3C","#4A7EC4","#A47EC4","#C4A84A","#4AC4B8","#C44A7E"];

const getIcon = (k) => ICONS_MAP[k] || Home;
const fmt = (v) => { const n=parseFloat(v); return isNaN(n)?"—":n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); };
const daysLeft = (d) => { if(!d) return null; const t=new Date(d+"T00:00:00"),now=new Date(); now.setHours(0,0,0,0); return Math.round((t-now)/86400000); };
const uid = () => Math.random().toString(36).slice(2)+Date.now().toString(36);

/* ══════════════════════════════════════════
   STORAGE
══════════════════════════════════════════ */
const load = async (key, fb, shared=false) => {
  try { const r=await window.storage.get(key,shared); return r?JSON.parse(r.value):fb; } catch { return fb; }
};
const save = async (key, val, shared=false) => {
  try { await window.storage.set(key,JSON.stringify(val),shared); } catch {}
};

/* ══════════════════════════════════════════
   CLAUDE API — AUTO FILL FROM LINK
══════════════════════════════════════════ */
async function extractProductFromURL(url) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      tools:[{ type:"web_search_20250305", name:"web_search" }],
      messages:[{
        role:"user",
        content:`Acesse a URL do produto e extraia as informações: "${url}"

Retorne APENAS um JSON válido com esses campos (sem markdown, sem explicação):
{"name":"nome do produto","price":"preço em reais como número (ex: 299.90)","imageUrl":"URL da imagem principal do produto","brand":"marca se disponível"}

Se não encontrar algum campo, use null. Retorne SOMENTE o JSON.`
      }]
    })
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
  const match = text.match(/\{[\s\S]*\}/);
  if(!match) throw new Error("Resposta inválida");
  return JSON.parse(match[0]);
}

/* ══════════════════════════════════════════
   MODAL: QUICK ADD + AUTO FILL
══════════════════════════════════════════ */
function QuickAddModal({ rooms, onSave, onClose }) {
  const [url,  setUrl]     = useState("");
  const [name, setName]    = useState("");
  const [roomId, setRoomId]= useState(rooms[0]?.id||"");
  const [loading, setLoading] = useState(false);
  const [error, setError]  = useState("");
  const [extracted, setExtracted] = useState(null);
  const [step, setStep]    = useState(1); // 1=url, 2=confirm

  const handleExtract = async () => {
    if(!url.trim()) return;
    setLoading(true); setError("");
    try {
      const info = await extractProductFromURL(url.trim());
      setExtracted(info);
      if(info.name) setName(info.name);
      setStep(2);
    } catch(e) {
      setError("Não consegui extrair as informações. Preencha manualmente.");
      setStep(2);
    } finally { setLoading(false); }
  };

  const handleSave = () => {
    if(!name.trim()||!roomId) return;
    onSave({
      id:uid(), name:name.trim(), link:url.trim(),
      price:extracted?.price||"", imageUrl:extracted?.imageUrl||"",
      status:"want", priority:"normal", roomId, notes:"",
      createdAt:new Date().toISOString()
    });
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"28px"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
          <div>
            <h2 className="fd" style={{fontSize:"22px",fontWeight:700}}>Adicionar rápido</h2>
            <span className="ai-badge" style={{marginTop:4}}><Sparkles size={10}/>Preenchimento automático por IA</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>

        {step === 1 && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label className="label">Cole o link do produto</label>
              <div style={{display:"flex",gap:8}}>
                <input className="input" placeholder="https://www.amazon.com.br/..." value={url} onChange={e=>setUrl(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleExtract()} style={{flex:1}}/>
                <button className="btn btn-primary" onClick={handleExtract} disabled={!url.trim()||loading}
                  style={!url.trim()?{opacity:0.5,cursor:"not-allowed"}:{}}>
                  {loading ? <Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/> : <Sparkles size={16}/>}
                  {loading?"Buscando...":"Preencher"}
                </button>
              </div>
              <p style={{fontSize:12,color:"var(--text3)",marginTop:6}}>
                Funciona com Amazon, Mercado Livre, Shopee, Magazine Luiza e mais
              </p>
            </div>
            <div style={{textAlign:"center"}}>
              <button className="btn btn-ghost" onClick={()=>setStep(2)} style={{fontSize:13,color:"var(--text3)"}}>
                Preencher manualmente →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Preview extracted */}
            {extracted && (
              <div style={{background:"var(--green-bg)",border:"1px solid var(--green)",borderRadius:10,padding:"12px 14px",display:"flex",gap:12,alignItems:"center"}}>
                {extracted.imageUrl && (
                  <img src={extracted.imageUrl} alt="" style={{width:52,height:52,objectFit:"cover",borderRadius:8,flexShrink:0}} onError={e=>e.target.style.display="none"}/>
                )}
                <div>
                  <p style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>✓ Informações extraídas pela IA</p>
                  <p style={{fontSize:13,color:"var(--text)"}}>{extracted.name}</p>
                  {extracted.price && <p style={{fontSize:13,fontWeight:700,color:"var(--green)"}}>{fmt(extracted.price)}</p>}
                </div>
              </div>
            )}
            {error && (
              <div style={{background:"var(--primary-bg)",border:"1px solid var(--primary)",borderRadius:10,padding:"10px 14px",display:"flex",gap:8,alignItems:"center",fontSize:13,color:"var(--primary)"}}>
                <AlertCircle size={15}/>{error}
              </div>
            )}

            <div>
              <label className="label">Nome do produto *</label>
              <input className="input" placeholder="Ex: Sofá 3 lugares..." value={name} onChange={e=>setName(e.target.value)}/>
            </div>
            <div>
              <label className="label">Cômodo *</label>
              <select className="input" value={roomId} onChange={e=>setRoomId(e.target.value)} style={{cursor:"pointer"}}>
                {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div style={{display:"flex",gap:8,marginTop:4,justifyContent:"space-between"}}>
              <button className="btn btn-ghost" onClick={()=>{setStep(1);setExtracted(null);setError("");}}>← Voltar</button>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim()||!roomId}
                  style={!name.trim()?{opacity:0.5,cursor:"not-allowed"}:{}}>
                  <Check size={15}/>Salvar item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL: FULL ITEM FORM
══════════════════════════════════════════ */
function ItemModal({ item, rooms, onSave, onClose }) {
  const isEdit = !!item?.id;
  const [f, setF] = useState({
    name:item?.name||"", link:item?.link||"", price:item?.price||"",
    imageUrl:item?.imageUrl||"", notes:item?.notes||"",
    status:item?.status||"want", roomId:item?.roomId||(rooms[0]?.id||""),
    priority:item?.priority||"normal",
  });
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const valid = f.name.trim()&&f.roomId;

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
          <h2 className="fd" style={{fontSize:"22px",fontWeight:700}}>{isEdit?"Editar item":"Novo item"}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label className="label">Nome *</label>
            <input className="input" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nome do produto"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label className="label">Cômodo *</label>
              <select className="input" value={f.roomId} onChange={e=>set("roomId",e.target.value)} style={{cursor:"pointer"}}>
                {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={f.status} onChange={e=>set("status",e.target.value)} style={{cursor:"pointer"}}>
                <option value="want">Quero comprar</option>
                <option value="bought">Comprado ✓</option>
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label className="label">Preço (R$)</label>
              <input className="input" type="number" min="0" step="0.01" value={f.price} onChange={e=>set("price",e.target.value)} placeholder="0,00"/>
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select className="input" value={f.priority} onChange={e=>set("priority",e.target.value)} style={{cursor:"pointer"}}>
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta ⚡</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Link do produto</label>
            <input className="input" value={f.link} onChange={e=>set("link",e.target.value)} placeholder="https://..."/>
          </div>
          <div>
            <label className="label">URL da imagem (opcional)</label>
            <input className="input" value={f.imageUrl} onChange={e=>set("imageUrl",e.target.value)} placeholder="https://..."/>
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea className="input" rows={3} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Cor, tamanho, modelo..." style={{resize:"vertical"}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>{if(valid)onSave({...item,...f,name:f.name.trim()});}}
            disabled={!valid} style={!valid?{opacity:0.5,cursor:"not-allowed"}:{}}>
            <Check size={15}/>{isEdit?"Salvar":"Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL: BUDGET
══════════════════════════════════════════ */
function BudgetModal({ budget, onSave, onClose }) {
  const [val, setVal] = useState(budget?.total||"");
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"28px",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 className="fd" style={{fontSize:"20px",fontWeight:700}}>Orçamento total</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div>
          <label className="label">Quanto você pretende gastar no total?</label>
          <input className="input" type="number" min="0" value={val} onChange={e=>setVal(e.target.value)} placeholder="Ex: 15000"/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>onSave({total:parseFloat(val)||0})}>
            <Target size={15}/>Definir orçamento
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL: COUPLE MODE
══════════════════════════════════════════ */
function ShareModal({ coupleMode, onToggle, onClose }) {
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"28px",maxWidth:400}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 className="fd" style={{fontSize:"20px",fontWeight:700}}>Modo casal</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{textAlign:"center",padding:"12px 0"}}>
          <div style={{width:72,height:72,borderRadius:20,background:"var(--primary-bg)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <Heart size={32} style={{color:"var(--primary)"}}/>
          </div>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Compartilhe com seu parceiro(a)</h3>
          <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:20}}>
            No modo casal, os dados são compartilhados em tempo real. Ambos podem adicionar, editar e marcar itens como comprados!
          </p>
          <button className="btn btn-primary pulse-cta" onClick={onToggle} style={{width:"100%",justifyContent:"center",padding:"13px"}}>
            {coupleMode ? <><X size={15}/>Desativar modo casal</> : <><Heart size={15}/>Ativar modo casal</>}
          </button>
          {coupleMode && (
            <div style={{marginTop:14,background:"var(--green-bg)",border:"1px solid var(--green)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--green)"}}>
              ✓ Modo casal ativo! Abra este app no outro dispositivo para sincronizar.
            </div>
          )}
          {!coupleMode && (
            <p style={{marginTop:12,fontSize:12,color:"var(--text3)"}}>
              Basta abrir este link no outro dispositivo após ativar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL: ADD ROOM
══════════════════════════════════════════ */
function RoomModal({ onSave, onClose }) {
  const [name,setName]=useState(""); const [icon,setIcon]=useState("home"); const [color,setColor]=useState(COLORS[0]);
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"28px",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 className="fd" style={{fontSize:"20px",fontWeight:700}}>Novo cômodo</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div><label className="label">Nome</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Varanda, Escritório..."/>
          </div>
          <div><label className="label">Ícone</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {Object.entries(ICONS_MAP).map(([k,Icon])=>(
                <button key={k} onClick={()=>setIcon(k)} style={{width:38,height:38,borderRadius:9,border:`2px solid ${icon===k?color:"var(--border)"}`,
                  background:icon===k?`${color}20`:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                  color:icon===k?color:"var(--text3)",transition:"all 0.2s"}}>
                  <Icon size={17}/>
                </button>
              ))}
            </div>
          </div>
          <div><label className="label">Cor</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>setColor(c)} style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",
                  border:`3px solid ${color===c?"var(--text)":"transparent"}`,outline:"none",transition:"all 0.2s"}}/>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>{if(name.trim())onSave({name:name.trim(),icon,color});}} disabled={!name.trim()}
            style={!name.trim()?{opacity:0.5,cursor:"not-allowed"}:{}}>
            <Plus size={15}/>Criar cômodo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   COMPONENT: ITEM CARD
══════════════════════════════════════════ */
function ItemCard({ item, rooms, onToggle, onEdit, onDelete, isNew }) {
  const room = rooms.find(r=>r.id===item.roomId);
  const RoomIcon = room ? getIcon(room.icon) : Home;
  const [buying, setBuying] = useState(false);

  const handleToggle = () => {
    setBuying(true);
    onToggle(item);
    setTimeout(()=>setBuying(false),600);
  };

  return (
    <div className={`item-card ${item.status==="bought"?"bought":""} ${item.priority==="high"?"priority-high":""} ${isNew?"anim-slide-up":""} ${buying?"anim-buy-pop":""}`}
      style={{padding:"15px 16px"}}>
      <div style={{display:"flex",gap:13}}>
        {/* Image */}
        <div style={{width:68,height:68,borderRadius:10,flexShrink:0,overflow:"hidden",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
            : null}
          <Package size={22} style={{color:"var(--text3)",display:item.imageUrl?"none":"flex"}}/>
        </div>

        {/* Content */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:5}}>
            <span style={{fontWeight:700,fontSize:14.5,color:"var(--text)",textDecoration:item.status==="bought"?"line-through":"none",lineHeight:1.35,flex:1}}>
              {item.name}
            </span>
            {item.priority==="high" && <span className="badge badge-high" style={{flexShrink:0}}><Flame size={9}/>Alta</span>}
          </div>

          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
            {room && (
              <span style={{display:"flex",alignItems:"center",gap:3,fontSize:11,color:"var(--text3)",background:"var(--bg3)",padding:"2px 8px",borderRadius:99}}>
                <RoomIcon size={9}/>{room.name}
              </span>
            )}
            <span className={`badge ${item.status==="bought"?"badge-bought":"badge-want"}`}>
              {item.status==="bought"?"✓ Comprado":"Quero comprar"}
            </span>
            {item.price && <span style={{fontSize:12.5,fontWeight:800,color:"var(--primary)"}}>{fmt(item.price)}</span>}
          </div>

          {item.notes && <p style={{fontSize:12,color:"var(--text3)",lineHeight:1.4,marginBottom:8}}>{item.notes}</p>}

          {/* Actions */}
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <button onClick={handleToggle} className="btn btn-ghost"
              style={{fontSize:12,fontWeight:700,padding:"5px 10px",borderRadius:8,
                background:item.status==="bought"?"var(--green-bg)":"var(--primary-bg)",
                color:item.status==="bought"?"var(--green)":"var(--primary)",gap:4}}>
              {item.status==="bought"?<Circle size={12}/>:<CheckCircle2 size={12}/>}
              {item.status==="bought"?"Desmarcar":"Comprado!"}
            </button>
            {item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon" style={{textDecoration:"none"}} title="Abrir link"><ExternalLink size={14}/></a>}
            <button className="btn btn-ghost btn-icon" onClick={()=>onEdit(item)} title="Editar"><Edit3 size={14}/></button>
            <button className="btn btn-ghost btn-icon btn-danger" onClick={()=>onDelete(item.id)} title="Excluir" style={{marginLeft:"auto"}}><Trash2 size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   COMPONENT: SPENDING CHART
══════════════════════════════════════════ */
function SpendingChart({ items, rooms }) {
  const data = rooms.map(r=>({
    name:r.name.length>7?r.name.slice(0,7)+"…":r.name,
    fullName:r.name,
    total:items.filter(i=>i.roomId===r.id&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0),
    gasto:items.filter(i=>i.roomId===r.id&&i.status==="bought"&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0),
    color:r.color,
  })).filter(d=>d.total>0);

  if(!data.length) return null;

  const CustomTooltip = ({active,payload,label})=> {
    if(!active||!payload?.length) return null;
    const d = data.find(x=>x.name===label)||{};
    return (
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",fontSize:13}}>
        <p style={{fontWeight:700,marginBottom:4,color:"var(--text)"}}>{d.fullName}</p>
        <p style={{color:"var(--text2)"}}>Total: <b style={{color:"var(--primary)"}}>{fmt(d.total)}</b></p>
        <p style={{color:"var(--text2)"}}>Gasto: <b style={{color:"var(--green)"}}>{fmt(d.gasto)}</b></p>
      </div>
    );
  };

  return (
    <div>
      <h3 style={{fontWeight:700,fontSize:15,marginBottom:14,display:"flex",alignItems:"center",gap:7}}>
        <BarChart2 size={16} style={{color:"var(--primary)"}}/>Gastos por cômodo
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={28} barCategoryGap="30%">
          <XAxis dataKey="name" tick={{fontSize:12,fill:"var(--text3)",fontFamily:"var(--font)"}} axisLine={false} tickLine={false}/>
          <YAxis hide/>
          <Tooltip content={<CustomTooltip/>} cursor={{fill:"var(--bg3)"}}/>
          <Bar dataKey="total" radius={[7,7,0,0]}>
            {data.map((d,i)=><Cell key={i} fill={d.color+"55"}/>)}
          </Bar>
          <Bar dataKey="gasto" radius={[7,7,0,0]}>
            {data.map((d,i)=><Cell key={i} fill={d.color}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{fontSize:11,color:"var(--text3)",textAlign:"center",marginTop:4}}>
        <span style={{background:"var(--primary-bg)",color:"var(--primary)",padding:"1px 8px",borderRadius:99,marginRight:8}}>■ Estimado</span>
        <span style={{background:"var(--green-bg)",color:"var(--green)",padding:"1px 8px",borderRadius:99}}>■ Gasto</span>
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════
   VIEW: DASHBOARD
══════════════════════════════════════════ */
function Dashboard({ items, rooms, deliveryDate, onSetDate, budget, onOpenBudget, onAddItem, onQuickAdd }) {
  const total    = items.length;
  const bought   = items.filter(i=>i.status==="bought").length;
  const want     = total-bought;
  const pct      = total>0?Math.round((bought/total)*100):0;
  const totalVal = items.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const spentVal = items.filter(i=>i.status==="bought"&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const days     = daysLeft(deliveryDate);
  const budgetPct= budget?.total>0?Math.round((spentVal/budget.total)*100):0;
  const overBudget = budget?.total>0 && spentVal>budget.total;

  const priorityItems = items.filter(i=>i.priority==="high"&&i.status!=="bought").slice(0,3);
  const expensiveItems= items.filter(i=>i.price&&i.status!=="bought").sort((a,b)=>parseFloat(b.price)-parseFloat(a.price)).slice(0,3);

  const roomStats = rooms.map(r=>({
    ...r,
    count:items.filter(i=>i.roomId===r.id).length,
    bought:items.filter(i=>i.roomId===r.id&&i.status==="bought").length,
  })).filter(r=>r.count>0).sort((a,b)=>b.count-a.count);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* Title */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:30,fontWeight:700,lineHeight:1.15}}>Meu Enxoval 🏠</h1>
          <p style={{color:"var(--text2)",fontSize:14,marginTop:3}}>Tudo para o seu novo lar</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-secondary" onClick={onQuickAdd}><Zap size={15}/>Rápido</button>
          <button className="btn btn-primary pulse-cta" onClick={onAddItem}><Plus size={15}/>Adicionar</button>
        </div>
      </div>

      {/* Hero countdown */}
      <div style={{background:"linear-gradient(135deg, var(--primary) 0%, var(--primary-h) 100%)",borderRadius:18,padding:"24px 26px",color:"white"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",opacity:0.75,marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
              <Clock size={11}/>Contagem regressiva
            </p>
            {days!==null ? (
              <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                <span className="fd" style={{fontSize:52,fontWeight:700,lineHeight:1}}>{Math.max(0,days)}</span>
                <span style={{fontSize:18,opacity:0.85}}>
                  {days<0?"dias (chegou!)":days===1?"dia restante":"dias restantes"}
                </span>
              </div>
            ) : (
              <p style={{fontSize:15,opacity:0.75,marginTop:4}}>Defina a data de entrega</p>
            )}
          </div>
          <div>
            <label style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",opacity:0.7,display:"block",marginBottom:6}}>Data de entrega</label>
            <input type="date" value={deliveryDate||""} onChange={e=>onSetDate(e.target.value)}
              style={{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.35)",borderRadius:9,
                padding:"9px 13px",color:"white",fontFamily:"var(--font)",fontSize:14,cursor:"pointer",outline:"none",
                colorScheme:"dark"}}/>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{marginTop:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{opacity:0.75,fontSize:12}}>Progresso de compras</span>
            <span style={{fontWeight:800,fontSize:14}}>{pct}%</span>
          </div>
          <div style={{height:7,background:"rgba(255,255,255,0.2)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:"rgba(255,255,255,0.92)",borderRadius:99,transition:"width 0.7s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,opacity:0.75,fontSize:12}}>
            <span>{bought} comprados de {total}</span>
            <span>{want} restantes</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
        {[
          {label:"Total",val:total,icon:Package,color:"var(--primary)",delay:0},
          {label:"Comprados",val:bought,icon:CheckCircle2,color:"var(--green)",delay:0.06},
          {label:"Pendentes",val:want,icon:ShoppingBag,color:"var(--gold)",delay:0.12},
          {label:"Estimado",val:fmt(totalVal),icon:DollarSign,color:"var(--primary)",small:true,delay:0.18},
        ].map((s,i)=>{
          const Icon=s.icon;
          return (
            <div key={i} className="stat-card" style={{animationDelay:`${s.delay}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <p style={{fontSize:10.5,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7}}>{s.label}</p>
                  <p className="fd" style={{fontSize:s.small?18:30,fontWeight:700,color:s.color,lineHeight:1}}>{s.val}</p>
                </div>
                <div style={{width:34,height:34,borderRadius:9,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Icon size={16} style={{color:s.color}}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget widget */}
      <div className="card" style={{padding:"20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:7}}>
            <Wallet size={15} style={{color:"var(--primary)"}}/>Controle financeiro
          </h3>
          <button className="btn btn-ghost" onClick={onOpenBudget} style={{fontSize:12,color:"var(--text3)"}}>
            <Edit3 size={13}/>{budget?.total?"Editar":"Definir orçamento"}
          </button>
        </div>

        {overBudget && (
          <div style={{background:"var(--red-bg)",border:"1px solid var(--red)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--red)",display:"flex",gap:8,marginBottom:14}}>
            <AlertCircle size={15} style={{flexShrink:0}}/>Atenção! Você ultrapassou o orçamento em {fmt(spentVal-(budget?.total||0))}.
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
          {[
            {label:"Orçamento",val:budget?.total?fmt(budget.total):"—",color:"var(--text)"},
            {label:"Já gasto",val:fmt(spentVal),color:"var(--green)"},
            {label:"Restante",val:budget?.total?fmt(Math.max(0,budget.total-spentVal)):"—",color:overBudget?"var(--red)":"var(--primary)"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <p style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{s.label}</p>
              <p style={{fontSize:15,fontWeight:800,color:s.color}}>{s.val}</p>
            </div>
          ))}
        </div>

        {budget?.total>0 && (
          <>
            <div className="progress-track">
              <div className="progress-fill" style={{width:`${Math.min(100,budgetPct)}%`,background:overBudget?"var(--red)":budgetPct>80?"var(--gold)":"var(--green)"}}/>
            </div>
            <p style={{fontSize:12,color:overBudget?"var(--red)":budgetPct>80?"var(--gold)":"var(--text3)",marginTop:6,textAlign:"right",fontWeight:600}}>
              {budgetPct}% do orçamento utilizado
            </p>
          </>
        )}

        {/* Value breakdown */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)",fontSize:13,color:"var(--text2)"}}>
          <span>Valor estimado total: <b style={{color:"var(--primary)"}}>{fmt(totalVal)}</b></span>
          <span>Já gasto: <b style={{color:"var(--green)"}}>{fmt(spentVal)}</b></span>
        </div>
      </div>

      {/* Chart */}
      {items.some(i=>i.price) && (
        <div className="card" style={{padding:"20px"}}>
          <SpendingChart items={items} rooms={rooms}/>
        </div>
      )}

      {/* Priority items */}
      {priorityItems.length>0 && (
        <div>
          <h3 style={{fontWeight:700,fontSize:15,marginBottom:12,display:"flex",alignItems:"center",gap:7,color:"var(--red)"}}>
            <Flame size={15}/>Itens de alta prioridade
          </h3>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {priorityItems.map(item=>{
              const room=rooms.find(r=>r.id===item.roomId);
              const Icon=room?getIcon(room.icon):Home;
              return (
                <div key={item.id} className="card" style={{padding:"12px 16px",borderLeft:"3px solid var(--red)",borderRadius:"0 10px 10px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <p style={{fontWeight:600,fontSize:14}}>{item.name}</p>
                    <p style={{fontSize:12,color:"var(--text3)",display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                      <Icon size={10}/>{room?.name}
                      {item.price&&<span style={{color:"var(--primary)",fontWeight:700,marginLeft:4}}>{fmt(item.price)}</span>}
                    </p>
                  </div>
                  {item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon" style={{textDecoration:"none"}}><ExternalLink size={14}/></a>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most expensive */}
      {expensiveItems.length>0 && (
        <div>
          <h3 style={{fontWeight:700,fontSize:15,marginBottom:12,display:"flex",alignItems:"center",gap:7}}>
            <TrendingUp size={15} style={{color:"var(--gold)"}}/>Itens mais caros pendentes
          </h3>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {expensiveItems.map((item,idx)=>{
              const room=rooms.find(r=>r.id===item.roomId);
              return (
                <div key={item.id} className="card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                  <span className="fd" style={{fontSize:22,fontWeight:700,color:"var(--text3)",width:24,textAlign:"center"}}>{idx+1}</span>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:600,fontSize:14}}>{item.name}</p>
                    <p style={{fontSize:12,color:"var(--text3)"}}>{room?.name}</p>
                  </div>
                  <span style={{fontSize:15,fontWeight:800,color:"var(--primary)"}}>{fmt(item.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Room progress */}
      {roomStats.length>0 && (
        <div>
          <h3 className="fd" style={{fontSize:20,fontWeight:600,marginBottom:14}}>Por cômodo</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {roomStats.map(r=>{
              const Icon=getIcon(r.icon);
              const p=r.count>0?Math.round((r.bought/r.count)*100):0;
              return (
                <div key={r.id} className="card" style={{padding:"15px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{width:38,height:38,borderRadius:11,background:`${r.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon size={18} style={{color:r.color}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontWeight:700,fontSize:14}}>{r.name}</span>
                        <span style={{fontSize:12,color:"var(--text3)"}}>{r.bought}/{r.count} · <b style={{color:r.color}}>{p}%</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{width:`${p}%`,background:r.color}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty */}
      {total===0 && (
        <div className="empty-state">
          <div className="empty-icon"><Package size={32} style={{color:"var(--text3)"}}/></div>
          <p className="fd" style={{fontSize:20,fontWeight:600}}>Nenhum item ainda</p>
          <p style={{fontSize:13,color:"var(--text3)",maxWidth:280}}>Comece adicionando os primeiros itens para o seu enxoval!</p>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button className="btn btn-secondary" onClick={onQuickAdd}><Zap size={14}/>Adicionar rápido</button>
            <button className="btn btn-primary pulse-cta" onClick={onAddItem}><Plus size={14}/>Adicionar item</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   VIEW: ITEMS
══════════════════════════════════════════ */
function ItemsView({ items, rooms, onAdd, onQuickAdd, onToggle, onEdit, onDelete }) {
  const [search,setSearch]=useState("");
  const [fRoom,setFRoom]=useState("all");
  const [fStatus,setFStatus]=useState("all");
  const [fPrio,setFPrio]=useState("all");
  const [sort,setSort]=useState("name");
  const [view,setView]=useState("grid");
  const [newIds,setNewIds]=useState(new Set());

  const filtered = useMemo(()=>{
    let arr=[...items];
    if(search.trim()) arr=arr.filter(i=>i.name.toLowerCase().includes(search.toLowerCase()));
    if(fRoom!=="all") arr=arr.filter(i=>i.roomId===fRoom);
    if(fStatus!=="all") arr=arr.filter(i=>i.status===fStatus);
    if(fPrio!=="all") arr=arr.filter(i=>i.priority===fPrio);
    arr.sort((a,b)=>{
      if(sort==="name")  return a.name.localeCompare(b.name,"pt");
      if(sort==="price") return (parseFloat(b.price)||0)-(parseFloat(a.price)||0);
      if(sort==="prio")  { const p={high:0,normal:1,low:2}; return (p[a.priority]||1)-(p[b.priority]||1); }
      return 0;
    });
    return arr;
  },[items,search,fRoom,fStatus,fPrio,sort]);

  // Suggestions for empty room
  const suggestRoom = fRoom!=="all" ? fRoom : null;
  const suggestions = suggestRoom ? (ROOM_SUGGESTIONS[suggestRoom]||[]).filter(s=>!items.some(i=>i.name.toLowerCase()===s.toLowerCase())).slice(0,6) : [];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:28,fontWeight:700}}>Meus Itens</h1>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:2}}>{items.length} itens · {items.filter(i=>i.status==="bought").length} comprados</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-secondary" onClick={onQuickAdd}><Zap size={14}/>Rápido</button>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={14}/>Adicionar</button>
        </div>
      </div>

      {/* Search */}
      <div style={{position:"relative"}}>
        <Search size={15} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--text3)"}}/>
        <input className="input" placeholder="Buscar itens..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:40}}/>
        {search&&<button className="btn btn-ghost btn-icon" onClick={()=>setSearch("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)"}}><X size={14}/></button>}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.07em"}}>Cômodo:</span>
        {[{id:"all",name:"Todos"},...rooms].map(r=>(
          <button key={r.id} className={`chip ${fRoom===r.id?"active":""}`} onClick={()=>setFRoom(r.id)}>{r.name}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.07em"}}>Status:</span>
        {[{id:"all",l:"Todos"},{id:"want",l:"Quero comprar"},{id:"bought",l:"Comprados"}].map(s=>(
          <button key={s.id} className={`chip ${fStatus===s.id?"active":""}`} onClick={()=>setFStatus(s.id)}>{s.l}</button>
        ))}
        <span style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.07em",marginLeft:4}}>Prio:</span>
        {[{id:"all",l:"Todas"},{id:"high",l:"⚡ Alta"},{id:"normal",l:"Normal"}].map(s=>(
          <button key={s.id} className={`chip ${fPrio===s.id?"active":""}`} onClick={()=>setFPrio(s.id)}>{s.l}</button>
        ))}
      </div>

      {/* Sort + view */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:"var(--text3)"}}>Ordenar:</span>
          <select className="input" value={sort} onChange={e=>setSort(e.target.value)} style={{width:"auto",padding:"6px 10px",fontSize:13}}>
            <option value="name">Nome</option>
            <option value="price">Maior preço</option>
            <option value="prio">Prioridade</option>
          </select>
        </div>
        <div style={{display:"flex",gap:4}}>
          <button className="btn btn-ghost btn-icon" onClick={()=>setView("grid")} style={view==="grid"?{background:"var(--bg3)",color:"var(--primary)"}:{}}><Grid3X3 size={15}/></button>
          <button className="btn btn-ghost btn-icon" onClick={()=>setView("list")} style={view==="list"?{background:"var(--bg3)",color:"var(--primary)"}:{}}><List size={15}/></button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length>0 && (
        <div style={{background:"var(--bg2)",border:"1px dashed var(--border2)",borderRadius:12,padding:"14px 16px"}}>
          <p style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10,display:"flex",alignItems:"center",gap:5}}>
            <Sparkles size={12}/>Sugestões para {rooms.find(r=>r.id===suggestRoom)?.name}
          </p>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {suggestions.map(s=>(
              <button key={s} className="suggest-chip" onClick={()=>onAdd({prefillName:s,prefillRoom:suggestRoom})}>
                <Plus size={10}/>{s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      {filtered.length===0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Search size={28} style={{color:"var(--text3)"}}/></div>
          <p style={{fontWeight:700,fontSize:15}}>Nenhum item encontrado</p>
          <p style={{fontSize:13,color:"var(--text3)"}}>Tente ajustar os filtros</p>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={14}/>Adicionar item</button>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:view==="grid"?"repeat(auto-fill,minmax(290px,1fr))":"1fr",gap:10}}>
          {filtered.map(item=>(
            <ItemCard key={item.id} item={item} rooms={rooms} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} isNew={newIds.has(item.id)}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   VIEW: ROOMS
══════════════════════════════════════════ */
function RoomsView({ rooms, items, onAddRoom, onDeleteRoom, onGoItems }) {
  const [showModal,setShowModal]=useState(false);
  const isDefault=(id)=>DEFAULT_ROOMS.some(d=>d.id===id);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:28,fontWeight:700}}>Cômodos</h1>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:2}}>{rooms.length} cômodos</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={14}/>Novo cômodo</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:14}}>
        {rooms.map(r=>{
          const Icon=getIcon(r.icon);
          const rItems=items.filter(i=>i.roomId===r.id);
          const bgt=rItems.filter(i=>i.status==="bought").length;
          const tot=rItems.length;
          const p=tot>0?Math.round((bgt/tot)*100):0;
          const val=rItems.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);

          return (
            <div key={r.id} className="card card-hover anim-slide-up" style={{padding:"20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:13,background:`${r.color}20`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Icon size={22} style={{color:r.color}}/>
                  </div>
                  <div>
                    <h3 style={{fontWeight:700,fontSize:16}}>{r.name}</h3>
                    <p style={{fontSize:12,color:"var(--text3)"}}>{tot} {tot===1?"item":"itens"}</p>
                  </div>
                </div>
                {!isDefault(r.id)&&<button className="btn btn-ghost btn-icon btn-danger" onClick={()=>onDeleteRoom(r.id)}><Trash2 size={14}/></button>}
              </div>

              {tot>0?(
                <>
                  <div className="progress-track" style={{marginBottom:8}}>
                    <div className="progress-fill" style={{width:`${p}%`,background:r.color}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)"}}>
                    <span>{bgt}/{tot} comprados ({p}%)</span>
                    {val>0&&<span style={{color:r.color,fontWeight:700}}>{fmt(val)}</span>}
                  </div>
                </>
              ):(
                <p style={{fontSize:13,color:"var(--text3)",fontStyle:"italic"}}>Nenhum item ainda</p>
              )}
            </div>
          );
        })}
      </div>

      {showModal&&<RoomModal onSave={(d)=>{onAddRoom(d);setShowModal(false);}} onClose={()=>setShowModal(false)}/>}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  const [dark,setDark]=useState(false);
  const [view,setView]=useState("dashboard");
  const [items,setItems]=useState([]);
  const [rooms,setRooms]=useState(DEFAULT_ROOMS);
  const [deliveryDate,setDeliveryDate]=useState("");
  const [budget,setBudget]=useState(null);
  const [coupleMode,setCoupleMode]=useState(false);
  const [loading,setLoading]=useState(true);
  const [sidebarOpen,setSidebarOpen]=useState(false);

  const [itemModal,setItemModal]=useState(null);   // null | "new" | item | {prefillName,prefillRoom}
  const [quickModal,setQuickModal]=useState(false);
  const [budgetModal,setBudgetModal]=useState(false);
  const [shareModal,setShareModal]=useState(false);

  const shared = coupleMode;

  /* Load */
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const [si,sr,sd,sb,sc,sdk] = await Promise.all([
        load("enxoval:items",[],false), load("enxoval:rooms",DEFAULT_ROOMS,false),
        load("enxoval:date","",false), load("enxoval:budget",null,false),
        load("enxoval:couple",false,false), load("enxoval:dark",false,false),
      ]);
      // if couple mode was on, try shared items
      let finalItems=si;
      if(sc){ try{ const r=await load("enxoval:items:shared",[],true); if(r.length) finalItems=r; }catch{} }
      setItems(finalItems); setRooms(sr); setDeliveryDate(sd); setBudget(sb); setCoupleMode(sc); setDark(sdk);
      setLoading(false);
    })();
  },[]);

  /* Persist */
  useEffect(()=>{ if(!loading){ save("enxoval:items",items,false); if(coupleMode) save("enxoval:items:shared",items,true); } },[items,loading,coupleMode]);
  useEffect(()=>{ if(!loading) save("enxoval:rooms",rooms,false); },[rooms,loading]);
  useEffect(()=>{ if(!loading) save("enxoval:date",deliveryDate,false); },[deliveryDate,loading]);
  useEffect(()=>{ if(!loading) save("enxoval:budget",budget,false); },[budget,loading]);
  useEffect(()=>{ if(!loading) save("enxoval:couple",coupleMode,false); },[coupleMode,loading]);
  useEffect(()=>{ if(!loading) save("enxoval:dark",dark,false); },[dark,loading]);

  /* Dark */
  useEffect(()=>{ if(dark) document.body.classList.add("dark"); else document.body.classList.remove("dark"); },[dark]);

  /* CRUD */
  const saveItem = (data) => {
    if(data.id) setItems(p=>p.map(i=>i.id===data.id?data:i));
    else setItems(p=>[...p,{...data,id:uid(),createdAt:new Date().toISOString()}]);
    setItemModal(null);
  };
  const toggleItem=(item)=>setItems(p=>p.map(i=>i.id===item.id?{...i,status:i.status==="bought"?"want":"bought"}:i));
  const deleteItem=(id)=>{ if(confirm("Excluir este item?")) setItems(p=>p.filter(i=>i.id!==id)); };
  const addRoom=(data)=>{ const id=data.name.toLowerCase().replace(/\s+/g,"-")+"-"+Date.now(); setRooms(p=>[...p,{...data,id}]); };
  const deleteRoom=(id)=>{ if(items.some(i=>i.roomId===id)){alert("Remova os itens deste cômodo primeiro.");return;} if(confirm("Excluir cômodo?")) setRooms(p=>p.filter(r=>r.id!==id)); };

  /* Export CSV */
  const exportCSV=()=>{
    const h=["Nome","Cômodo","Status","Preço","Prioridade","Link","Notas"];
    const rows=items.map(i=>{const r=rooms.find(x=>x.id===i.roomId);return[i.name,r?.name||"",i.status==="bought"?"Comprado":"Quero comprar",i.price||"",i.priority||"normal",i.link||"",i.notes||""];});
    const csv=[h,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv); a.download="enxoval.csv"; a.click();
  };

  const openAdd=(prefill=null)=>{ setItemModal(prefill||"new"); };

  if(loading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,background:"var(--bg)"}}>
      <Styles/>
      <div style={{width:52,height:52,borderRadius:16,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Home size={24} style={{color:"white"}}/>
      </div>
      <Loader2 size={24} style={{color:"var(--primary)",animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const navItems=[
    {id:"dashboard",label:"Dashboard",icon:LayoutDashboard,count:null},
    {id:"items",label:"Meus Itens",icon:ShoppingBag,count:items.length},
    {id:"rooms",label:"Cômodos",icon:Home,count:rooms.length},
  ];

  const wantCount=items.filter(i=>i.status!=="bought").length;

  return (
    <div className={dark?"dark":""} style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
      <Styles/>

      {/* Sidebar backdrop */}
      {sidebarOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:90}} onClick={()=>setSidebarOpen(false)}/>}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen?"open":""}`} style={{
        width:232,background:"var(--bg2)",borderRight:"1px solid var(--border)",
        padding:"20px 14px",display:"flex",flexDirection:"column",gap:3,zIndex:100,
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:26,paddingLeft:4}}>
          <div style={{width:36,height:36,borderRadius:11,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Home size={18} style={{color:"white"}}/>
          </div>
          <div>
            <span className="fd" style={{fontSize:17,fontWeight:700,color:"var(--text)"}}>Enxoval</span>
            {coupleMode&&<div style={{fontSize:9,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"0.07em",marginTop:1}}>♥ Modo Casal</div>}
          </div>
        </div>

        {/* Nav */}
        {navItems.map(n=>{
          const Icon=n.icon;
          return (
            <button key={n.id} className={`nav-btn ${view===n.id?"active":""}`}
              onClick={()=>{setView(n.id);setSidebarOpen(false);}}>
              <Icon size={16}/>{n.label}
              {n.count!==null&&<span className="nav-count">{n.count}</span>}
            </button>
          );
        })}

        <div style={{flex:1}}/>

        {/* Quick stats */}
        <div style={{background:"var(--bg3)",borderRadius:12,padding:"14px",marginBottom:12}}>
          <p style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Resumo</p>
          {[
            {l:"Total",v:items.length,c:"var(--text)"},
            {l:"Comprados",v:items.filter(i=>i.status==="bought").length,c:"var(--green)"},
            {l:"Pendentes",v:wantCount,c:"var(--primary)"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0"}}>
              <span style={{color:"var(--text3)"}}>{s.l}</span>
              <span style={{fontWeight:700,color:s.c}}>{s.v}</span>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
          <button className="btn btn-ghost btn-icon" onClick={()=>setDark(d=>!d)} title={dark?"Modo claro":"Modo escuro"}
            style={{background:"var(--bg3)",width:"100%",height:34,borderRadius:9}}>
            {dark?<Sun size={15}/>:<Moon size={15}/>}
          </button>
          <button className="btn btn-ghost btn-icon" onClick={()=>setShareModal(true)} title="Modo casal"
            style={{background:"var(--bg3)",width:"100%",height:34,borderRadius:9,color:coupleMode?"var(--primary)":"var(--text3)"}}>
            <Heart size={15}/>
          </button>
          <button className="btn btn-ghost btn-icon" onClick={exportCSV} title="Exportar CSV"
            style={{background:"var(--bg3)",width:"100%",height:34,borderRadius:9}}>
            <Download size={15}/>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        {/* Topbar */}
        <div className="topbar">
          <button className="btn btn-ghost btn-icon" onClick={()=>setSidebarOpen(s=>!s)} style={{background:"var(--bg3)"}}>
            <Layers size={17}/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span className="fd" style={{fontWeight:600,fontSize:16}}>
              {navItems.find(n=>n.id===view)?.label}
            </span>
            {wantCount>0&&view==="dashboard"&&(
              <span style={{background:"var(--primary)",color:"white",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:99}}>
                {wantCount} pendentes
              </span>
            )}
          </div>
          <div style={{display:"flex",gap:7}}>
            <button className="btn btn-secondary" style={{padding:"8px 12px",fontSize:13}} onClick={()=>setQuickModal(true)}>
              <Zap size={14}/>Rápido
            </button>
            <button className="btn btn-primary" style={{padding:"8px 14px",fontSize:13}} onClick={()=>openAdd()}>
              <Plus size={14}/>Item
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"28px 24px"}}>
          <div style={{maxWidth:920,margin:"0 auto"}}>
            {view==="dashboard"&&(
              <Dashboard items={items} rooms={rooms} deliveryDate={deliveryDate} onSetDate={setDeliveryDate}
                budget={budget} onOpenBudget={()=>setBudgetModal(true)} onAddItem={()=>openAdd()} onQuickAdd={()=>setQuickModal(true)}/>
            )}
            {view==="items"&&(
              <ItemsView items={items} rooms={rooms} onAdd={(p)=>openAdd(p||null)} onQuickAdd={()=>setQuickModal(true)}
                onToggle={toggleItem} onEdit={setItemModal} onDelete={deleteItem}/>
            )}
            {view==="rooms"&&(
              <RoomsView rooms={rooms} items={items} onAddRoom={addRoom} onDeleteRoom={deleteRoom}/>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {quickModal&&(
        <QuickAddModal rooms={rooms} onSave={(data)=>{saveItem(data);setQuickModal(false);}} onClose={()=>setQuickModal(false)}/>
      )}
      {itemModal&&(
        <ItemModal
          item={typeof itemModal==="object"&&itemModal!==null&&!itemModal.prefillName?itemModal:null}
          rooms={rooms}
          onSave={saveItem}
          onClose={()=>setItemModal(null)}
        />
      )}
      {budgetModal&&(
        <BudgetModal budget={budget} onSave={(b)=>{setBudget(b);setBudgetModal(false);}} onClose={()=>setBudgetModal(false)}/>
      )}
      {shareModal&&(
        <ShareModal coupleMode={coupleMode} onToggle={()=>setCoupleMode(m=>!m)} onClose={()=>setShareModal(false)}/>
      )}
    </div>
  );
}
