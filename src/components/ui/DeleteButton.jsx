"use client";
import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

function DeleteButton({onConfirm,size=13}) {
  const [armed,setArmed]=useState(false);
  const tr=useRef(null);
  const handle=(e)=>{e.stopPropagation();if(!armed){setArmed(true);tr.current=setTimeout(()=>setArmed(false),3000);}else{clearTimeout(tr.current);onConfirm();}};
  useEffect(()=>()=>clearTimeout(tr.current),[]);
  return (
    <button className="btn btn-g bico" onClick={handle} title={armed?"Confirmar exclusão":"Excluir"}
      style={{color:armed?"white":undefined,background:armed?"var(--r)":undefined,
        padding:armed?"4px 9px":undefined,gap:4,fontSize:armed?11:undefined,fontWeight:armed?700:undefined,transition:"all .2s"}}>
      <Trash2 size={size}/>{armed&&"Confirmar"}
    </button>
  );
}

export default DeleteButton;
