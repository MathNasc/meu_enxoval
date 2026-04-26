"use client";
import { useState } from "react";
import {
  Home, Plus, Clock, DollarSign, Package, ShoppingBag, CheckCircle2,
  Wallet, Lightbulb, Sparkles, Zap, Flame, BadgePercent, Award,
  TrendingDown, BarChart3, CalendarCheck, Target, Loader2,
  BarChart2,
} from "lucide-react";
import { fmt, daysLeft, getPromoInfo } from "../lib/utils/format";
import { getIcon } from "../lib/constants/index";
import BudgetInput  from "../components/ui/BudgetInput";
import InsightCard  from "../components/ui/InsightCard";
import RoomCharts   from "../components/rooms/RoomCharts";

// Analisa items e gera insights úteis para o dashboard
function generateInsights(activeItems, rooms, settings) {

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
  
}

  export default function Dashboard({ activeItems, rooms, settings, settingsHook, auth, openAdd, setHomeModal, setQuickModal, setView }) {
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
    const insights = generateInsights(activeItems, rooms, settings);

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
            <div style={{display:"flex",alignItems:"center",gap:7,flex:"0 1 auto",minWidth:0}}>
              <span style={{fontSize:12,color:"var(--tx3)",whiteSpace:"nowrap"}}>Orçamento:</span>
              <div style={{minWidth:0,flex:"1 1 100px"}}>
                <BudgetInput value={settings.budgetTotal} onSave={settingsHook.setBudgetTotal}/>
              </div>
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

