// src/App.js — versão com Supabase Auth + banco de dados
"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useReducer, Component } from "react";
// recharts → src/components/rooms/RoomCharts.jsx
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
  Filter, ArrowUpDown, BarChart3, CalendarCheck
} from "lucide-react";

// ── Hooks Supabase ───────────────────────────────────────
import { useAuth }     from "./lib/hooks/useAuth";
import { useItems }    from "./lib/hooks/useItems";
import { useRooms }    from "./lib/hooks/useRooms";
import { useSettings } from "./lib/hooks/useSettings";

// ── Componentes ──────────────────────────────────────────
import AuthScreen     from "./components/AuthScreen";
import HouseholdModal from "./components/HouseholdModal";

// ── Utils, constantes e hooks extraídos (Semana 1 refactor) ──
import {
  fmt, daysLeft, uid, todayStr,
  isActive, isDeleted, TRASH_DAYS, trashDaysLeft, getPromoInfo,
} from "./lib/utils/format";
import {
  ICONS_MAP, PALETTE, STORE_MAP, ROOM_SUGGESTIONS_BY_NAME,
  getIcon, getStore, getRoomSuggestions,
} from "./lib/constants/index";
import { useFilters, filterReducer, FILTER_INITIAL } from "./lib/hooks/useFilters";
import { AI } from "./lib/services/api";

// ── Componentes extraídos (Semana 2 refactor) ─────────────
import ItemCard          from "./components/items/ItemCard";
import TrashView         from "./components/items/TrashView";
import QuickAddModal     from "./components/modals/QuickAddModal";
import ItemModal         from "./components/modals/ItemModal";
import CompleteHomeModal from "./components/modals/CompleteHomeModal";
import RoomModal         from "./components/modals/RoomModal";
import DeleteButton      from "./components/ui/DeleteButton";
import PricePanel        from "./components/ui/PricePanel";
import StoreBadge        from "./components/ui/StoreBadge";
import PromoBadge        from "./components/ui/PromoBadge";
import Toast             from "./components/ui/Toast";
import BudgetInput       from "./components/ui/BudgetInput";
import InsightCard       from "./components/ui/InsightCard";
import RoomCharts        from "./components/rooms/RoomCharts";

// ── Views extraídas (Semana 3 refactor) ───────────────────
import Dashboard  from "./views/Dashboard";
import ItemsView  from "./views/ItemsView";
import RoomsView  from "./views/RoomsView";
import SummaryView from "./views/SummaryView";

// ════════════════════════════════════════════════════════
// STYLES (idêntico ao v4 — mantido para brevidade)
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// ERROR BOUNDARY — catches render crashes and shows a
// friendly message instead of a blank screen
// ════════════════════════════════════════════════════════

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", flexDirection:"column", gap:16,
        background:"#F5F0E6", padding:24, textAlign:"center",
      }}>
        <div style={{fontSize:40}}>🏠</div>
        <h2 style={{fontFamily:"sans-serif", fontSize:20, fontWeight:700, color:"#102030"}}>
          Algo deu errado
        </h2>
        <p style={{fontFamily:"sans-serif", fontSize:14, color:"#325870", maxWidth:400, lineHeight:1.6}}>
          {this.state.error?.message?.includes("API key") ||
           this.state.error?.message?.includes("apikey")
            ? "As variáveis de ambiente do Supabase não estão configuradas no Vercel. Veja as instruções abaixo."
            : "Ocorreu um erro inesperado. Tente recarregar a página."}
        </p>
        {(this.state.error?.message?.includes("API key") ||
          this.state.error?.message?.includes("apikey")) && (
          <div style={{
            background:"#fff", border:"1.5px solid #C8B99E",
            borderRadius:12, padding:"16px 20px", textAlign:"left",
            fontFamily:"monospace", fontSize:13, maxWidth:480,
          }}>
            <p style={{marginBottom:8,fontFamily:"sans-serif",fontWeight:700,fontSize:14}}>
              Configure no Vercel:
            </p>
            <p style={{color:"#555",marginBottom:4}}>Settings → Environment Variables</p>
            <p style={{background:"#f0f0f0",padding:"6px 10px",borderRadius:6,marginBottom:4}}>
              NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
            </p>
            <p style={{background:"#f0f0f0",padding:"6px 10px",borderRadius:6}}>
              NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
            </p>
          </div>
        )}
        <button
          onClick={()=>{ this.setState({hasError:false,error:null}); window.location.reload(); }}
          style={{
            background:"#1272AA", color:"white", border:"none",
            borderRadius:9, padding:"10px 22px", fontFamily:"sans-serif",
            fontWeight:700, fontSize:14, cursor:"pointer",
          }}>
          Recarregar
        </button>
      </div>
    );
  }
}

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

// Constants, utils e ICONS_MAP → ver src/lib/constants/index.js e src/lib/utils/format.js

// AI → src/lib/services/api.js

// ════════════════════════════════════════════════════════
// PRIMITIVES (Sk, StoreBadge, DeleteButton, Toast, etc.)
// ════════════════════════════════════════════════════════
const Sk = ({w="100%",h=14,r=8}) => (
  <span className="shimmer" style={{width:w,height:h,borderRadius:r,display:"block"}}/>
);

// StoreBadge → src/components/ui/StoreBadge.jsx

// PromoBadge → src/components/ui/PromoBadge.jsx


// DeleteButton → src/components/ui/DeleteButton.jsx

// Toast → src/components/ui/Toast.jsx




// PricePanel → src/components/ui/PricePanel.jsx



// QuickAddModal → src/components/modals/QuickAddModal.jsx



// ItemModal → src/components/modals/ItemModal.jsx


// CompleteHomeModal → src/components/modals/CompleteHomeModal.jsx



// RoomModal → src/components/modals/RoomModal.jsx



// ItemCard → src/components/items/ItemCard.jsx



// TrashView → src/components/items/TrashView.jsx


// ════════════════════════════════════════════════════════
// MAIN APP — com Supabase
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// FILTER REDUCER — estado único para todos os filtros de Meus Itens
// Elevado ao App para sobreviver a re-renders e troca de abas.
// ════════════════════════════════════════════════════════
// filterReducer + FILTER_INITIAL → ver src/lib/hooks/useFilters.js

function AppInner() {
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
    for (const item of arr) {
      await itemsHook.addItem(item);
    }
    setHomeModal(false);
    showToast(`${arr.length} item${arr.length !== 1 ? "s" : ""} adicionado${arr.length !== 1 ? "s" : ""}!`, "success");
  }, [itemsHook, showToast]);

  const openAdd=useCallback((prefill=null)=>{
    setItemModal(prefill?.prefillName?{name:prefill.prefillName,roomId:prefill.prefillRoom||roomsHook.rooms[0]?.id}:prefill||"new");
  },[roomsHook.rooms]);

  const exportCSV=useCallback(()=>{
    const h=["Nome","Cômodo","Status","Preço","Prioridade","Link","Notas"];
    const rows=activeItems.map(i=>{const r=roomsHook.rooms.find(x=>x.id===i.roomId);return[i.name||"",r?.name||"",i.status==="bought"?"Comprado":"Quero comprar",i.price||"",i.priority||"",i.link||"",i.notes||""];});
    const csv=[h,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);a.download="enxoval.csv";a.click();
  },[]);


  // ── Summary View ─────────────────────────────────────
  // generateInsights — analisa items e gera alertas úteis
  // ─────────────────────────────────────────────────────
  // generateInsights → src/views/Dashboard.jsx and SummaryView.jsx
// SummaryView → src/views/SummaryView.jsx
// ── Derived from hooks (must be before useMemo deps and early returns) ──
  const {items,loading:itemsLoading}=itemsHook;
  const {rooms}=roomsHook;
  const {settings,saveSettings}=settingsHook;
  const activeItems  = items.filter(isActive);
  const deletedItems = items.filter(isDeleted);

  const navItems=[
    {id:"dashboard",label:"Dashboard",  icon:LayoutDashboard,count:null},
    {id:"items",    label:"Meus Itens", icon:ShoppingBag,    count:activeItems.length},
    {id:"rooms",    label:"Cômodos",    icon:Home,           count:rooms.length},
    {id:"summary",  label:"Resumo",     icon:FileText,       count:null},
    {id:"trash",    label:"Lixeira",    icon:Trash,          count:deletedItems.length,danger:true},
  ];
  const pending      = activeItems.filter(i=>i.status!=="bought").length;

  // ── Pre-computed derived state (must be before early returns — Rules of Hooks) ──
  // Desestrutura o estado elevado de filtros
  const { search, fRoom, fStatus, fPrio, fStar, fPromo, minPrice, maxPrice, sort, vw, filtersOpen } = filters;

  const filtered = useMemo(()=>{
    let arr = [...(activeItems || [])];
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
    arr.sort((a,b)=>{
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


  // ── Dados agregados por cômodo (derivados de activeItems — sem query extra) ──
  const roomStats = useMemo(() => (rooms || []).map(r => {
    const ri       = (activeItems || []).filter(i => i?.roomId === r.id);
    const bought   = ri.filter(i => i.status === "bought");
    const want     = ri.filter(i => i.status === "want");
    const highPrio = ri.filter(i => i.priority === "high" && i.status !== "bought");
    const totalVal = ri.filter(i => i.price).reduce((s,i) => s + (parseFloat(i.price)||0), 0);
    const spentVal = bought.filter(i => i.price).reduce((s,i) => s + (parseFloat(i.price)||0), 0);
    const pct      = ri.length > 0 ? Math.round((bought.length / ri.length) * 100) : 0;
    return {
      ...r,
      total:    ri.length,
      bought:   bought.length,
      want:     want.length,
      highPrio: highPrio.length,
      totalVal: parseFloat(totalVal.toFixed(2)),
      spentVal: parseFloat(spentVal.toFixed(2)),
      pendVal:  parseFloat((totalVal - spentVal).toFixed(2)),
      pct,
    };
  }), [rooms, activeItems]);

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



  // ── Conteúdo simplificado (Dashboard e Items)  ────────────

// ════════════════════════════════════════════════════════
// ROOM CHARTS — gráficos por cômodo
// Reutiliza dados já carregados (activeItems + rooms).
// Nenhuma query extra ao Supabase necessária.
// ════════════════════════════════════════════════════════
// RoomCharts → src/components/rooms/RoomCharts.jsx


  // ─────────────────────────────────────────────────────
  // DashboardSimple → src/views/Dashboard.jsx
// ItemsSimple → src/views/ItemsView.jsx
// RoomsSimple → src/views/RoomsView.jsx
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
            {view==="dashboard" && (
              <Dashboard
                activeItems={activeItems}
                rooms={rooms}
                settings={settings}
                settingsHook={settingsHook}
                auth={auth}
                openAdd={openAdd}
                setHomeModal={setHomeModal}
                setQuickModal={setQuickModal}
                setView={setView}
              />
            )}
            {view==="items" && (
              <ItemsView
                activeItems={activeItems}
                filtered={filtered}
                rooms={rooms}
                itemsLoading={itemsLoading}
                filters={filters}
                dispatchFilter={dispatchFilter}
                hasFilters={hasFilters}
                openAdd={openAdd}
                setQuickModal={setQuickModal}
                setItemModal={setItemModal}
                handleDeleteItem={handleDeleteItem}
                itemsHook={itemsHook}
              />
            )}
            {view==="rooms" && (
              <RoomsView
                roomStats={roomStats}
                rooms={rooms}
                activeItems={activeItems}
                openAdd={openAdd}
                setRoomModal={setRoomModal}
                handleDeleteRoom={handleDeleteRoom}
                dispatchFilter={dispatchFilter}
                setView={setView}
              />
            )}
            {view==="summary" && (
              <SummaryView
                activeItems={activeItems}
                rooms={rooms}
                settings={settings}
                roomStats={roomStats}
              />
            )}
            {view==="trash" && (
              <TrashView
                items={items}
                rooms={rooms}
                onRestore={handleRestoreItem}
                onPermanentDelete={handlePermanentDelete}
                onEmptyTrash={handleEmptyTrash}
              />
            )}
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

// Wrap with ErrorBoundary so crashes show a friendly message
// instead of a blank Vercel page
export default function App() {
  return (
    <ErrorBoundary>
      <AppInner/>
    </ErrorBoundary>
  );
}
