"use client";
import { Plus, Flame, Home, ArrowRight } from "lucide-react";
import { fmt } from "../lib/utils/format";
import { getIcon } from "../lib/constants/index";
import DeleteButton from "../components/ui/DeleteButton";

  export default function RoomsView({ roomStats, rooms, activeItems, openAdd, setRoomModal, handleDeleteRoom, dispatchFilter, setView }) {
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
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
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      {/* Pendentes */}
                      <div style={{background:"var(--bg3)",borderRadius:9,padding:"8px 6px",textAlign:"center",minWidth:0}}>
                        <p style={{fontSize:20,fontWeight:800,color:"var(--go)",lineHeight:1}}>{r.want}</p>
                        <p style={{fontSize:9,color:"var(--tx3)",textTransform:"uppercase",
                          letterSpacing:".04em",marginTop:3,fontWeight:600,whiteSpace:"nowrap"}}>Pendentes</p>
                      </div>

                      {/* Alta prioridade */}
                      <div style={{background: r.highPrio > 0 ? "var(--ra)" : "var(--bg3)",
                        borderRadius:9,padding:"8px 6px",textAlign:"center",minWidth:0,
                        border: r.highPrio > 0 ? "1px solid rgba(217,79,92,.2)" : "none"}}>
                        <p style={{fontSize:20,fontWeight:800,
                          color:r.highPrio>0?"var(--r)":"var(--tx3)",lineHeight:1}}>
                          {r.highPrio}
                        </p>
                        <p style={{fontSize:9,textTransform:"uppercase",letterSpacing:".04em",
                          marginTop:3,fontWeight:600,whiteSpace:"nowrap",
                          color:r.highPrio>0?"var(--r)":"var(--tx3)"}}>
                          {r.highPrio > 0 ? "⚡ Urgentes" : "Urgentes"}
                        </p>
                      </div>

                      {/* Valor total — fonte se adapta ao comprimento */}
                      <div style={{background:"var(--bg3)",borderRadius:9,padding:"8px 6px",textAlign:"center",minWidth:0,overflow:"hidden"}}>
                        <p style={{
                          fontSize: r.totalVal >= 10000 ? 10.5 : r.totalVal >= 1000 ? 12 : 14,
                          fontWeight:800, color:"var(--p)", lineHeight:1.2,
                          wordBreak:"break-all", overflowWrap:"break-word",
                        }}>
                          {fmt(r.totalVal)}
                        </p>
                        <p style={{fontSize:9,color:"var(--tx3)",textTransform:"uppercase",
                          letterSpacing:".04em",marginTop:3,fontWeight:600}}>Estimado</p>
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

