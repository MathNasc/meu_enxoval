"use client";
import { Bell, Home, Package, RotateCcw, Trash, Trash2, X } from "lucide-react";
import { fmt, isDeleted, trashDaysLeft, TRASH_DAYS } from "../../lib/utils/format";
import { getIcon } from "../../lib/constants/index";
import DeleteButton from "./ui/DeleteButton";

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

export default TrashView;
