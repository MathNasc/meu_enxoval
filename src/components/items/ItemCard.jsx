"use client";
import { CheckCircle2, Circle, Copy, Edit3, ExternalLink, Flame, Home, Package, Star } from "lucide-react";
import { fmt, getPromoInfo } from "../../lib/utils/format";
import { getIcon, getStore } from "../../lib/constants/index";
import DeleteButton from "./ui/DeleteButton";
import PricePanel  from "./ui/PricePanel";
import PromoBadge  from "./ui/PromoBadge";
import StoreBadge  from "./ui/StoreBadge";

function ItemCard({item,rooms=[],onToggle,onEdit,onDelete,onDuplicate,onStar,onUpdatePrice}) {
  const room=rooms.find(r=>r.id===item?.roomId);
  const RIcon=room?getIcon(room.icon):Home;
  const store=getStore(item?.link);
  const promoInfo=getPromoInfo(item);
  const [buying,setBuying]=useState(false);
  if(!item) return null;
  const handleToggle=()=>{setBuying(true);onToggle(item);setTimeout(()=>setBuying(false),500);};
  const cls=["ic",item.status==="bought"?"bought":"",item.priority==="high"&&item.status!=="bought"?"phi":"",item.starred&&item.status!=="bought"&&!promoInfo?"starred":"",promoInfo&&item.status!=="bought"?"promo":"",buying?"acp":""].filter(Boolean).join(" ");
  return (
    <div className={cls} style={{padding:"14px 15px"}}>
      <div style={{display:"flex",gap:12}}>
        <div style={{width:64,height:64,borderRadius:9,flexShrink:0,overflow:"hidden",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          {item.imageUrl?<img src={item.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>:<Package size={22} style={{color:"var(--tx3)"}}/>}
          {item.starred&&!promoInfo&&<div style={{position:"absolute",top:2,right:2,width:15,height:15,borderRadius:"50%",background:"var(--go)",display:"flex",alignItems:"center",justifyContent:"center"}}><Star size={8} style={{color:"white",fill:"white"}}/></div>}
          {promoInfo&&item.status!=="bought"&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"var(--go)",color:"white",fontSize:8,fontWeight:800,textAlign:"center",padding:"2px 0"}}>🔥 {promoInfo.discount}% OFF</div>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:14,color:"var(--tx)",textDecoration:item.status==="bought"?"line-through":"none",lineHeight:1.3,flex:1}}>{item.name}</span>
            {item.priority==="high"&&item.status!=="bought"&&<span className="bdg bh" style={{flexShrink:0}}><Flame size={8}/>Alta</span>}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:promoInfo&&item.status!=="bought"?5:7,alignItems:"center"}}>
            {room&&<span style={{display:"flex",alignItems:"center",gap:3,fontSize:10.5,color:"var(--tx3)",background:"var(--bg3)",padding:"2px 7px",borderRadius:99}}><RIcon size={9}/>{room.name}</span>}
            <span className={`bdg ${item.status==="bought"?"bd":"bw"}`}>{item.status==="bought"?"✓ Comprado":"Quero comprar"}</span>
            {item.price&&<span style={{display:"flex",alignItems:"center",gap:5}}>{promoInfo&&<span style={{fontSize:11,color:"var(--tx3)",textDecoration:"line-through"}}>{fmt(promoInfo.originalPrice)}</span>}<span style={{fontSize:13,fontWeight:800,color:promoInfo?"var(--go)":"var(--p)"}}>{fmt(item.price)}</span></span>}
            {store&&<StoreBadge url={item.link}/>}
          </div>
          {promoInfo&&item.status!=="bought"&&<div style={{marginBottom:6}}><PromoBadge promoInfo={promoInfo}/></div>}
          {item.notes&&<p style={{fontSize:11.5,color:"var(--tx3)",lineHeight:1.4,marginBottom:6}}>{item.notes}</p>}
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button onClick={handleToggle} className="btn btn-g" style={{fontSize:11.5,fontWeight:700,padding:"4px 9px",borderRadius:7,gap:4,background:item.status==="bought"?"var(--ga)":"var(--pa)",color:item.status==="bought"?"var(--g)":"var(--p)"}}>
              {item.status==="bought"?<Circle size={11}/>:<CheckCircle2 size={11}/>}{item.status==="bought"?"Desmarcar":"Comprado!"}
            </button>
            {item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-g bico" style={{textDecoration:"none"}}><ExternalLink size={13}/></a>}
            <button className="btn btn-g bico" onClick={()=>onEdit(item)}><Edit3 size={13}/></button>
            <DeleteButton onConfirm={()=>onDelete(item.id)}/>
            <button className={`btn btn-g bico bstr ${item.starred?"on":""}`} onClick={()=>onStar(item)}><Star size={13} style={item.starred?{fill:"var(--go)"}:{}}/></button>
            <button className="btn btn-g bico" onClick={()=>onDuplicate(item)} title="Duplicar"><Copy size={13}/></button>
          </div>
          <PricePanel item={item} onUpdatePrice={onUpdatePrice}/>
        </div>
      </div>
    </div>
  );
}

export default ItemCard;
