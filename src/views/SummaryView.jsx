"use client";
import {
  BarChart3, Wallet, CalendarCheck, Home, Star, BadgePercent,
  Flame, TrendingDown, Lightbulb, CheckCircle2,
} from "lucide-react";
import { fmt, daysLeft, getPromoInfo } from "../lib/utils/format";
import { getIcon } from "../lib/constants/index";
import InsightCard from "../components/ui/InsightCard";

// generateInsights re-used from Dashboard logic
function generateInsights(activeItems, rooms, settings) {
  const insights = [];
  if (!activeItems.length) return insights;
  const highPrio  = activeItems.filter(i => i.priority === "high" && i.status !== "bought");
  const promoList = activeItems.filter(i => getPromoInfo(i) && i.status !== "bought");
  const bought    = activeItems.filter(i => i.status === "bought");
  const pct       = activeItems.length > 0 ? Math.round((bought.length / activeItems.length) * 100) : 0;
  const allVal    = activeItems.filter(i=>i.price).reduce((s,i)=>s+parseFloat(i.price||0),0);
  const budget    = parseFloat(settings?.budgetTotal||0);
  if (highPrio.length > 0)
    insights.push({ type:"alert", text:`${highPrio.length} item${highPrio.length>1?"s":""} de alta prioridade ainda pendente${highPrio.length>1?"s":""}`, Icon:Flame });
  if (promoList.length > 0)
    insights.push({ type:"warn", text:`🔥 ${promoList.length} item${promoList.length>1?"s em promoção":" em promoção"}! Aproveite antes de acabar`, Icon:BadgePercent });
  if (pct >= 75 && pct < 100)
    insights.push({ type:"ok", text:`Quase lá! ${pct}% do enxoval já comprado 🎉`, Icon:CheckCircle2 });
  if (pct === 100 && activeItems.length > 0)
    insights.push({ type:"ok", text:`Enxoval 100% completo! Parabéns! 🏠✨`, Icon:CheckCircle2 });
  const emptyRooms = rooms.filter(r => !activeItems.some(i => i.roomId === r.id));
  if (emptyRooms.length > 0)
    insights.push({ type:"info", text:`${emptyRooms.length} cômodo${emptyRooms.length>1?"s":""} sem itens: ${emptyRooms.map(r=>r.name).join(", ")}`, Icon:Home });
  if (budget > 0 && allVal > budget)
    insights.push({ type:"alert", text:`Estimativa (${fmt(allVal)}) ultrapassa o orçamento (${fmt(budget)}) em ${fmt(allVal-budget)}`, Icon:TrendingDown });
  else if (budget > 0 && allVal <= budget)
    insights.push({ type:"ok", text:`Dentro do orçamento! Restam ${fmt(budget-allVal)} disponíveis`, Icon:Wallet });
  return insights.slice(0, 5);
}

  export default function SummaryView({ activeItems, rooms, settings, roomStats }) {
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
        {(()=>{const ins=generateInsights();return ins.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <h3 className="fd" style={{fontSize:18,fontWeight:600,display:"flex",alignItems:"center",gap:8}}><Lightbulb size={16} style={{color:"var(--go)"}}/>Insights</h3>
            {ins.map((x,i)=><InsightCard key={i} type={x.type} text={x.text} Icon={x.Icon} delay={i*.07}/>)}
          </div>
        );})()}
      </div>
    );
  };

