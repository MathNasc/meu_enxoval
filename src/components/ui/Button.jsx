"use client";

/**
 * Button — componente base reutilizável.
 *
 * Variantes:
 *   primary   → azul sólido  (.btn-p)
 *   secondary → fundo neutro (.btn-s)
 *   ghost     → transparente (.btn-g)
 *
 * Uso:
 *   <Button variant="primary" onClick={fn}><Plus size={13}/>Adicionar</Button>
 *   <Button variant="ghost" icon><X size={14}/></Button>   ← ícone quadrado
 *   <Button variant="primary" pulse>Pulsar</Button>
 */
export default function Button({
  variant = "secondary",
  icon    = false,
  pulse   = false,
  danger  = false,
  disabled = false,
  className = "",
  style   = {},
  children,
  ...props
}) {
  const cls = [
    "btn",
    variant === "primary"   ? "btn-p" : "",
    variant === "secondary" ? "btn-s" : "",
    variant === "ghost"     ? "btn-g" : "",
    icon   ? "bico"  : "",
    pulse  ? "pulse" : "",
    danger ? "bdng"  : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      className={cls}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer", ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
