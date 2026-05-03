"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PALETTE, ICONS_MAP } from "../../lib/constants/index";

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

export default RoomModal;
