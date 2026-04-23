"use client";
import { Lightbulb } from "lucide-react";

const InsightCard = ({type="info",text,Icon=Lightbulb,delay=0}) => (
  <div className={`ins ins-${type}`} style={{animationDelay:`${delay}s`}}>
    <Icon size={14} style={{marginTop:1,flexShrink:0}}/><span>{text}</span>
  </div>
);

export default InsightCard;
