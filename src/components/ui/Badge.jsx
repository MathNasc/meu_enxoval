"use client";

/**
 * Badge — etiqueta inline colorida.
 *
 * Variantes:
 *   primary  → azul  (.bw)
 *   success  → verde (.bd)
 *   danger   → vermelho (.bh)
 *   neutral  → cinza
 *
 * Uso:
 *   <Badge variant="danger"><Flame size={9}/>Alta</Badge>
 *   <Badge variant="success">Comprado</Badge>
 *   <Badge count={5}/>  ← contador numérico (bolinha)
 */
export default function Badge({
  variant  = "primary",
  count,
  className = "",
  style    = {},
  children,
  ...props
}) {
  // Counter badge (bolinha numérica)
  if (count !== undefined) {
    return (
      <span style={{
        position: "absolute", top: -5, right: -5,
        width: 17, height: 17, borderRadius: "50%",
        background: "var(--r)", color: "white",
        fontSize: 9, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
        ...style,
      }} {...props}>
        {count}
      </span>
    );
  }

  const cls = [
    "bdg",
    variant === "primary" ? "bw" : "",
    variant === "success" ? "bd" : "",
    variant === "danger"  ? "bh" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <span className={cls} style={style} {...props}>
      {children}
    </span>
  );
}
