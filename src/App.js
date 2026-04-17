// src/App.js — versão com Supabase Auth + banco de dados
"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useReducer } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, CartesianGrid } from "recharts";
import {
  Home, Plus, Trash2, ExternalLink, Check, Search, Moon, Sun,
  Package, ShoppingBag, DollarSign, Clock, X, Edit3, Layers,
  Loader2, Sofa, Bath, UtensilsCrossed, BedDouble, Star, Grid3X3,
  List, AlertCircle, Download, Heart, Target, Zap, Sparkles,
  Flame, CheckCircle2, Circle, BarChart2, TrendingUp, Wallet,
  Copy, ArrowRight, LayoutDashboard, Lightbulb, AlertTriangle,
  Bell, Award, RefreshCw, ChevronDown, ChevronUp, BadgePercent,
  RotateCcw, Trash, LogOut, User, SlidersHorizontal, SortAsc,
  ShoppingCart, Boxes, PiggyBank, ArrowLeft, FileText, TrendingDown,
  Filter, ArrowUpDown, Eye, BarChart3,
  PieChart as PieChartIcon, // ✅ FIX
  CalendarCheck
} from "lucide-react";

// ── Hooks Supabase ───────────────────────────────────────
import { useAuth }     from "./lib/hooks/useAuth";
import { useItems }    from "./lib/hooks/useItems";
import { useRooms }    from "./lib/hooks/useRooms";
import { useSettings } from "./lib/hooks/useSettings";

// ── Componentes ──────────────────────────────────────────
import AuthScreen     from "./components/AuthScreen";
import HouseholdModal from "./components/HouseholdModal";

import dynamic from "next/dynamic";

const RoomCharts = dynamic(() => import("./RoomCharts"), {
  ssr: false
});

// ════════════════════════════════════════════════════════
// STYLES (idêntico ao v4 — mantido para brevidade)
// ════════════════════════════════════════════════════════
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#F5F0E6;--bg2:#EBE3D3;--bg3:#DDD4BF;
      --bdr:#C8B99E;--bdr2:#B5A486;
      --p:#1272AA;--pl:#1E90CC;--pd:#0C5884;--pa:rgba(18,114,170,.13);
      --g:#2A9D8F;--ga:rgba(42,157,143,.14);
      --go:#E9A830;--goa:rgba(233,168,48,.14);
      --r:#D94F5C;--ra:rgba(217,79,92,.12);
      --b:#7058C8;--ba:rgba(112,88,200,.12);
      --tx:#102030;--tx2:#325870;--tx3:#6A92A8;
      --rd:14px;--rs:9px;
      --sh:0 2px 10px rgba(22,37,48,.08);
      --shl:0 8px 36px rgba(22,37,48,.14);
      --f:'Inter',sans-serif;--fd:'DM Serif Display',serif;
    }
    .dk{
      --bg:#0C1C28;--bg2:#122436;--bg3:#182E46;
      --bdr:#1E3A54;--bdr2:#284E6E;
      --p:#2AB6F0;--pl:#50CCFF;--pd:#1494CC;--pa:rgba(42,182,240,.16);
      --g:#35BFB0;--ga:rgba(53,191,176,.15);
      --go:#F4C24A;--goa:rgba(244,194,74,.15);
      --r:#F45C6E;--ra:rgba(244,92,110,.14);
      --tx:#DFF0FA;--tx2:#7AB4CC;--tx3:#3E6E84;
    }
    body{font-family:var(--f);background:var(--bg);color:var(--tx);transition:background .3s,color .3s}
    .fd{font-family:var(--fd)}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-track{background:var(--bg2)}
    ::-webkit-scrollbar-thumb{background:var(--bdr2);border-radius:99px}
    @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes shimmer{0%{background-position:-300% 0}100%{background-position:300% 0}}
    @keyframes checkPop{0%{transform:scale(1)}40%{transform:scale(1.18)}70%{transform:scale(.95)}100%{transform:scale(1)}}
    @keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(18,114,170,.4)}70%{box-shadow:0 0 0 10px rgba(18,114,170,0)}100%{box-shadow:0 0 0 0 rgba(18,114,170,0)}}
    @keyframes fabIn{from{opacity:0;transform:scale(.5) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes promoGlow{0%,100%{box-shadow:0 0 0 0 rgba(233,168,48,.25)}50%{box-shadow:0 0 10px 2px rgba(233,168,48,.18)}}
    @keyframes toastIn{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
    @keyframes toastOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(8px)}}
    .au{animation:slideUp .35s ease both}
    .shimmer{background:linear-gradient(90deg,var(--bg3) 25%,var(--bg2) 50%,var(--bg3) 75%);background-size:300% 100%;animation:shimmer 1.6s infinite;border-radius:8px;display:block}
    .card{background:var(--bg2);border:1px solid var(--bdr);border-radius:var(--rd);transition:border-color .2s,box-shadow .2s,transform .2s}
    .clift:hover{border-color:var(--pl);box-shadow:var(--shl);transform:translateY(-2px)}
    .ic{background:var(--bg2);border:1.5px solid var(--bdr);border-radius:var(--rd);transition:all .22s ease;position:relative;overflow:hidden}
    .ic::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3.5px;background:var(--bdr2);opacity:.5;transition:all .2s}
    .ic:hover{border-color:var(--pl);box-shadow:var(--shl);transform:translateY(-1px)}
    .ic:hover::before{background:var(--p);opacity:1}
    .ic.bought{opacity:.58}.ic.bought::before{background:var(--g);opacity:1}
    .ic.phi::before{background:var(--r);opacity:1}.ic.phi{border-color:rgba(217,79,92,.25)}
    .ic.starred::before{background:var(--go);opacity:1}
    .ic.promo{animation:promoGlow 3s ease infinite}.ic.promo::before{background:var(--go);opacity:1}
    .btn{display:inline-flex;align-items:center;gap:6px;font-family:var(--f);font-weight:600;border:none;cursor:pointer;transition:all .18s ease;border-radius:var(--rs);font-size:13px}
    .btn-p{background:var(--p);color:#fff;padding:10px 18px}
    .btn-p:hover{background:var(--pd);transform:translateY(-1px);box-shadow:0 4px 16px var(--pa)}
    .btn-s{background:var(--bg3);color:var(--tx);padding:10px 18px;border:1px solid var(--bdr)}
    .btn-s:hover{border-color:var(--p);color:var(--p)}
    .btn-g{background:transparent;color:var(--tx3);padding:7px 9px;border-radius:8px;border:none}
    .btn-g:hover{background:var(--bg3);color:var(--tx)}
    .bico{width:34px;height:34px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center}
    .bdng:hover{color:var(--r)!important;background:var(--ra)!important}
    .bstr.on{color:var(--go)!important}
    .pulse{animation:pulseRing 2.2s infinite}
    .inp{font-family:var(--f);font-size:14px;color:var(--tx);background:var(--bg);border:1.5px solid var(--bdr);border-radius:var(--rs);padding:10px 14px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s}
    .inp:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--pa)}
    .inp::placeholder{color:var(--tx3)}
    .lbl{font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:5px}
    .bdg{display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:99px;font-size:10.5px;font-weight:700}
    .bw{background:var(--pa);color:var(--p)}.bd{background:var(--ga);color:var(--g)}.bh{background:var(--ra);color:var(--r)}
    .chip{padding:5px 13px;border-radius:99px;font-size:12.5px;font-weight:600;cursor:pointer;border:1.5px solid var(--bdr);background:transparent;color:var(--tx3);transition:all .18s;white-space:nowrap;font-family:var(--f)}
    .chip:hover{border-color:var(--p);color:var(--p)}.chip.on{background:var(--p);border-color:var(--p);color:#fff}
    .sch{padding:5px 11px;border-radius:99px;font-size:12px;font-weight:500;cursor:pointer;border:1.5px dashed var(--bdr2);background:transparent;color:var(--tx2);transition:all .18s;font-family:var(--f);display:inline-flex;align-items:center;gap:4px}
    .sch:hover{border-color:var(--p);color:var(--p);background:var(--pa);border-style:solid}
    .ptr{height:7px;background:var(--bg3);border-radius:99px;overflow:hidden}
    .pfl{height:100%;border-radius:99px;transition:width .75s cubic-bezier(.4,0,.2,1)}
    .mbk{position:fixed;inset:0;background:rgba(12,28,40,.6);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease}
    .modal{background:var(--bg);border:1px solid var(--bdr);border-radius:20px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;animation:scaleIn .25s ease;box-shadow:0 28px 80px rgba(0,0,0,.22)}
    .nb{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:600;color:var(--tx3);border:none;background:transparent;width:100%;text-align:left;transition:all .18s;font-family:var(--f)}
    .nb:hover{background:var(--bg3);color:var(--tx)}.nb.on{background:var(--p);color:#fff}
    .nc{margin-left:auto;font-size:11px;padding:1px 7px;border-radius:99px}
    .nb.on .nc{background:rgba(255,255,255,.22)}.nb:not(.on) .nc{background:var(--bg3);color:var(--tx3)}
    .sidebar{position:fixed;top:0;left:0;bottom:0;z-index:100;transition:transform .3s ease}
    @media(max-width:768px){.sidebar{transform:translateX(-100%)}.sidebar.open{transform:translateX(0)}.fab{display:flex!important}}
    @media(min-width:769px){.sidebar{position:sticky}.fab{display:none!important}}
    .topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:var(--bg2);border-bottom:1px solid var(--bdr);position:sticky;top:0;z-index:50;gap:10px}
    .ins{display:flex;gap:10px;align-items:flex-start;padding:11px 14px;border-radius:10px;font-size:13px;line-height:1.45}
    .ins-info{background:var(--ba);border:1px solid rgba(112,88,200,.2);color:var(--b)}
    .ins-warn{background:var(--goa);border:1px solid rgba(233,168,48,.25);color:var(--go)}
    .ins-alert{background:var(--ra);border:1px solid rgba(217,79,92,.22);color:var(--r)}
    .ins-ok{background:var(--ga);border:1px solid rgba(42,157,143,.22);color:var(--g)}
    .stat{background:var(--bg2);border:1px solid var(--bdr);border-radius:var(--rd);padding:16px 18px;animation:slideUp .35s ease both}
    .empty{text-align:center;padding:64px 24px;display:flex;flex-direction:column;align-items:center;gap:14px}
    .eico{width:72px;height:72px;border-radius:20px;background:var(--bg3);display:flex;align-items:center;justify-content:center}
    .sbdg{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:10.5px;font-weight:700;letter-spacing:.02em}
    .aitag{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:linear-gradient(135deg,var(--pa),var(--ba));color:var(--p);border:1px solid var(--pa)}
    .fab{position:fixed;bottom:24px;right:20px;z-index:80;width:54px;height:54px;border-radius:50%;background:var(--p);color:#fff;border:none;cursor:pointer;align-items:center;justify-content:center;box-shadow:0 4px 20px var(--pa);animation:fabIn .4s cubic-bezier(.34,1.56,.64,1) both;display:none}
    .price-row{display:flex;align-items:center;justify-content:space-between;padding:7px 12px;font-size:12.5px;border-bottom:1px solid var(--bdr)}
    .price-row:last-child{border-bottom:none}
    .price-row.best{background:rgba(42,157,143,.08)}
    .best-tag{font-size:9px;font-weight:800;padding:2px 6px;border-radius:99px;background:var(--ga);color:var(--g);text-transform:uppercase;letter-spacing:.05em}
    .promo-strip{background:linear-gradient(90deg,var(--goa),rgba(233,168,48,.04));border:1px solid rgba(233,168,48,.35);border-radius:8px;padding:5px 10px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--go)}
    .trash-card{background:var(--bg2);border:1.5px solid var(--bdr);border-radius:var(--rd);padding:14px 16px;opacity:.75;transition:all .2s}
    .trash-card:hover{opacity:1;border-color:var(--bdr2)}
    .toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);z-index:300;display:flex;align-items:center;gap:10px;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.2);white-space:nowrap;pointer-events:none;animation:toastIn .3s ease both}
  `}</style>
);

// ════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════
// FIX #2: chave normalizada pelo NOME do cômodo (não id UUID)
// Salas do Supabase têm UUIDs; normalizamos para match por nome
const ROOM_SUGGESTIONS_BY_NAME = {
  "quarto":   ["Cama box","Colchão","Cabeceira","Guarda-roupa","Cômoda","Criado-mudo","Espelho","Cortina","Edredom","Travesseiro","Abajur"],
  "sala":     ["Sofá","Mesa de centro","Rack TV","Televisão","Tapete","Luminária","Quadro","Poltrona","Prateleira","Cortina","Aparador"],
  "cozinha":  ["Geladeira","Fogão","Micro-ondas","Panelas","Talheres","Pratos","Copos","Liquidificador","Lixeira","Escorredor","Tábua de corte"],
  "banheiro": ["Toalha de banho","Toalha de rosto","Tapete","Espelho","Porta-shampoo","Saboneteira","Suporte papel","Lixeira"],
};
// Helper: dado um room id, retorna suas sugestões pelo nome normalizado
function getRoomSuggestions(roomId, rooms, existingItems) {
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeItems = Array.isArray(existingItems) ? existingItems : [];

  const room = safeRooms.find(r => r?.id === roomId);
  if (!room || !room?.name) return [];

  const key = room.name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  const list =
    ROOM_SUGGESTIONS_BY_NAME[key] ||
    Object.entries(ROOM_SUGGESTIONS_BY_NAME).find(([k]) =>
      key.includes(k)
    )?.[1] ||
    [];

  return list
    .filter(s =>
      !safeItems.some(i => i?.name?.toLowerCase?.() === s.toLowerCase())
    )
    .slice(0, 6);
}

const STORE_MAP = [
  {p:"amazon.com.br",       n:"Amazon",       bg:"#FF9900",fg:"#000"},
  {p:"mercadolivre.com.br", n:"Mercado Livre",bg:"#FFE600",fg:"#333"},
  {p:"shopee.com.br",       n:"Shopee",       bg:"#EE4D2D",fg:"#fff"},
  {p:"magazineluiza.com.br",n:"Magalu",       bg:"#0066CC",fg:"#fff"},
  {p:"casasbahia.com.br",   n:"Casas Bahia",  bg:"#F7941D",fg:"#fff"},
  {p:"americanas.com.br",   n:"Americanas",   bg:"#E8192C",fg:"#fff"},
  {p:"leroymerlin.com.br",  n:"Leroy Merlin", bg:"#78BE1F",fg:"#fff"},
];

const ICONS_MAP = {
  bed:BedDouble,sofa:Sofa,utensils:UtensilsCrossed,bath:Bath,
  home:Home,star:Star,zap:Zap,heart:Heart,target:Target,package:Package,
  shopping:ShoppingBag,dollar:DollarSign,layers:Layers,boxes:Boxes,
  wallet:Wallet,sparkles:Sparkles,bell:Bell,award:Award,
};
const PALETTE = ["#1272AA","#2A9D8F","#E9A830","#7058C8","#D4875A","#D94F7A","#20B2AA","#5D9E3A"];

const getIcon  = (k) => ICONS_MAP[k] || Home;
const uid      = ()  => Math.random().toString(36).slice(2)+Date.now().toString(36);
const fmt = useCallback((v) => { const n=parseFloat(v); return isNaN(n)?"—":n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); };
const daysLeft = (d) => { if(!d) return null; try{const t=new Date(d+"T00:00:00"),n=new Date();n.setHours(0,0,0,0);return Math.round((t-n)/86400000);}catch{return null;} };
const getStore = (url) => { if(!url) return null; try{const h=new URL(url).hostname.toLowerCase();return STORE_MAP.find(s=>h.includes(s.p))||null;}catch{return null;} };
const todayStr = () => new Date().toISOString().slice(0,10);
const isActive  = (i) => !i?.deletedAt;
const isDeleted = (i) => !!i?.deletedAt;
const TRASH_DAYS = 30;
const trashDaysLeft = (item) => {
  if(!item?.deletedAt) return null;
  try{const d=new Date(item.deletedAt),exp=new Date(d.getTime()+TRASH_DAYS*86400000);return Math.max(0,Math.ceil((exp-new Date())/86400000));}catch{return null;}
};
const getPromoInfo = (item) => {
  const cur=parseFloat(item?.price);
  if(!item?.price||isNaN(cur)||cur<=0) return null;
  const prices=(item.priceHistory||[]).map(h=>parseFloat(h.price)).filter(p=>!isNaN(p)&&p>0);
  if(!prices.length) return null;
  const ref=Math.max(...prices);
  if(ref<=cur) return null;
  const disc=Math.round(((ref-cur)/ref)*100);
  return disc>=10?{discount:disc,originalPrice:ref}:null;
};

// ════════════════════════════════════════════════════════
// AI SERVICE — rotas Next.js locais
// ════════════════════════════════════════════════════════
const AI = {
  extractProduct: async (url) => {
    const res = await fetch("/api/extract-product",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({url}),
    });
    if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.detail||e.error||`Erro ${res.status}`);}
    return res.json();
  },
  comparePrice: async (productName) => {
    const res = await fetch("/api/compare-prices",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({productName}),
    });
    if(!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  },
  completeHome: async (rooms,items,aptSize) => {
    const res = await fetch("/api/complete-home",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({rooms,items,aptSize}),
    });
    if(!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  },
};

// ════════════════════════════════════════════════════════
// PRIMITIVES (Sk, StoreBadge, DeleteButton, Toast, etc.)
// ════════════════════════════════════════════════════════
const Sk = ({w="100%",h=14,r=8}) => (
  <span className="shimmer" style={{width:w,height:h,borderRadius:r,display:"block"}}/>
);

const StoreBadge = ({url}) => {
  const s=getStore(url); if(!s) return null;
  return <span className="sbdg" style={{background:s.bg,color:s.fg}}>{s.n}</span>;
};

const PromoBadge = ({promoInfo}) => {
  if(!promoInfo) return null;
  return (
    <div className="promo-strip">
      <BadgePercent size={13}/>
      <span>🔥 Em promoção — {promoInfo.discount}% OFF</span>
      <span style={{fontWeight:400,opacity:.7,marginLeft:4,textDecoration:"line-through",fontSize:11}}>
        era {fmt(promoInfo.originalPrice)}
      </span>
    </div>
  );
};

// FIX #4: BudgetInput com debounce — evita salvar a cada tecla
function BudgetInput({ value, onSave }) {
  const [local, setLocal] = useState(value ?? "");
  const timerRef = useRef(null);

  // Sincroniza quando valor externo muda (ex: outro dispositivo)
  useEffect(() => { setLocal(value ?? ""); }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timerRef.current);
    // Salva 800ms após parar de digitar
    timerRef.current = setTimeout(() => {
      onSave(parseFloat(v) || null);
    }, 800);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <input
      type="number" min="0" step="100"
      placeholder="Orçamento total R$"
      value={local}
      onChange={handleChange}
      style={{
        width: 180, padding: "6px 10px",
        background: "var(--bg)", border: "1.5px solid var(--bdr)",
        borderRadius: 8, fontFamily: "var(--f)", fontSize: 12.5,
        color: "var(--tx)", outline: "none",
        transition: "border-color .2s",
      }}
      onFocus={e => e.target.style.borderColor = "var(--p)"}
      onBlur={e  => e.target.style.borderColor = "var(--bdr)"}
    />
  );
}

function DeleteButton({onConfirm,size=13}) {
  const [armed,setArmed]=useState(false);
  const tr=useRef(null);
  const handle=(e)=>{e.stopPropagation();if(!armed){setArmed(true);tr.current=setTimeout(()=>setArmed(false),3000);}else{clearTimeout(tr.current);onConfirm();}};
  useEffect(()=>()=>clearTimeout(tr.current),[]);
  return (
    <button className="btn btn-g bico" onClick={handle} title={armed?"Confirmar exclusão":"Excluir"}
      style={{color:armed?"white":undefined,background:armed?"var(--r)":undefined,
        padding:armed?"4px 9px":undefined,gap:4,fontSize:armed?11:undefined,fontWeight:armed?700:undefined,transition:"all .2s"}}>
      <Trash2 size={size}/>{armed&&"Confirmar"}
    </button>
  );
}

function Toast({toasts}) {
  if(!toasts.length) return null;
  const t=toasts[toasts.length-1];
  const c={success:"var(--g)",error:"var(--r)",info:"var(--p)",warn:"var(--go)",trash:"#666"};
  return <div className="toast" style={{background:c[t.type]||c.info,color:"white"}}>{t.message}</div>;
}

const InsightCard = ({type="info",text,Icon=Lightbulb,delay=0}) => (
  <div className={`ins ins-${type}`} style={{animationDelay:`${delay}s`}}>
    <Icon size={14} style={{marginTop:1,flexShrink:0}}/><span>{text}</span>
  </div>
);

// ════════════════════════════════════════════════════════
// PRICE PANEL
// ════════════════════════════════════════════════════════
function PricePanel({item,onUpdatePrice}) {
  const [open,setOpen]=useState(false);
  const [loading,setLoading]=useState(false);
  const [offers,setOffers]=useState(Array.isArray(item?.priceOffers)?item.priceOffers:[]);
  const [error,setError]=useState("");
  const fetched=offers.length>0;

  const doCompare=async()=>{
    if(!item?.name) return;
    setLoading(true);setError("");setOpen(true);
    try{
      const r=await AI.comparePrice(item.name);
      const valid=(r?.offers||[]).filter(o=>o?.price>0).sort((a,b)=>a.price-b.price).slice(0,6);
      setOffers(valid);
      if(valid.length>0&&onUpdatePrice) onUpdatePrice(item.id,valid);
    }catch{setError("Não foi possível buscar os preços agora.");}
    finally{setLoading(false);}
  };

  const best=offers[0];
  const curPrc=parseFloat(item?.price);
  const saving=best&&!isNaN(curPrc)&&curPrc>best.price?curPrc-best.price:0;

  return (
    <div style={{marginTop:9,paddingTop:9,borderTop:"1px solid var(--bdr)"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
        {!fetched?(
          <button onClick={doCompare} disabled={loading} className="btn btn-g"
            style={{fontSize:11.5,fontWeight:700,color:"var(--p)",gap:4,padding:"4px 9px",background:"var(--pa)",borderRadius:8}}>
            {loading?<><Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>Buscando...</>
                    :<><BarChart2 size={12}/>Comparar preços</>}
          </button>
        ):(
          <>
            {best&&(
              <div style={{display:"flex",alignItems:"center",gap:6,flex:1,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:800,color:"var(--g)"}}>🏆 {fmt(best.price)}</span>
                <span className="best-tag">{best.store}</span>
                {saving>0&&<span style={{fontSize:11,color:"var(--g)",background:"var(--ga)",padding:"1px 7px",borderRadius:99,fontWeight:700}}>economize {fmt(saving)}</span>}
              </div>
            )}
            <button onClick={()=>setOpen(o=>!o)} className="btn btn-g" style={{fontSize:11,padding:"3px 8px",gap:3,marginLeft:"auto"}}>
              {open?<ChevronUp size={12}/>:<ChevronDown size={12}/>}{open?"Ocultar":`${offers.length} lojas`}
            </button>
            <button onClick={doCompare} disabled={loading} className="btn btn-g bico" title="Atualizar">
              <RefreshCw size={12} style={loading?{animation:"spin 1s linear infinite"}:{}}/>
            </button>
          </>
        )}
      </div>
      {error&&<p style={{fontSize:11.5,color:"var(--r)",marginTop:6}}>{error} <button onClick={doCompare} style={{color:"var(--p)",background:"none",border:"none",cursor:"pointer",fontSize:11.5,fontWeight:700}}>Tentar novamente</button></p>}
      {fetched&&open&&(
        <div style={{marginTop:9,background:"var(--bg3)",borderRadius:10,overflow:"hidden",border:"1px solid var(--bdr)"}}>
          {offers.map((o,i)=>(
            <div key={i} className={`price-row ${i===0?"best":""}`}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                {i===0&&<span style={{fontSize:11}}>🏆</span>}
                <span style={{fontWeight:600,color:"var(--tx)"}}>{o.store}</span>
                {!o.inStock&&<span style={{fontSize:10,color:"var(--r)"}}>indisponível</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontWeight:800,fontSize:13.5,color:i===0?"var(--g)":"var(--tx)"}}>{fmt(o.price)}</span>
                {o.url&&<a href={o.url} target="_blank" rel="noopener noreferrer" className="btn btn-g bico" style={{textDecoration:"none",width:26,height:26}}><ExternalLink size={11}/></a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// QUICK ADD MODAL
// ════════════════════════════════════════════════════════
function QuickAddModal({rooms=[],items=[],onSave,onClose}) {
  const [url,setUrl]=useState("");
  const [name,setName]=useState("");
  const [roomId,setRoomId]=useState(rooms[0]?.id||"");
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState(1);
  const [extracted,setExtracted]=useState(null);
  const [error,setError]=useState("");
  const urlRef=useRef(null);
  useEffect(()=>{setTimeout(()=>urlRef.current?.focus(),80);},[]);

  const doExtract=useCallback(async(target)=>{
    const u=(target||url).trim();
    if(!u||!u.startsWith("http")) return;
    setLoading(true);setError("");setStep(2);
    try{
      const info=await AI.extractProduct(u);
      setExtracted(info||{});
      if(info?.name) setName(info.name);
      if(info?.suggestedRoom&&info.suggestedRoom!=="outro"){
        const m=rooms.find(r=>r.id===info.suggestedRoom);
        if(m) setRoomId(m.id);
      }
    }catch(e){setError("Não consegui extrair automaticamente. Preencha manualmente. ("+e.message+")");}
    finally{setLoading(false);}
  },[url,rooms]);

  const handlePaste=useCallback((e)=>{
    const t=e.clipboardData?.getData("text")||"";
    if(t.startsWith("http")){e.preventDefault();setUrl(t);setTimeout(()=>doExtract(t),80);}
    else if(t.length>2){setName(t);setStep(2);}
  },[doExtract]);

  const handleSave=()=>{
    if(!name.trim()||!roomId) return;
    const priceStr=extracted?.price?String(extracted.price):"";
    onSave({name:name.trim(),link:url.trim(),price:priceStr,imageUrl:extracted?.imageUrl||"",
      status:"want",priority:"normal",roomId,notes:extracted?.brand?`Marca: ${extracted.brand}`:"",
      starred:false,priceHistory:priceStr?[{price:parseFloat(priceStr),date:todayStr(),source:"auto"}]:[],priceOffers:[]});
  };

  // FIX #2: usa nome do cômodo para buscar sugestões, não o UUID
  const suggs=getRoomSuggestions(roomId, rooms, items||[]);
  const RoomPicker=()=>(
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {rooms.map(r=>{const Icon=getIcon(r.icon);const on=roomId===r.id;return(
        <button key={r.id} onClick={()=>setRoomId(r.id)} style={{padding:"7px 12px",borderRadius:9,cursor:"pointer",fontFamily:"var(--f)",fontSize:12.5,fontWeight:600,
          border:`1.5px solid ${on?r.color:"var(--bdr)"}`,background:on?`${r.color}18`:"transparent",color:on?r.color:"var(--tx3)",transition:"all .18s",display:"flex",alignItems:"center",gap:5}}>
          <Icon size={12}/>{r.name}
        </button>
      );})}
    </div>
  );

  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:480}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 className="fd" style={{fontSize:21,fontWeight:600}}>Adicionar rápido</h2>
            <span className="aitag" style={{marginTop:4,display:"inline-flex"}}><Sparkles size={9}/>Scraping automático</span>
          </div>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>
        {step===1&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label className="lbl">Cole o link ou escreva o nome</label>
              <div style={{position:"relative"}}>
                <input ref={urlRef} className="inp" placeholder="https://... ou nome do produto"
                  value={url} onChange={e=>setUrl(e.target.value)} onPaste={handlePaste}
                  onKeyDown={e=>e.key==="Enter"&&url.startsWith("http")&&doExtract()}
                  style={{paddingRight:url?106:14}}/>
                {url&&<button className="btn btn-p" onClick={()=>doExtract()}
                  style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",padding:"6px 11px",fontSize:12}}>
                  <Sparkles size={12}/>Preencher
                </button>}
              </div>
              <p style={{fontSize:11.5,color:"var(--tx3)",marginTop:6,lineHeight:1.5}}>
                🔗 Cole um link → extrai nome, preço e imagem automaticamente
              </p>
            </div>
            <div><label className="lbl">Cômodo</label><RoomPicker/></div>
            {suggs.length>0&&(
              <div>
                <label className="lbl">Sugestões rápidas</label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {suggs.map(s=><button key={s} className="sch" onClick={()=>{setName(s);setStep(2);}}><Plus size={9}/>{s}</button>)}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
              <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
              <button className="btn btn-p" onClick={()=>setStep(2)} disabled={!url.trim()&&!name.trim()} style={(!url.trim()&&!name.trim())?{opacity:.5,cursor:"not-allowed"}:{}}>Continuar<ArrowRight size={14}/></button>
            </div>
          </div>
        )}
        {step===2&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {loading&&<><Sk h={54} w="100%"/><Sk h={14} w="80%"/><Sk h={11} w="40%"/></>}
            {!loading&&extracted&&!error&&(
              extracted.name ? (
                <div style={{background:"var(--ga)",border:"1px solid rgba(42,157,143,.3)",borderRadius:10,padding:"12px 14px",display:"flex",gap:12}}>
                  {extracted.imageUrl&&<img src={extracted.imageUrl} alt="" style={{width:54,height:54,objectFit:"cover",borderRadius:8,flexShrink:0}} onError={e=>{e.target.style.display="none";}}/>}
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:10.5,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>✓ Extraído automaticamente</p>
                    <p style={{fontSize:13.5,fontWeight:600,lineHeight:1.3}}>{extracted.name}</p>
                    {extracted.price&&<p style={{fontSize:13,fontWeight:800,color:"var(--g)",marginTop:3}}>{fmt(extracted.price)}</p>}
                  </div>
                </div>
              ) : (
                <div style={{background:"var(--goa)",border:"1px solid rgba(233,168,48,.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--go)",display:"flex",gap:7}}>
                  <AlertCircle size={14} style={{flexShrink:0,marginTop:1}}/>
                  {extracted.warning || "Não consegui extrair os dados. Preencha o nome manualmente."}
                </div>
              )
            )}
            {!loading&&error&&<div style={{background:"var(--pa)",border:"1px solid rgba(18,114,170,.25)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--p)",display:"flex",gap:7}}><AlertCircle size={14} style={{flexShrink:0,marginTop:1}}/>{error}</div>}
            {!loading&&(
              <>
                <div><label className="lbl">Nome *</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do produto" autoFocus/></div>
                <div><label className="lbl">Cômodo *</label><RoomPicker/></div>
              </>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:4}}>
              <button className="btn btn-g" onClick={()=>{setStep(1);setExtracted(null);setError("");}}><ArrowLeft size={13}/>Voltar</button>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
                <button className="btn btn-p" onClick={handleSave} disabled={!name.trim()||!roomId||loading} style={(!name.trim()||loading)?{opacity:.5,cursor:"not-allowed"}:{}}><Check size={14}/>Salvar item</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ITEM FORM MODAL
// ════════════════════════════════════════════════════════
function ItemModal({item,rooms=[],onSave,onClose}) {
  const [f,setF]=useState({name:item?.name||"",link:item?.link||"",price:item?.price||"",
    imageUrl:item?.imageUrl||"",notes:item?.notes||"",status:item?.status||"want",
    roomId:item?.roomId||(rooms[0]?.id||""),priority:item?.priority||"normal",starred:item?.starred||false});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const valid=f.name.trim()&&f.roomId;
  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 className="fd" style={{fontSize:21,fontWeight:600}}>{item?.id?"Editar item":"Novo item"}</h2>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><label className="lbl">Nome *</label><input className="inp" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nome do produto" autoFocus/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label className="lbl">Cômodo *</label>
              <select className="inp" value={f.roomId} onChange={e=>set("roomId",e.target.value)} style={{cursor:"pointer"}}>
                {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div><label className="lbl">Status</label>
              <select className="inp" value={f.status} onChange={e=>set("status",e.target.value)} style={{cursor:"pointer"}}>
                <option value="want">🛒 Quero comprar</option>
                <option value="bought">✅ Comprado</option>
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label className="lbl">Preço (R$)</label><input className="inp" type="number" min="0" step="0.01" value={f.price} onChange={e=>set("price",e.target.value)} placeholder="0,00"/></div>
            <div><label className="lbl">Prioridade</label>
              <select className="inp" value={f.priority} onChange={e=>set("priority",e.target.value)} style={{cursor:"pointer"}}>
                <option value="low">📌 Baixa</option>
                <option value="normal">🔵 Normal</option>
                <option value="high">⚡ Alta</option>
              </select>
            </div>
          </div>
          <div><label className="lbl">Link</label><input className="inp" value={f.link} onChange={e=>set("link",e.target.value)} placeholder="https://..."/></div>
          <div><label className="lbl">URL da imagem</label><input className="inp" value={f.imageUrl} onChange={e=>set("imageUrl",e.target.value)} placeholder="https://..."/></div>
          <div><label className="lbl">Observações</label><textarea className="inp" rows={3} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Cor, tamanho, modelo..." style={{resize:"vertical"}}/></div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--tx2)"}}>
            <input type="checkbox" checked={f.starred} onChange={e=>set("starred",e.target.checked)} style={{width:16,height:16,accentColor:"var(--go)"}}/>⭐ Favorito
          </label>
        </div>
        <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
          <button className="btn btn-p" disabled={!valid} onClick={()=>{if(valid)onSave({...item,...f,name:f.name.trim()});}} style={!valid?{opacity:.5,cursor:"not-allowed"}:{}}><Check size={14}/>{item?.id?"Salvar":"Adicionar"}</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ROOM MODAL
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// COMPLETE HOME MODAL — IA sugere itens faltando
// ════════════════════════════════════════════════════════
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

    const existingNames = new Set(items.map(i => i.name?.toLowerCase()));

    const valid = arr.filter(i =>
      i?.name &&
      !existingNames.has(i.name.toLowerCase()) &&
      rooms.some(r => r.id === i.roomId)
    );

    setSuggestions(valid);

    // Seleciona apenas itens de prioridade alta por padrão
    setSelected(new Set(
      valid
        .map((item, i) => item.priority === "high" ? i : null)
        .filter(i => i !== null)
    ));

    setStep(2);
  } catch (e) {
    setError("Erro ao gerar sugestões. Tente novamente. (" + e.message + ")");
  } finally {
    setLoading(false);
  }
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
      name: s.name,
      roomId: s.roomId,
      price: s.estimatedPrice?.toString() || "",
      priority: s.priority || "normal",
      status: "want",
      notes: "",
      starred: false,
      imageUrl: "",
      link: "",
      priceHistory: s.estimatedPrice
        ? [{
            price: s.estimatedPrice,
            date: new Date().toISOString().slice(0,10),
            source: "estimate"
          }]
        : [],
      priceOffers: [],
    }));

  if (toAdd.length === 0) return;

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

function RoomModal({onSave,onClose}) {
  const [name,setName]=useState("");const [icon,setIcon]=useState("home");const [color,setColor]=useState(PALETTE[0]);
  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 className="fd" style={{fontSize:20,fontWeight:600}}>Novo cômodo</h2>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:15}}>
          <div><label className="lbl">Nome</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Varanda, Escritório..." autoFocus/></div>
          <div><label className="lbl">Ícone</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {Object.entries(ICONS_MAP).map(([k,Icon])=>(
                <button key={k} onClick={()=>setIcon(k)} style={{width:37,height:37,borderRadius:9,border:`2px solid ${icon===k?color:"var(--bdr)"}`,background:icon===k?`${color}20`:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:icon===k?color:"var(--tx3)",transition:"all .18s"}}><Icon size={16}/></button>
              ))}
            </div>
          </div>
          <div><label className="lbl">Cor</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {PALETTE.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:`3px solid ${color===c?"var(--tx)":"transparent"}`,outline:"none",transition:"all .18s"}}/>)}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
          <button className="btn btn-p" disabled={!name.trim()} onClick={()=>{if(name.trim())onSave({name:name.trim(),icon,color});}} style={!name.trim()?{opacity:.5,cursor:"not-allowed"}:{}}><Plus size={14}/>Criar</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ITEM CARD
// ════════════════════════════════════════════════════════
function ItemCard({item,rooms=[],onToggle,onEdit,onDelete,onDuplicate,onStar,onUpdatePrice}) {
  const room=rooms.find(r=>r.id===item?.roomId);
  const RIcon=room?getIcon(room.icon):Home;
  const store=getStore(item?.link);
  const promoInfo=getPromoInfo(item);
  const [buying,setBuying]=useState(false);
  if(!item) return null;
  const handleToggle=()=>{setBuying(true);onToggle(item);setTimeout(()=>setBuying(false),500);};
  const cls=["ic",item.status==="bought"?"bought":"",item.priority==="high"&&item.status!=="bought"?"phi":"",item.starred&&item.status!=="bought"&&!promoInfo?"starred":"",promoInfo&&item.status!=="bought"?"promo":"",buying?"acp":""].filter(Boolean).join(" ");
  return (
    <div className={cls} style={{padding:"14px 15px"}}>
      <div style={{display:"flex",gap:12}}>
        <div style={{width:64,height:64,borderRadius:9,flexShrink:0,overflow:"hidden",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          {item.imageUrl?<img src={item.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>:<Package size={22} style={{color:"var(--tx3)"}}/>}
          {item.starred&&!promoInfo&&<div style={{position:"absolute",top:2,right:2,width:15,height:15,borderRadius:"50%",background:"var(--go)",display:"flex",alignItems:"center",justifyContent:"center"}}><Star size={8} style={{color:"white",fill:"white"}}/></div>}
          {promoInfo&&item.status!=="bought"&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"var(--go)",color:"white",fontSize:8,fontWeight:800,textAlign:"center",padding:"2px 0"}}>🔥 {promoInfo.discount}% OFF</div>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:14,color:"var(--tx)",textDecoration:item.status==="bought"?"line-through":"none",lineHeight:1.3,flex:1}}>{item.name}</span>
            {item.priority==="high"&&item.status!=="bought"&&<span className="bdg bh" style={{flexShrink:0}}><Flame size={8}/>Alta</span>}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:promoInfo&&item.status!=="bought"?5:7,alignItems:"center"}}>
            {room&&<span style={{display:"flex",alignItems:"center",gap:3,fontSize:10.5,color:"var(--tx3)",background:"var(--bg3)",padding:"2px 7px",borderRadius:99}}><RIcon size={9}/>{room.name}</span>}
            <span className={`bdg ${item.status==="bought"?"bd":"bw"}`}>{item.status==="bought"?"✓ Comprado":"Quero comprar"}</span>
            {item.price&&<span style={{display:"flex",alignItems:"center",gap:5}}>{promoInfo&&<span style={{fontSize:11,color:"var(--tx3)",textDecoration:"line-through"}}>{fmt(promoInfo.originalPrice)}</span>}<span style={{fontSize:13,fontWeight:800,color:promoInfo?"var(--go)":"var(--p)"}}>{fmt(item.price)}</span></span>}
            {store&&<StoreBadge url={item.link}/>}
          </div>
          {promoInfo&&item.status!=="bought"&&<div style={{marginBottom:6}}><PromoBadge promoInfo={promoInfo}/></div>}
          {item.notes&&<p style={{fontSize:11.5,color:"var(--tx3)",lineHeight:1.4,marginBottom:6}}>{item.notes}</p>}
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button onClick={handleToggle} className="btn btn-g" style={{fontSize:11.5,fontWeight:700,padding:"4px 9px",borderRadius:7,gap:4,background:item.status==="bought"?"var(--ga)":"var(--pa)",color:item.status==="bought"?"var(--g)":"var(--p)"}}>
              {item.status==="bought"?<Circle size={11}/>:<CheckCircle2 size={11}/>}{item.status==="bought"?"Desmarcar":"Comprado!"}
            </button>
            {item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-g bico" style={{textDecoration:"none"}}><ExternalLink size={13}/></a>}
            <button className="btn btn-g bico" onClick={()=>onEdit(item)}><Edit3 size={13}/></button>
            <DeleteButton onConfirm={()=>onDelete(item.id)}/>
            <button className={`btn btn-g bico bstr ${item.starred?"on":""}`} onClick={()=>onStar(item)}><Star size={13} style={item.starred?{fill:"var(--go)"}:{}}/></button>
            <button className="btn btn-g bico" onClick={()=>onDuplicate(item)} title="Duplicar"><Copy size={13}/></button>
          </div>
          <PricePanel item={item} onUpdatePrice={onUpdatePrice}/>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// TRASH VIEW
// ════════════════════════════════════════════════════════
function TrashView({items=[],rooms=[],onRestore,onPermanentDelete,onEmptyTrash}) {
  const [confirmEmpty,setConfirmEmpty]=useState(false);
  const [confirmId,setConfirmId]=useState(null);
  const deleted=items.filter(isDeleted).sort((a,b)=>new Date(b.deletedAt)-new Date(a.deletedAt));
  const fmtDate=(d)=>{try{return new Date(d).toLocaleDateString("pt-BR");}catch{return "—";}};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:27,fontWeight:600,display:"flex",alignItems:"center",gap:10}}><Trash size={22} style={{color:"var(--r)"}}/>Lixeira</h1>
          <p style={{color:"var(--tx2)",fontSize:13,marginTop:3}}>{deleted.length} item{deleted.length!==1?"s":""} · removidos automaticamente após {TRASH_DAYS} dias</p>
        </div>
        {deleted.length>0&&<button className="btn btn-g" onClick={()=>setConfirmEmpty(true)} style={{color:"var(--r)",border:"1.5px solid var(--ra)",background:"var(--ra)",fontSize:12.5}}><Trash2 size={13}/>Esvaziar lixeira</button>}
      </div>
      <div style={{background:"var(--bg2)",border:"1px dashed var(--bdr2)",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,fontSize:13,color:"var(--tx3)"}}><Bell size={14} style={{flexShrink:0,color:"var(--go)"}}/>Itens excluídos não aparecem na lista nem nos cálculos. Auto-remoção em <b style={{color:"var(--tx)"}}>{TRASH_DAYS} dias</b>.</div>
      {deleted.length===0&&<div className="empty" style={{paddingTop:80}}><div className="eico"><Trash size={30} style={{color:"var(--tx3)"}}/></div><p className="fd" style={{fontSize:20,fontWeight:600}}>Lixeira vazia</p><p style={{fontSize:13,color:"var(--tx3)"}}>Itens excluídos aparecerão aqui</p></div>}
      {deleted.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {deleted.map(item=>{
            const room=rooms.find(r=>r.id===item.roomId);const RIcon=room?getIcon(room.icon):Home;
            const days=trashDaysLeft(item);const urgent=days!==null&&days<=3;
            return (
              <div key={item.id} className="trash-card">
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:54,height:54,borderRadius:9,flexShrink:0,overflow:"hidden",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",filter:"grayscale(60%)"}}>
                    {item.imageUrl?<img src={item.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>:<Package size={20} style={{color:"var(--tx3)"}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:700,fontSize:14,color:"var(--tx2)",textDecoration:"line-through",textDecorationColor:"var(--tx3)",marginBottom:4}}>{item.name}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:7,alignItems:"center"}}>
                      {room&&<span style={{display:"flex",alignItems:"center",gap:3,fontSize:10.5,color:"var(--tx3)",background:"var(--bg3)",padding:"2px 7px",borderRadius:99}}><RIcon size={9}/>{room.name}</span>}
                      {item.price&&<span style={{fontSize:12,fontWeight:700,color:"var(--tx3)"}}>{fmt(item.price)}</span>}
                      <span style={{fontSize:10.5,color:"var(--tx3)"}}>Excluído em {fmtDate(item.deletedAt)}</span>
                      {days!==null&&<span style={{fontSize:10.5,fontWeight:700,color:urgent?"var(--r)":"var(--tx3)",background:urgent?"var(--ra)":"var(--bg3)",padding:"1px 7px",borderRadius:99}}>{urgent&&"⚠️ "}Remove em {days}d</span>}
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>onRestore(item.id)} className="btn" style={{fontSize:12,fontWeight:700,padding:"5px 12px",borderRadius:8,background:"var(--ga)",color:"var(--g)",gap:5,border:"none",cursor:"pointer",display:"flex",alignItems:"center"}}><RotateCcw size={12}/>Restaurar</button>
                      {confirmId===item.id?(
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          <span style={{fontSize:11.5,color:"var(--r)",fontWeight:600}}>Tem certeza?</span>
                          <button onClick={()=>{onPermanentDelete(item.id);setConfirmId(null);}} className="btn" style={{fontSize:11.5,fontWeight:700,padding:"4px 10px",borderRadius:7,background:"var(--r)",color:"white",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Trash2 size={11}/>Excluir</button>
                          <button onClick={()=>setConfirmId(null)} className="btn btn-g" style={{fontSize:11.5,padding:"4px 8px",borderRadius:7,display:"flex",alignItems:"center",gap:4}}><X size={11}/>Cancelar</button>
                        </div>
                      ):(
                        <button onClick={()=>setConfirmId(item.id)} className="btn" style={{fontSize:12,fontWeight:700,padding:"5px 12px",borderRadius:8,background:"var(--ra)",color:"var(--r)",gap:5,border:"none",cursor:"pointer",display:"flex",alignItems:"center"}}><Trash2 size={12}/>Excluir definitivo</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {confirmEmpty&&(
        <div className="mbk" onClick={e=>e.target===e.currentTarget&&setConfirmEmpty(false)}>
          <div className="modal" style={{padding:"26px",maxWidth:380}}>
            <div style={{textAlign:"center",padding:"8px 0"}}>
              <div style={{width:64,height:64,borderRadius:18,background:"var(--ra)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Trash2 size={28} style={{color:"var(--r)"}}/></div>
              <h3 style={{fontWeight:700,fontSize:17,marginBottom:8}}>Esvaziar lixeira?</h3>
              <p style={{fontSize:13,color:"var(--tx2)",lineHeight:1.6,marginBottom:22}}>Todos os <b>{deleted.length} itens</b> serão removidos permanentemente.</p>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <button className="btn btn-s" onClick={()=>setConfirmEmpty(false)}><X size={13}/>Cancelar</button>
                <button className="btn" onClick={()=>{onEmptyTrash();setConfirmEmpty(false);}} style={{background:"var(--r)",color:"white",padding:"10px 20px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,borderRadius:9,fontWeight:700,fontSize:13}}><Trash2 size={14}/>Esvaziar tudo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// MAIN APP — com Supabase
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// FILTER REDUCER — estado único para todos os filtros de Meus Itens
// Elevado ao App para sobreviver a re-renders e troca de abas.
// ════════════════════════════════════════════════════════
const FILTER_INITIAL = {
  search:   "",
  fRoom:    "all",
  fStatus:  "all",
  fPrio:    "all",
  fStar:    false,
  fPromo:   false,
  minPrice:    "",      // "" = sem limite inferior
  maxPrice:    "",      // "" = sem limite superior
  sort:        "recent",
  vw:          "grid",
  filtersOpen: false,  // painel de filtros colapsável
};

function filterReducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH":  
      return { ...state, search: action.payload };

    case "SET_ROOM":    
      return { ...state, fRoom: action.payload };

    case "SET_STATUS":  
      return { ...state, fStatus: action.payload };

    case "SET_PRIO":    
      return { ...state, fPrio: action.payload };

    case "TOGGLE_STAR": 
      return { ...state, fStar: !state.fStar };

    case "TOGGLE_PROMO":
      return { ...state, fPromo: !state.fPromo };

    case "SET_SORT":    
      return { ...state, sort: action.payload };

    case "SET_VW":      
      return { ...state, vw: action.payload };

    case "TOGGLE_PANEL":
      return { ...state, filtersOpen: !state.filtersOpen };

    case "SET_MIN_PRICE":
      return { ...state, minPrice: action.payload };

    case "SET_MAX_PRICE":
      return { ...state, maxPrice: action.payload };

    case "CLEAR":
      return {
        ...state, // mantém sort, vw e painel
        search: "",
        fRoom: "all",
        fStatus: "all",
        fPrio: "all",
        fStar: false,
        fPromo: false,
        minPrice: "",
        maxPrice: ""
      };

    default:
      return state;
  }
}

export default function App() {
  const auth     = useAuth();
  const itemsHook= useItems(auth.householdId);
  const roomsHook= useRooms(auth.householdId);
  const settingsHook = useSettings(auth.householdId);

  const [dk,      setDk]      = useState(false);
  const [view,    setView]    = useState("dashboard");
  const [filters, dispatchFilter] = useReducer(filterReducer, FILTER_INITIAL);
  const [sidebar, setSidebar] = useState(false);
  const [toasts,  setToasts]  = useState([]);

  // Modals
  const [quickModal,    setQuickModal]    = useState(false);
  const [itemModal,     setItemModal]     = useState(null);
  const [roomModal,     setRoomModal]     = useState(false);
  const [householdModal,setHouseholdModal]= useState(false);
  const [homeModal,     setHomeModal]     = useState(false);

  // Dark mode persistence
  useEffect(()=>{
    const saved=localStorage.getItem("enxoval:dk");
    if(saved) setDk(JSON.parse(saved));
  },[]);
  useEffect(()=>{
    localStorage.setItem("enxoval:dk",JSON.stringify(dk));
    dk?document.body.classList.add("dk"):document.body.classList.remove("dk");
  },[dk]);

  const showToast=useCallback((message,type="info")=>{
    const id=uid();
    setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000);
  },[]);

  // ── Item actions ─────────────────────────────────────────
  const handleAddItem=useCallback(async(data)=>{
    const item=await itemsHook.addItem(data);
    if(item) showToast("Item adicionado!","success");
    setItemModal(null);setQuickModal(false);
  },[itemsHook,showToast]);

  const handleUpdateItem=useCallback(async(data)=>{
    await itemsHook.updateItem(data.id,data);
    showToast("Item atualizado!","success");
    setItemModal(null);
  },[itemsHook,showToast]);

  const handleSaveItem=useCallback((data)=>{
    if(data?.id) handleUpdateItem(data);
    else handleAddItem(data);
  },[handleAddItem,handleUpdateItem]);

  const handleDeleteItem=useCallback(async(id)=>{
    await itemsHook.softDelete(id);
    showToast("Item movido para a lixeira","info");
  },[itemsHook,showToast]);

  const handleRestoreItem=useCallback(async(id)=>{
    await itemsHook.restoreItem(id);
    showToast("Item restaurado!","success");
  },[itemsHook,showToast]);

  const handlePermanentDelete=useCallback(async(id)=>{
    await itemsHook.permanentDelete(id);
    showToast("Item excluído permanentemente","error");
  },[itemsHook,showToast]);

  const handleEmptyTrash=useCallback(async()=>{
    await itemsHook.emptyTrash();
    showToast("Lixeira esvaziada","error");
  },[itemsHook,showToast]);

  const handleAddRoom=useCallback(async(data)=>{
    await roomsHook.addRoom(data);
    setRoomModal(false);
  },[roomsHook]);

  const handleDeleteRoom=useCallback(async(id)=>{
    const hasItems=activeItems.some(i=>i.roomId===id);
    if(hasItems){showToast("Remova os itens deste cômodo primeiro","warn");return;}
    await roomsHook.deleteRoom(id);
  },[roomsHook,showToast]);

const handleAddItems = useCallback(async (arr) => {
  try {
    await Promise.all(arr.map(item => itemsHook.addItem(item)));
    setHomeModal(false);
    showToast(
      `${arr.length} item${arr.length !== 1 ? "s" : ""} adicionado${arr.length !== 1 ? "s" : ""}!`,
      "success"
    );
  } catch (e) {
    showToast("Erro ao adicionar itens", "error");
  }
}, [itemsHook, showToast]);

  const openAdd=useCallback((prefill=null)=>{
    setItemModal(prefill?.prefillName?{name:prefill.prefillName,roomId:prefill.prefillRoom||roomsHook.rooms[0]?.id}:prefill||"new");
  },[roomsHook.rooms]);

const exportCSV = useCallback(() => {
  const h = ["Nome","Cômodo","Status","Preço","Prioridade","Link","Notas"];
  const rows = activeItems.map(i => {
    const r = roomsHook.rooms.find(x => x.id === i.roomId);
    return [
      i.name || "",
      r?.name || "",
      i.status === "bought" ? "Comprado" : "Quero comprar",
      i.price || "",
      i.priority || "",
      i.link || "",
      i.notes || ""
    ];
  });

  const csv = [h, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
    .join("\n");

  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
  a.download = "enxoval.csv";
  a.click();
}, [activeItems, roomsHook.rooms]);


  // ── Summary View ─────────────────────────────────────
  const SummaryView = () => {
    const total     = activeItems.length;
    const bought    = activeItems.filter(i=>i.status==="bought").length;
    const want      = total - bought;
    const highPrio  = activeItems.filter(i=>i.priority==="high"&&i.status!=="bought");
    const starred   = activeItems.filter(i=>i.starred&&i.status!=="bought");
    const promos    = activeItems.filter(i=>getPromoInfo(i)&&i.status!=="bought");
    const allVal    = activeItems.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
    const spentVal  = activeItems.filter(i=>i.status==="bought"&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
    const budget    = parseFloat(settings.budgetTotal||0);
    const pct       = total>0?Math.round((bought/total)*100):0;

    // Top 5 most expensive pending
    const topExpensive = [...activeItems]
      .filter(i=>i.status!=="bought"&&i.price)
      .sort((a,b)=>parseFloat(b.price)-parseFloat(a.price))
      .slice(0,5);

    // Rooms stats
    const roomStats = rooms.map(r=>{
      const ri=activeItems.filter(i=>i.roomId===r.id);
      const rb=ri.filter(i=>i.status==="bought").length;
      const rv=ri.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
      return {...r,total:ri.length,bought:rb,value:rv,pct:ri.length>0?Math.round((rb/ri.length)*100):0};
    });

    const days = daysLeft(settings.deliveryDate);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:22}}>
        <div>
          <h1 className="fd" style={{fontSize:27,fontWeight:600}}>Resumo</h1>
          <p style={{color:"var(--tx2)",fontSize:13,marginTop:3}}>Visão geral do seu enxoval</p>
        </div>

        {/* Progress overview */}
        <div className="card" style={{padding:"20px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:7}}><BarChart3 size={15} style={{color:"var(--p)"}}/>Progresso geral</h3>
            <span className="fd" style={{fontSize:22,color:"var(--p)",fontStyle:"italic"}}>{pct}%</span>
          </div>
          <div className="ptr" style={{height:10,marginBottom:12}}>
            <div className="pfl" style={{width:`${pct}%`,background:"var(--g)",height:"100%"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[
              {l:"Total",   v:total, c:"var(--tx)"},
              {l:"Comprados",v:bought,c:"var(--g)"},
              {l:"Pendentes",v:want,  c:"var(--go)"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",padding:"10px 6px",background:"var(--bg3)",borderRadius:9}}>
                <p style={{fontSize:22,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</p>
                <p style={{fontSize:10,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".06em",marginTop:3}}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial summary */}
        <div className="card" style={{padding:"20px 22px"}}>
          <h3 style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:7,marginBottom:14}}><Wallet size={15} style={{color:"var(--p)"}}/>Financeiro</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:budget>0?14:0}}>
            {[
              {l:"Estimado total",v:fmt(allVal),  c:"var(--p)"},
              {l:"Já gasto",     v:fmt(spentVal), c:"var(--g)"},
            ].map((s,i)=>(
              <div key={i} style={{padding:"12px 14px",background:"var(--bg3)",borderRadius:10}}>
                <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>{s.l}</p>
                <p className="fd" style={{fontSize:17,fontWeight:400,fontStyle:"italic",color:s.c}}>{s.v}</p>
              </div>
            ))}
          </div>
          {budget>0&&(
            <div style={{padding:"12px 14px",background:"var(--pa)",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{fontSize:10,fontWeight:700,color:"var(--p)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Orçamento definido</p>
                <p style={{fontSize:16,fontWeight:800,color:"var(--p)"}}>{fmt(budget)}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:10,fontWeight:700,color:allVal>budget?"var(--r)":"var(--g)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{allVal>budget?"Acima":"Abaixo"} do orçamento</p>
                <p style={{fontSize:14,fontWeight:800,color:allVal>budget?"var(--r)":"var(--g)"}}>{allVal>budget?"+":"-"}{fmt(Math.abs(allVal-budget))}</p>
              </div>
            </div>
          )}
        </div>

        {/* Delivery countdown */}
        {days!==null&&(
          <div className="card" style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:12,background:"var(--pa)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <CalendarCheck size={22} style={{color:"var(--p)"}}/>
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>Data de entrega</p>
              <p style={{fontSize:15,fontWeight:700,color:"var(--tx)"}}>
                {days>0?`${days} dias restantes`:days===0?"Hoje! 🎉":"Mudança realizada! ✨"}
              </p>
              {settings.deliveryDate&&<p style={{fontSize:12,color:"var(--tx3)",marginTop:2}}>{new Date(settings.deliveryDate+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</p>}
            </div>
          </div>
        )}

        {/* Highlights */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
          {[
            {l:"Alta prioridade", v:highPrio.length, c:"var(--r)",   bg:"var(--ra)", Icon:Flame,       empty:"Nenhum item urgente"},
            {l:"Favoritos",       v:starred.length,  c:"var(--go)",  bg:"var(--goa)",Icon:Star,        empty:"Nenhum favorito"},
            {l:"Em promoção",     v:promos.length,   c:"var(--go)",  bg:"var(--goa)",Icon:BadgePercent,empty:"Sem promoções no momento"},
          ].map((s,i)=>(
            <div key={i} style={{padding:"14px 16px",background:s.bg,borderRadius:12,border:`1px solid ${s.c}28`}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                <s.Icon size={14} style={{color:s.c}}/><p style={{fontSize:11,fontWeight:700,color:s.c,textTransform:"uppercase",letterSpacing:".06em"}}>{s.l}</p>
              </div>
              {s.v>0
                ? <p style={{fontSize:26,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</p>
                : <p style={{fontSize:12,color:s.c,opacity:.7,fontStyle:"italic"}}>{s.empty}</p>}
            </div>
          ))}
        </div>

        {/* Most expensive pending */}
        {topExpensive.length>0&&(
          <div className="card" style={{padding:"18px 20px"}}>
            <h3 style={{fontWeight:700,fontSize:15,marginBottom:12,display:"flex",alignItems:"center",gap:7}}><TrendingDown size={14} style={{color:"var(--r)"}}/>Maiores gastos pendentes</h3>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {topExpensive.map((item,i)=>{
                const room=rooms.find(r=>r.id===item.roomId);
                const Icon=room?getIcon(room.icon):Home;
                return(
                  <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"var(--bg3)",borderRadius:9}}>
                    <span style={{fontSize:11,fontWeight:700,color:"var(--tx3)",width:16,textAlign:"center"}}>{i+1}</span>
                    {item.imageUrl&&<img src={item.imageUrl} alt="" style={{width:32,height:32,borderRadius:6,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none";}}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
                      <p style={{fontSize:11,color:"var(--tx3)",display:"flex",alignItems:"center",gap:3,marginTop:1}}><Icon size={9}/>{room?.name||"—"}</p>
                    </div>
                    <span style={{fontWeight:800,fontSize:13.5,color:"var(--p)",flexShrink:0}}>{fmt(item.price)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Room breakdown */}
        {roomStats.length>0&&(
          <div className="card" style={{padding:"18px 20px"}}>
            <h3 style={{fontWeight:700,fontSize:15,marginBottom:12,display:"flex",alignItems:"center",gap:7}}><Home size={14} style={{color:"var(--p)"}}/>Por cômodo</h3>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {roomStats.map(r=>{
                const Icon=getIcon(r.icon);
                return(
                  <div key={r.id} style={{padding:"10px 14px",background:"var(--bg3)",borderRadius:9}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:r.total>0?7:0}}>
                      <div style={{width:28,height:28,borderRadius:7,background:`${r.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={13} style={{color:r.color}}/></div>
                      <span style={{fontWeight:700,fontSize:13,flex:1}}>{r.name}</span>
                      <span style={{fontSize:11,color:"var(--tx3)"}}>{r.bought}/{r.total}</span>
                      {r.value>0&&<span style={{fontSize:11.5,fontWeight:700,color:"var(--tx2)"}}>{fmt(r.value)}</span>}
                      <span style={{fontSize:12,fontWeight:800,color:r.color,minWidth:32,textAlign:"right"}}>{r.pct}%</span>
                    </div>
                    {r.total>0&&<div className="ptr"><div className="pfl" style={{width:`${r.pct}%`,background:r.color}}/></div>}
                    {r.total===0&&<p style={{fontSize:11.5,color:"var(--tx3)",fontStyle:"italic"}}>Sem itens</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts */}
        {activeItems.length > 0 && (
          <div className="card" style={{ padding: "20px 22px" }}>
            <h3 className="fd" style={{ fontSize: 18, fontWeight: 600, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={16} style={{ color: "var(--p)" }}/>Gráficos por cômodo
            </h3>
            <RoomCharts items={activeItems} rooms={rooms}/>
          </div>
        )}

        {/* Insights */}
        {generateInsights().length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <h3 className="fd" style={{fontSize:18,fontWeight:600,display:"flex",alignItems:"center",gap:8}}><Lightbulb size={16} style={{color:"var(--go)"}}/>Insights</h3>
            {generateInsights().map((ins,i)=><InsightCard key={i} type={ins.type} text={ins.text} Icon={ins.Icon} delay={i*.07}/>)}
          </div>
        )}
      </div>
    );
  };

  // ── Loading / Auth screens ────────────────────────────────
  if(auth.loading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,background:"var(--bg)"}}>
      <Styles/>
      <div style={{width:54,height:54,borderRadius:16,background:"linear-gradient(135deg,#1272AA,#1E90CC)",display:"flex",alignItems:"center",justifyContent:"center"}}><Home size={26} style={{color:"white"}}/></div>
      <Loader2 size={22} style={{color:"var(--p)",animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Mostra tela de login se não autenticado
  if(!auth.user) return (
    <><Styles/>
    <AuthScreen onSignIn={auth.signIn} onSignUp={auth.signUp}
      loading={auth.loading} error={auth.error} setError={auth.setError}/></>
  );

  const {items,loading:itemsLoading}=itemsHook;
  const {rooms}=roomsHook;
  const {settings,saveSettings}=settingsHook;

  const activeItems  = items.filter(isActive);
  const deletedItems = items.filter(isDeleted);
  const pending      = activeItems.filter(i=>i.status!=="bought").length;

  const navItems=[
    {id:"dashboard",label:"Dashboard",  icon:LayoutDashboard,count:null},
    {id:"items",    label:"Meus Itens", icon:ShoppingBag,    count:activeItems.length},
    {id:"rooms",    label:"Cômodos",    icon:Home,           count:rooms.length},
    {id:"summary",  label:"Resumo",     icon:FileText,       count:null},
    {id:"trash",    label:"Lixeira",    icon:Trash,          count:deletedItems.length,danger:true},
  ];

  // ── Conteúdo simplificado (Dashboard e Items)  ────────────

// ════════════════════════════════════════════════════════
// ROOM CHARTS — gráficos por cômodo
// Reutiliza dados já carregados (activeItems + rooms).
// Nenhuma query extra ao Supabase necessária.
// ════════════════════════════════════════════════════════
function RoomCharts({ items = [], rooms = [] }) {
  const [chartType, setChartType] = useState("bar"); // bar | pie | status

  // ── Transforma dados ────────────────────────────────────
  const data = useMemo(() => {
    return rooms
      .map(room => {
        const roomItems    = items.filter(i => i.roomId === room.id);
        const boughtItems  = roomItems.filter(i => i.status === "bought");
        const wantItems    = roomItems.filter(i => i.status === "want");
        const totalSpent   = boughtItems.filter(i => i.price).reduce((s, i) => s + parseFloat(i.price || 0), 0);
        const totalPlanned = wantItems.filter(i => i.price).reduce((s, i) => s + parseFloat(i.price || 0), 0);
        const totalValue   = roomItems.filter(i => i.price).reduce((s, i) => s + parseFloat(i.price || 0), 0);

        return {
          name:    room.name.length > 9 ? room.name.slice(0, 8) + "…" : room.name,
          fullName: room.name,
          color:   room.color || "#1272AA",
          total:   roomItems.length,
          bought:  boughtItems.length,
          want:    wantItems.length,
          spent:   parseFloat(totalSpent.toFixed(2)),
          planned: parseFloat(totalPlanned.toFixed(2)),
          value:   parseFloat(totalValue.toFixed(2)),
        };
      })
      .filter(d => d.total > 0); // esconde cômodos vazios
  }, [items, rooms]);

  // ── Dados para pizza (distribuição de gastos) ──────────
  const pieData = useMemo(() => (
    data
      .filter(d => d.value > 0)
      .map(d => ({ name: d.fullName, value: d.value, color: d.color }))
  ), [data]);

  const fmt = useCallback((v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  if (!data.length) return (
    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--tx3)", fontSize: 13 }}>
      Nenhum dado disponível — adicione itens com preço para ver os gráficos.
    </div>
  );

  // ── Tooltip customizado ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const room = data.find(d => d.name === label || d.fullName === label) || {};

  return (
    <div style={{
      background: "var(--bg)", border: "1.5px solid var(--bdr)",
      borderRadius: 10, padding: "10px 14px", fontSize: 12.5,
      boxShadow: "0 4px 20px rgba(0,0,0,.15)",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>
        {room.fullName || label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill, marginBottom: 2 }}>
          {p.name}: <b>{typeof p.value === "number" ? fmt(p.value) : p.value}</b>
        </p>
      ))}
    </div>
  );
};

  // ── Tooltip pizza ───────────────────────────────────────
  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div style={{
        background: "var(--bg)", border: "1.5px solid var(--bdr)",
        borderRadius: 10, padding: "9px 13px", fontSize: 12.5,
        boxShadow: "0 4px 20px rgba(0,0,0,.15)",
      }}>
        <p style={{ fontWeight: 700, color: d.payload.color, marginBottom: 3 }}>{d.name}</p>
        <p style={{ color: "var(--tx2)" }}>{fmt(d.value)}</p>
        <p style={{ color: "var(--tx3)", fontSize: 11 }}>
          {((d.value / pieData.reduce((s, x) => s + x.value, 0)) * 100).toFixed(1)}% do total
        </p>
      </div>
    );
  };

  // ── Label customizado para pizza ────────────────────────
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.06) return null; // esconde fatias muito pequenas
    const rad = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x   = cx + rad * Math.cos(-midAngle * Math.PI / 180);
    const y   = cy + rad * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--f)" }}>
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  const tabs = [
    { id: "bar",    label: "Gastos" },
    { id: "qty",    label: "Qtd. itens" },
    { id: "status", label: "Status" },
    { id: "pie",    label: "Pizza" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Tab selector */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setChartType(t.id)}
            className={`chip ${chartType === t.id ? "on" : ""}`}
            style={{ fontSize: 12 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Gráfico de barras: gastos por cômodo ── */}
      {chartType === "bar" && (
        <div>
          <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 10 }}>
            Valor total estimado por cômodo (R$)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
              barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                tick={{ fontSize: 10, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false} width={36}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="spent"   name="Gasto"    radius={[4,4,0,0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.9}/>)}
              </Bar>
              <Bar dataKey="planned" name="Pendente"  radius={[4,4,0,0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.35}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
            {[{l:"Gasto",op:.9},{l:"Pendente",op:.35}].map((x,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--tx3)" }}>
                <div style={{ width:10, height:10, borderRadius:3, background:`rgba(18,114,170,${x.op})` }}/>
                {x.l}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gráfico de barras: quantidade por cômodo ── */}
      {chartType === "qty" && (
        <div>
          <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 10 }}>
            Quantidade de itens por cômodo
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
              barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={false}
                tick={{ fontSize: 10, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false} width={24}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="total" name="Total de itens" radius={[6,6,0,0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Gráfico de barras empilhadas: status ── */}
      {chartType === "status" && (
        <div>
          <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 10 }}>
            Comprados vs pendentes por cômodo
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
              barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={false}
                tick={{ fontSize: 10, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false} width={24}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="bought" name="✅ Comprados" stackId="a" fill="var(--g)" radius={[0,0,0,0]}/>
              <Bar dataKey="want"   name="🛒 Pendentes" stackId="a" fill="var(--go)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
            {[{l:"Comprados",c:"var(--g)"},{l:"Pendentes",c:"var(--go)"}].map((x,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--tx3)" }}>
                <div style={{ width:10, height:10, borderRadius:3, background:x.c }}/>
                {x.l}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gráfico pizza: distribuição de gastos ── */}
      {chartType === "pie" && (
        pieData.length === 0 ? (
          <p style={{ textAlign:"center", color:"var(--tx3)", fontSize:13, padding:"24px 0" }}>
            Adicione preços nos itens para ver a distribuição por cômodo.
          </p>
        ) : (
          <div>
            <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 10 }}>
              Distribuição do valor estimado por cômodo
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  dataKey="value" labelLine={false} label={renderPieLabel}>
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="var(--bg)" strokeWidth={2}/>
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            {/* Custom legend below chart */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", justifyContent:"center", marginTop:6 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
                  <span style={{ color:"var(--tx2)" }}>{d.name}</span>
                  <span style={{ color:"var(--tx3)", fontWeight:600 }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

  // ─────────────────────────────────────────────────────
  // generateInsights — analisa items e gera alertas úteis
  // ─────────────────────────────────────────────────────
  const generateInsights = () => {
    const insights = [];
    if (!activeItems.length) return insights;

    const highPrio  = activeItems.filter(i => i.priority === "high" && i.status !== "bought");
    const promoList = activeItems.filter(i => getPromoInfo(i) && i.status !== "bought");
    const bought    = activeItems.filter(i => i.status === "bought");
    const pct       = activeItems.length > 0 ? Math.round((bought.length / activeItems.length) * 100) : 0;

    if (highPrio.length > 0)
      insights.push({ type:"alert", text:`${highPrio.length} item${highPrio.length>1?"s":""} de alta prioridade ainda pendente${highPrio.length>1?"s":""}`, Icon:Flame });
    if (promoList.length > 0)
      insights.push({ type:"warn", text:`🔥 ${promoList.length} item${promoList.length>1?"s em promoção":" em promoção"}! Aproveite antes de acabar`, Icon:BadgePercent });
    if (pct >= 75 && pct < 100)
      insights.push({ type:"ok", text:`Quase lá! ${pct}% do enxoval já comprado 🎉`, Icon:Award });
    if (pct === 100 && activeItems.length > 0)
      insights.push({ type:"ok", text:`Enxoval 100% completo! Parabéns! 🏠✨`, Icon:CheckCircle2 });

    const emptyRooms = rooms.filter(r => !activeItems.some(i => i.roomId === r.id));
    if (emptyRooms.length > 0)
      insights.push({ type:"info", text:`${emptyRooms.length} cômodo${emptyRooms.length>1?"s":""} sem itens: ${emptyRooms.map(r=>r.name).join(", ")}`, Icon:Home });

    const allVal   = activeItems.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
    const budget   = parseFloat(settings.budgetTotal||0);
    if (budget > 0 && allVal > budget)
      insights.push({ type:"alert", text:`Estimativa (${fmt(allVal)}) ultrapassa o orçamento (${fmt(budget)}) em ${fmt(allVal-budget)}`, Icon:TrendingDown });
    else if (budget > 0 && allVal <= budget)
      insights.push({ type:"ok", text:`Dentro do orçamento! Restam ${fmt(budget-allVal)} disponíveis`, Icon:Wallet });

    return insights.slice(0, 5);
  };

  const DashboardSimple=()=>{
    const total    = activeItems.length;
    const bought   = activeItems.filter(i=>i.status==="bought").length;
    const want     = total - bought;
    const pct      = total>0?Math.round((bought/total)*100):0;
    const days     = daysLeft(settings.deliveryDate);
    const allVal   = activeItems.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
    const spentVal = activeItems.filter(i=>i.status==="bought"&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
    const pendVal  = allVal - spentVal;
    const budget   = parseFloat(settings.budgetTotal||0);
    const budgetPct= budget>0?Math.min(100,Math.round((allVal/budget)*100)):0;
    const insights = generateInsights();

    return (
      <div style={{display:"flex",flexDirection:"column",gap:22}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 className="fd" style={{fontSize:30,fontWeight:600}}>Meu Enxoval</h1>
            <p style={{color:"var(--tx2)",fontSize:14,marginTop:3}}>Olá, {auth.user.email?.split("@")[0]} 👋</p>
          </div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            <button className="btn btn-s" style={{fontSize:12.5}} onClick={()=>setHomeModal(true)}><Sparkles size={13}/>Completar casa</button>
            <button className="btn btn-s" style={{fontSize:12.5}} onClick={()=>setQuickModal(true)}><Zap size={13}/>Rápido</button>
            <button className="btn btn-p pulse" onClick={()=>openAdd()}><Plus size={13}/>Adicionar</button>
          </div>
        </div>

        {/* Countdown hero */}
        <div style={{background:"linear-gradient(135deg,#0C5884 0%,#1E90CC 100%)",borderRadius:18,padding:"22px 24px",color:"white"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
            <div>
              <p style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",opacity:.75,marginBottom:5,display:"flex",alignItems:"center",gap:5}}><Clock size={10}/>Contagem regressiva</p>
              {days!==null
                ? <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                    <span className="fd" style={{fontSize:54,fontWeight:400,fontStyle:"italic",lineHeight:1}}>{Math.max(0,days)}</span>
                    <span style={{fontSize:17,opacity:.85}}>{days<0?"dias (chegou! ✨)":days===1?"dia restante":"dias restantes"}</span>
                  </div>
                : <p style={{fontSize:15,opacity:.7}}>Defina a data de entrega →</p>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <label style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",opacity:.7}}>Data de entrega</label>
              <input type="date" value={settings.deliveryDate||""}
                onChange={e=>settingsHook.setDeliveryDate(e.target.value)}
                min={new Date().toISOString().slice(0,10)}
                style={{background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.35)",borderRadius:8,padding:"9px 14px",color:"white",fontFamily:"var(--f)",fontSize:14,cursor:"pointer",outline:"none",colorScheme:"dark"}}/>
              {settings.deliveryDate&&(
                <button onClick={()=>settingsHook.setDeliveryDate("")}
                  style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:6,padding:"3px 8px",color:"rgba(255,255,255,.75)",fontFamily:"var(--f)",fontSize:11,cursor:"pointer"}}>
                  ✕ Limpar data
                </button>
              )}
            </div>
          </div>
          <div style={{marginTop:18}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{opacity:.75,fontSize:12}}>Progresso geral</span>
              <span style={{fontWeight:800,fontSize:14}}>{pct}%</span>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,.2)",borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:"rgba(255,255,255,.9)",borderRadius:99,transition:"width .8s ease"}}/>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10}}>
          {[
            {l:"Total",    v:total,      Icon:Package,     c:"var(--p)",  d:0},
            {l:"Comprados",v:bought,     Icon:CheckCircle2,c:"var(--g)",  d:.05},
            {l:"Pendentes",v:want,       Icon:ShoppingBag, c:"var(--go)", d:.10},
            {l:"Estimado", v:fmt(allVal),Icon:DollarSign,  c:"var(--p)",  d:.15,sm:true},
          ].map((s,i)=>(
            <div key={i} className="stat" style={{animationDelay:`${s.d}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>{s.l}</p>
                  <p className="fd" style={{fontSize:s.sm?18:30,fontWeight:s.sm?700:400,fontStyle:s.sm?"normal":"italic",color:s.c,lineHeight:1}}>{s.v}</p>
                </div>
                <div style={{width:32,height:32,borderRadius:8,background:`${s.c}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <s.Icon size={15} style={{color:s.c}}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Financial control — RESTORED */}
        <div className="card" style={{padding:"20px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <h3 style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:7}}><Wallet size={15} style={{color:"var(--p)"}}/>Controle financeiro</h3>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:12,color:"var(--tx3)"}}>Orçamento:</span>
              <BudgetInput value={settings.budgetTotal} onSave={settingsHook.setBudgetTotal}/>
            </div>
          </div>
          {/* Financial cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:budget>0?14:0}}>
            {[
              {l:"Já gasto",   v:fmt(spentVal),c:"var(--g)",  bg:"var(--ga)", Icon:CheckCircle2},
              {l:"Pendente",   v:fmt(pendVal), c:"var(--go)", bg:"var(--goa)",Icon:ShoppingBag},
              {l:"Orçamento",  v:budget>0?fmt(budget):"—", c:"var(--p)",  bg:"var(--pa)", Icon:Target},
            ].map((s,i)=>(
              <div key={i} style={{background:s.bg,borderRadius:10,padding:"11px 13px",textAlign:"center"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:5}}><s.Icon size={13} style={{color:s.c}}/></div>
                <p style={{fontSize:9.5,fontWeight:700,color:s.c,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4,opacity:.8}}>{s.l}</p>
                <p style={{fontSize:13.5,fontWeight:800,color:s.c}}>{s.v}</p>
              </div>
            ))}
          </div>
          {/* Budget progress bar */}
          {budget>0&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,color:"var(--tx3)",marginBottom:5}}>
                <span>Uso do orçamento</span>
                <span style={{fontWeight:700,color:budgetPct>=100?"var(--r)":"var(--tx)"}}>{budgetPct}%{budgetPct>=100?" ⚠️":""}</span>
              </div>
              <div className="ptr">
                <div className="pfl" style={{width:`${budgetPct}%`,background:budgetPct>=100?"var(--r)":budgetPct>=80?"var(--go)":"var(--g)"}}/>
              </div>
              {budgetPct>=100&&(
                <p style={{fontSize:11.5,color:"var(--r)",fontWeight:600,marginTop:5}}>⚠️ Estimativa acima do orçamento em {fmt(allVal-budget)}</p>
              )}
            </div>
          )}
        </div>

        {/* Insights — RESTORED */}
        {insights.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <h3 className="fd" style={{fontSize:18,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
              <Lightbulb size={16} style={{color:"var(--go)"}}/>Insights
            </h3>
            {insights.map((ins,i)=>(
              <InsightCard key={i} type={ins.type} text={ins.text} Icon={ins.Icon} delay={i*0.07}/>
            ))}
          </div>
        )}

        {/* Room progress */}
        {rooms.length>0&&(
          <div>
            <h3 className="fd" style={{fontSize:20,fontWeight:600,marginBottom:12}}>Por cômodo</h3>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {rooms.map(r=>{
                const Icon=getIcon(r.icon);
                const ri=activeItems.filter(i=>i.roomId===r.id);
                const b=ri.filter(i=>i.status==="bought").length;
                const t=ri.length;
                const p=t>0?Math.round((b/t)*100):0;
                const roomVal=ri.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
                return(
                  <div key={r.id} className="card" style={{padding:"14px 17px",cursor:"pointer"}}
                    onClick={()=>setView("items")}>
                    <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:p>0?9:0}}>
                      <div style={{width:38,height:38,borderRadius:10,background:`${r.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Icon size={18} style={{color:r.color}}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                          <span style={{fontWeight:700,fontSize:14}}>{r.name}</span>
                          <div style={{display:"flex",gap:10,alignItems:"center"}}>
                            {roomVal>0&&<span style={{fontSize:11,color:"var(--tx3)"}}>{fmt(roomVal)}</span>}
                            <span style={{fontSize:11.5,color:"var(--tx3)"}}>{b}/{t} · <b style={{color:r.color}}>{p}%</b></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {t>0&&<div className="ptr"><div className="pfl" style={{width:`${p}%`,background:r.color}}/></div>}
                    {t===0&&<p style={{fontSize:12,color:"var(--tx3)",fontStyle:"italic",marginTop:3}}>Nenhum item ainda — clique para adicionar</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts section */}
        {activeItems.length > 0 && rooms.length > 0 && (
          <div className="card" style={{ padding: "20px 22px" }}>
            <h3 className="fd" style={{ fontSize: 18, fontWeight: 600, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={16} style={{ color: "var(--p)" }}/>Gráficos por cômodo
            </h3>
            <RoomCharts items={activeItems} rooms={rooms}/>
          </div>
        )}

        {/* Empty state */}
        {total===0&&(
          <div className="empty">
            <div className="eico"><Package size={30} style={{color:"var(--tx3)"}}/></div>
            <p className="fd" style={{fontSize:22,fontWeight:600}}>Nenhum item ainda</p>
            <p style={{fontSize:13,color:"var(--tx2)",maxWidth:280,lineHeight:1.55}}>Adicione itens ou deixe a IA montar uma lista completa!</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              <button className="btn btn-s" onClick={()=>setHomeModal(true)}><Sparkles size={13}/>IA: Completar casa</button>
              <button className="btn btn-p pulse" onClick={()=>openAdd()} style={{fontSize:14,padding:"12px 22px"}}><Plus size={15}/>Adicionar primeiro item</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Desestrutura o estado elevado de filtros
  const { search, fRoom, fStatus, fPrio, fStar, fPromo, minPrice, maxPrice, sort, vw, filtersOpen } = filters;

  const filtered = useMemo(()=>{
    let arr = [...activeItems];
    if (search.trim()) arr = arr.filter(i=>i.name?.toLowerCase().includes(search.toLowerCase())||i.notes?.toLowerCase().includes(search.toLowerCase()));
    if (fRoom   !== "all") arr = arr.filter(i=>i.roomId===fRoom);
    if (fStatus !== "all") arr = arr.filter(i=>i.status===fStatus);
    if (fPrio   !== "all") arr = arr.filter(i=>i.priority===fPrio);
    if (fStar)             arr = arr.filter(i=>i.starred);
    if (fPromo)            arr = arr.filter(i=>!!getPromoInfo(i));
    if (minPrice !== "") {
      const mn = parseFloat(minPrice);
      if (!isNaN(mn)) arr = arr.filter(i => parseFloat(i.price||0) >= mn);
    }
    if (maxPrice !== "") {
      const mx = parseFloat(maxPrice);
      if (!isNaN(mx)) arr = arr.filter(i => parseFloat(i.price||0) <= mx);
    }
    arr = [...arr].sort((a,b)=>{
      if (sort==="name")       return (a.name||"").localeCompare(b.name||"","pt");
      if (sort==="price_asc")  return (parseFloat(a.price)||0)-(parseFloat(b.price)||0);
      if (sort==="price_desc") return (parseFloat(b.price)||0)-(parseFloat(a.price)||0);
      if (sort==="prio")  { const p={high:0,normal:1,low:2}; return (p[a.priority]||1)-(p[b.priority]||1); }
      if (sort==="recent"){ try{return new Date(b.createdAt||0)-new Date(a.createdAt||0);}catch{return 0;} }
      return 0;
    });
    return arr;
  },[activeItems,search,fRoom,fStatus,fPrio,fStar,fPromo,minPrice,maxPrice,sort]);

  const hasFilters = fRoom!=="all"||fStatus!=="all"||fPrio!=="all"||fStar||fPromo||!!search.trim()||minPrice!==""||maxPrice!=="";

  const ItemsSimple=()=>{
    const clearFilters = () => {dispatchFilter({ type: "CLEAR" });
	};
    const suggs = fRoom!=="all" ? getRoomSuggestions(fRoom,rooms,activeItems) : [];

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 className="fd" style={{fontSize:27,fontWeight:600}}>Meus Itens</h1>
            <p style={{color:"var(--tx2)",fontSize:13,marginTop:2}}>
              {filtered.length} de {activeItems.length} · {activeItems.filter(i=>i.status==="bought").length} comprados
            </p>
          </div>
          <div style={{display:"flex",gap:7}}>
            <button className="btn btn-s" style={{fontSize:12.5}} onClick={()=>setQuickModal(true)}><Zap size={13}/>Rápido</button>
            <button className="btn btn-p" style={{fontSize:12.5}} onClick={()=>openAdd()}><Plus size={13}/>Adicionar</button>
          </div>
        </div>

        {/* ── Search bar ─────────────────────────────── */}
        <div style={{position:"relative"}}>
          <Search size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"var(--tx3)"}}/>
          <input className="inp" placeholder="Buscar por nome, observação..."
            value={search}
            onChange={e=>dispatchFilter({type:"SET_SEARCH",payload:e.target.value})}
            style={{paddingLeft:37,paddingRight:search?36:14}}/>
          {search&&(
            <button className="btn btn-g bico"
              onClick={()=>dispatchFilter({type:"SET_SEARCH",payload:""})}
              style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)"}}>
              <X size={13}/>
            </button>
          )}
        </div>

        {/* ── Filter bar: sort + view + toggle panel ─── */}
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
          {/* Sort */}
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:180}}>
            <ArrowUpDown size={13} style={{color:"var(--tx3)",flexShrink:0}}/>
            <select className="inp" value={sort}
              onChange={e=>dispatchFilter({type:"SET_SORT",payload:e.target.value})}
              style={{flex:1,padding:"7px 10px",fontSize:12.5,cursor:"pointer"}}>
              <option value="recent">🕐 Mais recente</option>
              <option value="name">🔤 Nome A–Z</option>
              <option value="price_desc">💰 Maior preço</option>
              <option value="price_asc">💸 Menor preço</option>
              <option value="prio">⚡ Prioridade</option>
            </select>
          </div>
          {/* View toggle */}
          <div style={{display:"flex",gap:3}}>
            <button className="btn btn-g bico" title="Grade"
              onClick={()=>dispatchFilter({type:"SET_VW",payload:"grid"})}
              style={vw==="grid"?{background:"var(--bg3)",color:"var(--p)"}:{}}>
              <Grid3X3 size={14}/>
            </button>
            <button className="btn btn-g bico" title="Lista"
              onClick={()=>dispatchFilter({type:"SET_VW",payload:"list"})}
              style={vw==="list"?{background:"var(--bg3)",color:"var(--p)"}:{}}>
              <List size={14}/>
            </button>
          </div>
          {/* Filter panel toggle button */}
          <button
            onClick={()=>dispatchFilter({type:"TOGGLE_PANEL"})}
            className={`btn ${filtersOpen?"btn-p":"btn-s"}`}
            style={{fontSize:12.5,gap:6,padding:"7px 13px",position:"relative"}}>
            <Filter size={13}/>
            Filtros
            {hasFilters&&(
              <span style={{
                position:"absolute",top:-5,right:-5,
                width:17,height:17,borderRadius:"50%",
                background:"var(--r)",color:"white",
                fontSize:9,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
				{[
				fRoom !== "all",
				fStatus !== "all",
				fPrio !== "all",
				fStar,
				fPromo,
				minPrice !== "",
				maxPrice !== "",
				!!search.trim()
				].filter(Boolean).length}
              </span>
            )}
          </button>
          {/* Clear — only when filters active */}
          {hasFilters&&(
            <button className="btn btn-g" onClick={clearFilters}
              style={{fontSize:11.5,color:"var(--r)",gap:4,padding:"5px 9px"}}>
              <X size={11}/>Limpar
            </button>
          )}
        </div>

        {/* ── Filter panel (collapsible) ──────────────── */}
        {filtersOpen&&(
          <div style={{
            background:"var(--bg2)",border:"1.5px solid var(--bdr)",
            borderRadius:14,padding:"16px 18px",
            display:"flex",flexDirection:"column",gap:16,
          }}>
            {/* Cômodo */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <Home size={10}/>Cômodo
              </p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[{id:"all",name:"Todos"},...rooms].map(r=>(
                  <button key={r.id}
                    className={`chip ${fRoom===r.id?"on":""}`}
                    onClick={()=>dispatchFilter({type:"SET_ROOM",payload:r.id})}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <ShoppingCart size={10}/>Status
              </p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[{id:"all",l:"Todos"},{id:"want",l:"🛒 Pendentes"},{id:"bought",l:"✅ Comprados"}].map(s=>(
                  <button key={s.id}
                    className={`chip ${fStatus===s.id?"on":""}`}
                    onClick={()=>dispatchFilter({type:"SET_STATUS",payload:s.id})}>
                    {s.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <Flame size={10}/>Prioridade
              </p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[
                  {id:"all",    l:"Todas",       color:null},
                  {id:"high",   l:"⚡ Alta",      color:"var(--r)"},
                  {id:"normal", l:"🔵 Normal",    color:"var(--p)"},
                  {id:"low",    l:"📌 Baixa",     color:"var(--tx3)"},
                ].map(p=>(
                  <button key={p.id}
                    className={`chip ${fPrio===p.id?"on":""}`}
                    onClick={()=>dispatchFilter({type:"SET_PRIO",payload:p.id})}
                    style={fPrio===p.id&&p.color?{background:p.color,borderColor:p.color}:{}}>
                    {p.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Faixa de preço */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <DollarSign size={10}/>Faixa de preço (R$)
              </p>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="number" min="0" step="50"
                  placeholder="Mín"
                  value={minPrice}
                  onChange={e=>dispatchFilter({type:"SET_MIN_PRICE",payload:e.target.value})}
                  style={{
                    flex:1,padding:"8px 10px",background:"var(--bg)",
                    border:"1.5px solid var(--bdr)",borderRadius:8,
                    fontFamily:"var(--f)",fontSize:13,color:"var(--tx)",outline:"none",
                    transition:"border-color .2s",
                  }}
                  onFocus={e=>e.target.style.borderColor="var(--p)"}
                  onBlur={e=>e.target.style.borderColor="var(--bdr)"}
                />
                <span style={{color:"var(--tx3)",fontSize:12,flexShrink:0}}>até</span>
                <input type="number" min="0" step="50"
                  placeholder="Máx"
                  value={maxPrice}
                  onChange={e=>dispatchFilter({type:"SET_MAX_PRICE",payload:e.target.value})}
                  style={{
                    flex:1,padding:"8px 10px",background:"var(--bg)",
                    border:"1.5px solid var(--bdr)",borderRadius:8,
                    fontFamily:"var(--f)",fontSize:13,color:"var(--tx)",outline:"none",
                    transition:"border-color .2s",
                  }}
                  onFocus={e=>e.target.style.borderColor="var(--p)"}
                  onBlur={e=>e.target.style.borderColor="var(--bdr)"}
                />
                {(minPrice||maxPrice)&&(
                  <button className="btn btn-g bico"
                    onClick={()=>{
                      dispatchFilter({type:"SET_MIN_PRICE",payload:""});
                      dispatchFilter({type:"SET_MAX_PRICE",payload:""});
                    }}>
                    <X size={12}/>
                  </button>
                )}
              </div>
              {/* Quick price presets */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
                {[
                  {l:"Até R$100",   min:"",    max:"100" },
                  {l:"R$100–500",   min:"100", max:"500" },
                  {l:"R$500–1000",  min:"500", max:"1000"},
                  {l:"Acima R$1k",  min:"1000",max:""    },
                ].map(p=>{
                  const active = minPrice===p.min && maxPrice===p.max;
                  return (
                    <button key={p.l}
                      className={`chip ${active?"on":""}`}
                      style={{fontSize:11.5}}
                      onClick={()=>{
                        dispatchFilter({type:"SET_MIN_PRICE",payload:active?"":p.min});
                        dispatchFilter({type:"SET_MAX_PRICE",payload:active?"":p.max});
                      }}>
                      {p.l}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Especiais */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <Star size={10}/>Especiais
              </p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <button
                  className={`chip ${fStar?"on":""}`}
                  onClick={()=>dispatchFilter({type:"TOGGLE_STAR"})}
                  style={{display:"flex",alignItems:"center",gap:4}}>
                  <Star size={11}/>Favoritos
                </button>
                <button
                  className={`chip ${fPromo?"on":""}`}
                  onClick={()=>dispatchFilter({type:"TOGGLE_PROMO"})}
                  style={{display:"flex",alignItems:"center",gap:4}}>
                  <BadgePercent size={11}/>Em promoção
                </button>
              </div>
            </div>

            {/* Active filter summary */}
            {hasFilters&&(
              <div style={{
                paddingTop:12,borderTop:"1px solid var(--bdr)",
                display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,
              }}>
                <p style={{fontSize:12,color:"var(--tx2)"}}>
                  <b style={{color:"var(--p)"}}>{filtered.length}</b> resultado{filtered.length!==1?"s":""} com os filtros atuais
                </p>
                <button className="btn btn-g" onClick={clearFilters}
                  style={{fontSize:12,color:"var(--r)",gap:4}}>
                  <X size={11}/>Limpar todos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Room suggestions */}
        {suggs.length>0&&(
          <div style={{background:"var(--bg2)",border:"1.5px dashed var(--bdr2)",borderRadius:12,padding:"13px 15px"}}>
            <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9,display:"flex",alignItems:"center",gap:5}}>
              <Sparkles size={11}/>Sugestões — {rooms.find(r=>r.id===fRoom)?.name}
            </p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {suggs.map(s=><button key={s} className="sch" onClick={()=>openAdd({prefillName:s,prefillRoom:fRoom})}><Plus size={9}/>{s}</button>)}
            </div>
          </div>
        )}

        {/* Items grid/list */}
        {itemsLoading ? (
          <div style={{display:"flex",justifyContent:"center",padding:40}}>
            <Loader2 size={24} style={{color:"var(--p)",animation:"spin 1s linear infinite"}}/>
          </div>
        ) : filtered.length===0 ? (
          <div className="empty">
            <div className="eico"><Search size={26} style={{color:"var(--tx3)"}}/></div>
            <p style={{fontWeight:700,fontSize:15}}>Nenhum item encontrado</p>
            <p style={{fontSize:13,color:"var(--tx3)"}}>
              {hasFilters?"Ajuste os filtros ou ":""}
              <button className="btn btn-p" onClick={()=>openAdd()} style={{marginLeft:hasFilters?8:0}}><Plus size={13}/>Adicionar</button>
            </p>
            {hasFilters&&<button className="btn btn-s" style={{marginTop:4,fontSize:12}} onClick={clearFilters}><X size={12}/>Limpar filtros</button>}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:vw==="grid"?"repeat(auto-fill,minmax(280px,1fr))":"1fr",gap:9}}>
            {filtered.map(item=>(
              <ItemCard key={item.id} item={item} rooms={rooms}
                onToggle={itemsHook.toggleStatus}
                onEdit={setItemModal}
                onDelete={handleDeleteItem}
                onDuplicate={itemsHook.duplicateItem}
                onStar={itemsHook.toggleStar}
                onUpdatePrice={itemsHook.updatePriceOffers}/>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Dados agregados por cômodo (derivados de activeItems — sem query extra) ──
  const roomStats = useMemo(() => rooms.map(r => {
    const ri       = activeItems.filter(i => i.roomId === r.id);
    const bought   = ri.filter(i => i.status === "bought");
    const want     = ri.filter(i => i.status === "want");
    const highPrio = ri.filter(i => i.priority === "high" && i.status !== "bought");
    const totalVal = ri.filter(i => i.price).reduce((s,i) => s + parseFloat(i.price||0), 0);
    const spentVal = bought.filter(i => i.price).reduce((s,i) => s + parseFloat(i.price||0), 0);
    const pct      = ri.length > 0 ? Math.round((bought.length / ri.length) * 100) : 0;
    return {
      ...r,
      total:     ri.length,
      bought:    bought.length,
      want:      want.length,
      highPrio:  highPrio.length,
      totalVal,
      spentVal,
      pendVal:   totalVal - spentVal,
      pct,
    };
  }), [rooms, activeItems]);

  const RoomsSimple = () => {
    // Totais globais para o header
    const totalItems = roomStats.reduce((s,r)=>s+r.total,0);
    const totalHigh  = roomStats.reduce((s,r)=>s+r.highPrio,0);
    const totalVal   = roomStats.reduce((s,r)=>s+r.totalVal,0);

    return (
      <div style={{display:"flex",flexDirection:"column",gap:22}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 className="fd" style={{fontSize:27,fontWeight:600}}>Cômodos</h1>
            <p style={{color:"var(--tx2)",fontSize:13,marginTop:2}}>
              {rooms.length} cômodos · {totalItems} itens · {fmt(totalVal)}
            </p>
          </div>
          <button className="btn btn-p" onClick={()=>setRoomModal(true)}><Plus size={13}/>Novo cômodo</button>
        </div>

        {/* Summary bar */}
        {totalHigh > 0 && (
          <div style={{background:"var(--ra)",border:"1px solid rgba(217,79,92,.25)",borderRadius:10,
            padding:"10px 16px",display:"flex",alignItems:"center",gap:8,fontSize:13}}>
            <Flame size={14} style={{color:"var(--r)",flexShrink:0}}/>
            <span style={{color:"var(--r)",fontWeight:600}}>
              {totalHigh} item{totalHigh>1?"s":""} de alta prioridade pendente{totalHigh>1?"s":""}
            </span>
          </div>
        )}

        {/* Room cards grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
          {roomStats.map(r => {
            const Icon       = getIcon(r.icon);
            const isDefault  = ["quarto","sala","cozinha","banheiro"].includes(r.id);
            const hasItems   = r.total > 0;

            return (
              <div key={r.id} className="card clift au" style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:0}}>

                {/* Card header: icon + name + delete */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:11}}>
                    <div style={{width:44,height:44,borderRadius:13,background:`${r.color}18`,
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon size={22} style={{color:r.color}}/>
                    </div>
                    <div>
                      <h3 style={{fontWeight:700,fontSize:15,lineHeight:1.2}}>{r.name}</h3>
                      <p style={{fontSize:11.5,color:"var(--tx3)",marginTop:2}}>
                        {r.total} {r.total===1?"item":"itens"}
                      </p>
                    </div>
                  </div>
                  {!isDefault && <DeleteButton onConfirm={()=>handleDeleteRoom(r.id)}/>}
                </div>

                {hasItems ? (
                  <>
                    {/* Progress bar */}
                    <div style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,color:"var(--tx3)",marginBottom:5}}>
                        <span>{r.bought} comprado{r.bought!==1?"s":""}</span>
                        <span style={{fontWeight:700,color:r.color}}>{r.pct}%</span>
                      </div>
                      <div className="ptr">
                        <div className="pfl" style={{width:`${r.pct}%`,background:r.color}}/>
                      </div>
                    </div>

                    {/* Stats grid: 3 columns */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {/* Pendentes */}
                      <div style={{background:"var(--bg3)",borderRadius:9,padding:"9px 10px",textAlign:"center"}}>
                        <p style={{fontSize:18,fontWeight:800,color:"var(--go)",lineHeight:1}}>{r.want}</p>
                        <p style={{fontSize:9.5,color:"var(--tx3)",textTransform:"uppercase",
                          letterSpacing:".06em",marginTop:3,fontWeight:600}}>Pendentes</p>
                      </div>

                      {/* Alta prioridade */}
                      <div style={{background: r.highPrio > 0 ? "var(--ra)" : "var(--bg3)",
                        borderRadius:9,padding:"9px 10px",textAlign:"center",
                        border: r.highPrio > 0 ? "1px solid rgba(217,79,92,.2)" : "none"}}>
                        <p style={{fontSize:18,fontWeight:800,
                          color:r.highPrio>0?"var(--r)":"var(--tx3)",lineHeight:1}}>
                          {r.highPrio}
                        </p>
                        <p style={{fontSize:9.5,textTransform:"uppercase",letterSpacing:".06em",
                          marginTop:3,fontWeight:600,
                          color:r.highPrio>0?"var(--r)":"var(--tx3)"}}>
                          {r.highPrio > 0 ? "⚡ Urgentes" : "Urgentes"}
                        </p>
                      </div>

                      {/* Valor total */}
                      <div style={{background:"var(--bg3)",borderRadius:9,padding:"9px 10px",textAlign:"center"}}>
                        <p style={{fontSize:r.totalVal>=1000?13:16,fontWeight:800,
                          color:"var(--p)",lineHeight:1,marginTop:r.totalVal>=1000?2:0}}>
                          {fmt(r.totalVal)}
                        </p>
                        <p style={{fontSize:9.5,color:"var(--tx3)",textTransform:"uppercase",
                          letterSpacing:".06em",marginTop:3,fontWeight:600}}>Estimado</p>
                      </div>
                    </div>

                    {/* Spent vs pending breakdown (só se tiver preços) */}
                    {r.spentVal > 0 && (
                      <div style={{marginTop:10,display:"flex",gap:6}}>
                        <div style={{flex:1,background:"var(--ga)",borderRadius:7,padding:"6px 8px",textAlign:"center"}}>
                          <p style={{fontSize:11,fontWeight:700,color:"var(--g)"}}>{fmt(r.spentVal)}</p>
                          <p style={{fontSize:9,color:"var(--g)",opacity:.8,textTransform:"uppercase",letterSpacing:".05em",marginTop:1}}>Gasto</p>
                        </div>
                        <div style={{flex:1,background:"var(--pa)",borderRadius:7,padding:"6px 8px",textAlign:"center"}}>
                          <p style={{fontSize:11,fontWeight:700,color:"var(--p)"}}>{fmt(r.pendVal)}</p>
                          <p style={{fontSize:9,color:"var(--p)",opacity:.8,textTransform:"uppercase",letterSpacing:".05em",marginTop:1}}>Pendente</p>
                        </div>
                      </div>
                    )}

                    {/* CTA — ver itens deste cômodo */}
                    <button onClick={()=>{dispatchFilter({type:"SET_ROOM",payload:r.id});setView("items");}}
                      className="btn btn-g"
                      style={{marginTop:12,width:"100%",justifyContent:"center",
                        fontSize:12,gap:5,padding:"7px",borderRadius:8,
                        border:"1px solid var(--bdr)",color:"var(--tx3)"}}>
                      Ver itens <ArrowRight size={11}/>
                    </button>
                  </>
                ) : (
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <p style={{fontSize:12.5,color:"var(--tx3)",fontStyle:"italic",marginBottom:10}}>
                      Nenhum item ainda
                    </p>
                    <button onClick={()=>openAdd({prefillRoom:r.id})}
                      className="btn btn-g"
                      style={{fontSize:12,gap:5,border:"1.5px dashed var(--bdr2)",borderRadius:8,padding:"7px 14px"}}>
                      <Plus size={12}/>Adicionar item
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={dk?"dk":""} style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
      <Styles/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fabIn{from{opacity:0;transform:scale(.5) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

      {sidebar&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:90}} onClick={()=>setSidebar(false)}/>}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebar?"open":""}`} style={{width:228,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"18px 13px",display:"flex",flexDirection:"column",gap:3,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,paddingLeft:4}}>
          <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#1272AA,#1E90CC)",display:"flex",alignItems:"center",justifyContent:"center"}}><Home size={18} style={{color:"white"}}/></div>
          <span className="fd" style={{fontSize:17,fontWeight:600,fontStyle:"italic",color:"var(--tx)"}}>Enxoval</span>
        </div>
        {navItems.map(n=>{const Icon=n.icon;const isOn=view===n.id;const isDanger=n.danger&&!isOn;return(
          <button key={n.id} className={`nb ${isOn?"on":""}`} onClick={()=>{setView(n.id);setSidebar(false);}} style={isDanger?{color:"var(--r)"}:{}}>
            <Icon size={15}/>{n.label}
            {n.count!=null&&n.count>0&&<span className="nc" style={isDanger?{background:"var(--ra)",color:"var(--r)"}:{}}>{n.count}</span>}
          </button>
        );})}
        <div style={{flex:1}}/>
        {/* User info */}
        <div style={{background:"var(--bg3)",borderRadius:11,padding:"12px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"var(--pa)",display:"flex",alignItems:"center",justifyContent:"center"}}><User size={14} style={{color:"var(--p)"}}/></div>
            <p style={{fontSize:12,color:"var(--tx2)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{auth.user.email}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            <button onClick={()=>setDk(d=>!d)} className="btn btn-g" style={{background:"var(--bg2)",borderRadius:8,padding:"7px 10px",justifyContent:"flex-start",gap:7,width:"100%",fontSize:12.5}}>
              {dk?<Sun size={13}/>:<Moon size={13}/>}{dk?"Modo claro":"Modo escuro"}
            </button>
            <button onClick={()=>setHouseholdModal(true)} className="btn btn-g" style={{background:"var(--bg2)",borderRadius:8,padding:"7px 10px",justifyContent:"flex-start",gap:7,width:"100%",fontSize:12.5,color:"var(--p)"}}>
              <Heart size={13}/>Modo casal
            </button>
            <button onClick={exportCSV} className="btn btn-g" style={{background:"var(--bg2)",borderRadius:8,padding:"7px 10px",justifyContent:"flex-start",gap:7,width:"100%",fontSize:12.5}}>
              <Download size={13}/>Exportar CSV
            </button>
            <button onClick={auth.signOut} className="btn btn-g" style={{background:"var(--bg2)",borderRadius:8,padding:"7px 10px",justifyContent:"flex-start",gap:7,width:"100%",fontSize:12.5,color:"var(--r)"}}>
              <LogOut size={13}/>Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <div className="topbar">
          <button className="btn btn-g bico" onClick={()=>setSidebar(s=>!s)} style={{background:"var(--bg3)",flexShrink:0}}><Layers size={16}/></button>
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
            {(()=>{const n=navItems.find(x=>x.id===view);const Icon=n?.icon;return Icon?<Icon size={16} style={{color:"var(--p)",flexShrink:0}}/>:null;})()}
            <span className="fd" style={{fontWeight:600,fontSize:16,fontStyle:"italic",whiteSpace:"nowrap"}}>{navItems.find(n=>n.id===view)?.label}</span>
            {pending>0&&view==="dashboard"&&<span style={{background:"var(--p)",color:"white",fontSize:10.5,fontWeight:700,padding:"2px 8px",borderRadius:99,flexShrink:0}}>{pending} pendentes</span>}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            {view!=="trash"&&view!=="summary"&&<><button className="btn btn-s" style={{padding:"7px 11px",fontSize:12.5}} onClick={()=>setQuickModal(true)}><Zap size={13}/>Rápido</button><button className="btn btn-p" style={{padding:"7px 13px",fontSize:12.5}} onClick={()=>openAdd()}><Plus size={13}/>Item</button></>}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"24px 20px"}}>
          <div style={{maxWidth:900,margin:"0 auto"}}>
            {view==="dashboard" && <DashboardSimple/>}
            {view==="items"     && <ItemsSimple/>}
            {view==="rooms"     && <RoomsSimple/>}
            {view==="summary"   && <SummaryView/>}
            {view==="trash"     && <TrashView items={items} rooms={rooms} onRestore={handleRestoreItem} onPermanentDelete={handlePermanentDelete} onEmptyTrash={handleEmptyTrash}/>}
          </div>
        </div>
      </main>

      {view!=="trash"&&<button className="fab" onClick={()=>setQuickModal(true)}><Plus size={22}/></button>}
      <Toast toasts={toasts}/>

      {/* Modals */}
      {quickModal&&<QuickAddModal rooms={rooms} items={activeItems} onSave={handleAddItem} onClose={()=>setQuickModal(false)}/>}
      {itemModal&&<ItemModal item={typeof itemModal==="string"?null:itemModal} rooms={rooms} onSave={handleSaveItem} onClose={()=>setItemModal(null)}/>}
      {roomModal&&<RoomModal onSave={handleAddRoom} onClose={()=>setRoomModal(false)}/>}
      {householdModal&&<HouseholdModal auth={auth} onClose={()=>setHouseholdModal(false)}/>}
      {homeModal&&<CompleteHomeModal rooms={rooms} items={activeItems} onAddItems={handleAddItems} onClose={()=>setHomeModal(false)}/>}
    </div>
  );
}
