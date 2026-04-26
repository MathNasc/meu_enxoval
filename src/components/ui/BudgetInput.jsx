"use client";
import { useState, useRef, useEffect } from "react";

// Input de orçamento com debounce — salva 800ms após parar de digitar
// evita chamadas ao Supabase a cada tecla pressionada
function BudgetInput({ value, onSave }) {
  const [local, setLocal] = useState(value ?? "");
  const timerRef = useRef(null);

  // Sincroniza quando valor externo muda (ex: outro dispositivo via realtime)
  useEffect(() => { setLocal(value ?? ""); }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSave(parseFloat(v) || null);
    }, 800);
  };

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <input
      type="number" min="0" step="100"
      placeholder="Orçamento total R$"
      value={local}
      onChange={handleChange}
      style={{
        width: "100%", maxWidth: 180, minWidth: 100, padding: "6px 10px",
        background: "var(--bg)", border: "1.5px solid var(--bdr)",
        borderRadius: 8, fontFamily: "var(--f)", fontSize: 12.5,
        color: "var(--tx)", outline: "none", transition: "border-color .2s",
        boxSizing: "border-box",
      }}
      onFocus={e => e.target.style.borderColor = "var(--p)"}
      onBlur={e  => e.target.style.borderColor = "var(--bdr)"}
    />
  );
}

export default BudgetInput;
