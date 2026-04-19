/**
 * ENXOVAL APP v4
 * [FIX]  Quick Add nunca adicionava o item:
 *        QuickAddModal passava id antes de onSave →
 *        saveItem interpretava como edição → map sem match → item perdido.
 *        Agora saveItem verifica se o id existe na lista antes de decidir.
 * [NEW]  AI.comparePrice — busca preços em tempo real em 6 lojas via web_search
 * [NEW]  PricePanel — painel expansível por card com ranking de lojas
 * [NEW]  Histórico de preços (priceHistory[]) salvo por item
 * [NEW]  getPromoInfo — detecta promoção ≥10% de queda vs histórico
 * [NEW]  PromoBadge + promo-glow + preço anterior riscado
 * [NEW]  Filtro "🔥 Promoção" na view de itens
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  Home, Plus, Trash2, ExternalLink, Check, Search, Moon, Sun,
  Package, ShoppingBag, DollarSign, Clock, X, Edit3, Layers,
  Loader2, Sofa, Bath, UtensilsCrossed, BedDouble, Star, Grid3X3,
  List, AlertCircle, Download, Heart, Target, Zap, Sparkles,
  Flame, CheckCircle2, Circle, BarChart2, TrendingUp, Wallet,
  Copy, ArrowRight, LayoutDashboard, ChevronRight,
  Lightbulb, AlertTriangle, Bell, Award, RefreshCw,
  ChevronDown, ChevronUp, BadgePercent, Tag, RotateCcw, Trash,
  ArrowLeft, SlidersHorizontal, SortAsc, Eye, EyeOff,
  FilterX, Share2, Settings, ChevronLeft, CalendarDays,
  PiggyBank, ShoppingCart, ReceiptText, Boxes, MapPin
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

    :root{
      /* ── Beach Day ── areia · coral · oceano · espuma */
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
      /* ── Beach Night ── oceano profundo · coral vivo · espuma */
      --bg:#0C1C28;--bg2:#122436;--bg3:#182E46;
      --bdr:#1E3A54;--bdr2:#284E6E;
      --p:#2AB6F0;--pl:#50CCFF;--pd:#1494CC;--pa:rgba(42,182,240,.16);
      --g:#35BFB0;--ga:rgba(53,191,176,.15);
      --go:#F4C24A;--goa:rgba(244,194,74,.15);
      --r:#F45C6E;--ra:rgba(244,92,110,.14);
      --b:#9A8AFF;--ba:rgba(154,138,255,.15);
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
    @keyframes insightIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}

    .au{animation:slideUp .35s ease both}
    .afi{animation:fadeIn .25s ease both}
    .asi{animation:scaleIn .28s ease both}
    .acp{animation:checkPop .45s ease both}

    .shimmer{
      background:linear-gradient(90deg,var(--bg3) 25%,var(--bg2) 50%,var(--bg3) 75%);
      background-size:300% 100%;animation:shimmer 1.6s infinite;border-radius:8px;display:block
    }

    .card{background:var(--bg2);border:1px solid var(--bdr);border-radius:var(--rd);transition:border-color .2s,box-shadow .2s,transform .2s}
    .clift:hover{border-color:var(--pl);box-shadow:var(--shl);transform:translateY(-2px)}

    .ic{background:var(--bg2);border:1.5px solid var(--bdr);border-radius:var(--rd);transition:all .22s ease;position:relative;overflow:hidden}
    .ic::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3.5px;background:var(--bdr2);opacity:.5;transition:all .2s}
    .ic:hover{border-color:var(--pl);box-shadow:var(--shl);transform:translateY(-1px)}
    .ic:hover::before{background:var(--p);opacity:1}
    .ic.bought{opacity:.58}
    .ic.bought::before{background:var(--g);opacity:1}
    .ic.phi::before{background:var(--r);opacity:1}
    .ic.phi{border-color:rgba(184,50,50,.25)}
    .ic.starred::before{background:var(--go);opacity:1}

    .btn{display:inline-flex;align-items:center;gap:6px;font-family:var(--f);font-weight:600;border:none;cursor:pointer;transition:all .18s ease;border-radius:var(--rs);font-size:13px}
    .btn-p{background:var(--p);color:#fff;padding:10px 18px}
    .btn-p:hover{background:var(--pd);transform:translateY(-1px);box-shadow:0 4px 16px rgba(184,92,50,.38)}
    .btn-p:active{transform:none}
    .btn-s{background:var(--bg3);color:var(--tx);padding:10px 18px;border:1px solid var(--bdr)}
    .btn-s:hover{border-color:var(--p);color:var(--p)}
    .btn-g{background:transparent;color:var(--tx3);padding:7px 9px;border-radius:8px;border:none}
    .btn-g:hover{background:var(--bg3);color:var(--tx)}
    .bico{width:34px;height:34px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center}
    .bdng:hover{color:var(--r)!important;background:var(--ra)!important}
    .bstr:hover{color:var(--go)!important;background:var(--goa)!important}
    .bstr.on{color:var(--go)!important}
    .pulse{animation:pulseRing 2.2s infinite}

    .inp{font-family:var(--f);font-size:14px;color:var(--tx);background:var(--bg);border:1.5px solid var(--bdr);border-radius:var(--rs);padding:10px 14px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s}
    .inp:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--pa)}
    .inp::placeholder{color:var(--tx3)}
    .lbl{font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:5px}

    .bdg{display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:99px;font-size:10.5px;font-weight:700}
    .bw{background:var(--pa);color:var(--p)}
    .bd{background:var(--ga);color:var(--g)}
    .bh{background:var(--ra);color:var(--r)}

    .chip{padding:5px 13px;border-radius:99px;font-size:12.5px;font-weight:600;cursor:pointer;border:1.5px solid var(--bdr);background:transparent;color:var(--tx3);transition:all .18s;white-space:nowrap;font-family:var(--f)}
    .chip:hover{border-color:var(--p);color:var(--p)}
    .chip.on{background:var(--p);border-color:var(--p);color:#fff}

    .sch{padding:5px 11px;border-radius:99px;font-size:12px;font-weight:500;cursor:pointer;border:1.5px dashed var(--bdr2);background:transparent;color:var(--tx2);transition:all .18s;font-family:var(--f);display:inline-flex;align-items:center;gap:4px}
    .sch:hover{border-color:var(--p);color:var(--p);background:var(--pa);border-style:solid}

    .ptr{height:7px;background:var(--bg3);border-radius:99px;overflow:hidden}
    .pfl{height:100%;border-radius:99px;transition:width .75s cubic-bezier(.4,0,.2,1)}

    .mbk{position:fixed;inset:0;background:rgba(18,14,10,.58);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease}
    .modal{background:var(--bg);border:1px solid var(--bdr);border-radius:20px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;animation:scaleIn .25s ease;box-shadow:0 28px 80px rgba(0,0,0,.22)}

    .nb{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:600;color:var(--tx3);border:none;background:transparent;width:100%;text-align:left;transition:all .18s;font-family:var(--f)}
    .nb:hover{background:var(--bg3);color:var(--tx)}
    .nb.on{background:var(--p);color:#fff}
    .nc{margin-left:auto;font-size:11px;padding:1px 7px;border-radius:99px}
    .nb.on .nc{background:rgba(255,255,255,.22)}
    .nb:not(.on) .nc{background:var(--bg3);color:var(--tx3)}

    .sidebar{position:fixed;top:0;left:0;bottom:0;z-index:100;transition:transform .3s ease}
    @media(max-width:768px){.sidebar{transform:translateX(-100%)}.sidebar.open{transform:translateX(0)}.fab{display:flex!important}}
    @media(min-width:769px){.sidebar{position:sticky}.fab{display:none!important}}

    .topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:var(--bg2);border-bottom:1px solid var(--bdr);position:sticky;top:0;z-index:50;gap:10px}

    .ins{display:flex;gap:10px;align-items:flex-start;padding:11px 14px;border-radius:10px;font-size:13px;animation:insightIn .4s ease both;line-height:1.45}
    .ins-info{background:var(--ba);border:1px solid rgba(50,100,184,.2);color:var(--b)}
    .ins-warn{background:var(--goa);border:1px solid rgba(184,137,26,.25);color:var(--go)}
    .ins-alert{background:var(--ra);border:1px solid rgba(184,50,50,.22);color:var(--r)}
    .ins-ok{background:var(--ga);border:1px solid rgba(61,140,95,.22);color:var(--g)}
    .ins-p{background:var(--pa);border:1px solid rgba(184,92,50,.22);color:var(--p)}

    .stat{background:var(--bg2);border:1px solid var(--bdr);border-radius:var(--rd);padding:16px 18px;animation:slideUp .35s ease both}
    .empty{text-align:center;padding:64px 24px;display:flex;flex-direction:column;align-items:center;gap:14px}
    .eico{width:72px;height:72px;border-radius:20px;background:var(--bg3);display:flex;align-items:center;justify-content:center}
    .sbdg{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:10.5px;font-weight:700;letter-spacing:.02em}
    .aitag{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:linear-gradient(135deg,var(--pa),rgba(50,100,184,.1));color:var(--p);border:1px solid var(--pa)}
    .fab{position:fixed;bottom:24px;right:20px;z-index:80;width:54px;height:54px;border-radius:50%;background:var(--p);color:#fff;border:none;cursor:pointer;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(18,114,170,.45);animation:fabIn .4s cubic-bezier(.34,1.56,.64,1) both;display:none}

    /* ── v4: price panel ── */
    @keyframes promoGlow{0%,100%{box-shadow:0 0 0 0 rgba(233,168,48,.25)}50%{box-shadow:0 0 10px 2px rgba(233,168,48,.18)}}
    .ic.promo{animation:promoGlow 3s ease infinite}
    .ic.promo::before{background:var(--go);opacity:1}
    .price-row{display:flex;align-items:center;justify-content:space-between;padding:7px 12px;font-size:12.5px;border-bottom:1px solid var(--bdr)}
    .price-row:last-child{border-bottom:none}
    .price-row.best{background:rgba(42,157,143,.08)}
    .best-tag{font-size:9px;font-weight:800;padding:2px 6px;border-radius:99px;background:var(--ga);color:var(--g);text-transform:uppercase;letter-spacing:.05em}
    .promo-strip{background:linear-gradient(90deg,var(--goa),rgba(233,168,48,.04));border:1px solid rgba(233,168,48,.35);border-radius:8px;padding:5px 10px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--go)}

    /* ── v5: toast ── */
    @keyframes toastIn{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
    @keyframes toastOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(8px) scale(.96)}}
    .toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);z-index:300;display:flex;align-items:center;gap:10px;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.2);white-space:nowrap;pointer-events:none;animation:toastIn .3s ease both}
    .toast-exit{animation:toastOut .3s ease both}

    /* ── v5: trash view ── */
    .trash-card{background:var(--bg2);border:1.5px solid var(--bdr);border-radius:var(--rd);padding:14px 16px;opacity:.75;transition:all .2s}
    .trash-card:hover{opacity:1;border-color:var(--bdr2)}
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   CONSTANTS & UTILS
═══════════════════════════════════════════════════════ */
const DEFAULT_ROOMS = [
  { id:"quarto",   name:"Quarto",   icon:"bed",      color:"#D4875A" }, // areia terracota
  { id:"sala",     name:"Sala",     icon:"sofa",     color:"#2A9D8F" }, // teal oceano
  { id:"cozinha",  name:"Cozinha",  icon:"utensils", color:"#E9A830" }, // areia dourada
  { id:"banheiro", name:"Banheiro", icon:"bath",     color:"#1272AA" }, // azul oceano
];

const ROOM_SUGGESTIONS = {
  quarto:   ["Cama box","Colchão","Cabeceira","Guarda-roupa","Cômoda","Criado-mudo","Espelho","Cortina","Abajur","Edredom","Travesseiro"],
  sala:     ["Sofá","Mesa de centro","Rack TV","Televisão","Tapete","Luminária","Quadro","Poltrona","Prateleira","Cortina","Aparador"],
  cozinha:  ["Geladeira","Fogão","Micro-ondas","Panelas","Talheres","Pratos","Copos","Liquidificador","Lixeira","Escorredor","Tábua de corte"],
  banheiro: ["Toalha de banho","Toalha de rosto","Tapete","Espelho","Porta-shampoo","Saboneteira","Suporte papel","Lixeira","Box"],
};

const STORE_MAP = [
  { p:"amazon",        n:"Amazon",       bg:"#FF9900",color:"#000" },
  { p:"mercadolivre",  n:"Mercado Livre",bg:"#FFE600",color:"#333" },
  { p:"shopee",        n:"Shopee",       bg:"#EE4D2D",color:"#fff" },
  { p:"magazineluiza", n:"Magalu",       bg:"#0066CC",color:"#fff" },
  { p:"magalu",        n:"Magalu",       bg:"#0066CC",color:"#fff" },
  { p:"casasbahia",    n:"Casas Bahia",  bg:"#F7941D",color:"#fff" },
  { p:"americanas",    n:"Americanas",   bg:"#E8192C",color:"#fff" },
  { p:"submarino",     n:"Submarino",    bg:"#0034BB",color:"#fff" },
  { p:"leroy",         n:"Leroy Merlin", bg:"#78BE1F",color:"#fff" },
  { p:"ikea",          n:"IKEA",         bg:"#0058A3",color:"#FFDA1A"},
];

const ICONS_MAP = {
  bed:BedDouble, sofa:Sofa, utensils:UtensilsCrossed, bath:Bath,
  home:Home, star:Star, zap:Zap, heart:Heart, target:Target, package:Package,
  shopping:ShoppingBag, dollar:DollarSign, layers:Layers, boxes:Boxes,
  mappin:MapPin, receipt:ReceiptText, wallet:Wallet, sparkles:Sparkles,
  tree:Lightbulb, bell:Bell, award:Award, settings:Settings,
};
const PALETTE = ["#1272AA","#2A9D8F","#E9A830","#7058C8","#D4875A","#D94F7A","#20B2AA","#5D9E3A"];

const getIcon  = (k) => ICONS_MAP[k] || Home;
const uid      = ()  => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmt      = (v) => { const n = parseFloat(v); return isNaN(n) ? "—" : n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); };
const daysLeft = (d) => {
  if (!d) return null;
  try { const t=new Date(d+"T00:00:00"),n=new Date(); n.setHours(0,0,0,0); return Math.round((t-n)/86400000); }
  catch { return null; }
};
const getStore = (url) => {
  if (!url) return null;
  try { const h=new URL(url).hostname.toLowerCase(); return STORE_MAP.find(s=>h.includes(s.p))||null; }
  catch { return null; }
};
const todayStr = () => new Date().toISOString().slice(0, 10);

/** Appends a price entry to item.priceHistory (deduplicates by date+price) */
const recordPrice = (item, price, source = "manual") => {
  const p = parseFloat(price);
  if (!price || isNaN(p) || p <= 0) return item;
  const history = Array.isArray(item.priceHistory) ? item.priceHistory : [];
  const t = todayStr();
  if (history.some(h => h.date === t && parseFloat(h.price) === p)) return item;
  return { ...item, priceHistory: [...history, { price: p, date: t, source }] };
};

/**
 * Returns promo info if current price is ≥10% below the historical maximum.
 * @returns {null | { discount: number, originalPrice: number }}
 */
const getPromoInfo = (item) => {
  const cur = parseFloat(item?.price);
  if (!item?.price || isNaN(cur) || cur <= 0) return null;
  const history = Array.isArray(item?.priceHistory) ? item.priceHistory : [];
  const prices = history.map(h => parseFloat(h.price)).filter(p => !isNaN(p) && p > 0);
  if (!prices.length) return null;
  const ref = Math.max(...prices);
  if (ref <= cur) return null;
  const disc = Math.round(((ref - cur) / ref) * 100);
  return disc >= 10 ? { discount: disc, originalPrice: ref } : null;
};

/* ── Trash helpers ── */
const TRASH_DAYS = 30; // auto-purge after this many days

const isDeleted  = (item) => !!item?.deletedAt;
const isActive   = (item) => !item?.deletedAt;

/** Returns days remaining before auto-purge, or null */
const trashDaysLeft = (item) => {
  if (!item?.deletedAt) return null;
  try {
    const del = new Date(item.deletedAt);
    const exp = new Date(del.getTime() + TRASH_DAYS * 86400000);
    const diff = Math.ceil((exp - new Date()) / 86400000);
    return Math.max(0, diff);
  } catch { return null; }
};

/* ═══════════════════════════════════════════════════════
   STORAGE SERVICE  ← fixed signature
═══════════════════════════════════════════════════════ */
const Storage = {
  // FIXED: fallback is 2nd arg, shared is 3rd
  get: async (key, fallback = null, shared = false) => {
    try {
      const r = await window.storage.get(key, shared);
      if (!r || r.value == null) return fallback;
      const parsed = JSON.parse(r.value);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  },
  set: async (key, val, shared = false) => {
    try { await window.storage.set(key, JSON.stringify(val), shared); } catch {}
  },
};

/* ═══════════════════════════════════════════════════════
   AI SERVICE
═══════════════════════════════════════════════════════ */
const AI = {
  _call: async (prompt, webSearch = true) => {
    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role:"user", content: prompt }],
    };
    if (webSearch) body.tools = [{ type:"web_search_20250305", name:"web_search" }];
    const res  = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const text = (data.content || []).filter(b=>b.type==="text").map(b=>b.text).join("");
    const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!m) throw new Error("Resposta sem JSON");
    return JSON.parse(m[0]);
  },

  extractProduct: async (url) => AI._call(`
Acesse esta URL de produto: "${url}"
Retorne APENAS JSON válido (sem markdown):
{"name":"nome completo do produto","price":"preço numérico decimal ou null","imageUrl":"URL da imagem principal ou null","brand":"marca ou null","suggestedRoom":"quarto|sala|cozinha|banheiro|outro"}
`, true),

  /** Busca preços em múltiplas lojas brasileiras via web_search */
  comparePrice: async (productName) => AI._call(`
Pesquise o produto "${productName}" nas lojas online brasileiras: Amazon, Mercado Livre, Shopee, Magazine Luiza, Casas Bahia, Americanas.
Para cada loja onde o produto for encontrado, retorne preço e URL.
Retorne APENAS JSON (sem markdown):
{"offers":[{"store":"nome da loja","price":valor_numerico,"url":"url_do_produto","inStock":true}]}
Regras: ordene do menor para o maior preço · máximo 6 ofertas · apenas produtos reais encontrados agora.
`, true),

  completeHome: async (rooms, items, aptSize) => AI._call(`
Consultor de enxoval. Apê: ${aptSize}. Cômodos: ${rooms.map(r=>r.name).join(", ")}.
Já tem: ${items.map(i=>i.name).join(", ") || "nenhum"}.
Liste itens ESSENCIAIS faltando. APENAS JSON array (sem markdown):
[{"name":"item","roomId":"${rooms.map(r=>r.id).join("|")}","estimatedPrice":numero,"priority":"high|normal|low"}]
Máx 20 itens, preços em reais, não repetir existentes.
`, false),
};

/* ═══════════════════════════════════════════════════════
   PRIMITIVE COMPONENTS
═══════════════════════════════════════════════════════ */
const Sk = ({ w="100%", h=16, r=8 }) => (
  <span className="shimmer" style={{ width:w, height:h, borderRadius:r, display:"block" }}/>
);

const ProductSkeleton = () => (
  <div style={{background:"var(--bg2)",border:"1px solid var(--bdr)",borderRadius:10,padding:"14px",display:"flex",gap:12}}>
    <Sk w={54} h={54} r={10}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
      <Sk h={14} w="80%"/>
      <Sk h={11} w="45%"/>
      <Sk h={18} w="30%"/>
    </div>
  </div>
);

const StoreBadge = ({ url }) => {
  const s = getStore(url);
  if (!s) return null;
  return <span className="sbdg" style={{background:s.bg,color:s.color}}>{s.n}</span>;
};

/**
 * Two-step delete button — avoids confirm() which is blocked in iframes.
 * First click: turns red and shows "Confirmar". Second click: deletes.
 * Clicking outside or waiting 3s resets to idle.
 */
function DeleteButton({ onConfirm, size=13 }) {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!armed) {
      setArmed(true);
      timerRef.current = setTimeout(() => setArmed(false), 3000);
    } else {
      clearTimeout(timerRef.current);
      onConfirm();
    }
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <button
      className="btn btn-g bico"
      onClick={handleClick}
      title={armed ? "Clique novamente para confirmar" : "Excluir"}
      style={{
        color: armed ? "white" : undefined,
        background: armed ? "var(--r)" : undefined,
        borderRadius: armed ? 8 : undefined,
        transition: "all .2s",
        minWidth: armed ? "auto" : undefined,
        padding: armed ? "4px 9px" : undefined,
        gap: 4,
        fontSize: armed ? 11 : undefined,
        fontWeight: armed ? 700 : undefined,
      }}
    >
      <Trash2 size={size}/>
      {armed && "Confirmar"}
    </button>
  );
}

const InsightCard = ({ type="info", text, Icon=Lightbulb, delay=0 }) => (
  <div className={`ins ins-${type}`} style={{animationDelay:`${delay}s`}}>
    <Icon size={14} style={{marginTop:1,flexShrink:0}}/>
    <span>{text}</span>
  </div>
);

/* ── PromoBadge: shows discount and crossed-out original price ── */
const PromoBadge = ({ promoInfo }) => {
  if (!promoInfo) return null;
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

/* ── PricePanel: per-card expandable price comparison ── */
function PricePanel({ item, onUpdatePrice }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [offers,  setOffers]  = useState(Array.isArray(item?.priceOffers) ? item.priceOffers : []);
  const [error,   setError]   = useState("");
  const fetched = offers.length > 0;

  const doCompare = async () => {
    if (!item?.name) return;
    setLoading(true); setError(""); setOpen(true);
    try {
      const r = await AI.comparePrice(item.name);
      const valid = (r?.offers || [])
        .filter(o => o?.price > 0)
        .sort((a, b) => a.price - b.price)
        .slice(0, 6);
      setOffers(valid);
      if (valid.length > 0) onUpdatePrice(item.id, valid);
    } catch {
      setError("Não foi possível buscar os preços agora.");
    } finally { setLoading(false); }
  };

  const best   = offers[0];
  const curPrc = parseFloat(item?.price);
  const saving = best && !isNaN(curPrc) && curPrc > best.price ? curPrc - best.price : 0;

  return (
    <div style={{marginTop:9,paddingTop:9,borderTop:"1px solid var(--bdr)"}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
        {!fetched ? (
          <button onClick={doCompare} disabled={loading} className="btn btn-g"
            style={{fontSize:11.5,fontWeight:700,color:"var(--p)",gap:4,padding:"4px 9px",background:"var(--pa)",borderRadius:8}}>
            {loading
              ? <><Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>Buscando preços...</>
              : <><BarChart2 size={12}/>Comparar preços</>}
          </button>
        ) : (
          <>
            {best && (
              <div style={{display:"flex",alignItems:"center",gap:6,flex:1,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:800,color:"var(--g)"}}>🏆 {fmt(best.price)}</span>
                <span className="best-tag">{best.store}</span>
                {saving > 0 && (
                  <span style={{fontSize:11,color:"var(--g)",background:"var(--ga)",padding:"1px 7px",borderRadius:99,fontWeight:700}}>
                    economize {fmt(saving)}
                  </span>
                )}
              </div>
            )}
            <button onClick={() => setOpen(o => !o)} className="btn btn-g"
              style={{fontSize:11,padding:"3px 8px",gap:3,marginLeft:"auto"}}>
              {open ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
              {open ? "Ocultar" : `${offers.length} lojas`}
            </button>
            <button onClick={doCompare} disabled={loading} className="btn btn-g bico" title="Atualizar preços">
              <RefreshCw size={12} style={loading?{animation:"spin 1s linear infinite"}:{}}/>
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <p style={{fontSize:11.5,color:"var(--r)",marginTop:6,display:"flex",gap:5,alignItems:"center"}}>
          <AlertCircle size={12}/>{error}
          <button onClick={doCompare} style={{color:"var(--p)",background:"none",border:"none",cursor:"pointer",fontSize:11.5,fontWeight:700}}>Tentar novamente</button>
        </p>
      )}

      {/* Offers list */}
      {fetched && open && (
        <div style={{marginTop:9,background:"var(--bg3)",borderRadius:10,overflow:"hidden",border:"1px solid var(--bdr)"}}>
          {offers.map((o, i) => (
            <div key={i} className={`price-row ${i===0?"best":""}`}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                {i === 0 && <span style={{fontSize:11}}>🏆</span>}
                <span style={{fontWeight:600,color:"var(--tx)"}}>{o.store}</span>
                {!o.inStock && <span style={{fontSize:10,color:"var(--r)"}}>indisponível</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontWeight:800,fontSize:13.5,color:i===0?"var(--g)":"var(--tx)"}}>{fmt(o.price)}</span>
                {o.url && (
                  <a href={o.url} target="_blank" rel="noopener noreferrer"
                    className="btn btn-g bico" style={{textDecoration:"none",width:26,height:26}}>
                    <ExternalLink size={11}/>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {fetched && offers.length === 0 && !error && (
        <p style={{fontSize:11.5,color:"var(--tx3)",marginTop:6}}>Nenhum resultado. Tente novamente mais tarde.</p>
      )}
    </div>
  );
}

function generateInsights(items=[], rooms=[], budget=null, deliveryDate="") {
  const insights = [];
  const total    = items.length;
  const bought   = items.filter(i => i?.status === "bought").length;
  const highPrio = items.filter(i => i?.priority === "high" && i?.status !== "bought");
  const noPrice  = items.filter(i => !i?.price || parseFloat(i.price) === 0);
  const spent    = items.filter(i => i?.status === "bought" && i?.price)
                        .reduce((s,i) => s + parseFloat(i.price||0), 0);
  const days       = daysLeft(deliveryDate);
  const emptyRooms = rooms.filter(r => !items.some(i => i?.roomId === r.id));
  const promoItems = items.filter(i => getPromoInfo(i) && i?.status !== "bought");

  // Promo alert first — most actionable
  if (promoItems.length > 0)
    insights.push({ type:"warn", Icon:BadgePercent, delay:0,
      text:`🔥 ${promoItems.length} item${promoItems.length>1?"s":""} em promoção! Preço abaixo do histórico — aproveite.` });

  if (days !== null && days > 0 && days <= 30)
    insights.push({ type:"alert", Icon:Clock, delay:.06, text:`⏰ Faltam apenas ${days} dias! Foque nos itens de alta prioridade primeiro.` });

  if (emptyRooms.length > 0)
    insights.push({ type:"warn", Icon:AlertTriangle, delay:.12, text:`Cômodos sem itens: ${emptyRooms.map(r=>r.name).join(", ")}.` });

  if (highPrio.length > 0) {
    const pct = total > 0 ? Math.round((highPrio.length/total)*100) : 0;
    insights.push({ type:"alert", Icon:Flame, delay:.18, text:`${highPrio.length} item${highPrio.length>1?"s":""} de alta prioridade pendente${highPrio.length>1?"s":""}${pct>0?` (${pct}% do total)`:""}.` });
  }

  const roomValues = rooms
    .map(r => ({ name:r.name, val:items.filter(i=>i?.roomId===r.id&&i?.price).reduce((s,i)=>s+parseFloat(i.price||0),0) }))
    .filter(r => r.val > 0).sort((a,b) => b.val - a.val);
  if (roomValues.length > 1)
    insights.push({ type:"info", Icon:TrendingUp, delay:.24, text:`Seu maior gasto está no(a) ${roomValues[0].name} (${fmt(roomValues[0].val)} estimado).` });

  if (noPrice.length > 0 && total > 3)
    insights.push({ type:"info", Icon:DollarSign, delay:.3, text:`${noPrice.length} item${noPrice.length>1?"s":""} sem preço. Adicione valores para melhorar a previsão.` });

  if (total > 0 && bought > 0) {
    const pct = Math.round((bought/total)*100);
    if (pct >= 75) insights.push({ type:"ok", Icon:Award, delay:.36, text:`🎉 Incrível! Você já comprou ${pct}% dos itens!` });
    else if (pct >= 50) insights.push({ type:"ok", Icon:CheckCircle2, delay:.36, text:`Você já comprou metade dos itens! Continue assim.` });
  }

  if (budget?.total > 0) {
    const pct = (spent / budget.total) * 100;
    if (pct >= 80 && pct < 100)
      insights.push({ type:"warn", Icon:Wallet, delay:.42, text:`${Math.round(pct)}% do orçamento utilizado. Revise os itens restantes.` });
  }

  return insights.slice(0, 4);
}

/* ═══════════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════════ */

/* ── Quick Add ── */
function QuickAddModal({ rooms=[], items=[], onSave, onClose }) {
  const [url,       setUrl]       = useState("");
  const [name,      setName]      = useState("");
  const [roomId,    setRoomId]    = useState(rooms[0]?.id || "");
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState(1);
  const [extracted, setExtracted] = useState(null);
  const [error,     setError]     = useState("");
  const urlRef = useRef(null);

  useEffect(() => { setTimeout(() => urlRef.current?.focus(), 80); }, []);

  const doExtract = useCallback(async (target) => {
    const u = (target || url).trim();
    if (!u || !u.startsWith("http")) return;
    setLoading(true); setError(""); setStep(2);
    try {
      const info = await AI.extractProduct(u);
      setExtracted(info || {});
      if (info?.name)          setName(info.name);
      if (info?.suggestedRoom && info.suggestedRoom !== "outro") {
        const m = rooms.find(r => r.id === info.suggestedRoom);
        if (m) setRoomId(m.id);
      }
    } catch {
      setError("Não consegui extrair automaticamente. Preencha manualmente.");
    } finally { setLoading(false); }
  }, [url, rooms]);

  const handlePaste = useCallback((e) => {
    const t = e.clipboardData?.getData("text") || "";
    if (t.startsWith("http://") || t.startsWith("https://")) {
      e.preventDefault(); setUrl(t);
      setTimeout(() => doExtract(t), 80);
    } else if (t.length > 2 && !t.startsWith("http")) {
      setName(t); setStep(2);
    }
  }, [doExtract]);

  /* ✅ FIX: Do NOT pass id here.
     Old bug: passing id:uid() made saveItem think this was an edit,
     called .map() which found no match → item silently lost.
     saveItem now generates id only for truly new items (no id in data). */
  const handleSave = () => {
    if (!name.trim() || !roomId) return;
    const priceStr = extracted?.price ? String(extracted.price) : "";
    onSave({
      name:     name.trim(),
      link:     url.trim(),
      price:    priceStr,
      imageUrl: extracted?.imageUrl || "",
      status:   "want",
      priority: "normal",
      roomId,
      notes:    extracted?.brand ? `Marca: ${extracted.brand}` : "",
      starred:  false,
      priceHistory: priceStr
        ? [{ price: parseFloat(priceStr), date: todayStr(), source: "auto" }]
        : [],
      priceOffers: [],
    });
  };

  const suggs = (ROOM_SUGGESTIONS[roomId] || [])
    .filter(s => !(items || []).some(i => i?.name?.toLowerCase() === s.toLowerCase()))
    .slice(0, 5);

  const RoomPicker = () => (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {rooms.map(r => {
        const Icon = getIcon(r.icon);
        const on = roomId === r.id;
        return (
          <button key={r.id} onClick={() => setRoomId(r.id)} style={{
            padding:"7px 12px", borderRadius:9, cursor:"pointer", fontFamily:"var(--f)", fontSize:12.5, fontWeight:600,
            border:`1.5px solid ${on?r.color:"var(--bdr)"}`,
            background:on?`${r.color}18`:"transparent",
            color:on?r.color:"var(--tx3)", transition:"all .18s",
            display:"flex", alignItems:"center", gap:5,
          }}>
            <Icon size={12}/>{r.name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mbk" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:480}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 className="fd" style={{fontSize:21,fontWeight:600}}>Adicionar rápido</h2>
            <span className="aitag" style={{marginTop:4,display:"inline-flex"}}><Sparkles size={9}/>IA preenche automaticamente</span>
          </div>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>

        {step === 1 && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label className="lbl">Cole o link ou escreva o nome</label>
              <div style={{position:"relative"}}>
                <input ref={urlRef} className="inp" placeholder="https://... ou nome do produto"
                  value={url} onChange={e=>setUrl(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={e => e.key==="Enter" && url.startsWith("http") && doExtract()}
                  style={{paddingRight:url ? 104 : 14}}/>
                {url && (
                  <button className="btn btn-p" onClick={()=>doExtract()}
                    style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",padding:"6px 11px",fontSize:12}}>
                    <Sparkles size={12}/>Preencher
                  </button>
                )}
              </div>
              <p style={{fontSize:11.5,color:"var(--tx3)",marginTop:6,lineHeight:1.5}}>
                🔗 Cole um link → IA busca nome, preço e imagem<br/>
                ✏️ Ou escreva/cole o nome diretamente
              </p>
            </div>
            <div><label className="lbl">Cômodo</label><RoomPicker/></div>
            {suggs.length > 0 && (
              <div>
                <label className="lbl">Sugestões rápidas</label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {suggs.map(s => (
                    <button key={s} className="sch" onClick={()=>{ setName(s); setStep(2); }}>
                      <Plus size={9}/>{s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
              <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
              <button className="btn btn-p" onClick={()=>setStep(2)} disabled={!url.trim()&&!name.trim()}
                style={(!url.trim()&&!name.trim())?{opacity:.5,cursor:"not-allowed"}:{}}>
                Continuar<ArrowRight size={14}/>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {loading && <ProductSkeleton/>}
            {!loading && extracted && !error && (
              <div style={{background:"var(--ga)",border:"1px solid rgba(61,140,95,.3)",borderRadius:10,padding:"12px 14px",display:"flex",gap:12}}>
                {extracted.imageUrl && (
                  <img src={extracted.imageUrl} alt="" style={{width:54,height:54,objectFit:"cover",borderRadius:8,flexShrink:0}}
                    onError={e=>{e.target.style.display="none";}}/>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:10.5,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>✓ Preenchido pela IA</p>
                  <p style={{fontSize:13.5,fontWeight:600,color:"var(--tx)",lineHeight:1.3}}>{extracted.name}</p>
                  {extracted.price && <p style={{fontSize:13,fontWeight:800,color:"var(--g)",marginTop:3}}>{fmt(extracted.price)}</p>}
                  {extracted.brand && <p style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>{extracted.brand}</p>}
                </div>
              </div>
            )}
            {!loading && error && (
              <div style={{background:"var(--pa)",border:"1px solid rgba(184,92,50,.25)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--p)",display:"flex",gap:7}}>
                <AlertCircle size={14} style={{flexShrink:0,marginTop:1}}/>{error}
              </div>
            )}
            {!loading && (
              <>
                <div><label className="lbl">Nome *</label>
                  <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do produto" autoFocus/>
                </div>
                <div><label className="lbl">Cômodo *</label><RoomPicker/></div>
              </>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:4}}>
              <button className="btn btn-g" onClick={()=>{setStep(1);setExtracted(null);setError("");}}><ArrowLeft size={13}/>Voltar</button>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
                <button className="btn btn-p" onClick={handleSave}
                  disabled={!name.trim()||!roomId||loading}
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

/* ── Full Item Form ── */
function ItemModal({ item, rooms=[], onSave, onClose }) {
  const [f, setF] = useState({
    name:item?.name||"", link:item?.link||"", price:item?.price||"",
    imageUrl:item?.imageUrl||"", notes:item?.notes||"",
    status:item?.status||"want", roomId:item?.roomId||(rooms[0]?.id||""),
    priority:item?.priority||"normal", starred:item?.starred||false,
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const valid = f.name.trim() && f.roomId;

  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 className="fd" style={{fontSize:21,fontWeight:600}}>{item?.id?"Editar item":"Novo item"}</h2>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><label className="lbl">Nome *</label>
            <input className="inp" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Nome do produto" autoFocus/>
          </div>
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
            <div><label className="lbl">Preço (R$)</label>
              <input className="inp" type="number" min="0" step="0.01" value={f.price} onChange={e=>set("price",e.target.value)} placeholder="0,00"/>
            </div>
            <div><label className="lbl">Prioridade</label>
              <select className="inp" value={f.priority} onChange={e=>set("priority",e.target.value)} style={{cursor:"pointer"}}>
                <option value="low">📌 Baixa</option>
                <option value="normal">🔵 Normal</option>
                <option value="high">⚡ Alta prioridade</option>
              </select>
            </div>
          </div>
          <div><label className="lbl">Link</label>
            <input className="inp" value={f.link} onChange={e=>set("link",e.target.value)} placeholder="https://..."/>
          </div>
          <div><label className="lbl">URL da imagem</label>
            <input className="inp" value={f.imageUrl} onChange={e=>set("imageUrl",e.target.value)} placeholder="https://..."/>
          </div>
          <div><label className="lbl">Observações</label>
            <textarea className="inp" rows={3} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Cor, tamanho, modelo..." style={{resize:"vertical"}}/>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--tx2)"}}>
            <input type="checkbox" checked={f.starred} onChange={e=>set("starred",e.target.checked)} style={{width:16,height:16,accentColor:"var(--go)"}}/>
            ⭐ Marcar como favorito
          </label>
        </div>
        <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
          <button className="btn btn-p" disabled={!valid} onClick={()=>{ if(valid) onSave({...item,...f,name:f.name.trim()}); }}
            style={!valid?{opacity:.5,cursor:"not-allowed"}:{}}>
            <Check size={14}/>{item?.id?"Salvar":"Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Budget Modal ── */
function BudgetModal({ budget, onSave, onClose }) {
  const [val, setVal] = useState(budget?.total || "");
  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 className="fd" style={{fontSize:20,fontWeight:600}}>Orçamento total</h2>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>
        <label className="lbl">Quanto você pretende gastar no total?</label>
        <input className="inp" type="number" min="0" value={val} onChange={e=>setVal(e.target.value)} placeholder="Ex: 15000" autoFocus/>
        <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}>
          <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
          <button className="btn btn-p" onClick={()=>onSave({total:parseFloat(val)||0})}>
            <PiggyBank size={14}/>Salvar orçamento
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Complete Home ── */
function CompleteHomeModal({ rooms=[], items=[], onAddItems, onClose }) {
  const [aptSize, setAptSize] = useState("2 quartos");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected,    setSelected]    = useState(new Set());
  const [error,       setError]       = useState("");
  const [step,        setStep]        = useState(1);

  const handleGenerate = async () => {
    setLoading(true); setError("");
    try {
      const result = await AI.completeHome(rooms, items, aptSize);
      const arr = Array.isArray(result) ? result : (result?.items || []);
      const valid = arr.filter(i => rooms.some(r=>r.id===i.roomId));
      setSuggestions(valid);
      setSelected(new Set(valid.map((_,i)=>i)));
      setStep(2);
    } catch(e) {
      setError("Erro ao gerar sugestões. Tente novamente.");
    } finally { setLoading(false); }
  };

  const toggle = (idx) => setSelected(s=>{ const n=new Set(s); n.has(idx)?n.delete(idx):n.add(idx); return n; });

  const handleAdd = () => {
    const toAdd = suggestions
      .filter((_,i)=>selected.has(i))
      .map(s=>({ ...s, id:uid(), status:"want", notes:"", starred:false, imageUrl:"", link:"",
                  price:s.estimatedPrice?.toString()||"", createdAt:new Date().toISOString() }));
    onAddItems(toAdd);
  };

  const sizes = ["Studio","1 quarto","2 quartos","3 quartos","4+ quartos"];

  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 className="fd" style={{fontSize:21,fontWeight:600}}>Completar minha casa</h2>
            <span className="aitag" style={{marginTop:4,display:"inline-flex"}}><Sparkles size={9}/>IA sugere o que está faltando</span>
          </div>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>

        {step===1 && (
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              <label className="lbl">Tamanho do apartamento</label>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {sizes.map(o=>(
                  <button key={o} onClick={()=>setAptSize(o)} style={{
                    padding:"8px 14px",borderRadius:9,cursor:"pointer",fontFamily:"var(--f)",fontSize:13,fontWeight:600,
                    border:`1.5px solid ${aptSize===o?"var(--p)":"var(--bdr)"}`,
                    background:aptSize===o?"var(--pa)":"transparent",
                    color:aptSize===o?"var(--p)":"var(--tx3)",transition:"all .18s",
                  }}>{o}</button>
                ))}
              </div>
            </div>
            <div style={{background:"var(--pa)",border:"1px solid rgba(184,92,50,.2)",borderRadius:10,padding:"12px 14px",fontSize:13,color:"var(--tx2)"}}>
              <p style={{fontWeight:700,marginBottom:4,color:"var(--p)"}}>Como funciona?</p>
              <p style={{lineHeight:1.55}}>A IA analisa os {items.length} itens já na lista e sugere o que falta para um enxoval completo de {aptSize}.</p>
            </div>
            {error && <div style={{color:"var(--r)",fontSize:13,background:"var(--ra)",padding:"10px 12px",borderRadius:9}}>{error}</div>}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
              <button className="btn btn-p" onClick={handleGenerate} disabled={loading}>
                {loading?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Gerando...</>:<><Sparkles size={14}/>Gerar sugestões</>}
              </button>
            </div>
          </div>
        )}

        {step===2 && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:14,color:"var(--tx2)"}}><b style={{color:"var(--tx)"}}>{selected.size}</b> de {suggestions.length} selecionados</p>
              <button className="btn btn-g" onClick={()=>selected.size===suggestions.length?setSelected(new Set()):setSelected(new Set(suggestions.map((_,i)=>i)))} style={{fontSize:12}}>
                {selected.size===suggestions.length?"Desmarcar todos":"Marcar todos"}
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:340,overflowY:"auto"}}>
              {suggestions.map((s,i)=>{
                const room=rooms.find(r=>r.id===s.roomId);
                const Icon=room?getIcon(room.icon):Home;
                const on=selected.has(i);
                return (
                  <div key={i} onClick={()=>toggle(i)} style={{
                    display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,cursor:"pointer",
                    border:`1.5px solid ${on?"var(--p)":"var(--bdr)"}`,
                    background:on?"var(--pa)":"transparent",transition:"all .18s",
                  }}>
                    <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${on?"var(--p)":"var(--bdr2)"}`,
                      background:on?"var(--p)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .18s"}}>
                      {on&&<Check size={12} style={{color:"white"}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:600,fontSize:13.5}}>{s.name}</p>
                      <p style={{fontSize:11,color:"var(--tx3)",display:"flex",alignItems:"center",gap:4,marginTop:1}}>
                        <Icon size={9}/>{room?.name}
                        {s.priority==="high"&&<span className="bdg bh" style={{fontSize:9,marginLeft:2}}>Alta</span>}
                      </p>
                    </div>
                    {s.estimatedPrice&&<span style={{fontSize:12.5,fontWeight:700,color:"var(--tx2)",whiteSpace:"nowrap"}}>{fmt(s.estimatedPrice)}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"space-between",paddingTop:6,borderTop:"1px solid var(--bdr)"}}>
              <button className="btn btn-g" onClick={()=>setStep(1)}><ArrowLeft size={13}/>Refazer</button>
              <button className="btn btn-p" onClick={handleAdd} disabled={selected.size===0}
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

/* ── Share / Couple ── */
function ShareModal({ coupleMode, onToggle, onClose }) {
  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 className="fd" style={{fontSize:20,fontWeight:600}}>Modo casal</h2>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{width:68,height:68,borderRadius:18,background:"var(--pa)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <Heart size={30} style={{color:"var(--p)"}}/>
          </div>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Organize junto com seu parceiro(a)</h3>
          <p style={{fontSize:13,color:"var(--tx2)",lineHeight:1.6,marginBottom:18}}>
            Com o modo casal ativo, os dados são sincronizados e ambos podem editar a lista em qualquer dispositivo.
          </p>
          <button className="btn btn-p pulse" onClick={onToggle} style={{width:"100%",justifyContent:"center",padding:"13px",fontSize:14}}>
            {coupleMode?<><X size={15}/>Desativar</>:<><Heart size={15}/>Ativar modo casal</>}
          </button>
          {coupleMode&&(
            <div style={{marginTop:14,background:"var(--ga)",border:"1px solid rgba(61,140,95,.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--g)"}}>
              ✓ Ativo! Abra este app em outro dispositivo para sincronizar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Room Modal ── */
function RoomModal({ onSave, onClose }) {
  const [name,setName]=useState(""); const [icon,setIcon]=useState("home"); const [color,setColor]=useState(PALETTE[0]);
  return (
    <div className="mbk" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{padding:"26px",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 className="fd" style={{fontSize:20,fontWeight:600}}>Novo cômodo</h2>
          <button className="btn btn-g bico" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:15}}>
          <div><label className="lbl">Nome</label>
            <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Varanda, Escritório..." autoFocus/>
          </div>
          <div><label className="lbl">Ícone</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {Object.entries(ICONS_MAP).map(([k,Icon])=>(
                <button key={k} onClick={()=>setIcon(k)} style={{
                  width:37,height:37,borderRadius:9,border:`2px solid ${icon===k?color:"var(--bdr)"}`,
                  background:icon===k?`${color}20`:"transparent",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:icon===k?color:"var(--tx3)",transition:"all .18s",
                }}><Icon size={16}/></button>
              ))}
            </div>
          </div>
          <div><label className="lbl">Cor</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {PALETTE.map(c=>(
                <button key={c} onClick={()=>setColor(c)} style={{
                  width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",
                  border:`3px solid ${color===c?"var(--tx)":"transparent"}`,outline:"none",transition:"all .18s",
                }}/>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-s" onClick={onClose}><X size={13}/>Cancelar</button>
          <button className="btn btn-p" disabled={!name.trim()} onClick={()=>{if(name.trim())onSave({name:name.trim(),icon,color});}}
            style={!name.trim()?{opacity:.5,cursor:"not-allowed"}:{}}>
            <Plus size={14}/>Criar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ITEM CARD
═══════════════════════════════════════════════════════ */
function ItemCard({ item, rooms=[], onToggle, onEdit, onDelete, onDuplicate, onStar, onUpdatePrice }) {
  const room      = rooms.find(r=>r.id===item?.roomId);
  const RIcon     = room ? getIcon(room.icon) : Home;
  const store     = getStore(item?.link);
  const promoInfo = getPromoInfo(item);
  const [buying, setBuying] = useState(false);

  if (!item) return null;

  const handleToggle = () => {
    setBuying(true); onToggle(item);
    setTimeout(()=>setBuying(false), 500);
  };

  const cls = [
    "ic",
    item.status==="bought" ? "bought" : "",
    item.priority==="high" && item.status!=="bought" ? "phi" : "",
    item.starred && item.status!=="bought" && !promoInfo ? "starred" : "",
    promoInfo && item.status!=="bought" ? "promo" : "",
    buying ? "acp" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={cls} style={{padding:"14px 15px"}}>
      <div style={{display:"flex",gap:12}}>
        {/* Thumbnail */}
        <div style={{width:64,height:64,borderRadius:9,flexShrink:0,overflow:"hidden",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
            : <Package size={22} style={{color:"var(--tx3)"}}/>}
          {item.starred && !promoInfo && (
            <div style={{position:"absolute",top:2,right:2,width:15,height:15,borderRadius:"50%",background:"var(--go)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Star size={8} style={{color:"white",fill:"white"}}/>
            </div>
          )}
          {promoInfo && item.status!=="bought" && (
            <div style={{position:"absolute",bottom:0,left:0,right:0,background:"var(--go)",color:"white",fontSize:8,fontWeight:800,textAlign:"center",padding:"2px 0",letterSpacing:".03em"}}>
              🔥 {promoInfo.discount}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:14,color:"var(--tx)",textDecoration:item.status==="bought"?"line-through":"none",lineHeight:1.3,flex:1}}>
              {item.name}
            </span>
            {item.priority==="high" && item.status!=="bought" && (
              <span className="bdg bh" style={{flexShrink:0}}><Flame size={8}/>Alta</span>
            )}
          </div>

          {/* Badges */}
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:promoInfo&&item.status!=="bought"?5:7,alignItems:"center"}}>
            {room && (
              <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10.5,color:"var(--tx3)",background:"var(--bg3)",padding:"2px 7px",borderRadius:99}}>
                <RIcon size={9}/>{room.name}
              </span>
            )}
            <span className={`bdg ${item.status==="bought"?"bd":"bw"}`}>
              {item.status==="bought"?"✓ Comprado":"Quero comprar"}
            </span>
            {item.price && (
              <span style={{display:"flex",alignItems:"center",gap:5}}>
                {promoInfo && (
                  <span style={{fontSize:11,color:"var(--tx3)",textDecoration:"line-through"}}>
                    {fmt(promoInfo.originalPrice)}
                  </span>
                )}
                <span style={{fontSize:13,fontWeight:800,color:promoInfo?"var(--go)":"var(--p)"}}>
                  {fmt(item.price)}
                </span>
              </span>
            )}
            {store && <StoreBadge url={item.link}/>}
          </div>

          {/* Promo strip */}
          {promoInfo && item.status!=="bought" && (
            <div style={{marginBottom:6}}><PromoBadge promoInfo={promoInfo}/></div>
          )}

          {item.notes && <p style={{fontSize:11.5,color:"var(--tx3)",lineHeight:1.4,marginBottom:6}}>{item.notes}</p>}

          {/* Actions */}
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button onClick={handleToggle} className="btn btn-g"
              style={{fontSize:11.5,fontWeight:700,padding:"4px 9px",borderRadius:7,gap:4,
                background:item.status==="bought"?"var(--ga)":"var(--pa)",
                color:item.status==="bought"?"var(--g)":"var(--p)"}}>
              {item.status==="bought"?<Circle size={11}/>:<CheckCircle2 size={11}/>}
              {item.status==="bought"?"Desmarcar":"Comprado!"}
            </button>
            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-g bico" style={{textDecoration:"none"}}><ExternalLink size={13}/></a>}
            <button className="btn btn-g bico" onClick={()=>onEdit(item)} title="Editar"><Edit3 size={13}/></button>
            <DeleteButton onConfirm={()=>onDelete(item.id)}/>
            <button className={`btn btn-g bico bstr ${item.starred?"on":""}`} onClick={()=>onStar(item)}>
              <Star size={13} style={item.starred?{fill:"var(--go)"}:{}}/>
            </button>
            <button className="btn btn-g bico" onClick={()=>onDuplicate(item)} title="Duplicar"><Copy size={13}/></button>
          </div>

          {/* Price comparison panel */}
          {onUpdatePrice && (
            <PricePanel item={item} onUpdatePrice={onUpdatePrice}/>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CHART
═══════════════════════════════════════════════════════ */
function SpendingChart({ items=[], rooms=[] }) {
  const [mode, setMode] = useState("both");

  const data = rooms.map(r=>({
    name: r.name.length>8?r.name.slice(0,7)+"…":r.name,
    full: r.name, color: r.color,
    estimado: items.filter(i=>i?.roomId===r.id&&i?.price).reduce((s,i)=>s+parseFloat(i.price||0),0),
    gasto:    items.filter(i=>i?.roomId===r.id&&i?.status==="bought"&&i?.price).reduce((s,i)=>s+parseFloat(i.price||0),0),
  })).filter(d=>d.estimado>0);

  if (!data.length) return null;

  const Tip = ({active,payload,label})=>{
    if (!active||!payload?.length) return null;
    const d = data.find(x=>x.name===label)||{};
    return (
      <div style={{background:"var(--bg2)",border:"1px solid var(--bdr)",borderRadius:10,padding:"10px 14px"}}>
        <p style={{fontWeight:700,marginBottom:4}}>{d.full}</p>
        {(mode==="both"||mode==="estimated")&&<p style={{fontSize:12,color:"var(--tx2)"}}>Estimado: <b style={{color:"var(--p)"}}>{fmt(d.estimado)}</b></p>}
        {(mode==="both"||mode==="spent")&&<p style={{fontSize:12,color:"var(--tx2)"}}>Gasto: <b style={{color:"var(--g)"}}>{fmt(d.gasto)}</b></p>}
      </div>
    );
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:7}}>
          <BarChart2 size={15} style={{color:"var(--p)"}}/>Gastos por cômodo
        </h3>
        <div style={{display:"flex",gap:5}}>
          {[{k:"both",l:"Ambos",icon:"◈"},{k:"estimated",l:"Estimado",icon:"◻"},{k:"spent",l:"Gasto",icon:"◼"}].map(m=>(
            <button key={m.k} onClick={()=>setMode(m.k)} style={{
              padding:"4px 9px",borderRadius:99,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"var(--f)",
              border:"1.5px solid var(--bdr)",background:mode===m.k?"var(--p)":"transparent",
              color:mode===m.k?"white":"var(--tx3)",transition:"all .18s",
            }}>{m.l}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={165}>
        <BarChart data={data} barSize={22} barCategoryGap="25%" barGap={4}>
          <XAxis dataKey="name" tick={{fontSize:11.5,fill:"var(--tx3)",fontFamily:"var(--f)"}} axisLine={false} tickLine={false}/>
          <YAxis hide/>
          <Tooltip content={<Tip/>} cursor={{fill:"var(--bg3)"}}/>
          {(mode==="both"||mode==="estimated")&&<Bar dataKey="estimado" radius={[6,6,0,0]}>{data.map((d,i)=><Cell key={i} fill={d.color+"55"}/>)}</Bar>}
          {(mode==="both"||mode==="spent")&&<Bar dataKey="gasto" radius={[6,6,0,0]}>{data.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD VIEW
═══════════════════════════════════════════════════════ */
function Dashboard({ items=[], rooms=[], deliveryDate="", onSetDate, budget, onOpenBudget, onQuickAdd, onAddItem, onCompleteHome, coupleMode, onUpdatePrice }) {
  const total    = items.length;
  const bought   = items.filter(i=>i?.status==="bought").length;
  const want     = total - bought;
  const pct      = total>0 ? Math.round((bought/total)*100) : 0;
  const allVal   = items.filter(i=>i?.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const spentVal = items.filter(i=>i?.status==="bought"&&i?.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const days     = daysLeft(deliveryDate);
  const budgetPct= (budget?.total||0)>0 ? Math.round((spentVal/budget.total)*100) : 0;
  const overBudget = (budget?.total||0)>0 && spentVal>budget.total;

  const priced   = items.filter(i=>i?.price&&parseFloat(i.price)>0);
  const avgTicket= priced.length>0 ? priced.reduce((s,i)=>s+parseFloat(i.price),0)/priced.length : 0;
  const noPrice  = items.filter(i=>!i?.price||parseFloat(i?.price||0)===0).length;
  const forecast = allVal + (noPrice * avgTicket);

  const insights    = useMemo(()=>generateInsights(items,rooms,budget,deliveryDate),[items,rooms,budget,deliveryDate]);
  const highPrio    = items.filter(i=>i?.priority==="high"&&i?.status!=="bought").slice(0,3);
  const topExp      = items.filter(i=>i?.price&&i?.status!=="bought").sort((a,b)=>parseFloat(b.price)-parseFloat(a.price)).slice(0,3);
  const roomStats   = rooms.map(r=>({
    ...r,
    count: items.filter(i=>i?.roomId===r.id).length,
    bought:items.filter(i=>i?.roomId===r.id&&i?.status==="bought").length,
  })).filter(r=>r.count>0);

  const budgetColor = overBudget?"var(--r)":budgetPct>=90?"#D46020":budgetPct>=70?"var(--go)":"var(--g)";

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:30,fontWeight:600,lineHeight:1.15}}>
            Meu Enxoval {coupleMode&&<span style={{fontSize:16,color:"var(--p)"}}>♥ Casal</span>}
          </h1>
          <p style={{color:"var(--tx2)",fontSize:14,marginTop:3}}>Organize tudo para o novo lar</p>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <button className="btn btn-s" style={{fontSize:12.5}} onClick={onCompleteHome}><Sparkles size={13}/>Completar casa</button>
          <button className="btn btn-s" style={{fontSize:12.5}} onClick={onQuickAdd}><Zap size={13}/>Rápido</button>
          <button className="btn btn-p pulse" style={{fontSize:12.5}} onClick={onAddItem}><Plus size={13}/>Adicionar</button>
        </div>
      </div>

      {/* Countdown Hero */}
      <div style={{background:"linear-gradient(135deg,#0C5884 0%,#1E90CC 100%)",borderRadius:18,padding:"22px 24px",color:"white"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <p style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",opacity:.75,marginBottom:5,display:"flex",alignItems:"center",gap:5}}>
              <Clock size={10}/>Contagem regressiva
            </p>
            {days!==null ? (
              <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                <span className="fd" style={{fontSize:54,fontWeight:400,fontStyle:"italic",lineHeight:1}}>{Math.max(0,days)}</span>
                <span style={{fontSize:17,opacity:.85}}>{days<0?"dias (chegou! ✨)":days===1?"dia restante":"dias restantes"}</span>
              </div>
            ) : (
              <p style={{fontSize:15,opacity:.7,marginTop:2}}>Defina a data de entrega →</p>
            )}
          </div>
          <div>
            <label style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",opacity:.7,display:"block",marginBottom:6,display:"flex",alignItems:"center",gap:4}}><CalendarDays size={10}/>Data de entrega</label>
            <input type="date" value={deliveryDate||""} onChange={e=>onSetDate(e.target.value)}
              style={{background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.35)",borderRadius:8,
                padding:"8px 13px",color:"white",fontFamily:"var(--f)",fontSize:13,cursor:"pointer",outline:"none",colorScheme:"dark"}}/>
          </div>
        </div>
        <div style={{marginTop:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{opacity:.75,fontSize:12}}>Progresso de compras</span>
            <span style={{fontWeight:800,fontSize:14}}>{pct}%</span>
          </div>
          <div style={{height:6,background:"rgba(255,255,255,.2)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:"rgba(255,255,255,.9)",borderRadius:99,transition:"width .8s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:7,opacity:.7,fontSize:11.5}}>
            <span>{bought} comprado{bought!==1?"s":""}</span><span>{want} pendente{want!==1?"s":""}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10}}>
        {[
          {l:"Total",    v:total,       Icon:Package,      c:"var(--p)",  d:0},
          {l:"Comprados",v:bought,      Icon:CheckCircle2, c:"var(--g)",  d:.06},
          {l:"Pendentes",v:want,        Icon:ShoppingBag,  c:"var(--go)", d:.12},
          {l:"Estimado", v:fmt(allVal), Icon:DollarSign,   c:"var(--p)",  d:.18, sm:true},
        ].map((s,i)=>(
          <div key={i} className="stat" style={{animationDelay:`${s.d}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>{s.l}</p>
                <p className="fd" style={{fontSize:s.sm?17:30,fontWeight:s.sm?700:400,fontStyle:s.sm?"normal":"italic",color:s.c,lineHeight:1}}>{s.v}</p>
              </div>
              <div style={{width:32,height:32,borderRadius:8,background:`${s.c}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <s.Icon size={15} style={{color:s.c}}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Finance */}
      <div className="card" style={{padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:7}}>
            <Wallet size={14} style={{color:"var(--p)"}}/>Controle financeiro
          </h3>
          <button className="btn btn-g" onClick={onOpenBudget} style={{fontSize:12}}>
            <Edit3 size={12}/>{budget?.total?"Editar":"Definir orçamento"}
          </button>
        </div>
        {overBudget && (
          <div style={{background:"var(--ra)",border:"1px solid rgba(184,50,50,.25)",borderRadius:9,padding:"10px 13px",fontSize:13,color:"var(--r)",display:"flex",gap:7,marginBottom:12}}>
            <AlertCircle size={14} style={{flexShrink:0}}/>Orçamento estourado em {fmt(spentVal-(budget?.total||0))}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
          {[
            {l:"Orçamento",  v:budget?.total?fmt(budget.total):"—",   c:"var(--tx)"},
            {l:"Já gasto",   v:fmt(spentVal),                          c:"var(--g)"},
            {l:budget?.total?"Restante":"Pendente", v:budget?.total?fmt(Math.max(0,budget.total-spentVal)):fmt(allVal-spentVal), c:overBudget?"var(--r)":"var(--p)"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{s.l}</p>
              <p className="fd" style={{fontSize:16,fontWeight:400,fontStyle:"italic",color:s.c}}>{s.v}</p>
            </div>
          ))}
        </div>
        {(budget?.total||0)>0 && (
          <div>
            <div className="ptr"><div className="pfl" style={{width:`${Math.min(100,budgetPct)}%`,background:budgetColor}}/></div>
            <p style={{fontSize:11,color:budgetColor,marginTop:5,textAlign:"right",fontWeight:600}}>{budgetPct}% utilizado</p>
          </div>
        )}
        {priced.length>0 && (
          <div style={{display:"flex",gap:10,marginTop:14,paddingTop:14,borderTop:"1px solid var(--bdr)"}}>
            <div style={{flex:1,textAlign:"center"}}>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Ticket médio</p>
              <p style={{fontSize:15,fontWeight:800,color:"var(--tx2)"}}>{fmt(avgTicket)}</p>
            </div>
            <div style={{width:1,background:"var(--bdr)"}}/>
            <div style={{flex:1,textAlign:"center"}}>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Previsão total</p>
              <p style={{fontSize:15,fontWeight:800,color:"var(--p)"}}>{fmt(forecast)}</p>
              {noPrice>0&&<p style={{fontSize:10,color:"var(--tx3)",marginTop:2}}>+{noPrice} sem preço estimados</p>}
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights.length>0 && (
        <div>
          <p style={{fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9,display:"flex",alignItems:"center",gap:5}}>
            <Lightbulb size={12}/>Insights
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {insights.map((ins,i)=><InsightCard key={i} {...ins} delay={i*.08}/>)}
          </div>
        </div>
      )}

      {/* Chart */}
      {items.some(i=>i?.price) && (
        <div className="card" style={{padding:"18px 20px"}}>
          <SpendingChart items={items} rooms={rooms}/>
        </div>
      )}

      {/* High priority */}
      {highPrio.length>0 && (
        <div>
          <p style={{fontSize:11,fontWeight:700,color:"var(--r)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9,display:"flex",alignItems:"center",gap:5}}>
            <Flame size={12}/>Alta prioridade
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {highPrio.map(item=>{
              const room=rooms.find(r=>r.id===item.roomId);
              const Icon=room?getIcon(room.icon):Home;
              return (
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"var(--bg2)",border:"1.5px solid rgba(184,50,50,.2)",borderLeft:"3.5px solid var(--r)",borderRadius:"0 10px 10px 0"}}>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:13.5}}>{item.name}</p>
                    <p style={{fontSize:11,color:"var(--tx3)",display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                      <Icon size={9}/>{room?.name}{item.price&&<span style={{color:"var(--p)",fontWeight:700,marginLeft:4}}>{fmt(item.price)}</span>}
                    </p>
                  </div>
                  {item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-g bico" style={{textDecoration:"none"}}><ExternalLink size={13}/></a>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top expensive */}
      {topExp.length>0 && (
        <div>
          <p style={{fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9,display:"flex",alignItems:"center",gap:5}}>
            <TrendingUp size={12} style={{color:"var(--go)"}}/>Mais caros pendentes
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topExp.map((item,idx)=>{
              const room=rooms.find(r=>r.id===item.roomId);
              return (
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--bg2)",border:"1px solid var(--bdr)",borderRadius:10}}>
                  <span style={{fontSize:18,width:24,textAlign:"center"}}>{"🥇🥈🥉"[idx]}</span>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:600,fontSize:13.5}}>{item.name}</p>
                    <p style={{fontSize:11,color:"var(--tx3)"}}>{room?.name}</p>
                  </div>
                  <span style={{fontSize:14,fontWeight:800,color:"var(--p)"}}>{fmt(item.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Room progress */}
      {roomStats.length>0 && (
        <div>
          <h3 className="fd" style={{fontSize:20,fontWeight:600,marginBottom:12}}>Por cômodo</h3>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {roomStats.map(r=>{
              const Icon=getIcon(r.icon);
              const p=r.count>0?Math.round((r.bought/r.count)*100):0;
              return (
                <div key={r.id} className="card" style={{padding:"14px 17px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:9}}>
                    <div style={{width:36,height:36,borderRadius:10,background:`${r.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon size={17} style={{color:r.color}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <span style={{fontWeight:700,fontSize:14}}>{r.name}</span>
                        <span style={{fontSize:11.5,color:"var(--tx3)"}}>{r.bought}/{r.count} · <b style={{color:r.color}}>{p}%</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="ptr"><div className="pfl" style={{width:`${p}%`,background:r.color}}/></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty */}
      {total===0 && (
        <div className="empty">
          <div className="eico"><Package size={30} style={{color:"var(--tx3)"}}/></div>
          <p className="fd" style={{fontSize:22,fontWeight:600}}>Nenhum item ainda</p>
          <p style={{fontSize:13,color:"var(--tx2)",maxWidth:280,lineHeight:1.55}}>Adicione itens ou deixe a IA montar uma lista completa para você!</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:4}}>
            <button className="btn btn-s" onClick={onCompleteHome}><Sparkles size={13}/>IA: Completar casa</button>
            <button className="btn btn-s" onClick={onQuickAdd}><Zap size={13}/>Adicionar rápido</button>
            <button className="btn btn-p pulse" onClick={onAddItem} style={{fontSize:14,padding:"12px 22px"}}>
              <Plus size={15}/>Adicionar primeiro item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ITEMS VIEW
═══════════════════════════════════════════════════════ */
function ItemsView({ items=[], rooms=[], onAdd, onQuickAdd, onToggle, onEdit, onDelete, onDuplicate, onStar, onUpdatePrice }) {
  const [search,  setSearch]  = useState("");
  const [fRoom,   setFRoom]   = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fPrio,   setFPrio]   = useState("all");
  const [fStar,   setFStar]   = useState(false);
  const [sort,    setSort]    = useState("name");
  const [vw,      setVw]      = useState("grid");

  const filtered = useMemo(()=>{
    let arr = [...items];
    if (search.trim())   arr=arr.filter(i=>i?.name?.toLowerCase().includes(search.toLowerCase())||i?.notes?.toLowerCase().includes(search.toLowerCase()));
    if (fRoom!=="all")   arr=arr.filter(i=>i?.roomId===fRoom);
    if (fStatus!=="all") arr=arr.filter(i=>i?.status===fStatus);
    if (fPrio!=="all")   arr=arr.filter(i=>i?.priority===fPrio);
    if (fStar)           arr=arr.filter(i=>i?.starred);
    arr.sort((a,b)=>{
      if (sort==="name")   return (a?.name||"").localeCompare(b?.name||"","pt");
      if (sort==="price")  return (parseFloat(b?.price)||0)-(parseFloat(a?.price)||0);
      if (sort==="prio")   { const p={high:0,normal:1,low:2}; return (p[a?.priority]||1)-(p[b?.priority]||1); }
      if (sort==="recent") { try{return new Date(b?.createdAt||0)-new Date(a?.createdAt||0);}catch{return 0;} }
      return 0;
    });
    return arr;
  },[items,search,fRoom,fStatus,fPrio,fStar,sort]);

  const suggs = fRoom!=="all"
    ? (ROOM_SUGGESTIONS[fRoom]||[]).filter(s=>!items.some(i=>i?.name?.toLowerCase()===s.toLowerCase())).slice(0,6)
    : [];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:27,fontWeight:600}}>Meus Itens</h1>
          <p style={{color:"var(--tx2)",fontSize:13,marginTop:2}}>{filtered.length} de {items.length} · {items.filter(i=>i?.status==="bought").length} comprados</p>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button className="btn btn-s" style={{fontSize:12.5}} onClick={onQuickAdd}><Zap size={13}/>Rápido</button>
          <button className="btn btn-p" style={{fontSize:12.5}} onClick={()=>onAdd()}><Plus size={13}/>Adicionar</button>
        </div>
      </div>

      <div style={{position:"relative"}}>
        <Search size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"var(--tx3)"}}/>
        <input className="inp" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:37}}/>
        {search&&<button className="btn btn-g bico" onClick={()=>setSearch("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)"}}><X size={13}/></button>}
      </div>

      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",display:"flex",alignItems:"center",gap:4}}><Boxes size={11}/>Cômodo:</span>
        {[{id:"all",name:"Todos"},...rooms].map(r=>(
          <button key={r.id} className={`chip ${fRoom===r.id?"on":""}`} onClick={()=>setFRoom(r.id)}>{r.name}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",display:"flex",alignItems:"center",gap:4}}><SlidersHorizontal size={11}/>Filtros:</span>
        {[{id:"all",l:"Todos",icon:null},{id:"want",l:"Pendentes",icon:ShoppingCart},{id:"bought",l:"Comprados",icon:CheckCircle2}].map(s=>(
          <button key={s.id} className={`chip ${fStatus===s.id?"on":""}`} onClick={()=>setFStatus(s.id)} style={{display:"flex",alignItems:"center",gap:4}}>
            {s.icon && <s.icon size={11}/>}{s.l}
          </button>
        ))}
        <button className={`chip ${fStar?"on":""}`} onClick={()=>setFStar(v=>!v)} style={{display:"flex",alignItems:"center",gap:4}}>
          <Star size={11}/>Favoritos
        </button>
        <button className={`chip`} onClick={()=>setFPromo?.(v=>!v)} style={{display:"flex",alignItems:"center",gap:4}}>
          <BadgePercent size={11}/>Promoção
        </button>
        {[{id:"all",l:"Todas",icon:null},{id:"high",l:"Alta",icon:Flame},{id:"normal",l:"Normal",icon:null}].map(p=>(
          <button key={p.id} className={`chip ${fPrio===p.id?"on":""}`} onClick={()=>setFPrio(p.id)} style={{display:"flex",alignItems:"center",gap:4}}>
            {p.icon && <p.icon size={11}/>}{p.l}
          </button>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <span style={{fontSize:12,color:"var(--tx3)",display:"flex",alignItems:"center",gap:4}}><SortAsc size={13}/>Ordenar:</span>
          <select className="inp" value={sort} onChange={e=>setSort(e.target.value)} style={{width:"auto",padding:"5px 10px",fontSize:12.5}}>
            <option value="name">🔤 Nome A–Z</option>
            <option value="price">💰 Maior preço</option>
            <option value="prio">⚡ Prioridade</option>
            <option value="recent">🕐 Mais recente</option>
          </select>
        </div>
        <div style={{display:"flex",gap:4}}>
          <button className="btn btn-g bico" onClick={()=>setVw("grid")} title="Grade" style={vw==="grid"?{background:"var(--bg3)",color:"var(--p)"}:{}}><Grid3X3 size={14}/></button>
          <button className="btn btn-g bico" onClick={()=>setVw("list")} title="Lista" style={vw==="list"?{background:"var(--bg3)",color:"var(--p)"}:{}}><List size={14}/></button>
        </div>
      </div>

      {suggs.length>0 && (
        <div style={{background:"var(--bg2)",border:"1.5px dashed var(--bdr2)",borderRadius:12,padding:"13px 15px"}}>
          <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9,display:"flex",alignItems:"center",gap:5}}>
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

      {filtered.length===0 ? (
        <div className="empty">
          <div className="eico"><Search size={26} style={{color:"var(--tx3)"}}/></div>
          <p style={{fontWeight:700,fontSize:15}}>Nenhum item encontrado</p>
          <p style={{fontSize:13,color:"var(--tx3)"}}>Ajuste os filtros ou adicione um item</p>
          <button className="btn btn-p" onClick={()=>onAdd()}><Plus size={13}/>Adicionar</button>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:vw==="grid"?"repeat(auto-fill,minmax(280px,1fr))":"1fr",gap:9}}>
          {filtered.map(item=>(
            <ItemCard key={item.id} item={item} rooms={rooms}
              onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
              onDuplicate={onDuplicate} onStar={onStar} onUpdatePrice={onUpdatePrice}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOMS VIEW
═══════════════════════════════════════════════════════ */
function RoomsView({ rooms=[], items=[], onAddRoom, onDeleteRoom }) {
  const [showModal,setShowModal]=useState(false);
  const isDefault=(id)=>DEFAULT_ROOMS.some(d=>d.id===id);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:27,fontWeight:600}}>Cômodos</h1>
          <p style={{color:"var(--tx2)",fontSize:13,marginTop:2}}>{rooms.length} cômodos</p>
        </div>
        <button className="btn btn-p" onClick={()=>setShowModal(true)}><Plus size={13}/>Novo cômodo</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {rooms.map(r=>{
          const Icon=getIcon(r.icon);
          const ri=items.filter(i=>i?.roomId===r.id);
          const bgt=ri.filter(i=>i?.status==="bought").length;
          const tot=ri.length;
          const p=tot>0?Math.round((bgt/tot)*100):0;
          const val=ri.filter(i=>i?.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
          const high=ri.filter(i=>i?.priority==="high"&&i?.status!=="bought").length;
          return (
            <div key={r.id} className="card clift au" style={{padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:42,height:42,borderRadius:12,background:`${r.color}20`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Icon size={20} style={{color:r.color}}/>
                  </div>
                  <div>
                    <h3 style={{fontWeight:700,fontSize:15}}>{r.name}</h3>
                    <p style={{fontSize:11.5,color:"var(--tx3)"}}>{tot} {tot===1?"item":"itens"}</p>
                  </div>
                </div>
                {!isDefault(r.id) && <DeleteButton onConfirm={()=>onDeleteRoom(r.id)}/>}
              </div>
              {tot>0?(
                <>
                  <div className="ptr" style={{marginBottom:8}}><div className="pfl" style={{width:`${p}%`,background:r.color}}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--tx3)"}}>
                    <span>{bgt}/{tot} ({p}%)</span>
                    <span style={{display:"flex",gap:8,alignItems:"center"}}>
                      {high>0&&<span className="bdg bh" style={{fontSize:9}}>{high} alta</span>}
                      {val>0&&<span style={{color:r.color,fontWeight:700}}>{fmt(val)}</span>}
                    </span>
                  </div>
                </>
              ):(
                <p style={{fontSize:12.5,color:"var(--tx3)",fontStyle:"italic"}}>Nenhum item ainda</p>
              )}
            </div>
          );
        })}
      </div>
      {showModal&&<RoomModal onSave={(d)=>{onAddRoom(d);setShowModal(false);}} onClose={()=>setShowModal(false)}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOAST COMPONENT
═══════════════════════════════════════════════════════ */
function Toast({ toasts }) {
  if (!toasts.length) return null;
  const t = toasts[toasts.length - 1];
  const colors = {
    success: { bg:"var(--g)",    border:"rgba(42,157,143,.4)" },
    error:   { bg:"var(--r)",    border:"rgba(217,79,92,.4)"  },
    info:    { bg:"var(--p)",    border:"rgba(18,114,170,.4)" },
    warn:    { bg:"var(--go)",   border:"rgba(233,168,48,.4)" },
    trash:   { bg:"#555",       border:"rgba(80,80,80,.4)"   },
  };
  const c = colors[t.type] || colors.info;
  return (
    <div className={`toast ${t.exiting?"toast-exit":""}`}
      style={{background:c.bg, border:`1px solid ${c.border}`, color:"white"}}>
      {t.icon && <t.icon size={15}/>}
      {t.message}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TRASH VIEW
═══════════════════════════════════════════════════════ */
function TrashView({ items=[], rooms=[], onRestore, onPermanentDelete, onEmptyTrash }) {
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmId,    setConfirmId]    = useState(null); // id pending perm-delete

  const deleted = items
    .filter(isDeleted)
    .sort((a,b) => new Date(b.deletedAt) - new Date(a.deletedAt));

  const fmt_date = (d) => {
    try { return new Date(d).toLocaleDateString("pt-BR"); }
    catch { return "—"; }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="fd" style={{fontSize:27,fontWeight:600,display:"flex",alignItems:"center",gap:10}}>
            <Trash size={22} style={{color:"var(--r)"}}/>Lixeira
          </h1>
          <p style={{color:"var(--tx2)",fontSize:13,marginTop:3}}>
            {deleted.length} item{deleted.length!==1?"s":""} na lixeira
            {deleted.length>0&&<span style={{color:"var(--tx3)",marginLeft:6}}>· removidos automaticamente após {TRASH_DAYS} dias</span>}
          </p>
        </div>
        {deleted.length>0&&(
          <button className="btn btn-g" onClick={()=>setConfirmEmpty(true)}
            style={{color:"var(--r)",border:"1.5px solid var(--ra)",background:"var(--ra)",fontSize:12.5}}>
            <Trash2 size={13}/>Esvaziar lixeira
          </button>
        )}
      </div>

      {/* Info banner */}
      <div style={{background:"var(--bg2)",border:"1px dashed var(--bdr2)",borderRadius:12,padding:"12px 16px",
        display:"flex",alignItems:"center",gap:10,fontSize:13,color:"var(--tx3)"}}>
        <Bell size={14} style={{flexShrink:0,color:"var(--go)"}}/>
        Itens na lixeira não aparecem na sua lista nem nos cálculos de valor e progresso.
        Eles são excluídos automaticamente após <b style={{color:"var(--tx)"}}>{TRASH_DAYS} dias</b>.
      </div>

      {/* Empty state */}
      {deleted.length===0&&(
        <div className="empty" style={{paddingTop:80}}>
          <div className="eico" style={{background:"var(--bg3)"}}>
            <Trash size={30} style={{color:"var(--tx3)"}}/>
          </div>
          <p className="fd" style={{fontSize:20,fontWeight:600}}>Lixeira vazia</p>
          <p style={{fontSize:13,color:"var(--tx3)"}}>Itens excluídos aparecerão aqui</p>
        </div>
      )}

      {/* Deleted items */}
      {deleted.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {deleted.map(item=>{
            const room = rooms.find(r=>r.id===item.roomId);
            const RIcon = room ? getIcon(room.icon) : Home;
            const days = trashDaysLeft(item);
            const urgent = days !== null && days <= 3;
            return (
              <div key={item.id} className="trash-card">
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  {/* Thumbnail */}
                  <div style={{width:54,height:54,borderRadius:9,flexShrink:0,overflow:"hidden",
                    background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",filter:"grayscale(60%)"}}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                      : <Package size={20} style={{color:"var(--tx3)"}}/>}
                  </div>
                  {/* Content */}
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:700,fontSize:14,color:"var(--tx2)",lineHeight:1.3,marginBottom:4,textDecoration:"line-through",textDecorationColor:"var(--tx3)"}}>
                      {item.name}
                    </p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:7,alignItems:"center"}}>
                      {room&&(
                        <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10.5,color:"var(--tx3)",background:"var(--bg3)",padding:"2px 7px",borderRadius:99}}>
                          <RIcon size={9}/>{room.name}
                        </span>
                      )}
                      {item.price&&<span style={{fontSize:12,fontWeight:700,color:"var(--tx3)"}}>{fmt(item.price)}</span>}
                      <span style={{fontSize:10.5,color:"var(--tx3)"}}>Excluído em {fmt_date(item.deletedAt)}</span>
                      {days!==null&&(
                        <span style={{fontSize:10.5,fontWeight:700,
                          color:urgent?"var(--r)":"var(--tx3)",
                          background:urgent?"var(--ra)":"var(--bg3)",
                          padding:"1px 7px",borderRadius:99}}>
                          {urgent&&"⚠️ "}Remove em {days}d
                        </span>
                      )}
                    </div>
                    {/* Actions */}
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>onRestore(item.id)} className="btn"
                        style={{fontSize:12,fontWeight:700,padding:"5px 12px",borderRadius:8,
                          background:"var(--ga)",color:"var(--g)",gap:5,border:"none",cursor:"pointer",
                          display:"flex",alignItems:"center"}}>
                        <RotateCcw size={12}/>Restaurar
                      </button>
                      {confirmId===item.id ? (
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          <span style={{fontSize:11.5,color:"var(--r)",fontWeight:600}}>Tem certeza?</span>
                          <button onClick={()=>{onPermanentDelete(item.id);setConfirmId(null);}} className="btn"
                            style={{fontSize:11.5,fontWeight:700,padding:"4px 10px",borderRadius:7,
                              background:"var(--r)",color:"white",border:"none",cursor:"pointer",
                              display:"flex",alignItems:"center",gap:4}}>
                            <Trash2 size={11}/>Excluir
                          </button>
                          <button onClick={()=>setConfirmId(null)} className="btn btn-g"
                            style={{fontSize:11.5,padding:"4px 8px",borderRadius:7,display:"flex",alignItems:"center",gap:4}}>
                            <X size={11}/>Cancelar
                          </button>
                        </div>
                      ):(
                        <button onClick={()=>setConfirmId(item.id)} className="btn"
                          style={{fontSize:12,fontWeight:700,padding:"5px 12px",borderRadius:8,
                            background:"var(--ra)",color:"var(--r)",gap:5,border:"none",cursor:"pointer",
                            display:"flex",alignItems:"center"}}>
                          <Trash2 size={12}/>Excluir definitivo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm empty trash modal */}
      {confirmEmpty&&(
        <div className="mbk" onClick={e=>e.target===e.currentTarget&&setConfirmEmpty(false)}>
          <div className="modal" style={{padding:"26px",maxWidth:380}}>
            <div style={{textAlign:"center",padding:"8px 0"}}>
              <div style={{width:64,height:64,borderRadius:18,background:"var(--ra)",
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                <Trash2 size={28} style={{color:"var(--r)"}}/>
              </div>
              <h3 style={{fontWeight:700,fontSize:17,marginBottom:8}}>Esvaziar lixeira?</h3>
              <p style={{fontSize:13,color:"var(--tx2)",lineHeight:1.6,marginBottom:22}}>
                Todos os <b>{deleted.length} itens</b> serão removidos permanentemente.
                Esta ação não pode ser desfeita.
              </p>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <button className="btn btn-s" onClick={()=>setConfirmEmpty(false)}><X size={13}/>Cancelar</button>
                <button className="btn" onClick={()=>{onEmptyTrash();setConfirmEmpty(false);}}
                  style={{background:"var(--r)",color:"white",padding:"10px 20px",border:"none",
                    cursor:"pointer",display:"flex",alignItems:"center",gap:6,borderRadius:9,fontWeight:700,fontSize:13}}>
                  <Trash2 size={14}/>Esvaziar tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default function App() {
  const [dk,      setDk]      = useState(false);
  const [view,    setView]    = useState("dashboard");
  const [items,   setItems]   = useState([]);
  const [rooms,   setRooms]   = useState(DEFAULT_ROOMS);
  const [date,    setDate]    = useState("");
  const [budget,  setBudget]  = useState(null);
  const [couple,  setCouple]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebar, setSidebar] = useState(false);
  const [toasts,  setToasts]  = useState([]);

  const [quickModal,  setQuickModal]  = useState(false);
  const [itemModal,   setItemModal]   = useState(null);
  const [budgetModal, setBudgetModal] = useState(false);
  const [shareModal,  setShareModal]  = useState(false);
  const [homeModal,   setHomeModal]   = useState(false);

  /* ── Toast helper ── */
  const showToast = useCallback((message, type="info", icon=null) => {
    const id = uid();
    setToasts(p => [...p, { id, message, type, icon }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  /* Load — fixed Storage.get call order */
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const [si,sr,sd,sb,sc,sdk] = await Promise.all([
        Storage.get("env:items",    [],           false),
        Storage.get("env:rooms",    DEFAULT_ROOMS,false),
        Storage.get("env:date",     "",           false),
        Storage.get("env:budget",   null,         false),
        Storage.get("env:couple",   false,        false),
        Storage.get("env:dk",       false,        false),
      ]);

      // null-safety: ensure arrays
      const safeItems = Array.isArray(si) ? si : [];
      const safeRooms = Array.isArray(sr) && sr.length > 0 ? sr : DEFAULT_ROOMS;

      let finalItems = safeItems;
      if (sc) {
        const shared = await Storage.get("env:items:shared", [], true);
        if (Array.isArray(shared) && shared.length > 0) finalItems = shared;
      }

      setItems(finalItems);
      setRooms(safeRooms);
      setDate(typeof sd === "string" ? sd : "");
      setBudget(sb || null);
      setCouple(!!sc);
      setDk(!!sdk);
      setLoading(false);
    })();
  },[]);

  /* Persist */
  useEffect(()=>{ if(!loading){ Storage.set("env:items",items,false); if(couple) Storage.set("env:items:shared",items,true); }},[items,loading,couple]);
  useEffect(()=>{ if(!loading) Storage.set("env:rooms",rooms,false); },[rooms,loading]);
  useEffect(()=>{ if(!loading) Storage.set("env:date",date,false); },[date,loading]);
  useEffect(()=>{ if(!loading) Storage.set("env:budget",budget,false); },[budget,loading]);
  useEffect(()=>{ if(!loading) Storage.set("env:couple",couple,false); },[couple,loading]);
  useEffect(()=>{ if(!loading) Storage.set("env:dk",dk,false); },[dk,loading]);
  useEffect(()=>{ dk?document.body.classList.add("dk"):document.body.classList.remove("dk"); },[dk]);

  /* CRUD */
  /**
   * ✅ FIX: checks if id actually exists in the list.
   * Old bug: any data.id (even a brand-new one from QuickAdd) caused .map()
   * which silently found nothing → item never appeared in the list.
   */
  const saveItem = useCallback((data) => {
    setItems(prev => {
      const exists = data?.id && prev.some(i => i.id === data.id);
      if (exists) {
        // Edit: swap in place, preserving history fields
        return prev.map(i => i.id === data.id ? {
          ...i, ...data,
          priceHistory: Array.isArray(data.priceHistory) ? data.priceHistory : (i.priceHistory||[]),
          priceOffers:  Array.isArray(data.priceOffers)  ? data.priceOffers  : (i.priceOffers||[]),
        } : i);
      }
      // New item: assign id + timestamps
      return [...prev, {
        priceHistory: [],
        priceOffers:  [],
        ...data,
        id:        uid(),
        createdAt: new Date().toISOString(),
      }];
    });
    setItemModal(null);
  }, []);

  const toggleItem  = useCallback((item)=>setItems(p=>p.map(i=>i.id===item.id?{...i,status:i.status==="bought"?"want":"bought"}:i)),[]);

  /** Soft delete: marks item with deletedAt, keeps in state */
  const deleteItem  = useCallback((id) => {
    setItems(p => p.map(i => i.id===id ? {...i, deletedAt: new Date().toISOString()} : i));
    showToast("Item movido para a lixeira", "trash", Trash2);
  }, [showToast]);

  /** Restore: clears deletedAt */
  const restoreItem = useCallback((id) => {
    setItems(p => p.map(i => i.id===id ? {...i, deletedAt: null} : i));
    showToast("Item restaurado com sucesso", "success", RotateCcw);
  }, [showToast]);

  /** Permanent delete: removes from state entirely */
  const permanentDeleteItem = useCallback((id) => {
    setItems(p => p.filter(i => i.id !== id));
    showToast("Item excluído permanentemente", "error", Trash2);
  }, [showToast]);

  /** Empty trash: removes all soft-deleted items */
  const emptyTrash = useCallback(() => {
    setItems(p => p.filter(isActive));
    showToast("Lixeira esvaziada", "error", Trash2);
  }, [showToast]);

  /** Auto-purge items deleted more than TRASH_DAYS days ago */
  useEffect(() => {
    if (loading) return;
    const cutoff = Date.now() - TRASH_DAYS * 86400000;
    setItems(p => {
      const purged = p.filter(i => {
        if (!i.deletedAt) return true;
        return new Date(i.deletedAt).getTime() > cutoff;
      });
      return purged.length !== p.length ? purged : p;
    });
  }, [loading]);

  const dupItem     = useCallback((item)=>setItems(p=>[...p,{...item,id:uid(),status:"want",priceOffers:[],deletedAt:null,createdAt:new Date().toISOString()}]),[]);
  const starItem    = useCallback((item)=>setItems(p=>p.map(i=>i.id===item.id?{...i,starred:!i.starred}:i)),[]);
  const addItems    = useCallback((arr)=>{ setItems(p=>[...p,...arr.map(a=>({priceHistory:[],priceOffers:[],deletedAt:null,...a,id:uid(),createdAt:new Date().toISOString()}))]); setHomeModal(false); },[]);
  const addRoom     = useCallback((data)=>{ const id=data.name.toLowerCase().replace(/\s+/g,"-")+"-"+Date.now(); setRooms(p=>[...p,{...data,id}]); },[]);
  const deleteRoom  = useCallback((id) => {
    if (items.filter(isActive).some(i => i?.roomId === id)) { showToast("Remova os itens deste cômodo primeiro.","warn",AlertTriangle); return; }
    setRooms(p => p.filter(r => r.id !== id));
  }, [items, showToast]);
  const openAdd     = useCallback((prefill=null)=>{ setItemModal(prefill?.prefillName?{name:prefill.prefillName,roomId:prefill.prefillRoom||rooms[0]?.id}:prefill||"new"); },[rooms]);

  /** Called by PricePanel after a successful comparison search */
  const updateItemPrice = useCallback((id, offers) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const best = offers[0];
      let updated = { ...item, priceOffers: offers, lastPriceCheck: new Date().toISOString() };
      if (best?.price > 0) {
        updated = recordPrice(updated, best.price, "comparison");
        // Only auto-update price if item has no price yet or found cheaper
        if (!updated.price || parseFloat(best.price) < parseFloat(updated.price)) {
          updated = { ...updated, price: String(best.price) };
        }
      }
      return updated;
    }));
  }, []);

  const exportCSV = useCallback(()=>{
    const h=["Nome","Cômodo","Status","Preço","Promoção","Prioridade","Loja","Link","Notas"];
    const r=items.map(i=>{
      const rm=rooms.find(x=>x.id===i?.roomId);
      const st=getStore(i?.link);
      const promo=getPromoInfo(i);
      return [i?.name||"",rm?.name||"",i?.status==="bought"?"Comprado":"Quero comprar",i?.price||"",promo?`${promo.discount}% OFF`:"",i?.priority||"",st?.n||"",i?.link||"",i?.notes||""];
    });
    const csv=[h,...r].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv); a.download="enxoval.csv"; a.click();
  },[items,rooms]);

  if (loading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,background:"var(--bg)"}}>
      <Styles/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:54,height:54,borderRadius:16,background:"linear-gradient(135deg,#1272AA,#1E90CC)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Home size={26} style={{color:"white"}}/>
      </div>
      <Loader2 size={22} style={{color:"var(--p)",animation:"spin 1s linear infinite"}}/>
    </div>
  );

  const activeItems = items.filter(isActive);
  const deletedItems = items.filter(isDeleted);

  const navItems=[
    {id:"dashboard",label:"Dashboard",  icon:LayoutDashboard, count:null},
    {id:"items",    label:"Meus Itens", icon:ShoppingBag,     count:activeItems.length},
    {id:"rooms",    label:"Cômodos",    icon:Home,            count:rooms.length},
    {id:"trash",    label:"Lixeira",    icon:Trash,           count:deletedItems.length, danger:true},
  ];
  const pending = activeItems.filter(i=>i?.status!=="bought").length;

  return (
    <div className={dk?"dk":""} style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
      <Styles/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fabIn{from{opacity:0;transform:scale(.5) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

      {sidebar&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:90}} onClick={()=>setSidebar(false)}/>}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebar?"open":""}`} style={{width:228,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"18px 13px",display:"flex",flexDirection:"column",gap:3,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,paddingLeft:4}}>
          <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#1272AA,#1E90CC)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Home size={18} style={{color:"white"}}/>
          </div>
          <div>
            <span className="fd" style={{fontSize:17,fontWeight:600,fontStyle:"italic",color:"var(--tx)"}}>Enxoval</span>
            {couple&&<div style={{fontSize:9,fontWeight:700,color:"var(--p)",textTransform:"uppercase",letterSpacing:".07em",marginTop:1}}>♥ Modo Casal</div>}
          </div>
        </div>

        {navItems.map(n=>{
          const Icon=n.icon;
          const isOn = view===n.id;
          const isDanger = n.danger && !isOn;
          return (
            <button key={n.id}
              className={`nb ${isOn?"on":""}`}
              onClick={()=>{setView(n.id);setSidebar(false);}}
              style={isDanger?{color:"var(--r)"}:{}}>
              <Icon size={15}/>{n.label}
              {n.count!==null&&n.count>0&&(
                <span className="nc" style={isDanger?{background:"var(--ra)",color:"var(--r)"}:{}}>
                  {n.count}
                </span>
              )}
            </button>
          );
        })}

        <div style={{flex:1}}/>

        <div style={{background:"var(--bg3)",borderRadius:11,padding:"13px",marginBottom:10}}>
          <p style={{fontSize:9.5,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9}}>Resumo</p>
          {[
            {l:"Total",    v:activeItems.length,                                      c:"var(--tx)"},
            {l:"Comprados",v:activeItems.filter(i=>i?.status==="bought").length,       c:"var(--g)"},
            {l:"Pendentes",v:pending,                                                  c:"var(--p)"},
            {l:"🔥 Promoção",v:activeItems.filter(i=>getPromoInfo(i)).length,          c:"var(--go)"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12.5,padding:"2.5px 0"}}>
              <span style={{color:"var(--tx3)"}}>{s.l}</span>
              <span style={{fontWeight:700,color:s.c}}>{s.v}</span>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <button onClick={()=>setDk(d=>!d)} className="btn btn-g"
            style={{background:"var(--bg3)",borderRadius:9,padding:"8px 12px",justifyContent:"flex-start",gap:8,width:"100%",color:"var(--tx2)",fontSize:12.5,fontWeight:500}}>
            {dk?<Sun size={14}/>:<Moon size={14}/>}
            {dk?"Modo claro":"Modo escuro"}
          </button>
          <button onClick={()=>setShareModal(true)} className="btn btn-g"
            style={{background:couple?"var(--pa)":"var(--bg3)",borderRadius:9,padding:"8px 12px",justifyContent:"flex-start",gap:8,width:"100%",color:couple?"var(--p)":"var(--tx2)",fontSize:12.5,fontWeight:500}}>
            <Heart size={14} style={couple?{fill:"var(--p)"}:{}}/>
            {couple?"Casal ativo":"Modo casal"}
          </button>
          <button onClick={exportCSV} className="btn btn-g"
            style={{background:"var(--bg3)",borderRadius:9,padding:"8px 12px",justifyContent:"flex-start",gap:8,width:"100%",color:"var(--tx2)",fontSize:12.5,fontWeight:500}}>
            <Download size={14}/>Exportar CSV
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <div className="topbar">
          <button className="btn btn-g bico" onClick={()=>setSidebar(s=>!s)} style={{background:"var(--bg3)",flexShrink:0}}><Layers size={16}/></button>
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
            {(() => { const n=navItems.find(x=>x.id===view); const Icon=n?.icon; return Icon ? <Icon size={16} style={{color:"var(--p)",flexShrink:0}}/> : null; })()}
            <span className="fd" style={{fontWeight:600,fontSize:16,fontStyle:"italic",whiteSpace:"nowrap"}}>
              {navItems.find(n=>n.id===view)?.label}
            </span>
            {pending>0&&view==="dashboard"&&(
              <span style={{background:"var(--p)",color:"white",fontSize:10.5,fontWeight:700,padding:"2px 8px",borderRadius:99,flexShrink:0}}>
                {pending} pendentes
              </span>
            )}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            {view!=="trash" && <>
              <button className="btn btn-s" style={{padding:"7px 11px",fontSize:12.5}} onClick={()=>setQuickModal(true)}><Zap size={13}/>Rápido</button>
              <button className="btn btn-p" style={{padding:"7px 13px",fontSize:12.5}} onClick={()=>openAdd()}><Plus size={13}/>Item</button>
            </>}
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"24px 20px"}}>
          <div style={{maxWidth:900,margin:"0 auto"}}>
            {view==="dashboard"&&<Dashboard items={activeItems} rooms={rooms} deliveryDate={date} onSetDate={setDate} budget={budget} onOpenBudget={()=>setBudgetModal(true)} onQuickAdd={()=>setQuickModal(true)} onAddItem={()=>openAdd()} onCompleteHome={()=>setHomeModal(true)} coupleMode={couple} onUpdatePrice={updateItemPrice}/>}
            {view==="items"&&<ItemsView items={activeItems} rooms={rooms} onAdd={openAdd} onQuickAdd={()=>setQuickModal(true)} onToggle={toggleItem} onEdit={setItemModal} onDelete={deleteItem} onDuplicate={dupItem} onStar={starItem} onUpdatePrice={updateItemPrice}/>}
            {view==="rooms"&&<RoomsView rooms={rooms} items={activeItems} onAddRoom={addRoom} onDeleteRoom={deleteRoom}/>}
            {view==="trash"&&<TrashView items={items} rooms={rooms} onRestore={restoreItem} onPermanentDelete={permanentDeleteItem} onEmptyTrash={emptyTrash}/>}
          </div>
        </div>
      </main>

      {/* FAB — hidden on trash view */}
      {view!=="trash" && <button className="fab" onClick={()=>setQuickModal(true)}><Plus size={22}/></button>}

      {/* Toast notifications */}
      <Toast toasts={toasts}/>

      {/* Modals */}
      {quickModal  && <QuickAddModal rooms={rooms} items={activeItems} onSave={(d)=>{saveItem(d);setQuickModal(false);}} onClose={()=>setQuickModal(false)}/>}
      {itemModal   && <ItemModal item={typeof itemModal==="string"?null:itemModal} rooms={rooms} onSave={saveItem} onClose={()=>setItemModal(null)}/>}
      {budgetModal && <BudgetModal budget={budget} onSave={(b)=>{setBudget(b);setBudgetModal(false);}} onClose={()=>setBudgetModal(false)}/>}
      {shareModal  && <ShareModal coupleMode={couple} onToggle={()=>setCouple(c=>!c)} onClose={()=>setShareModal(false)}/>}
      {homeModal   && <CompleteHomeModal rooms={rooms} items={activeItems} onAddItems={addItems} onClose={()=>setHomeModal(false)}/>}
    </div>
  );
}
