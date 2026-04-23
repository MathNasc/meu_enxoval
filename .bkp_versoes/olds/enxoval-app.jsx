import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Home, Plus, Trash2, ExternalLink, Check, Search, Moon, Sun,
  Package, ShoppingBag, DollarSign, Clock, ChevronDown, X,
  Edit3, Filter, Image as ImageIcon, FileText, Layers,
  ArrowRight, LayoutDashboard, Tag, Loader2, Sofa, Bath,
  UtensilsCrossed, BedDouble, Star, Grid3X3, List,
  ChevronRight, AlertCircle, Download, Share2
} from "lucide-react";

/* ─── GOOGLE FONTS ─── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --cream: #FAF7F2;
      --cream2: #F2EDE4;
      --sand: #E8DDD0;
      --terra: #C4714A;
      --terra-light: #E8966E;
      --terra-dark: #A05A38;
      --sage: #7A9E87;
      --sage-light: #9BBFA8;
      --charcoal: #2C2825;
      --charcoal2: #3D3830;
      --warm-gray: #8C8278;
      --warm-gray-light: #B5AEA6;
      --text-primary: #2C2825;
      --text-secondary: #6B6259;
      --gold: #C9A84C;
    }

    .dark-mode {
      --cream: #1E1B18;
      --cream2: #252118;
      --sand: #2E2922;
      --terra: #D4845A;
      --terra-light: #E89E7A;
      --terra-dark: #B86840;
      --sage: #8AB097;
      --charcoal: #F0EBE3;
      --charcoal2: #D4CFC9;
      --warm-gray: #8C8278;
      --warm-gray-light: #6B6259;
      --text-primary: #F0EBE3;
      --text-secondary: #B5AEA6;
    }

    body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text-primary); transition: all 0.3s ease; }

    .font-display { font-family: 'Playfair Display', serif; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--cream2); }
    ::-webkit-scrollbar-thumb { background: var(--sand); border-radius: 3px; }

    /* Animations */
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .animate-slide-up { animation: slideUp 0.4s ease forwards; }
    .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
    .animate-scale-in { animation: scaleIn 0.3s ease forwards; }

    /* Cards */
    .card {
      background: var(--cream2);
      border: 1px solid var(--sand);
      border-radius: 16px;
      transition: all 0.25s ease;
    }
    .card:hover { border-color: var(--terra-light); box-shadow: 0 8px 32px rgba(196,113,74,0.08); }
    
    .card-item {
      background: var(--cream2);
      border: 1px solid var(--sand);
      border-radius: 12px;
      transition: all 0.25s ease;
    }
    .card-item:hover { border-color: var(--terra); box-shadow: 0 4px 20px rgba(196,113,74,0.1); transform: translateY(-1px); }
    .card-item.purchased { opacity: 0.65; }

    /* Buttons */
    .btn-primary {
      background: var(--terra);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 10px 20px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary:hover { background: var(--terra-dark); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(196,113,74,0.3); }

    .btn-secondary {
      background: var(--sand);
      color: var(--text-primary);
      border: 1px solid var(--sand);
      border-radius: 10px;
      padding: 10px 20px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-secondary:hover { border-color: var(--terra); color: var(--terra); }

    .btn-ghost {
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 6px;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-ghost:hover { background: var(--sand); color: var(--terra); }

    /* Inputs */
    .input {
      background: var(--cream);
      border: 1.5px solid var(--sand);
      border-radius: 10px;
      padding: 10px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-primary);
      width: 100%;
      outline: none;
      transition: all 0.2s ease;
    }
    .input::placeholder { color: var(--warm-gray-light); }
    .input:focus { border-color: var(--terra); box-shadow: 0 0 0 3px rgba(196,113,74,0.1); }

    .label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
      display: block;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(44,40,37,0.5);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }
    .modal {
      background: var(--cream);
      border-radius: 20px;
      border: 1px solid var(--sand);
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      animation: scaleIn 0.25s ease;
    }

    /* Nav */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
    }
    .nav-item:hover { background: var(--sand); color: var(--text-primary); }
    .nav-item.active { background: var(--terra); color: white; }

    /* Progress */
    .progress-bar {
      height: 8px;
      background: var(--sand);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--terra), var(--terra-light));
      border-radius: 999px;
      transition: width 0.6s ease;
    }

    /* Badge */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-want { background: rgba(196,113,74,0.15); color: var(--terra); }
    .badge-bought { background: rgba(122,158,135,0.15); color: var(--sage); }

    /* Stat card */
    .stat-card {
      background: var(--cream2);
      border: 1px solid var(--sand);
      border-radius: 16px;
      padding: 20px;
    }

    /* Countdown */
    .countdown-digit {
      background: var(--terra);
      color: white;
      border-radius: 12px;
      padding: 12px 16px;
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
      min-width: 60px;
      text-align: center;
    }

    /* Chip filter */
    .chip {
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1.5px solid var(--sand);
      background: transparent;
      color: var(--text-secondary);
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .chip:hover { border-color: var(--terra); color: var(--terra); }
    .chip.active { background: var(--terra); border-color: var(--terra); color: white; }

    /* Room icon bg */
    .room-icon-bg {
      width: 40px; height: 40px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(196,113,74,0.12);
      color: var(--terra);
      flex-shrink: 0;
    }

    /* Sidebar overlay mobile */
    .sidebar-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 40;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
      .sidebar.open { transform: translateX(0); }
      .countdown-digit { font-size: 24px; padding: 8px 12px; min-width: 44px; }
    }
  `}</style>
);

/* ─── CONSTANTS ─── */
const DEFAULT_ROOMS = [
  { id: "quarto", name: "Quarto", icon: "bed", color: "#C4714A" },
  { id: "sala", name: "Sala", icon: "sofa", color: "#7A9E87" },
  { id: "cozinha", name: "Cozinha", icon: "utensils", color: "#C9A84C" },
  { id: "banheiro", name: "Banheiro", icon: "bath", color: "#7BA8C4" },
];

const ROOM_ICONS = { bed: BedDouble, sofa: Sofa, utensils: UtensilsCrossed, bath: Bath, home: Home, star: Star, grid: Grid3X3, package: Package };
const ROOM_COLORS = ["#C4714A","#7A9E87","#C9A84C","#7BA8C4","#A87AC4","#C4A87A","#7AC4B8","#C47A8A"];

const getRoomIcon = (iconName) => ROOM_ICONS[iconName] || Home;

const formatCurrency = (val) => {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const getDaysLeft = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

/* ─── STORAGE HELPERS ─── */
const loadFromStorage = async (key, fallback) => {
  try {
    const res = await window.storage.get(key);
    return res ? JSON.parse(res.value) : fallback;
  } catch { return fallback; }
};

const saveToStorage = async (key, value) => {
  try { await window.storage.set(key, JSON.stringify(value)); } catch {}
};

/* ─── MODAL: ADD / EDIT ITEM ─── */
function ItemModal({ item, rooms, onSave, onClose }) {
  const isEdit = !!item?.id;
  const [form, setForm] = useState({
    name: item?.name || "",
    link: item?.link || "",
    price: item?.price || "",
    imageUrl: item?.imageUrl || "",
    notes: item?.notes || "",
    status: item?.status || "want",
    roomId: item?.roomId || (rooms[0]?.id || ""),
    priority: item?.priority || "normal",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim().length > 0 && form.roomId;

  const handleSave = () => {
    if (!valid) return;
    onSave({ ...item, ...form, name: form.name.trim() });
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: "28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
          <h2 className="font-display" style={{ fontSize:"22px", fontWeight:600 }}>
            {isEdit ? "Editar item" : "Novo item"}
          </h2>
          <button className="btn-ghost" onClick={onClose}><X size={20}/></button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label className="label">Nome do produto *</label>
            <input className="input" placeholder="Ex: Sofá 3 lugares" value={form.name} onChange={e=>set("name",e.target.value)}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div>
              <label className="label">Cômodo *</label>
              <select className="input" value={form.roomId} onChange={e=>set("roomId",e.target.value)} style={{cursor:"pointer"}}>
                {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e=>set("status",e.target.value)} style={{cursor:"pointer"}}>
                <option value="want">Quero comprar</option>
                <option value="bought">Comprado ✓</option>
              </select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div>
              <label className="label">Preço estimado</label>
              <input className="input" placeholder="R$ 0,00" value={form.price} onChange={e=>set("price",e.target.value)} type="number" min="0" step="0.01"/>
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select className="input" value={form.priority} onChange={e=>set("priority",e.target.value)} style={{cursor:"pointer"}}>
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta ⚡</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Link do produto</label>
            <input className="input" placeholder="https://..." value={form.link} onChange={e=>set("link",e.target.value)}/>
          </div>

          <div>
            <label className="label">URL da imagem (opcional)</label>
            <input className="input" placeholder="https://..." value={form.imageUrl} onChange={e=>set("imageUrl",e.target.value)}/>
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea className="input" placeholder="Cor, tamanho, modelo..." value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} style={{resize:"vertical"}}/>
          </div>
        </div>

        <div style={{ display:"flex", gap:"10px", marginTop:"24px", justifyContent:"flex-end" }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={!valid} style={!valid?{opacity:0.5,cursor:"not-allowed"}:{}}>
            <Check size={16}/>{isEdit?"Salvar alterações":"Adicionar item"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MODAL: ADD ROOM ─── */
function RoomModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("home");
  const [color, setColor] = useState(ROOM_COLORS[0]);

  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ padding:"28px", maxWidth:"380px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <h2 className="font-display" style={{ fontSize:"20px", fontWeight:600 }}>Novo cômodo</h2>
          <button className="btn-ghost" onClick={onClose}><X size={20}/></button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label className="label">Nome</label>
            <input className="input" placeholder="Ex: Varanda, Escritório..." value={name} onChange={e=>setName(e.target.value)}/>
          </div>
          <div>
            <label className="label">Ícone</label>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {Object.keys(ROOM_ICONS).map(k=>{
                const Icon = ROOM_ICONS[k];
                return (
                  <button key={k} onClick={()=>setIcon(k)} style={{
                    width:40, height:40, borderRadius:10, border:`2px solid ${icon===k?color:"var(--sand)"}`,
                    background: icon===k?`${color}22`:"transparent", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color: icon===k?color:"var(--text-secondary)", transition:"all 0.2s"
                  }}>
                    <Icon size={18}/>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Cor</label>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {ROOM_COLORS.map(c=>(
                <button key={c} onClick={()=>setColor(c)} style={{
                  width:32, height:32, borderRadius:"50%", background:c, border:`3px solid ${color===c?"var(--text-primary)":"transparent"}`,
                  cursor:"pointer", transition:"all 0.2s", outline:"none"
                }}/>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:"10px", marginTop:"24px", justifyContent:"flex-end" }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={()=>{ if(name.trim()) onSave({name:name.trim(),icon,color}); }} disabled={!name.trim()} style={!name.trim()?{opacity:0.5,cursor:"not-allowed"}:{}}>
            <Plus size={16}/>Criar cômodo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ITEM CARD ─── */
function ItemCard({ item, rooms, onToggle, onEdit, onDelete }) {
  const room = rooms.find(r=>r.id===item.roomId);
  const RoomIcon = room ? getRoomIcon(room.icon) : Home;

  return (
    <div className={`card-item ${item.status==="bought"?"purchased":""} animate-slide-up`} style={{ padding:"16px", position:"relative" }}>
      {item.priority==="high" && (
        <div style={{ position:"absolute", top:12, right:12, fontSize:10, fontWeight:700, color:"var(--terra)", background:"rgba(196,113,74,0.12)", padding:"2px 7px", borderRadius:999, letterSpacing:"0.05em" }}>
          ⚡ ALTA
        </div>
      )}
      <div style={{ display:"flex", gap:"14px" }}>
        {/* Image */}
        <div style={{
          width:72, height:72, borderRadius:10, flexShrink:0, overflow:"hidden",
          background:"var(--sand)", display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
            : <Package size={24} style={{color:"var(--warm-gray-light)"}}/>
          }
        </div>

        {/* Content */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:"8px", marginBottom:"4px" }}>
            <span style={{ fontWeight:600, fontSize:15, color:"var(--text-primary)", textDecoration:item.status==="bought"?"line-through":"none", lineHeight:1.3 }}>
              {item.name}
            </span>
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"8px" }}>
            {room && (
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--text-secondary)", background:"var(--sand)", padding:"2px 8px", borderRadius:999 }}>
                <RoomIcon size={10}/>{room.name}
              </span>
            )}
            <span className={`badge ${item.status==="bought"?"badge-bought":"badge-want"}`}>
              {item.status==="bought"?"✓ Comprado":"Quero comprar"}
            </span>
            {item.price && (
              <span style={{ fontSize:12, fontWeight:600, color:"var(--terra)" }}>
                {formatCurrency(item.price)}
              </span>
            )}
          </div>

          {item.notes && (
            <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.4, marginBottom:"6px" }}>{item.notes}</p>
          )}

          {/* Actions */}
          <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
            <button onClick={()=>onToggle(item)} className="btn-ghost" title={item.status==="bought"?"Desmarcar":"Marcar como comprado"}
              style={{ background: item.status==="bought"?"rgba(122,158,135,0.15)":"rgba(196,113,74,0.1)",
                color: item.status==="bought"?"var(--sage)":"var(--terra)", padding:"5px 10px", borderRadius:8, fontSize:12, fontWeight:500, gap:5
              }}>
              <Check size={12}/>{item.status==="bought"?"Desmarcar":"Comprado"}
            </button>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-ghost" title="Abrir link" style={{textDecoration:"none"}}>
                <ExternalLink size={15}/>
              </a>
            )}
            <button className="btn-ghost" onClick={()=>onEdit(item)} title="Editar"><Edit3 size={15}/></button>
            <button className="btn-ghost" onClick={()=>onDelete(item.id)} title="Excluir" style={{color:"#C44A4A"}}><Trash2 size={15}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─── */
function Dashboard({ items, rooms, deliveryDate, onSetDate, darkMode }) {
  const total = items.length;
  const bought = items.filter(i=>i.status==="bought").length;
  const want = total - bought;
  const totalValue = items.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const boughtValue = items.filter(i=>i.status==="bought"&&i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const progress = total > 0 ? Math.round((bought/total)*100) : 0;
  const daysLeft = getDaysLeft(deliveryDate);

  const roomStats = rooms.map(r=>({
    ...r,
    count: items.filter(i=>i.roomId===r.id).length,
    bought: items.filter(i=>i.roomId===r.id&&i.status==="bought").length,
  })).filter(r=>r.count>0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      {/* Header */}
      <div>
        <h1 className="font-display" style={{ fontSize:"32px", fontWeight:700, marginBottom:"4px" }}>
          Meu Enxoval 🏠
        </h1>
        <p style={{ color:"var(--text-secondary)", fontSize:15 }}>Organize tudo para o seu novo lar</p>
      </div>

      {/* Countdown */}
      <div className="card" style={{ padding:"24px", background:"linear-gradient(135deg, var(--terra) 0%, var(--terra-dark) 100%)", border:"none" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>
              <Clock size={12} style={{display:"inline",marginRight:4}}/>Data de entrega
            </p>
            {daysLeft !== null ? (
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span className="font-display" style={{ fontSize:48, fontWeight:700, color:"white", lineHeight:1 }}>
                  {daysLeft < 0 ? 0 : daysLeft}
                </span>
                <span style={{ color:"rgba(255,255,255,0.85)", fontSize:18 }}>
                  {daysLeft < 0 ? "dias (passou!)" : daysLeft === 1 ? "dia restante" : "dias restantes"}
                </span>
              </div>
            ) : (
              <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15 }}>Defina a data de entrega do apartamento</p>
            )}
          </div>
          <div>
            <label style={{ color:"rgba(255,255,255,0.8)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>
              Definir data
            </label>
            <input type="date" value={deliveryDate||""} onChange={e=>onSetDate(e.target.value)}
              style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:8,
                padding:"8px 12px", color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer", outline:"none"
              }}/>
          </div>
        </div>
        {/* Mini progress */}
        <div style={{ marginTop:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ color:"rgba(255,255,255,0.8)", fontSize:12 }}>Progresso geral</span>
            <span style={{ color:"white", fontSize:12, fontWeight:600 }}>{progress}%</span>
          </div>
          <div style={{ height:6, background:"rgba(255,255,255,0.2)", borderRadius:999, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:"rgba(255,255,255,0.9)", borderRadius:999, transition:"width 0.6s ease" }}/>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"14px" }}>
        {[
          { label:"Total de itens", value:total, icon:Package, color:"var(--terra)" },
          { label:"Comprados", value:bought, icon:Check, color:"var(--sage)" },
          { label:"Faltam", value:want, icon:ShoppingBag, color:"var(--gold)" },
          { label:"Valor estimado", value:formatCurrency(totalValue), icon:DollarSign, color:"var(--terra)", small:true },
        ].map((s,i)=>{
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card animate-slide-up" style={{ animationDelay:`${i*0.08}s` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:600, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{s.label}</p>
                  <p className="font-display" style={{ fontSize:s.small?20:32, fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</p>
                </div>
                <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={18} style={{ color:s.color }}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Valor comprado */}
      {total > 0 && (
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <h3 style={{ fontWeight:600, fontSize:15 }}>Progresso de compras</h3>
            <span style={{ fontSize:13, color:"var(--text-secondary)" }}>{bought}/{total} itens</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${progress}%` }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
            <span style={{ fontSize:12, color:"var(--text-secondary)" }}>Gasto até agora: <b style={{color:"var(--sage)"}}>{formatCurrency(boughtValue)}</b></span>
            <span style={{ fontSize:12, color:"var(--text-secondary)" }}>Restante: <b style={{color:"var(--terra)"}}>{formatCurrency(totalValue - boughtValue)}</b></span>
          </div>
        </div>
      )}

      {/* Por cômodo */}
      {roomStats.length > 0 && (
        <div>
          <h2 className="font-display" style={{ fontSize:"20px", fontWeight:600, marginBottom:14 }}>Por cômodo</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {roomStats.map(r=>{
              const Icon = getRoomIcon(r.icon);
              const pct = r.count > 0 ? Math.round((r.bought/r.count)*100) : 0;
              return (
                <div key={r.id} className="card" style={{ padding:"16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${r.color}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon size={18} style={{color:r.color}}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontWeight:600, fontSize:14 }}>{r.name}</span>
                        <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{r.bought}/{r.count} · {pct}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="progress-bar" style={{height:5}}>
                    <div style={{ height:"100%", width:`${pct}%`, background:r.color, borderRadius:999, transition:"width 0.6s ease" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-secondary)" }}>
          <Package size={48} style={{ margin:"0 auto 16px", opacity:0.3 }}/>
          <p className="font-display" style={{ fontSize:20, marginBottom:8, color:"var(--text-primary)" }}>Nenhum item ainda</p>
          <p style={{ fontSize:14 }}>Comece adicionando itens para o seu enxoval!</p>
        </div>
      )}
    </div>
  );
}

/* ─── ITEMS VIEW ─── */
function ItemsView({ items, rooms, onAdd, onToggle, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  const filtered = useMemo(() => {
    let arr = [...items];
    if (search.trim()) arr = arr.filter(i=>i.name.toLowerCase().includes(search.toLowerCase()));
    if (filterRoom !== "all") arr = arr.filter(i=>i.roomId===filterRoom);
    if (filterStatus !== "all") arr = arr.filter(i=>i.status===filterStatus);
    arr.sort((a,b)=>{
      if (sortBy==="name") return a.name.localeCompare(b.name,"pt");
      if (sortBy==="price") return (parseFloat(b.price)||0)-(parseFloat(a.price)||0);
      if (sortBy==="priority") { const p={high:0,normal:1,low:2}; return (p[a.priority]||1)-(p[b.priority]||1); }
      return 0;
    });
    return arr;
  }, [items, search, filterRoom, filterStatus, sortBy]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:"28px", fontWeight:700 }}>Meus Itens</h1>
          <p style={{ color:"var(--text-secondary)", fontSize:14 }}>{items.length} itens no total</p>
        </div>
        <button className="btn-primary" onClick={onAdd}><Plus size={16}/>Adicionar item</button>
      </div>

      {/* Search */}
      <div style={{ position:"relative" }}>
        <Search size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--warm-gray-light)" }}/>
        <input className="input" placeholder="Buscar itens..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:40 }}/>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:600 }}>Cômodo:</span>
        {[{id:"all",name:"Todos"},...rooms].map(r=>(
          <button key={r.id} className={`chip ${filterRoom===r.id?"active":""}`} onClick={()=>setFilterRoom(r.id)}>{r.name}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:600 }}>Status:</span>
        {[{id:"all",label:"Todos"},{id:"want",label:"Quero comprar"},{id:"bought",label:"Comprados"}].map(s=>(
          <button key={s.id} className={`chip ${filterStatus===s.id?"active":""}`} onClick={()=>setFilterStatus(s.id)}>{s.label}</button>
        ))}
      </div>

      {/* Sort + view toggle */}
      <div style={{ display:"flex", gap:"10px", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"var(--text-secondary)" }}>Ordenar:</span>
          <select className="input" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:"auto", padding:"6px 10px", fontSize:13 }}>
            <option value="name">Nome</option>
            <option value="price">Preço (maior)</option>
            <option value="priority">Prioridade</option>
          </select>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button className="btn-ghost" onClick={()=>setViewMode("grid")} style={viewMode==="grid"?{background:"var(--sand)",color:"var(--terra)"}:{}}><Grid3X3 size={16}/></button>
          <button className="btn-ghost" onClick={()=>setViewMode("list")} style={viewMode==="list"?{background:"var(--sand)",color:"var(--terra)"}:{}}><List size={16}/></button>
        </div>
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-secondary)" }}>
          <Search size={40} style={{ margin:"0 auto 16px", opacity:0.3 }}/>
          <p style={{ fontSize:16, fontWeight:500, color:"var(--text-primary)" }}>Nenhum item encontrado</p>
          <p style={{ fontSize:13, marginTop:4 }}>Tente ajustar os filtros ou a busca</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns: viewMode==="grid" ? "repeat(auto-fill,minmax(300px,1fr))" : "1fr", gap:"12px" }}>
          {filtered.map(item=>(
            <ItemCard key={item.id} item={item} rooms={rooms} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ROOMS VIEW ─── */
function RoomsView({ rooms, items, onAddRoom, onDeleteRoom }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:"28px", fontWeight:700 }}>Cômodos</h1>
          <p style={{ color:"var(--text-secondary)", fontSize:14 }}>{rooms.length} cômodos configurados</p>
        </div>
        <button className="btn-primary" onClick={()=>setShowModal(true)}><Plus size={16}/>Novo cômodo</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"14px" }}>
        {rooms.map(r=>{
          const Icon = getRoomIcon(r.icon);
          const roomItems = items.filter(i=>i.roomId===r.id);
          const bought = roomItems.filter(i=>i.status==="bought").length;
          const total = roomItems.length;
          const pct = total > 0 ? Math.round((bought/total)*100) : 0;
          const totalVal = roomItems.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
          const isDefault = DEFAULT_ROOMS.some(d=>d.id===r.id);

          return (
            <div key={r.id} className="card animate-slide-up" style={{ padding:"20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:14, background:`${r.color}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={22} style={{color:r.color}}/>
                  </div>
                  <div>
                    <h3 style={{ fontWeight:600, fontSize:16 }}>{r.name}</h3>
                    <p style={{ fontSize:12, color:"var(--text-secondary)" }}>{total} {total===1?"item":"itens"}</p>
                  </div>
                </div>
                {!isDefault && (
                  <button className="btn-ghost" onClick={()=>onDeleteRoom(r.id)} style={{color:"#C44A4A"}}><Trash2 size={15}/></button>
                )}
              </div>

              {total > 0 ? (
                <>
                  <div className="progress-bar" style={{ marginBottom:8 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:r.color, borderRadius:999, transition:"width 0.6s" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--text-secondary)" }}>
                    <span>{bought}/{total} comprados ({pct}%)</span>
                    {totalVal > 0 && <span style={{color:r.color, fontWeight:600}}>{formatCurrency(totalVal)}</span>}
                  </div>
                </>
              ) : (
                <p style={{ fontSize:13, color:"var(--text-secondary)", fontStyle:"italic" }}>Nenhum item ainda</p>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <RoomModal
          onSave={(data)=>{ onAddRoom(data); setShowModal(false); }}
          onClose={()=>setShowModal(false)}
        />
      )}
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState("dashboard");
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [itemModal, setItemModal] = useState(null); // null | "new" | item-obj
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Load from storage */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [savedItems, savedRooms, savedDate, savedDark] = await Promise.all([
        loadFromStorage("enxoval:items", []),
        loadFromStorage("enxoval:rooms", DEFAULT_ROOMS),
        loadFromStorage("enxoval:date", ""),
        loadFromStorage("enxoval:dark", false),
      ]);
      setItems(savedItems);
      setRooms(savedRooms);
      setDeliveryDate(savedDate);
      setDarkMode(savedDark);
      setLoading(false);
    })();
  }, []);

  /* Persist */
  useEffect(() => { if (!loading) saveToStorage("enxoval:items", items); }, [items, loading]);
  useEffect(() => { if (!loading) saveToStorage("enxoval:rooms", rooms); }, [rooms, loading]);
  useEffect(() => { if (!loading) saveToStorage("enxoval:date", deliveryDate); }, [deliveryDate, loading]);
  useEffect(() => { if (!loading) saveToStorage("enxoval:dark", darkMode); }, [darkMode, loading]);

  /* Dark mode class on body */
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [darkMode]);

  /* Item CRUD */
  const handleSaveItem = (data) => {
    if (data.id) {
      setItems(prev => prev.map(i => i.id===data.id ? data : i));
    } else {
      setItems(prev => [...prev, { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    }
    setItemModal(null);
  };

  const handleToggle = (item) => {
    setItems(prev => prev.map(i => i.id===item.id ? {...i, status: i.status==="bought"?"want":"bought"} : i));
  };

  const handleDelete = (id) => {
    if (confirm("Excluir este item?")) setItems(prev => prev.filter(i=>i.id!==id));
  };

  const handleAddRoom = (data) => {
    const id = data.name.toLowerCase().replace(/\s+/g,"-") + "-" + Date.now();
    setRooms(prev => [...prev, { ...data, id }]);
  };

  const handleDeleteRoom = (id) => {
    if (items.some(i=>i.roomId===id)) {
      alert("Este cômodo tem itens. Remova os itens primeiro.");
      return;
    }
    if (confirm("Excluir este cômodo?")) setRooms(prev=>prev.filter(r=>r.id!==id));
  };

  /* Export CSV */
  const exportCSV = () => {
    const header = ["Nome","Cômodo","Status","Preço","Link","Prioridade","Notas"];
    const rows = items.map(i=>{
      const room = rooms.find(r=>r.id===i.roomId);
      return [i.name, room?.name||"", i.status==="bought"?"Comprado":"Quero comprar", i.price||"", i.link||"", i.priority||"normal", i.notes||""];
    });
    const csv = [header,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);
    a.download = "enxoval.csv";
    a.click();
  };

  if (loading) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, background:"var(--cream)" }}>
      <FontStyle/>
      <Loader2 size={32} style={{ color:"var(--terra)", animation:"spin 1s linear infinite" }}/>
      <p style={{ color:"var(--text-secondary)", fontSize:14 }}>Carregando seu enxoval...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const navItems = [
    { id:"dashboard", label:"Dashboard", icon:LayoutDashboard },
    { id:"items", label:"Meus Itens", icon:ShoppingBag },
    { id:"rooms", label:"Cômodos", icon:Home },
  ];

  return (
    <div className={darkMode?"dark-mode":""} style={{ display:"flex", minHeight:"100vh", background:"var(--cream)" }}>
      <FontStyle/>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}/>}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen?"open":""}`} style={{
        width:240, background:"var(--cream2)", borderRight:"1px solid var(--sand)",
        padding:"24px 16px", display:"flex", flexDirection:"column", gap:4,
        position:"fixed", top:0, left:0, bottom:0, zIndex:50,
        "@media(minWidth:769px)":{position:"sticky"}
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, paddingLeft:4 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"var(--terra)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Home size={18} style={{color:"white"}}/>
          </div>
          <span className="font-display" style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)" }}>Enxoval</span>
        </div>

        {/* Nav */}
        {navItems.map(n=>{
          const Icon = n.icon;
          return (
            <button key={n.id} className={`nav-item ${view===n.id?"active":""}`}
              onClick={()=>{ setView(n.id); setSidebarOpen(false); }}>
              <Icon size={17}/>{n.label}
            </button>
          );
        })}

        <div style={{ flex:1 }}/>

        {/* Quick stats */}
        <div style={{ borderTop:"1px solid var(--sand)", paddingTop:16, marginBottom:16 }}>
          <p style={{ fontSize:11, fontWeight:600, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10, paddingLeft:4 }}>Resumo</p>
          {[
            { label:"Total", val:items.length, color:"var(--text-primary)" },
            { label:"Comprados", val:items.filter(i=>i.status==="bought").length, color:"var(--sage)" },
            { label:"Pendentes", val:items.filter(i=>i.status!=="bought").length, color:"var(--terra)" },
          ].map((s,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"4px 4px", fontSize:13 }}>
              <span style={{ color:"var(--text-secondary)" }}>{s.label}</span>
              <span style={{ fontWeight:600, color:s.color }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ display:"flex", gap:6 }}>
          <button className="btn-ghost" onClick={()=>setDarkMode(d=>!d)} title={darkMode?"Modo claro":"Modo escuro"}
            style={{ flex:1, justifyContent:"center", background:"var(--sand)", borderRadius:10, padding:"8px" }}>
            {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
          <button className="btn-ghost" onClick={exportCSV} title="Exportar CSV"
            style={{ flex:1, justifyContent:"center", background:"var(--sand)", borderRadius:10, padding:"8px" }}>
            <Download size={16}/>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, marginLeft:0, minWidth:0 }}>
        {/* Mobile topbar */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 20px", borderBottom:"1px solid var(--sand)",
          background:"var(--cream2)", position:"sticky", top:0, zIndex:30
        }}>
          <button className="btn-ghost" onClick={()=>setSidebarOpen(s=>!s)} style={{ background:"var(--sand)", padding:"8px 12px", borderRadius:10 }}>
            <Layers size={18}/>
          </button>
          <span className="font-display" style={{ fontWeight:600, fontSize:16 }}>
            {navItems.find(n=>n.id===view)?.label}
          </span>
          <button className="btn-primary" style={{ padding:"8px 12px", fontSize:13 }}
            onClick={()=>setItemModal("new")}>
            <Plus size={15}/>Item
          </button>
        </div>

        {/* Content */}
        <div style={{ padding:"28px 24px", maxWidth:900, margin:"0 auto" }}>
          {view==="dashboard" && (
            <Dashboard items={items} rooms={rooms} deliveryDate={deliveryDate} onSetDate={setDeliveryDate} darkMode={darkMode}/>
          )}
          {view==="items" && (
            <ItemsView items={items} rooms={rooms} onAdd={()=>setItemModal("new")} onToggle={handleToggle} onEdit={setItemModal} onDelete={handleDelete}/>
          )}
          {view==="rooms" && (
            <RoomsView rooms={rooms} items={items} onAddRoom={handleAddRoom} onDeleteRoom={handleDeleteRoom}/>
          )}
        </div>
      </main>

      {/* Item modal */}
      {itemModal && (
        <ItemModal
          item={itemModal==="new" ? null : itemModal}
          rooms={rooms}
          onSave={handleSaveItem}
          onClose={()=>setItemModal(null)}
        />
      )}
    </div>
  );
}
