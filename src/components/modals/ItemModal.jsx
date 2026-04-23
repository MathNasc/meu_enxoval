"use client";
import { useState, useCallback } from "react";
import { Check, X } from "lucide-react";
import { PALETTE, ICONS_MAP } from "../../lib/constants/index";

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

export default ItemModal;
