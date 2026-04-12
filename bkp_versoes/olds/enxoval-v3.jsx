/**
 * ENXOVAL APP v3
 * ─────────────────────────────────────────────────────
 * Sections:
 *   1. STYLES
 *   2. CONSTANTS & UTILS
 *   3. STORAGE SERVICE
 *   4. API SERVICE (Claude)
 *   5. PRIMITIVE COMPONENTS (Skeleton, FAB, StoreBadge, Insight)
 *   6. MODALS (QuickAdd, ItemForm, Budget, CompleteHome, Share, Room)
 *   7. ITEM CARD
 *   8. CHART
 *   9. VIEWS (Dashboard, Items, Rooms)
 *  10. MAIN APP
 * ─────────────────────────────────────────────────────
 */

import {
  useState, useEffect, useCallback, useMemo, useRef
} from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import {
  Home, Plus, Trash2, ExternalLink, Check, Search, Moon, Sun,
  Package, ShoppingBag, DollarSign, Clock, X, Edit3, Layers,
  Loader2, Sofa, Bath, UtensilsCrossed, BedDouble, Star, Grid3X3,
  List, AlertCircle, Download, Heart, Target, Zap, Sparkles,
  Flame, CheckCircle2, Circle, BarChart2, TrendingUp, Wallet,
  Copy, ArrowRight, LayoutDashboard, ChevronRight, Bell,
  AlertTriangle, Lightbulb, Info, RefreshCw, Award, Lock
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   1. STYLES
═══════════════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #F6F2EC;
      --bg2:       #EDE8DF;
      --bg3:       #E3DDD3;
      --border:    #D5CEBE;
      --border2:   #C4BBA8;
      --primary:   #B85C32;
      --primary-l: #D4784E;
      --primary-d: #9C4825;
      --primary-a: rgba(184,92,50,.11);
      --green:     #3D8C5F;
      --green-a:   rgba(61,140,95,.13);
      --gold:      #B8891A;
      --gold-a:    rgba(184,137,26,.13);
      --red:       #B83232;
      --red-a:     rgba(184,50,50,.11);
      --blue:      #3264B8;
      --blue-a:    rgba(50,100,184,.11);
      --text:      #1A1612;
      --text2:     #54493E;
      --text3:     #8A7F74;
      --r:         14px;
      --rs:        9px;
      --sh:        0 2px 10px rgba(26,22,18,.07);
      --sh-lg:     0 8px 36px rgba(26,22,18,.13);
      --font:      'Outfit', sans-serif;
      --font-d:    'Instrument Serif', serif;
    }
    .dk {
      --bg:        #161210;
      --bg2:       #1E1A16;
      --bg3:       #262118;
      --border:    #302820;
      --border2:   #3C3228;
      --primary:   #D4784E;
      --primary-l: #E8956E;
      --primary-d: #B85C32;
      --primary-a: rgba(212,120,78,.14);
      --green:     #52B07A;
      --green-a:   rgba(82,176,122,.14);
      --gold:      #D4AA3C;
      --gold-a:    rgba(212,170,60,.14);
      --red:       #D45050;
      --red-a:     rgba(212,80,80,.14);
      --text:      #F0EAE0;
      --text2:     #B0A898;
      --text3:     #6E6258;
    }

    body { font-family: var(--font); background: var(--bg); color: var(--text); transition: background .3s, color .3s; }
    .fd { font-family: var(--font-d); }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

    /* ── Keyframes ── */
    @keyframes slideUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
    @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
    @keyframes scaleIn    { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
    @keyframes spin       { to{transform:rotate(360deg)} }
    @keyframes shimmer    { 0%{background-position:-300% 0} 100%{background-position:300% 0} }
    @keyframes checkPop   { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 70%{transform:scale(.95)} 100%{transform:scale(1)} }
    @keyframes fadeSlide  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
    @keyframes pulseRing  { 0%{box-shadow:0 0 0 0 rgba(184,92,50,.35)} 70%{box-shadow:0 0 0 10px rgba(184,92,50,0)} 100%{box-shadow:0 0 0 0 rgba(184,92,50,0)} }
    @keyframes countUp    { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
    @keyframes insightIn  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
    @keyframes fabIn      { from{opacity:0;transform:scale(.5) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }

    .au  { animation: slideUp   .35s ease both; }
    .afi { animation: fadeIn    .25s ease both; }
    .asi { animation: scaleIn   .28s ease both; }
    .acp { animation: checkPop  .45s ease both; }
    .aii { animation: insightIn .4s ease both; }

    /* ── Shimmer ── */
    .shimmer {
      background: linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%);
      background-size: 300% 100%;
      animation: shimmer 1.6s infinite;
      border-radius: 8px;
    }

    /* ── Cards ── */
    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--r);
      transition: border-color .2s, box-shadow .2s, transform .2s;
    }
    .c-hover:hover { border-color: var(--border2); box-shadow: var(--sh); }
    .c-lift:hover  { border-color: var(--primary-l); box-shadow: var(--sh-lg); transform: translateY(-2px); }

    /* ── Item Card ── */
    .ic {
      background: var(--bg2); border: 1.5px solid var(--border);
      border-radius: var(--r); transition: all .22s ease;
      position: relative; overflow: hidden;
    }
    .ic::before {
      content:''; position:absolute; left:0; top:0; bottom:0; width:3.5px;
      background: var(--border2); opacity:.5; transition: all .2s;
    }
    .ic:hover { border-color: var(--primary-l); box-shadow: var(--sh-lg); transform: translateY(-1px); }
    .ic:hover::before { background: var(--primary); opacity:1; }
    .ic.bought { opacity: .58; }
    .ic.bought::before { background: var(--green); opacity:1; }
    .ic.prio-high::before { background: var(--red); opacity:1; }
    .ic.prio-high { border-color: rgba(184,50,50,.25); }
    .ic.starred::before { background: var(--gold); opacity:1; }

    /* ── Buttons ── */
    .btn { display:inline-flex; align-items:center; gap:6px; font-family:var(--font); font-weight:600; border:none; cursor:pointer; transition: all .18s ease; border-radius:var(--rs); font-size:13px; }
    .btn-primary { background:var(--primary); color:#fff; padding:10px 18px; }
    .btn-primary:hover { background:var(--primary-d); transform:translateY(-1px); box-shadow:0 4px 16px rgba(184,92,50,.38); }
    .btn-primary:active { transform:none; }
    .btn-secondary { background:var(--bg3); color:var(--text); padding:10px 18px; border:1px solid var(--border); }
    .btn-secondary:hover { border-color:var(--primary); color:var(--primary); }
    .btn-ghost { background:transparent; color:var(--text3); padding:7px 9px; border-radius:8px; border:none; }
    .btn-ghost:hover { background:var(--bg3); color:var(--text); }
    .btn-icon { width:34px; height:34px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; }
    .btn-danger:hover { color:var(--red) !important; background:var(--red-a) !important; }
    .btn-star:hover { color:var(--gold) !important; background:var(--gold-a) !important; }
    .btn-star.on { color:var(--gold) !important; }
    .pulse { animation: pulseRing 2.2s infinite; }

    /* ── Input ── */
    .inp { font-family:var(--font); font-size:14px; color:var(--text); background:var(--bg); border:1.5px solid var(--border); border-radius:var(--rs); padding:10px 14px; width:100%; outline:none; transition: border-color .2s, box-shadow .2s; }
    .inp:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-a); }
    .inp::placeholder { color:var(--text3); }
    .lbl { font-size:11px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:.07em; display:block; margin-bottom:5px; }

    /* ── Badges ── */
    .bdg { display:inline-flex; align-items:center; gap:3px; padding:2px 9px; border-radius:99px; font-size:10.5px; font-weight:700; }
    .bdg-want  { background:var(--primary-a); color:var(--primary); }
    .bdg-done  { background:var(--green-a);   color:var(--green); }
    .bdg-high  { background:var(--red-a);     color:var(--red); }
    .bdg-gold  { background:var(--gold-a);    color:var(--gold); }
    .bdg-blue  { background:var(--blue-a);    color:var(--blue); }

    /* ── Chips ── */
    .chip { padding:5px 13px; border-radius:99px; font-size:12.5px; font-weight:600; cursor:pointer; border:1.5px solid var(--border); background:transparent; color:var(--text3); transition:all .18s; white-space:nowrap; font-family:var(--font); }
    .chip:hover { border-color:var(--primary); color:var(--primary); }
    .chip.on { background:var(--primary); border-color:var(--primary); color:#fff; }

    /* ── Suggest chips ── */
    .sch { padding:5px 11px; border-radius:99px; font-size:12px; font-weight:500; cursor:pointer; border:1.5px dashed var(--border2); background:transparent; color:var(--text2); transition:all .18s; font-family:var(--font); display:inline-flex; align-items:center; gap:4px; }
    .sch:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-a); border-style:solid; }

    /* ── Progress ── */
    .ptrack { height:7px; background:var(--bg3); border-radius:99px; overflow:hidden; }
    .pfill  { height:100%; border-radius:99px; transition:width .75s cubic-bezier(.4,0,.2,1); }

    /* ── Modal ── */
    .mbk { position:fixed; inset:0; background:rgba(18,14,10,.58); backdrop-filter:blur(6px); z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn .2s ease; }
    .modal { background:var(--bg); border:1px solid var(--border); border-radius:20px; width:100%; max-width:520px; max-height:92vh; overflow-y:auto; animation:scaleIn .25s ease; box-shadow:0 28px 80px rgba(0,0,0,.22); }

    /* ── Nav ── */
    .nb { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px; cursor:pointer; font-size:13.5px; font-weight:600; color:var(--text3); border:none; background:transparent; width:100%; text-align:left; transition:all .18s; font-family:var(--font); }
    .nb:hover { background:var(--bg3); color:var(--text); }
    .nb.on { background:var(--primary); color:#fff; }
    .nb .nc { margin-left:auto; font-size:11px; padding:1px 7px; border-radius:99px; }
    .nb.on .nc { background:rgba(255,255,255,.22); }
    .nb:not(.on) .nc { background:var(--bg3); color:var(--text3); }

    /* ── Sidebar ── */
    .sidebar { position:fixed; top:0; left:0; bottom:0; z-index:100; transition:transform .3s ease; }
    @media(max-width:768px) {
      .sidebar { transform:translateX(-100%); }
      .sidebar.open { transform:translateX(0); }
      .fab-btn { display:flex !important; }
    }
    @media(min-width:769px) {
      .sidebar { position:sticky; }
      .fab-btn { display:none !important; }
    }

    /* ── Insight card ── */
    .insight { display:flex; gap:10px; align-items:flex-start; padding:11px 14px; border-radius:10px; font-size:13px; animation: insightIn .4s ease both; }
    .insight-info    { background:var(--blue-a);    border:1px solid rgba(50,100,184,.18); color:var(--blue); }
    .insight-warn    { background:var(--gold-a);    border:1px solid rgba(184,137,26,.25); color:var(--gold); }
    .insight-alert   { background:var(--red-a);     border:1px solid rgba(184,50,50,.22);  color:var(--red); }
    .insight-success { background:var(--green-a);   border:1px solid rgba(61,140,95,.22);  color:var(--green); }
    .insight-primary { background:var(--primary-a); border:1px solid rgba(184,92,50,.2);   color:var(--primary); }

    /* ── Topbar ── */
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:var(--bg2); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:50; gap:10px; }

    /* ── Empty state ── */
    .empty { text-align:center; padding:64px 24px; display:flex; flex-direction:column; align-items:center; gap:14px; }
    .empty-ico { width:72px; height:72px; border-radius:20px; background:var(--bg3); display:flex; align-items:center; justify-content:center; }

    /* ── Skeleton ── */
    .sk { border-radius:8px; display:block; }

    /* ── Stat card ── */
    .stat { background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:16px 18px; animation:slideUp .35s ease both; }

    /* ── Store badge ── */
    .store-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:6px; font-size:10.5px; font-weight:700; letter-spacing:.02em; }

    /* ── AI tag ── */
    .ai-tag { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; padding:2px 8px; border-radius:99px; background:linear-gradient(135deg,var(--primary-a),rgba(50,100,184,.1)); color:var(--primary); border:1px solid var(--primary-a); }

    /* ── Tooltip ── */
    .recharts-default-tooltip { background:var(--bg2) !important; border:1px solid var(--border) !important; border-radius:10px !important; font-family:var(--font) !important; font-size:13px !important; color:var(--text) !important; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   2. CONSTANTS & UTILS
═══════════════════════════════════════════════════════ */
const DEFAULT_ROOMS = [
  { id:"quarto",   name:"Quarto",   icon:"bed",      color:"#B85C32" },
  { id:"sala",     name:"Sala",     icon:"sofa",     color:"#3D8C5F" },
  { id:"cozinha",  name:"Cozinha",  icon:"utensils", color:"#B8891A" },
  { id:"banheiro", name:"Banheiro", icon:"bath",     color:"#3264B8" },
];

const ROOM_SUGGESTIONS = {
  quarto:   ["Cama box","Colchão","Cabeceira","Guarda-roupa","Cômoda","Criado-mudo","Espelho","Cortina","Abajur","Edredom","Travesseiro","Rack de TV"],
  sala:     ["Sofá","Mesa de centro","Rack TV","Televisão","Tapete","Luminária","Quadro","Poltrona","Prateleira","Cortina","Aparador","Mesa lateral"],
  cozinha:  ["Geladeira","Fogão","Micro-ondas","Panelas","Talheres","Pratos","Copos","Liquidificador","Processador","Lixeira","Escorredor","Tábua de corte"],
  banheiro: ["Toalha de banho","Toalha de rosto","Tapete","Espelho","Porta-shampoo","Saboneteira","Suporte papel","Lixeira","Box","Toalha de piso"],
};

const STORE_MAP = [
  { pattern:"amazon",         name:"Amazon",       bg:"#FF9900", fg:"#000" },
  { pattern:"mercadolivre",   name:"Mercado Livre",bg:"#FFE600", fg:"#333" },
  { pattern:"mercadopago",    name:"Mercado Pago", bg:"#009EE3", fg:"#fff" },
  { pattern:"shopee",         name:"Shopee",       bg:"#EE4D2D", fg:"#fff" },
  { pattern:"magazineluiza",  name:"Magalu",       bg:"#0066CC", fg:"#fff" },
  { pattern:"magalu",         name:"Magalu",       bg:"#0066CC", fg:"#fff" },
  { pattern:"casasbahia",     name:"Casas Bahia",  bg:"#F7941D", fg:"#fff" },
  { pattern:"americanas",     name:"Americanas",   bg:"#E8192C", fg:"#fff" },
  { pattern:"submarino",      name:"Submarino",    bg:"#0034BB", fg:"#fff" },
  { pattern:"extra.com",      name:"Extra",        bg:"#E8001C", fg:"#fff" },
  { pattern:"leroy",          name:"Leroy Merlin", bg:"#78BE1F", fg:"#fff" },
  { pattern:"tok&stok",       name:"Tok&Stok",     bg:"#1A1A1A", fg:"#fff" },
  { pattern:"tok%26stok",     name:"Tok&Stok",     bg:"#1A1A1A", fg:"#fff" },
  { pattern:"ikea",           name:"IKEA",         bg:"#0058A3", fg:"#FFDA1A" },
];

const ICONS_MAP = {
  bed:BedDouble, sofa:Sofa, utensils:UtensilsCrossed, bath:Bath,
  home:Home, star:Star, zap:Zap, heart:Heart, target:Target, package:Package
};
const COLORS = ["#B85C32","#3D8C5F","#B8891A","#3264B8","#8B32B8","#B83264","#32B8A0","#6E8B32"];

const getIcon  = (k) => ICONS_MAP[k] || Home;
const uid      = ()  => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmt      = (v) => { const n=parseFloat(v); return isNaN(n)?"—":n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); };
const daysLeft = (d) => { if(!d) return null; const t=new Date(d+"T00:00:00"),n=new Date(); n.setHours(0,0,0,0); return Math.round((t-n)/86400000); };

const getStore = (url) => {
  if (!url) return null;
  try {
    const h = new URL(url).hostname.toLowerCase();
    return STORE_MAP.find(s => h.includes(s.pattern)) || null;
  } catch { return null; }
};

/* ═══════════════════════════════════════════════════════
   3. STORAGE SERVICE
═══════════════════════════════════════════════════════ */
const Storage = {
  get: async (key, shared=false, fallback=null) => {
    try { const r=await window.storage.get(key,shared); return r?JSON.parse(r.value):fallback; } catch { return fallback; }
  },
  set: async (key, val, shared=false) => {
    try { await window.storage.set(key,JSON.stringify(val),shared); } catch {}
  },
};

/* ═══════════════════════════════════════════════════════
   4. API SERVICE
═══════════════════════════════════════════════════════ */
const AI = {
  call: async (prompt, useWebSearch=true) => {
    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role:"user", content: prompt }],
    };
    if (useWebSearch) body.tools = [{ type:"web_search_20250305", name:"web_search" }];
    const res  = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
    const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!m) throw new Error("Sem JSON na resposta");
    return JSON.parse(m[0]);
  },

  extractProduct: async (url) => {
    return AI.call(`
Acesse esta URL de produto: "${url}"

Retorne APENAS JSON válido (sem markdown):
{
  "name": "nome completo do produto",
  "price": "preço em reais como número decimal (ex: 299.90) ou null",
  "imageUrl": "URL direta da imagem principal do produto ou null",
  "brand": "marca do produto ou null",
  "suggestedRoom": "um de: quarto|sala|cozinha|banheiro|outro (baseado no produto)"
}
`, true);
  },

  completeHome: async (rooms, existingItems, aptSize) => {
    const roomNames = rooms.map(r=>r.name).join(", ");
    const existing  = existingItems.map(i=>i.name).join(", ");
    return AI.call(`
Você é um consultor de enxoval de apartamento.

Apartamento: ${aptSize}
Cômodos: ${roomNames}
Itens já na lista: ${existing || "nenhum"}

Gere uma lista de itens ESSENCIAIS que ainda não estão na lista.
Retorne APENAS JSON array:
[
  {"name":"Nome do item","roomId":"id_do_comodo","estimatedPrice":valorNumerico,"priority":"high|normal|low"},
  ...
]

Regras:
- roomId deve ser exatamente um de: ${rooms.map(r=>`"${r.id}"`).join(",")}
- Máximo 20 itens, focando nos mais importantes
- estimatedPrice em reais realistas para o Brasil
- Não repetir itens já existentes
- Sem markdown, só o array JSON
`, false);
  },
};

/* ═══════════════════════════════════════════════════════
   5. PRIMITIVE COMPONENTS
═══════════════════════════════════════════════════════ */

/* ── Skeleton block ── */
const Sk = ({ w="100%", h=16, style={} }) => (
  <span className="shimmer sk" style={{ width:w, height:h, display:"block", ...style }}/>
);

/* ── Skeleton card for Quick Add preview ── */
const ProductSkeleton = () => (
  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"14px",display:"flex",gap:12,alignItems:"center"}}>
    <Sk w={52} h={52} style={{borderRadius:10,flexShrink:0}}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
      <Sk h={14} w="80%"/>
      <Sk h={11} w="40%"/>
      <Sk h={18} w="30%"/>
    </div>
  </div>
);

/* ── FAB ── */
const FAB = ({ onClick }) => (
  <button className="fab-btn" onClick={onClick} style={{
    display:"none", position:"fixed", bottom:24, right:20, zIndex:80,
    width:54, height:54, borderRadius:"50%", background:"var(--primary)", color:"#fff",
    border:"none", cursor:"pointer", alignItems:"center", justifyContent:"center",
    boxShadow:"0 4px 20px rgba(184,92,50,.45)",
    animation:"fabIn .4s cubic-bezier(.34,1.56,.64,1) both",
  }}>
    <Plus size={22}/>
  </button>
);

/* ── Store Badge ── */
const StoreBadge = ({ url, style={} }) => {
  const s = getStore(url);
  if (!s) return null;
  return (
    <span className="store-badge" style={{ background:s.bg, color:s.fg, ...style }}>
      {s.name}
    </span>
  );
};

/* ── Budget Alert Bar ── */
const BudgetAlertBar = ({ spent, total }) => {
  if (!total || total <= 0) return null;
  const pct = (spent / total) * 100;
  if (pct < 70) return null;
  const cfg = pct >= 100
    ? { color:"var(--red)", bg:"var(--red-a)", border:"rgba(184,50,50,.3)", label:"🚨 Orçamento estourado!", icon:AlertCircle }
    : pct >= 90
    ? { color:"var(--red)", bg:"var(--red-a)", border:"rgba(184,50,50,.2)", label:`⚠️ ${Math.round(pct)}% do orçamento utilizado — cuidado!`, icon:AlertTriangle }
    : { color:"var(--gold)", bg:"var(--gold-a)", border:"rgba(184,137,26,.25)", label:`📊 ${Math.round(pct)}% do orçamento utilizado`, icon:Bell };
  const Icon = cfg.icon;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,
      background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, fontSize:13, fontWeight:600}}>
      <Icon size={15} style={{flexShrink:0}}/>{cfg.label}
      <span style={{marginLeft:"auto",fontWeight:800}}>{fmt(total - spent)} restantes</span>
    </div>
  );
};

/* ── Insight card ── */
const InsightCard = ({ type="info", text, icon: Icon=Lightbulb, action, delay=0 }) => (
  <div className={`insight insight-${type}`} style={{animationDelay:`${delay}s`}}>
    <Icon size={15} style={{marginTop:1,flexShrink:0}}/>
    <span style={{flex:1,color:"inherit",lineHeight:1.45}}>{text}</span>
    {action && (
      <button onClick={action.fn} style={{
        background:"transparent",border:"none",cursor:"pointer",
        color:"inherit",fontSize:12,fontWeight:700,whiteSpace:"nowrap",
        display:"flex",alignItems:"center",gap:3,opacity:.85
      }}>
        {action.label}<ChevronRight size={12}/>
      </button>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════
   6. MODALS
═══════════════════════════════════════════════════════ */

/* ── Quick Add (with auto-paste & skeleton) ── */
function QuickAddModal({ rooms, items, onSave, onClose }) {
  const [url,     setUrl]     = useState("");
  const [name,    setName]    = useState("");
  const [roomId,  setRoomId]  = useState(rooms[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(1); // 1=input, 2=confirm
  const [extracted, setExtracted] = useState(null);
  const [error,   setError]   = useState("");
  const urlRef = useRef(null);

  // Auto-focus URL input
  useEffect(() => { setTimeout(() => urlRef.current?.focus(), 100); }, []);

  const doExtract = useCallback(async (target) => {
    const u = (target || url).trim();
    if (!u) return;
    setLoading(true); setError(""); setStep(2);
    try {
      const info = await AI.extractProduct(u);
      setExtracted(info);
      if (info.name) setName(info.name);
      // Auto-classify room
      if (info.suggestedRoom && info.suggestedRoom !== "outro") {
        const match = rooms.find(r => r.id === info.suggestedRoom);
        if (match) setRoomId(match.id);
      }
    } catch {
      setError("Não consegui extrair automaticamente. Preencha manualmente.");
    } finally { setLoading(false); }
  }, [url, rooms]);

  // Auto-paste detection
  const handlePaste = useCallback((e) => {
    const text = e.clipboardData.getData("text");
    if (text.startsWith("http://") || text.startsWith("https://")) {
      e.preventDefault();
      setUrl(text);
      setTimeout(() => doExtract(text), 80);
    }
    // If plain text, treat as name and jump to step 2
    else if (!text.includes(" ") === false && text.length > 3 && !text.startsWith("http")) {
      setName(text); setStep(2);
    }
  }, [doExtract]);

  const handleSave = () => {
    if (!name.trim() || !roomId) return;
    onSave({
      id: uid(), name: name.trim(), link: url.trim(),
      price: extracted?.price || "",
      imageUrl: extracted?.imageUrl || "",
      status: "want", priority: "normal", roomId,
      notes: extracted?.brand ? `Marca: ${extracted.brand}` : "",
      starred: false, createdAt: new Date().toISOString(),
    });
  };

  // Suggestions for selected room
  const suggs = (ROOM_SUGGESTIONS[roomId] || [])
    .filter(s => !items.some(i => i.name.toLowerCase() === s.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="mbk" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{padding:"26px", maxWidth:480}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 className="fd" style={{fontSize:21,fontWeight:600}}>Adicionar rápido</h2>
            <span className="ai-tag" style={{marginTop:3,display:"inline-flex"}}><Sparkles size={9}/>IA preenche automaticamente</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>

        {/* Step 1: URL input */}
        {step === 1 && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label className="lbl">Cole o link ou o nome do produto</label>
              <div style={{position:"relative"}}>
                <input ref={urlRef} className="inp" placeholder="https://... ou nome do produto"
                  value={url} onChange={e => setUrl(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={e => e.key === "Enter" && url.startsWith("http") && doExtract()}
                  style={{paddingRight:100}}/>
                {url && (
                  <button className="btn btn-primary" onClick={() => doExtract()}
                    style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",padding:"6px 12px",fontSize:12}}>
                    <Sparkles size={12}/>Preencher
                  </button>
                )}
              </div>
              <p style={{fontSize:11.5,color:"var(--text3)",marginTop:6,lineHeight:1.5}}>
                🔗 Cole um link — a IA busca nome, preço e imagem automaticamente<br/>
                📋 Ou cole/escreva o nome diretamente
              </p>
            </div>

            {/* Room selector */}
            <div>
              <label className="lbl">Cômodo</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {rooms.map(r => {
                  const Icon = getIcon(r.icon);
                  return (
                    <button key={r.id} onClick={() => setRoomId(r.id)} style={{
                      padding:"7px 12px", borderRadius:9, cursor:"pointer", fontFamily:"var(--font)", fontSize:12.5, fontWeight:600,
                      border: `1.5px solid ${roomId===r.id ? r.color : "var(--border)"}`,
                      background: roomId===r.id ? `${r.color}18` : "transparent",
                      color: roomId===r.id ? r.color : "var(--text3)",
                      transition:"all .18s", display:"flex", alignItems:"center", gap:5
                    }}>
                      <Icon size={12}/>{r.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggestions */}
            {suggs.length > 0 && (
              <div>
                <label className="lbl">Sugestões para este cômodo</label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {suggs.map(s => (
                    <button key={s} className="sch" onClick={() => { setName(s); setStep(2); }}>
                      <Plus size={9}/>{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { setStep(2); }}
                style={{gap:6}} disabled={!url.trim() && !name.trim()}>
                Continuar <ArrowRight size={14}/>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm / skeleton while loading */}
        {step === 2 && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {loading && <ProductSkeleton/>}
            {!loading && extracted && !error && (
              <div style={{background:"var(--green-a)",border:"1px solid rgba(61,140,95,.3)",borderRadius:10,padding:"12px 14px",display:"flex",gap:12}}>
                {extracted.imageUrl && (
                  <img src={extracted.imageUrl} alt="" style={{width:54,height:54,objectFit:"cover",borderRadius:8,flexShrink:0}}
                    onError={e => { e.target.style.display="none"; }}/>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:10.5,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>
                    ✓ Preenchido pela IA
                  </p>
                  <p style={{fontSize:13.5,fontWeight:600,color:"var(--text)",lineHeight:1.3}}>{extracted.name}</p>
                  {extracted.price && <p style={{fontSize:13,fontWeight:800,color:"var(--green)",marginTop:3}}>{fmt(extracted.price)}</p>}
                  {extracted.brand && <p style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{extracted.brand}</p>}
                </div>
              </div>
            )}
            {!loading && error && (
              <div style={{background:"var(--primary-a)",border:"1px solid rgba(184,92,50,.25)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--primary)",display:"flex",gap:7}}>
                <AlertCircle size={14} style={{flexShrink:0,marginTop:1}}/>{error}
              </div>
            )}

            {!loading && (
              <>
                <div>
                  <label className="lbl">Nome *</label>
                  <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do produto" autoFocus/>
                </div>
                <div>
                  <label className="lbl">Cômodo *</label>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {rooms.map(r => {
                      const Icon = getIcon(r.icon);
                      return (
                        <button key={r.id} onClick={() => setRoomId(r.id)} style={{
                          padding:"7px 12px", borderRadius:9, cursor:"pointer", fontFamily:"var(--font)", fontSize:12.5, fontWeight:600,
                          border: `1.5px solid ${roomId===r.id ? r.color : "var(--border)"}`,
                          background: roomId===r.id ? `${r.color}18` : "transparent",
                          color: roomId===r.id ? r.color : "var(--text3)", transition:"all .18s",
                          display:"flex", alignItems:"center", gap:5
                        }}>
                          <Icon size={12}/>{r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:4}}>
              <button className="btn btn-ghost" onClick={() => { setStep(1); setExtracted(null); setError(""); }}>
                ← Voltar
              </button>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave}
                  disabled={!name.trim() || !roomId || loading}
                  style={(!name.trim()||loading)?{opacity:.5,cursor:"not-allowed"}:{}}>
                  <Check size={14}/>Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Full Item Form Modal ── */
function ItemModal({ item, rooms, onSave, onClose }) {
  const isEdit = !!item?.id;
  const [f, setF] = useState({
    name:item?.name||"", link:item?.link||"", price:item?.price||"",
    imageUrl:item?.imageUrl||"", notes:item?.notes||"",
    status:item?.status||"want", roomId:item?.roomId||(rooms[0]?.id||""),
    priority:item?.priority||"normal", starred:item?.starred||false,
  });
  const set = (k,v) => setF(p => ({...p,[k]:v}));
  const valid = f.name.trim() && f.roomId;

  return (
    <div className="mbk" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{padding:"26px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 className="fd" style={{fontSize:21,fontWeight:600}}>{isEdit?"Editar item":"Novo item"}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><label className="lbl">Nome *</label>
            <input className="inp" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nome do produto"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label className="lbl">Cômodo *</label>
              <select className="inp" value={f.roomId} onChange={e=>set("roomId",e.target.value)} style={{cursor:"pointer"}}>
                {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div><label className="lbl">Status</label>
              <select className="inp" value={f.status} onChange={e=>set("status",e.target.value)} style={{cursor:"pointer"}}>
                <option value="want">Quero comprar</option>
                <option value="bought">Comprado ✓</option>
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label className="lbl">Preço (R$)</label>
              <input className="inp" type="number" min="0" step="0.01" value={f.price} onChange={e=>set("price",e.target.value)} placeholder="0,00"/>
            </div>
            <div><label className="lbl">Prioridade</label>
              <select className="inp" value={f.priority} onChange={e=>set("priority",e.target.value)} style={{cursor:"pointer"}}>
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta ⚡</option>
              </select>
            </div>
          </div>
          <div><label className="lbl">Link do produto</label>
            <input className="inp" value={f.link} onChange={e=>set("link",e.target.value)} placeholder="https://..."/>
          </div>
          <div><label className="lbl">URL da imagem</label>
            <input className="inp" value={f.imageUrl} onChange={e=>set("imageUrl",e.target.value)} placeholder="https://..."/>
          </div>
          <div><label className="lbl">Observações</label>
            <textarea className="inp" rows={3} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Cor, tamanho, modelo..." style={{resize:"vertical"}}/>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--text2)"}}>
            <input type="checkbox" checked={f.starred} onChange={e=>set("starred",e.target.checked)} style={{width:16,height:16,accentColor:"var(--gold)"}}/>
            ⭐ Marcar como favorito
          </label>
        </div>
        <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!valid} onClick={()=>{ if(valid) onSave({...item,...f,name:f.name.trim()}); }}
            style={!valid?{opacity:.5,cursor:"not-allowed"}:{}}>
            <Check size={14}/>{isEdit?"Salvar":"Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Budget Modal ── */
function BudgetModal({ budget, onSave, onClose }) {
  const [val, setVal] = useState(budget?.total||"");
  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 className="fd" style={{fontSize:20,fontWeight:600}}>Orçamento total</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <label className="lbl">Quanto você pretende gastar no total?</label>
        <input className="inp" type="number" min="0" value={val} onChange={e=>setVal(e.target.value)} placeholder="Ex: 15000" autoFocus/>
        <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>onSave({total:parseFloat(val)||0})}>
            <Target size={14}/>Definir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Complete Home Modal (AI) ── */
function CompleteHomeModal({ rooms, items, onAddItems, onClose }) {
  const [aptSize, setAptSize] = useState("2 quartos");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleGenerate = async () => {
    setLoading(true); setError("");
    try {
      const result = await AI.completeHome(rooms, items, aptSize);
      const valid = Array.isArray(result) ? result : result.items || [];
      setSuggestions(valid.filter(i => rooms.some(r => r.id === i.roomId)));
      setSelected(new Set(valid.map((_,idx) => idx)));
      setStep(2);
    } catch(e) {
      setError("Erro ao gerar sugestões: " + e.message);
    } finally { setLoading(false); }
  };

  const toggleSelect = (idx) => {
    setSelected(s => { const n=new Set(s); n.has(idx)?n.delete(idx):n.add(idx); return n; });
  };

  const handleAdd = () => {
    const toAdd = suggestions.filter((_,i) => selected.has(i)).map(s => ({
      ...s, id:uid(), status:"want", notes:"", starred:false,
      imageUrl:"", link:"", price: s.estimatedPrice?.toString() || "",
      createdAt: new Date().toISOString(),
    }));
    onAddItems(toAdd);
  };

  const aptOptions = ["Studio","1 quarto","2 quartos","3 quartos","4+ quartos"];

  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 className="fd" style={{fontSize:21,fontWeight:600}}>Completar minha casa</h2>
            <span className="ai-tag" style={{marginTop:4,display:"inline-flex"}}><Sparkles size={9}/>IA sugere o que está faltando</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>

        {step === 1 && (
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              <label className="lbl">Tamanho do apartamento</label>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {aptOptions.map(o => (
                  <button key={o} onClick={() => setAptSize(o)} style={{
                    padding:"8px 14px", borderRadius:9, cursor:"pointer", fontFamily:"var(--font)", fontSize:13, fontWeight:600,
                    border: `1.5px solid ${aptSize===o?"var(--primary)":"var(--border)"}`,
                    background: aptSize===o?"var(--primary-a)":"transparent",
                    color: aptSize===o?"var(--primary)":"var(--text3)", transition:"all .18s"
                  }}>{o}</button>
                ))}
              </div>
            </div>
            <div style={{background:"var(--primary-a)",border:"1px solid rgba(184,92,50,.2)",borderRadius:10,padding:"12px 14px",fontSize:13,color:"var(--text2)"}}>
              <p style={{fontWeight:700,marginBottom:4,color:"var(--primary)"}}>Como funciona?</p>
              <p style={{lineHeight:1.55}}>A IA analisa os {items.length} itens já na sua lista e sugere o que está faltando para um enxoval completo de {aptSize}.</p>
            </div>
            {error && <div style={{color:"var(--red)",fontSize:13,background:"var(--red-a)",padding:"10px 12px",borderRadius:9}}>{error}</div>}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}
                style={loading?{opacity:.7}:{}}>
                {loading ? <><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Gerando lista...</> : <><Sparkles size={14}/>Gerar sugestões</>}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:14,color:"var(--text2)"}}>
                <b style={{color:"var(--text)"}}>{selected.size}</b> de {suggestions.length} itens selecionados
              </p>
              <button className="btn btn-ghost" onClick={()=>{
                selected.size===suggestions.length ? setSelected(new Set()) : setSelected(new Set(suggestions.map((_,i)=>i)));
              }} style={{fontSize:12}}>
                {selected.size===suggestions.length?"Desmarcar todos":"Marcar todos"}
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:360,overflowY:"auto"}}>
              {suggestions.map((s,i) => {
                const room = rooms.find(r=>r.id===s.roomId);
                const Icon = room ? getIcon(room.icon) : Home;
                const on = selected.has(i);
                return (
                  <div key={i} onClick={()=>toggleSelect(i)} style={{
                    display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                    borderRadius:9, cursor:"pointer",border:`1.5px solid ${on?"var(--primary)":"var(--border)"}`,
                    background:on?"var(--primary-a)":"transparent",transition:"all .18s"
                  }}>
                    <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${on?"var(--primary)":"var(--border2)"}`,
                      background:on?"var(--primary)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s",flexShrink:0}}>
                      {on && <Check size={12} style={{color:"white"}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:600,fontSize:13.5}}>{s.name}</p>
                      <p style={{fontSize:11,color:"var(--text3)",display:"flex",alignItems:"center",gap:4,marginTop:1}}>
                        <Icon size={9}/>{room?.name}
                        {s.priority==="high"&&<span className="bdg bdg-high" style={{fontSize:9,marginLeft:2}}>Alta prioridade</span>}
                      </p>
                    </div>
                    {s.estimatedPrice && (
                      <span style={{fontSize:12.5,fontWeight:700,color:"var(--text2)",whiteSpace:"nowrap"}}>{fmt(s.estimatedPrice)}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"space-between",paddingTop:6,borderTop:"1px solid var(--border)"}}>
              <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Refazer</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={selected.size===0}
                style={selected.size===0?{opacity:.5,cursor:"not-allowed"}:{}}>
                <Plus size={14}/>Adicionar {selected.size} {selected.size===1?"item":"itens"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Share / Couple Modal ── */
function ShareModal({ coupleMode, onToggle, onClose }) {
  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:400}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 className="fd" style={{fontSize:20,fontWeight:600}}>Modo casal</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{width:68,height:68,borderRadius:18,background:"var(--primary-a)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <Heart size={30} style={{color:"var(--primary)"}}/>
          </div>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Organize junto com seu parceiro(a)</h3>
          <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:18}}>
            No modo casal, os dados são sincronizados. Ambos podem adicionar, editar e marcar itens em qualquer dispositivo.
          </p>
          <button className="btn btn-primary pulse" onClick={onToggle} style={{width:"100%",justifyContent:"center",padding:"13px",fontSize:14}}>
            {coupleMode ? <><X size={15}/>Desativar modo casal</> : <><Heart size={15}/>Ativar modo casal</>}
          </button>
          {coupleMode && (
            <div style={{marginTop:14,background:"var(--green-a)",border:"1px solid rgba(61,140,95,.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--green)",textAlign:"left"}}>
              ✓ Ativo! Abra este app em outro dispositivo para sincronizar em tempo real.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Room Modal ── */
function RoomModal({ onSave, onClose }) {
  const [name,setName]=useState(""); const [icon,setIcon]=useState("home"); const [color,setColor]=useState(COLORS[0]);
  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 className="fd" style={{fontSize:20,fontWeight:600}}>Novo cômodo</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:15}}>
          <div><label className="lbl">Nome</label>
            <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Varanda, Escritório..." autoFocus/>
          </div>
          <div><label className="lbl">Ícone</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {Object.entries(ICONS_MAP).map(([k,Icon])=>(
                <button key={k} onClick={()=>setIcon(k)} style={{
                  width:37,height:37,borderRadius:9,border:`2px solid ${icon===k?color:"var(--border)"}`,
                  background:icon===k?`${color}20`:"transparent",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:icon===k?color:"var(--text3)",transition:"all .18s"
                }}><Icon size={16}/></button>
              ))}
            </div>
          </div>
          <div><label className="lbl">Cor</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>setColor(c)} style={{
                  width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",
                  border:`3px solid ${color===c?"var(--text)":"transparent"}`,outline:"none",transition:"all .18s"
                }}/>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!name.trim()} onClick={()=>{if(name.trim())onSave({name:name.trim(),icon,color});}}
            style={!name.trim()?{opacity:.5,cursor:"not-allowed"}:{}}>
            <Plus size={14}/>Criar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   7. ITEM CARD
═══════════════════════════════════════════════════════ */
function ItemCard({ item, rooms, onToggle, onEdit, onDelete, onDuplicate, onStar }) {
  const room  = rooms.find(r => r.id === item.roomId);
  const Icon  = room ? getIcon(room.icon) : Home;
  const store = getStore(item.link);
  const [buying, setBuying] = useState(false);

  const handleToggle = () => {
    setBuying(true);
    onToggle(item);
    setTimeout(() => setBuying(false), 500);
  };

  const cls = [
    "ic",
    item.status==="bought" ? "bought" : "",
    item.priority==="high" && item.status!=="bought" ? "prio-high" : "",
    item.starred && item.status!=="bought" ? "starred" : "",
    buying ? "acp" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={cls} style={{padding:"14px 15px"}}>
      <div style={{display:"flex",gap:12}}>
        {/* Image */}
        <div style={{width:66,height:66,borderRadius:9,flexShrink:0,overflow:"hidden",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}
                onError={e=>{e.target.style.display="none";}}/>
            : <Package size={22} style={{color:"var(--text3)"}}/>
          }
          {item.starred && (
            <div style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Star size={8} style={{color:"white",fill:"white"}}/>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{flex:1,minWidth:0}}>
          {/* Title row */}
          <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:14,color:"var(--text)",textDecoration:item.status==="bought"?"line-through":"none",lineHeight:1.3,flex:1}}>
              {item.name}
            </span>
            {item.priority==="high" && item.status!=="bought" && (
              <span className="bdg bdg-high" style={{flexShrink:0}}><Flame size={8}/>Alta</span>
            )}
          </div>

          {/* Badges */}
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6,alignItems:"center"}}>
            {room && (
              <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10.5,color:"var(--text3)",background:"var(--bg3)",padding:"2px 7px",borderRadius:99}}>
                <Icon size={9}/>{room.name}
              </span>
            )}
            <span className={`bdg ${item.status==="bought"?"bdg-done":"bdg-want"}`}>
              {item.status==="bought"?"✓ Comprado":"Quero comprar"}
            </span>
            {item.price && (
              <span style={{fontSize:13,fontWeight:800,color:"var(--primary)"}}>{fmt(item.price)}</span>
            )}
            {store && <StoreBadge url={item.link}/>}
          </div>

          {item.notes && (
            <p style={{fontSize:11.5,color:"var(--text3)",lineHeight:1.4,marginBottom:6}}>{item.notes}</p>
          )}

          {/* Actions row */}
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button onClick={handleToggle} className="btn btn-ghost"
              style={{fontSize:11.5,fontWeight:700,padding:"4px 9px",borderRadius:7,gap:4,
                background:item.status==="bought"?"var(--green-a)":"var(--primary-a)",
                color:item.status==="bought"?"var(--green)":"var(--primary)"}}>
              {item.status==="bought"?<Circle size={11}/>:<CheckCircle2 size={11}/>}
              {item.status==="bought"?"Desmarcar":"Comprado!"}
            </button>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost btn-icon" title="Abrir link" style={{textDecoration:"none"}}>
                <ExternalLink size={13}/>
              </a>
            )}
            <button className="btn btn-ghost btn-icon" onClick={()=>onEdit(item)} title="Editar"><Edit3 size={13}/></button>
            <button className={`btn btn-ghost btn-icon btn-star ${item.starred?"on":""}`} onClick={()=>onStar(item)} title="Favorito">
              <Star size={13} style={item.starred?{fill:"var(--gold)"}:{}}/>
            </button>
            <button className="btn btn-ghost btn-icon" onClick={()=>onDuplicate(item)} title="Duplicar"><Copy size={13}/></button>
            <button className="btn btn-ghost btn-icon btn-danger" onClick={()=>onDelete(item.id)} title="Excluir" style={{marginLeft:"auto"}}>
              <Trash2 size={13}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   8. CHART
═══════════════════════════════════════════════════════ */
function SpendingChart({ items, rooms }) {
  const [mode, setMode] = useState("both"); // both | estimated | spent

  const data = rooms.map(r => ({
    name: r.name.length > 8 ? r.name.slice(0,7)+"…" : r.name,
    full: r.name, color: r.color,
    estimado: items.filter(i=>i.roomId===r.id&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0),
    gasto:    items.filter(i=>i.roomId===r.id&&i.status==="bought"&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0),
  })).filter(d => d.estimado > 0);

  if (!data.length) return null;

  const CustomTip = ({active,payload,label}) => {
    if (!active||!payload?.length) return null;
    const d = data.find(x=>x.name===label)||{};
    return (
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px"}}>
        <p style={{fontWeight:700,marginBottom:5,color:"var(--text)"}}>{d.full}</p>
        {(mode==="both"||mode==="estimated")&&<p style={{fontSize:12,color:"var(--text2)"}}>Estimado: <b style={{color:"var(--primary)"}}>{fmt(d.estimado)}</b></p>}
        {(mode==="both"||mode==="spent")&&<p style={{fontSize:12,color:"var(--text2)"}}>Gasto: <b style={{color:"var(--green)"}}>{fmt(d.gasto)}</b></p>}
      </div>
    );
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:7}}>
          <BarChart2 size={15} style={{color:"var(--primary)"}}/>Gastos por cômodo
        </h3>
        <div style={{display:"flex",gap:5}}>
          {[{k:"both",l:"Ambos"},{k:"estimated",l:"Estimado"},{k:"spent",l:"Gasto"}].map(m=>(
            <button key={m.k} onClick={()=>setMode(m.k)} style={{
              padding:"4px 10px",borderRadius:99,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"var(--font)",
              border:"1.5px solid var(--border)",background:mode===m.k?"var(--primary)":"transparent",
              color:mode===m.k?"white":"var(--text3)",transition:"all .18s"
            }}>{m.l}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={data} barSize={24} barCategoryGap="25%" barGap={4}>
          <XAxis dataKey="name" tick={{fontSize:11.5,fill:"var(--text3)",fontFamily:"var(--font)"}} axisLine={false} tickLine={false}/>
          <YAxis hide/>
          <Tooltip content={<CustomTip/>} cursor={{fill:"var(--bg3)"}}/>
          {(mode==="both"||mode==="estimated") && (
            <Bar dataKey="estimado" radius={[6,6,0,0]} name="Estimado">
              {data.map((d,i)=><Cell key={i} fill={d.color+"55"}/>)}
            </Bar>
          )}
          {(mode==="both"||mode==="spent") && (
            <Bar dataKey="gasto" radius={[6,6,0,0]} name="Gasto">
              {data.map((d,i)=><Cell key={i} fill={d.color}/>)}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   9. VIEWS
═══════════════════════════════════════════════════════ */

/* ─── INSIGHTS GENERATOR ─── */
function generateInsights(items, rooms, budget, deliveryDate) {
  const insights = [];
  const total    = items.length;
  const bought   = items.filter(i=>i.status==="bought").length;
  const highPrio = items.filter(i=>i.priority==="high"&&i.status!=="bought");
  const noPrice  = items.filter(i=>!i.price||parseFloat(i.price)===0);
  const spent    = items.filter(i=>i.status==="bought"&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const days     = daysLeft(deliveryDate);
  const emptyRooms = rooms.filter(r=>!items.some(i=>i.roomId===r.id));

  // Urgency
  if (days !== null && days > 0 && days <= 30) {
    insights.push({ type:"alert", icon:Clock, delay:0,
      text:`⏰ Faltam apenas ${days} dias! Foque nos itens de alta prioridade primeiro.`
    });
  }

  // Empty rooms
  if (emptyRooms.length > 0) {
    insights.push({ type:"warn", icon:AlertTriangle, delay:.08,
      text:`Cômodos sem itens: ${emptyRooms.map(r=>r.name).join(", ")}. Adicione o que está faltando.`
    });
  }

  // High priority
  if (highPrio.length > 0) {
    const pct = total>0 ? Math.round((highPrio.length/total)*100) : 0;
    insights.push({ type:"alert", icon:Flame, delay:.16,
      text:`${highPrio.length} item${highPrio.length>1?"s":""} de alta prioridade pendente${highPrio.length>1?"s":""}${pct>0?` (${pct}% do total)`:""}.`
    });
  }

  // Most expensive room
  const roomValues = rooms.map(r=>({
    name:r.name,
    val:items.filter(i=>i.roomId===r.id&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0)
  })).filter(r=>r.val>0).sort((a,b)=>b.val-a.val);
  if (roomValues.length > 1) {
    insights.push({ type:"info", icon:TrendingUp, delay:.24,
      text:`Seu maior gasto está no(a) ${roomValues[0].name} (${fmt(roomValues[0].val)} estimado).`
    });
  }

  // No price items
  if (noPrice.length > 0 && total > 3) {
    insights.push({ type:"info", icon:DollarSign, delay:.3,
      text:`${noPrice.length} item${noPrice.length>1?"s":""} sem preço definido. Adicionar preços melhora a previsão de gastos.`
    });
  }

  // Progress milestone
  if (total > 0 && bought > 0) {
    const pct = Math.round((bought/total)*100);
    if (pct >= 75) insights.push({ type:"success", icon:Award, delay:.36, text:`🎉 Você já comprou ${pct}% dos itens! Quase lá.` });
    else if (pct >= 50) insights.push({ type:"success", icon:CheckCircle2, delay:.36, text:`Você já comprou metade dos itens! Continue assim.` });
  }

  // Budget warning (light)
  if (budget?.total > 0) {
    const pct = (spent/budget.total)*100;
    if (pct >= 80 && pct < 90) {
      insights.push({ type:"warn", icon:Wallet, delay:.42,
        text:`Você usou ${Math.round(pct)}% do orçamento. Revise os itens restantes.`
      });
    }
  }

  return insights.slice(0, 4);
}

/* ─── DASHBOARD ─── */
function Dashboard({ items, rooms, deliveryDate, onSetDate, budget, onOpenBudget, onQuickAdd, onAddItem, onCompleteHome, coupleMode }) {
  const total    = items.length;
  const bought   = items.filter(i=>i.status==="bought").length;
  const want     = total - bought;
  const pct      = total > 0 ? Math.round((bought/total)*100) : 0;
  const allVal   = items.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const spentVal = items.filter(i=>i.status==="bought"&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const days     = daysLeft(deliveryDate);
  const budgetPct= budget?.total>0 ? Math.round((spentVal/budget.total)*100) : 0;

  // Avg ticket & forecast
  const pricedItems  = items.filter(i=>i.price&&parseFloat(i.price)>0);
  const avgTicket    = pricedItems.length > 0 ? pricedItems.reduce((s,i)=>s+parseFloat(i.price),0)/pricedItems.length : 0;
  const noPrice      = items.filter(i=>!i.price||parseFloat(i.price)===0).length;
  const forecast     = allVal + (noPrice * avgTicket);

  const insights = useMemo(() => generateInsights(items,rooms,budget,deliveryDate), [items,rooms,budget,deliveryDate]);

  const roomStats = rooms.map(r=>({
    ...r,
    count:items.filter(i=>i.roomId===r.id).length,
    bought:items.filter(i=>i.roomId===r.id&&i.status==="bought").length,
  })).filter(r=>r.count>0).sort((a,b)=>b.count-a.count);

  const highPrioItems = items.filter(i=>i.priority==="high"&&i.status!=="bought").slice(0,3);
  const topExpensive  = items.filter(i=>i.price&&i.status!=="bought").sort((a,b)=>parseFloat(b.price)-parseFloat(a.price)).slice(0,3);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      {/* Title + CTAs */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:30,fontWeight:600,lineHeight:1.15}}>
            Meu Enxoval{coupleMode&&<span style={{fontSize:16,marginLeft:10,color:"var(--primary)"}}>♥ Casal</span>}
          </h1>
          <p style={{color:"var(--text2)",fontSize:14,marginTop:3}}>Organize tudo para o seu novo lar</p>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <button className="btn btn-secondary" onClick={onCompleteHome} style={{fontSize:12.5}}>
            <Sparkles size={13}/>Completar casa
          </button>
          <button className="btn btn-secondary" onClick={onQuickAdd} style={{fontSize:12.5}}>
            <Zap size={13}/>Rápido
          </button>
          <button className="btn btn-primary pulse" onClick={onAddItem} style={{fontSize:12.5}}>
            <Plus size={13}/>Adicionar
          </button>
        </div>
      </div>

      {/* Hero Countdown */}
      <div style={{background:"linear-gradient(135deg, var(--primary) 0%, var(--primary-d) 100%)",borderRadius:18,padding:"22px 24px",color:"white"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <p style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",opacity:.75,marginBottom:5,display:"flex",alignItems:"center",gap:5}}>
              <Clock size={10}/>Contagem regressiva
            </p>
            {days !== null ? (
              <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                <span className="fd" style={{fontSize:54,fontWeight:400,lineHeight:1,fontStyle:"italic"}}>{Math.max(0,days)}</span>
                <span style={{fontSize:17,opacity:.85}}>{days<0?"dias (chegou!✨)":days===1?"dia restante":"dias restantes"}</span>
              </div>
            ) : (
              <p style={{fontSize:15,opacity:.7,marginTop:2}}>Defina a data de entrega abaixo</p>
            )}
          </div>
          <div>
            <label style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",opacity:.7,display:"block",marginBottom:6}}>Data de entrega</label>
            <input type="date" value={deliveryDate||""} onChange={e=>onSetDate(e.target.value)}
              style={{background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.35)",borderRadius:8,
                padding:"8px 13px",color:"white",fontFamily:"var(--font)",fontSize:13,cursor:"pointer",outline:"none",colorScheme:"dark"}}/>
          </div>
        </div>
        <div style={{marginTop:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{opacity:.75,fontSize:12}}>Progresso de compras</span>
            <span style={{fontWeight:800,fontSize:14}}>{pct}%</span>
          </div>
          <div style={{height:6,background:"rgba(255,255,255,.2)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:"rgba(255,255,255,.9)",borderRadius:99,transition:"width .8s cubic-bezier(.4,0,.2,1)"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:7,opacity:.7,fontSize:11.5}}>
            <span>{bought} comprado{bought!==1?"s":""}</span>
            <span>{want} pendente{want!==1?"s":""}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10}}>
        {[
          {l:"Total",    v:total,          Icon:Package,      c:"var(--primary)", d:0},
          {l:"Comprados",v:bought,         Icon:CheckCircle2, c:"var(--green)",   d:.06},
          {l:"Pendentes",v:want,           Icon:ShoppingBag,  c:"var(--gold)",    d:.12},
          {l:"Estimado", v:fmt(allVal),    Icon:DollarSign,   c:"var(--primary)", d:.18, sm:true},
        ].map((s,i)=>(
          <div key={i} className="stat" style={{animationDelay:`${s.d}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>{s.l}</p>
                <p className="fd" style={{fontSize:s.sm?17:30,fontWeight:s.sm?700:400,fontStyle:s.sm?"normal":"italic",color:s.c,lineHeight:1}}>{s.v}</p>
              </div>
              <div style={{width:32,height:32,borderRadius:8,background:`${s.c}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <s.Icon size={15} style={{color:s.c}}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget & Finance */}
      <div className="card" style={{padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:7}}>
            <Wallet size={14} style={{color:"var(--primary)"}}/>Controle financeiro
          </h3>
          <button className="btn btn-ghost" onClick={onOpenBudget} style={{fontSize:12}}>
            <Edit3 size={12}/>{budget?.total?"Editar":"Definir orçamento"}
          </button>
        </div>

        <BudgetAlertBar spent={spentVal} total={budget?.total}/>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:budget?.total?14:0}}>
          {[
            {l:"Orçamento",       v:budget?.total?fmt(budget.total):"—",  c:"var(--text)"},
            {l:"Já gasto",        v:fmt(spentVal),                         c:"var(--green)"},
            {l:budget?.total?"Restante":"Pendente", v:budget?.total?fmt(Math.max(0,budget.total-spentVal)):fmt(allVal-spentVal), c:budget?.total&&spentVal>budget.total?"var(--red)":"var(--primary)"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <p style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{s.l}</p>
              <p className="fd" style={{fontSize:16,fontWeight:400,fontStyle:"italic",color:s.c}}>{s.v}</p>
            </div>
          ))}
        </div>

        {budget?.total > 0 && (
          <div style={{marginTop:14}}>
            <div className="ptrack">
              <div className="pfill" style={{
                width:`${Math.min(100,budgetPct)}%`,
                background:budgetPct>=100?"var(--red)":budgetPct>=90?"#D46020":budgetPct>=70?"var(--gold)":"var(--green)"
              }}/>
            </div>
            <p style={{fontSize:11,color:"var(--text3)",marginTop:5,textAlign:"right",fontWeight:600}}>
              {budgetPct}% do orçamento utilizado
            </p>
          </div>
        )}

        {/* Avg ticket + forecast */}
        {pricedItems.length > 0 && (
          <div style={{display:"flex",gap:10,marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
            <div style={{flex:1,textAlign:"center"}}>
              <p style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Ticket médio</p>
              <p style={{fontSize:15,fontWeight:800,color:"var(--text2)"}}>{fmt(avgTicket)}</p>
            </div>
            <div style={{width:1,background:"var(--border)"}}/>
            <div style={{flex:1,textAlign:"center"}}>
              <p style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Previsão total</p>
              <p style={{fontSize:15,fontWeight:800,color:"var(--primary)"}}>{fmt(forecast)}</p>
              {noPrice > 0 && <p style={{fontSize:10,color:"var(--text3)",marginTop:2}}>estimando {noPrice} sem preço</p>}
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h3 style={{fontWeight:700,fontSize:14,marginBottom:10,display:"flex",alignItems:"center",gap:6,color:"var(--text2)"}}>
            <Lightbulb size={14}/>Insights
          </h3>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {insights.map((ins,i) => <InsightCard key={i} {...ins}/>)}
          </div>
        </div>
      )}

      {/* Chart */}
      {items.some(i=>i.price) && (
        <div className="card" style={{padding:"18px 20px"}}>
          <SpendingChart items={items} rooms={rooms}/>
        </div>
      )}

      {/* High priority */}
      {highPrioItems.length > 0 && (
        <div>
          <h3 style={{fontWeight:700,fontSize:14,marginBottom:10,display:"flex",alignItems:"center",gap:6,color:"var(--red)"}}>
            <Flame size={14}/>Alta prioridade
          </h3>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {highPrioItems.map(item => {
              const room = rooms.find(r=>r.id===item.roomId);
              const Icon = room ? getIcon(room.icon) : Home;
              return (
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",
                  background:"var(--bg2)",border:"1.5px solid rgba(184,50,50,.2)",borderLeft:"3.5px solid var(--red)",
                  borderRadius:"0 10px 10px 0"}}>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:13.5}}>{item.name}</p>
                    <p style={{fontSize:11,color:"var(--text3)",display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                      <Icon size={9}/>{room?.name}{item.price&&<span style={{color:"var(--primary)",fontWeight:700,marginLeft:4}}>{fmt(item.price)}</span>}
                    </p>
                  </div>
                  {item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon" style={{textDecoration:"none"}}><ExternalLink size={13}/></a>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top expensive */}
      {topExpensive.length > 0 && (
        <div>
          <h3 style={{fontWeight:700,fontSize:14,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
            <TrendingUp size={14} style={{color:"var(--gold)"}}/>Itens mais caros pendentes
          </h3>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topExpensive.map((item,idx) => {
              const room = rooms.find(r=>r.id===item.roomId);
              const medals = ["🥇","🥈","🥉"];
              return (
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10}}>
                  <span style={{fontSize:18,width:24,textAlign:"center"}}>{medals[idx]}</span>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:600,fontSize:13.5}}>{item.name}</p>
                    <p style={{fontSize:11,color:"var(--text3)"}}>{room?.name}</p>
                  </div>
                  <span style={{fontSize:14,fontWeight:800,color:"var(--primary)"}}>{fmt(item.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Room progress */}
      {roomStats.length > 0 && (
        <div>
          <h3 className="fd" style={{fontSize:20,fontWeight:600,marginBottom:12}}>Por cômodo</h3>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {roomStats.map(r => {
              const Icon = getIcon(r.icon);
              const p = r.count>0 ? Math.round((r.bought/r.count)*100) : 0;
              return (
                <div key={r.id} className="card" style={{padding:"14px 17px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:9}}>
                    <div style={{width:36,height:36,borderRadius:10,background:`${r.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon size={17} style={{color:r.color}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontWeight:700,fontSize:14}}>{r.name}</span>
                        <span style={{fontSize:11.5,color:"var(--text3)"}}>{r.bought}/{r.count} · <b style={{color:r.color}}>{p}%</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="ptrack"><div className="pfill" style={{width:`${p}%`,background:r.color}}/></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && (
        <div className="empty">
          <div className="empty-ico"><Package size={30} style={{color:"var(--text3)"}}/></div>
          <p className="fd" style={{fontSize:22,fontWeight:600}}>Nenhum item ainda</p>
          <p style={{fontSize:13,color:"var(--text2)",maxWidth:280,lineHeight:1.55}}>
            Comece adicionando itens para o seu enxoval — ou deixe a IA montar uma lista completa!
          </p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:4}}>
            <button className="btn btn-secondary" onClick={onCompleteHome}><Sparkles size={13}/>IA: Completar casa</button>
            <button className="btn btn-secondary" onClick={onQuickAdd}><Zap size={13}/>Adicionar rápido</button>
            <button className="btn btn-primary pulse" onClick={onAddItem} style={{fontSize:14,padding:"12px 24px"}}>
              <Plus size={15}/>Adicionar primeiro item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ITEMS VIEW ─── */
function ItemsView({ items, rooms, onAdd, onQuickAdd, onToggle, onEdit, onDelete, onDuplicate, onStar }) {
  const [search,   setSearch]   = useState("");
  const [fRoom,    setFRoom]    = useState("all");
  const [fStatus,  setFStatus]  = useState("all");
  const [fPrio,    setFPrio]    = useState("all");
  const [fStarred, setFStarred] = useState(false);
  const [sort,     setSort]     = useState("name");
  const [vw,       setVw]       = useState("grid");

  const filtered = useMemo(() => {
    let arr = [...items];
    if (search.trim())    arr = arr.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())||i.notes?.toLowerCase().includes(search.toLowerCase()));
    if (fRoom !== "all")  arr = arr.filter(i=>i.roomId===fRoom);
    if (fStatus !== "all")arr = arr.filter(i=>i.status===fStatus);
    if (fPrio !== "all")  arr = arr.filter(i=>i.priority===fPrio);
    if (fStarred)         arr = arr.filter(i=>i.starred);
    arr.sort((a,b) => {
      if (sort==="name")   return a.name.localeCompare(b.name,"pt");
      if (sort==="price")  return (parseFloat(b.price)||0)-(parseFloat(a.price)||0);
      if (sort==="prio")   { const p={high:0,normal:1,low:2}; return (p[a.priority]||1)-(p[b.priority]||1); }
      if (sort==="recent") return new Date(b.createdAt)-new Date(a.createdAt);
      return 0;
    });
    return arr;
  }, [items,search,fRoom,fStatus,fPrio,fStarred,sort]);

  // Suggestions for selected room
  const suggs = fRoom !== "all"
    ? (ROOM_SUGGESTIONS[fRoom]||[]).filter(s=>!items.some(i=>i.name.toLowerCase()===s.toLowerCase())).slice(0,6)
    : [];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:27,fontWeight:600}}>Meus Itens</h1>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:2}}>
            {filtered.length} de {items.length} itens · {items.filter(i=>i.status==="bought").length} comprados
          </p>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button className="btn btn-secondary" onClick={onQuickAdd} style={{fontSize:12.5}}><Zap size={13}/>Rápido</button>
          <button className="btn btn-primary" onClick={()=>onAdd()} style={{fontSize:12.5}}><Plus size={13}/>Adicionar</button>
        </div>
      </div>

      {/* Search */}
      <div style={{position:"relative"}}>
        <Search size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"var(--text3)"}}/>
        <input className="inp" placeholder="Buscar por nome ou observações..." value={search}
          onChange={e=>setSearch(e.target.value)} style={{paddingLeft:37}}/>
        {search && <button className="btn btn-ghost btn-icon" onClick={()=>setSearch("")}
          style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)"}}><X size={13}/></button>}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:10.5,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em"}}>Cômodo:</span>
        {[{id:"all",name:"Todos"},...rooms].map(r=>(
          <button key={r.id} className={`chip ${fRoom===r.id?"on":""}`} onClick={()=>setFRoom(r.id)}>{r.name}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:10.5,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em"}}>Status:</span>
        {[{id:"all",l:"Todos"},{id:"want",l:"Pendentes"},{id:"bought",l:"Comprados"}].map(s=>(
          <button key={s.id} className={`chip ${fStatus===s.id?"on":""}`} onClick={()=>setFStatus(s.id)}>{s.l}</button>
        ))}
        <button className={`chip ${fStarred?"on":""}`} onClick={()=>setFStarred(v=>!v)}>
          ⭐ Favoritos
        </button>
        <span style={{fontSize:10.5,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginLeft:4}}>Prio:</span>
        {[{id:"all",l:"Todas"},{id:"high",l:"⚡ Alta"},{id:"normal",l:"Normal"},{id:"low",l:"Baixa"}].map(p=>(
          <button key={p.id} className={`chip ${fPrio===p.id?"on":""}`} onClick={()=>setFPrio(p.id)}>{p.l}</button>
        ))}
      </div>

      {/* Sort + view */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <span style={{fontSize:12,color:"var(--text3)"}}>Ordenar:</span>
          <select className="inp" value={sort} onChange={e=>setSort(e.target.value)} style={{width:"auto",padding:"5px 10px",fontSize:12.5}}>
            <option value="name">Nome</option>
            <option value="price">Maior preço</option>
            <option value="prio">Prioridade</option>
            <option value="recent">Mais recente</option>
          </select>
        </div>
        <div style={{display:"flex",gap:4}}>
          <button className="btn btn-ghost btn-icon" onClick={()=>setVw("grid")} style={vw==="grid"?{background:"var(--bg3)",color:"var(--primary)"}:{}}><Grid3X3 size={14}/></button>
          <button className="btn btn-ghost btn-icon" onClick={()=>setVw("list")} style={vw==="list"?{background:"var(--bg3)",color:"var(--primary)"}:{}}><List size={14}/></button>
        </div>
      </div>

      {/* Smart suggestions for room */}
      {suggs.length > 0 && (
        <div style={{background:"var(--bg2)",border:"1.5px dashed var(--border2)",borderRadius:12,padding:"13px 15px"}}>
          <p style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9,display:"flex",alignItems:"center",gap:5}}>
            <Sparkles size={11}/>Sugestões — {rooms.find(r=>r.id===fRoom)?.name}
          </p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {suggs.map(s=>(
              <button key={s} className="sch" onClick={()=>onAdd({prefillName:s,prefillRoom:fRoom})}>
                <Plus size={9}/>{s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items grid/list */}
      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-ico"><Search size={26} style={{color:"var(--text3)"}}/></div>
          <p style={{fontWeight:700,fontSize:15}}>Nenhum item encontrado</p>
          <p style={{fontSize:13,color:"var(--text3)"}}>Tente ajustar os filtros ou a busca</p>
          <button className="btn btn-primary" onClick={()=>onAdd()}><Plus size={13}/>Adicionar item</button>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:vw==="grid"?"repeat(auto-fill,minmax(280px,1fr))":"1fr",gap:9}}>
          {filtered.map(item=>(
            <ItemCard key={item.id} item={item} rooms={rooms}
              onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
              onDuplicate={onDuplicate} onStar={onStar}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ROOMS VIEW ─── */
function RoomsView({ rooms, items, onAddRoom, onDeleteRoom }) {
  const [showModal, setShowModal] = useState(false);
  const isDefault = (id) => DEFAULT_ROOMS.some(d=>d.id===id);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:27,fontWeight:600}}>Cômodos</h1>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:2}}>{rooms.length} cômodos</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={13}/>Novo cômodo</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {rooms.map(r=>{
          const Icon = getIcon(r.icon);
          const ri = items.filter(i=>i.roomId===r.id);
          const bgt = ri.filter(i=>i.status==="bought").length;
          const tot = ri.length;
          const p   = tot>0?Math.round((bgt/tot)*100):0;
          const val = ri.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
          const high= ri.filter(i=>i.priority==="high"&&i.status!=="bought").length;

          return (
            <div key={r.id} className="card c-lift au" style={{padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:42,height:42,borderRadius:12,background:`${r.color}20`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Icon size={20} style={{color:r.color}}/>
                  </div>
                  <div>
                    <h3 style={{fontWeight:700,fontSize:15}}>{r.name}</h3>
                    <p style={{fontSize:11.5,color:"var(--text3)"}}>{tot} {tot===1?"item":"itens"}</p>
                  </div>
                </div>
                {!isDefault(r.id) && (
                  <button className="btn btn-ghost btn-icon btn-danger" onClick={()=>onDeleteRoom(r.id)}><Trash2 size={13}/></button>
                )}
              </div>
              {tot>0?(
                <>
                  <div className="ptrack" style={{marginBottom:8}}>
                    <div className="pfill" style={{width:`${p}%`,background:r.color}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)"}}>
                    <span>{bgt}/{tot} comprados ({p}%)</span>
                    <span style={{display:"flex",gap:8,alignItems:"center"}}>
                      {high>0&&<span className="bdg bdg-high">{high} alta prio</span>}
                      {val>0&&<span style={{color:r.color,fontWeight:700}}>{fmt(val)}</span>}
                    </span>
                  </div>
                </>
              ):(
                <p style={{fontSize:12.5,color:"var(--text3)",fontStyle:"italic"}}>Nenhum item ainda</p>
              )}
            </div>
          );
        })}
      </div>
      {showModal && <RoomModal onSave={(d)=>{onAddRoom(d);setShowModal(false);}} onClose={()=>setShowModal(false)}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   10. MAIN APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [dk,     setDk]     = useState(false);
  const [view,   setView]   = useState("dashboard");
  const [items,  setItems]  = useState([]);
  const [rooms,  setRooms]  = useState(DEFAULT_ROOMS);
  const [date,   setDate]   = useState("");
  const [budget, setBudget] = useState(null);
  const [couple, setCouple] = useState(false);
  const [loading,setLoading]= useState(true);
  const [sidebar,setSidebar]= useState(false);

  // Modals
  const [quickModal,   setQuickModal]   = useState(false);
  const [itemModal,    setItemModal]    = useState(null); // null | "new" | item
  const [budgetModal,  setBudgetModal]  = useState(false);
  const [shareModal,   setShareModal]   = useState(false);
  const [homeModal,    setHomeModal]    = useState(false);

  /* ── Load ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [si,sr,sd,sb,sc,sdk] = await Promise.all([
        Storage.get("env:items",[]), Storage.get("env:rooms",DEFAULT_ROOMS),
        Storage.get("env:date",""), Storage.get("env:budget",null),
        Storage.get("env:couple",false), Storage.get("env:dk",false),
      ]);
      let finalItems = si;
      if (sc) {
        const shared = await Storage.get("env:items:shared",[],true);
        if (shared.length) finalItems = shared;
      }
      setItems(finalItems); setRooms(sr); setDate(sd);
      setBudget(sb); setCouple(sc); setDk(sdk);
      setLoading(false);
    })();
  }, []);

  /* ── Persist ── */
  useEffect(() => { if(!loading){ Storage.set("env:items",items); if(couple) Storage.set("env:items:shared",items,true); }}, [items,loading,couple]);
  useEffect(() => { if(!loading) Storage.set("env:rooms",rooms); }, [rooms,loading]);
  useEffect(() => { if(!loading) Storage.set("env:date",date); }, [date,loading]);
  useEffect(() => { if(!loading) Storage.set("env:budget",budget); }, [budget,loading]);
  useEffect(() => { if(!loading) Storage.set("env:couple",couple); }, [couple,loading]);
  useEffect(() => { if(!loading) Storage.set("env:dk",dk); }, [dk,loading]);
  useEffect(() => { dk ? document.body.classList.add("dk") : document.body.classList.remove("dk"); }, [dk]);

  /* ── Item CRUD ── */
  const saveItem = useCallback((data) => {
    if (data.id) setItems(p => p.map(i => i.id===data.id ? data : i));
    else setItems(p => [...p, { ...data, id:uid(), createdAt:new Date().toISOString() }]);
    setItemModal(null);
  }, []);

  const toggleItem   = useCallback((item) => setItems(p => p.map(i => i.id===item.id ? {...i,status:i.status==="bought"?"want":"bought"} : i)), []);
  const deleteItem   = useCallback((id)   => { if(confirm("Excluir este item?")) setItems(p=>p.filter(i=>i.id!==id)); }, []);
  const duplicateItem= useCallback((item) => setItems(p=>[...p,{...item,id:uid(),status:"want",createdAt:new Date().toISOString()}]), []);
  const starItem     = useCallback((item) => setItems(p=>p.map(i=>i.id===item.id?{...i,starred:!i.starred}:i)), []);
  const addItems     = useCallback((arr)  => { setItems(p=>[...p,...arr]); setHomeModal(false); }, []);
  const addRoom      = useCallback((data) => {
    const id = data.name.toLowerCase().replace(/\s+/g,"-")+"-"+Date.now();
    setRooms(p=>[...p,{...data,id}]);
  }, []);
  const deleteRoom = useCallback((id) => {
    if (items.some(i=>i.roomId===id)) { alert("Remova os itens deste cômodo primeiro."); return; }
    if (confirm("Excluir este cômodo?")) setRooms(p=>p.filter(r=>r.id!==id));
  }, [items]);

  const openAdd = useCallback((prefill=null) => {
    if (prefill?.prefillName) {
      setItemModal({ prefillName:prefill.prefillName, prefillRoom:prefill.prefillRoom });
    } else {
      setItemModal("new");
    }
  }, []);

  /* ── Export CSV ── */
  const exportCSV = useCallback(() => {
    const h = ["Nome","Cômodo","Status","Preço","Prioridade","Loja","Link","Notas","Favorito"];
    const r = items.map(i => {
      const room  = rooms.find(x=>x.id===i.roomId);
      const store = getStore(i.link);
      return [i.name,room?.name||"",i.status==="bought"?"Comprado":"Quero comprar",i.price||"",i.priority||"normal",store?.name||"",i.link||"",i.notes||"",i.starred?"Sim":"Não"];
    });
    const csv = [h,...r].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv); a.download="enxoval.csv"; a.click();
  }, [items,rooms]);

  /* ── Loading screen ── */
  if (loading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,background:"var(--bg)"}}>
      <Styles/>
      <div style={{width:54,height:54,borderRadius:16,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Home size={26} style={{color:"white"}}/>
      </div>
      <Loader2 size={22} style={{color:"var(--primary)",animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const navItems = [
    { id:"dashboard", label:"Dashboard",  icon:LayoutDashboard, count:null },
    { id:"items",     label:"Meus Itens", icon:ShoppingBag,     count:items.length },
    { id:"rooms",     label:"Cômodos",    icon:Home,            count:rooms.length },
  ];
  const pendingCount = items.filter(i=>i.status!=="bought").length;

  return (
    <div className={dk?"dk":""} style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
      <Styles/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fabIn{from{opacity:0;transform:scale(.5) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

      {/* Sidebar backdrop mobile */}
      {sidebar && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:90}} onClick={()=>setSidebar(false)}/>}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebar?"open":""}`} style={{
        width:228, background:"var(--bg2)", borderRight:"1px solid var(--border)",
        padding:"18px 13px", display:"flex", flexDirection:"column", gap:3, zIndex:100,
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,paddingLeft:4}}>
          <div style={{width:36,height:36,borderRadius:11,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Home size={18} style={{color:"white"}}/>
          </div>
          <div>
            <span className="fd" style={{fontSize:17,fontWeight:600,fontStyle:"italic",color:"var(--text)"}}>Enxoval</span>
            {couple && <div style={{fontSize:9,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:".07em",marginTop:1}}>♥ Modo Casal</div>}
          </div>
        </div>

        {/* Nav */}
        {navItems.map(n => {
          const Icon = n.icon;
          return (
            <button key={n.id} className={`nb ${view===n.id?"on":""}`}
              onClick={()=>{setView(n.id);setSidebar(false);}}>
              <Icon size={15}/>{n.label}
              {n.count !== null && <span className="nc">{n.count}</span>}
            </button>
          );
        })}

        <div style={{flex:1}}/>

        {/* Summary */}
        <div style={{background:"var(--bg3)",borderRadius:11,padding:"13px",marginBottom:10}}>
          <p style={{fontSize:9.5,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9}}>Resumo rápido</p>
          {[
            {l:"Total",     v:items.length,                               c:"var(--text)"},
            {l:"Comprados", v:items.filter(i=>i.status==="bought").length, c:"var(--green)"},
            {l:"Pendentes", v:pendingCount,                                c:"var(--primary)"},
            {l:"Favoritos", v:items.filter(i=>i.starred).length,           c:"var(--gold)"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12.5,padding:"2.5px 0"}}>
              <span style={{color:"var(--text3)"}}>{s.l}</span>
              <span style={{fontWeight:700,color:s.c}}>{s.v}</span>
            </div>
          ))}
        </div>

        {/* Bottom buttons */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
          {[
            { icon:dk?Sun:Moon, fn:()=>setDk(d=>!d), title:dk?"Claro":"Escuro", active:false },
            { icon:Heart,       fn:()=>setShareModal(true), title:"Casal", active:couple, ac:"var(--primary)" },
            { icon:Download,    fn:exportCSV, title:"CSV", active:false },
          ].map((b,i)=>{
            const Icon = b.icon;
            return (
              <button key={i} className="btn btn-ghost btn-icon" onClick={b.fn} title={b.title}
                style={{background:"var(--bg3)",width:"100%",height:33,borderRadius:9,
                  color:b.active?b.ac:"var(--text3)"}}>
                <Icon size={14} style={b.active?{fill:b.ac}:{}}/>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        {/* Topbar */}
        <div className="topbar">
          <button className="btn btn-ghost btn-icon" onClick={()=>setSidebar(s=>!s)} style={{background:"var(--bg3)",flexShrink:0}}>
            <Layers size={16}/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
            <span className="fd" style={{fontWeight:600,fontSize:16,fontStyle:"italic",whiteSpace:"nowrap"}}>
              {navItems.find(n=>n.id===view)?.label}
            </span>
            {pendingCount > 0 && view==="dashboard" && (
              <span style={{background:"var(--primary)",color:"white",fontSize:10.5,fontWeight:700,padding:"2px 8px",borderRadius:99,flexShrink:0}}>
                {pendingCount} pendentes
              </span>
            )}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button className="btn btn-secondary" style={{padding:"7px 11px",fontSize:12.5}} onClick={()=>setQuickModal(true)}>
              <Zap size={13}/>Rápido
            </button>
            <button className="btn btn-primary" style={{padding:"7px 13px",fontSize:12.5}} onClick={()=>openAdd()}>
              <Plus size={13}/>Item
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"24px 20px"}}>
          <div style={{maxWidth:900,margin:"0 auto"}}>
            {view==="dashboard" && (
              <Dashboard items={items} rooms={rooms} deliveryDate={date} onSetDate={setDate}
                budget={budget} onOpenBudget={()=>setBudgetModal(true)}
                onQuickAdd={()=>setQuickModal(true)} onAddItem={()=>openAdd()}
                onCompleteHome={()=>setHomeModal(true)} coupleMode={couple}/>
            )}
            {view==="items" && (
              <ItemsView items={items} rooms={rooms} onAdd={openAdd}
                onQuickAdd={()=>setQuickModal(true)} onToggle={toggleItem}
                onEdit={setItemModal} onDelete={deleteItem}
                onDuplicate={duplicateItem} onStar={starItem}/>
            )}
            {view==="rooms" && (
              <RoomsView rooms={rooms} items={items} onAddRoom={addRoom} onDeleteRoom={deleteRoom}/>
            )}
          </div>
        </div>
      </main>

      {/* FAB (mobile only) */}
      <FAB onClick={()=>setQuickModal(true)}/>

      {/* ── Modals ── */}
      {quickModal && (
        <QuickAddModal rooms={rooms} items={items}
          onSave={(data)=>{saveItem(data);setQuickModal(false);}}
          onClose={()=>setQuickModal(false)}/>
      )}
      {itemModal && (
        <ItemModal
          item={typeof itemModal==="object"&&itemModal!==null&&!itemModal.prefillName ? itemModal
            : itemModal?.prefillName ? {name:itemModal.prefillName, roomId:itemModal.prefillRoom||rooms[0]?.id}
            : null}
          rooms={rooms} onSave={saveItem} onClose={()=>setItemModal(null)}/>
      )}
      {budgetModal  && <BudgetModal budget={budget} onSave={(b)=>{setBudget(b);setBudgetModal(false);}} onClose={()=>setBudgetModal(false)}/>}
      {shareModal   && <ShareModal coupleMode={couple} onToggle={()=>setCouple(c=>!c)} onClose={()=>setShareModal(false)}/>}
      {homeModal    && <CompleteHomeModal rooms={rooms} items={items} onAddItems={addItems} onClose={()=>setHomeModal(false)}/>}
    </div>
  );
}
