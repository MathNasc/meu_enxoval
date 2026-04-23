"use client";

function Toast({toasts}) {
  if(!toasts.length) return null;
  const t=toasts[toasts.length-1];
  const c={success:"var(--g)",error:"var(--r)",info:"var(--p)",warn:"var(--go)",trash:"#666"};
  return <div className="toast" style={{background:c[t.type]||c.info,color:"white"}}>{t.message}</div>;
}

const InsightCard = ({type="info",text,Icon=Lightbulb,delay=0}) => (
  <div className={`ins ins-${type}`} style={{animationDelay:`${delay}s`}}>
    <Icon size={14} style={{marginTop:1,flexShrink:0}}/><span>{text}</span>
  </div>
);

// ════════════════════════════════════════════════════════
// PRICE PANEL
// ════════════════════════════════════════════════════════

export default Toast;
