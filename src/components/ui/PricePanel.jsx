"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink,
  BarChart2, Loader2, RefreshCw,
} from "lucide-react";
import { fmt } from "../../lib/utils/format";
import { getStore } from "../../lib/constants/index";
import { AI } from "../../lib/services/api";

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

export default PricePanel;
