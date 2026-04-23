"use client";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart as RechartsPieChart, Pie, CartesianGrid,
} from "recharts";
import { fmt } from "../../lib/utils/format";

function RoomCharts({ items = [], rooms = [] }) {
  const [chartType, setChartType] = useState("bar"); // bar | pie | status

  // ── Transforma dados ────────────────────────────────────
  const data = useMemo(() => {
    return rooms
      .map(room => {
        const roomItems    = items.filter(i => i.roomId === room.id);
        const boughtItems  = roomItems.filter(i => i.status === "bought");
        const wantItems    = roomItems.filter(i => i.status === "want");
        const totalSpent   = boughtItems.filter(i => i.price).reduce((s, i) => s + parseFloat(i.price || 0), 0);
        const totalPlanned = wantItems.filter(i => i.price).reduce((s, i) => s + parseFloat(i.price || 0), 0);
        const totalValue   = roomItems.filter(i => i.price).reduce((s, i) => s + parseFloat(i.price || 0), 0);

        return {
          name:    room.name.length > 9 ? room.name.slice(0, 8) + "…" : room.name,
          fullName: room.name,
          color:   room.color || "#1272AA",
          total:   roomItems.length,
          bought:  boughtItems.length,
          want:    wantItems.length,
          spent:   parseFloat(totalSpent.toFixed(2)),
          planned: parseFloat(totalPlanned.toFixed(2)),
          value:   parseFloat(totalValue.toFixed(2)),
        };
      })
      .filter(d => d.total > 0); // esconde cômodos vazios
  }, [items, rooms]);

  // ── Dados para pizza (distribuição de gastos) ──────────
  const pieData = useMemo(() => (
    data
      .filter(d => d.value > 0)
      .map(d => ({ name: d.fullName, value: d.value, color: d.color }))
  ), [data]);

  // fmt importado de src/lib/utils/format.js (versão com centavos)
  if (!data.length) return (
    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--tx3)", fontSize: 13 }}>
      Nenhum dado disponível — adicione itens com preço para ver os gráficos.
    </div>
  );

  // ── Tooltip customizado ─────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const room = data.find(d => d.name === label) || {};
    return (
      <div style={{
        background: "var(--bg)", border: "1.5px solid var(--bdr)",
        borderRadius: 10, padding: "10px 14px", fontSize: 12.5,
        boxShadow: "0 4px 20px rgba(0,0,0,.15)",
      }}>
        <p style={{ fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>{room.fullName || label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill, marginBottom: 2 }}>
            {p.name}: <b>{typeof p.value === "number" && p.value > 100 ? fmt(p.value) : p.value}</b>
          </p>
        ))}
      </div>
    );
  };

  // ── Tooltip pizza ───────────────────────────────────────
  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div style={{
        background: "var(--bg)", border: "1.5px solid var(--bdr)",
        borderRadius: 10, padding: "9px 13px", fontSize: 12.5,
        boxShadow: "0 4px 20px rgba(0,0,0,.15)",
      }}>
        <p style={{ fontWeight: 700, color: d.payload.color, marginBottom: 3 }}>{d.name}</p>
        <p style={{ color: "var(--tx2)" }}>{fmt(d.value)}</p>
        <p style={{ color: "var(--tx3)", fontSize: 11 }}>
          {((d.value / pieData.reduce((s, x) => s + x.value, 0)) * 100).toFixed(1)}% do total
        </p>
      </div>
    );
  };

  // ── Label customizado para pizza ────────────────────────
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.06) return null; // esconde fatias muito pequenas
    const rad = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x   = cx + rad * Math.cos(-midAngle * Math.PI / 180);
    const y   = cy + rad * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--f)" }}>
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  const tabs = [
    { id: "bar",    label: "Gastos" },
    { id: "qty",    label: "Qtd. itens" },
    { id: "status", label: "Status" },
    { id: "pie",    label: "Pizza" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Tab selector */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setChartType(t.id)}
            className={`chip ${chartType === t.id ? "on" : ""}`}
            style={{ fontSize: 12 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Gráfico de barras: gastos por cômodo ── */}
      {chartType === "bar" && (
        <div>
          <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 10 }}>
            Valor total estimado por cômodo (R$)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
              barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                tick={{ fontSize: 10, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false} width={36}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="spent"   name="Gasto"    radius={[4,4,0,0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.9}/>)}
              </Bar>
              <Bar dataKey="planned" name="Pendente"  radius={[4,4,0,0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.35}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
            {[{l:"Gasto",op:.9},{l:"Pendente",op:.35}].map((x,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--tx3)" }}>
                <div style={{ width:10, height:10, borderRadius:3, background:`rgba(18,114,170,${x.op})` }}/>
                {x.l}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gráfico de barras: quantidade por cômodo ── */}
      {chartType === "qty" && (
        <div>
          <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 10 }}>
            Quantidade de itens por cômodo
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
              barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={false}
                tick={{ fontSize: 10, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false} width={24}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="total" name="Total de itens" radius={[6,6,0,0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Gráfico de barras empilhadas: status ── */}
      {chartType === "status" && (
        <div>
          <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 10 }}>
            Comprados vs pendentes por cômodo
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
              barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={false}
                tick={{ fontSize: 10, fill: "var(--tx3)", fontFamily: "var(--f)" }}
                axisLine={false} tickLine={false} width={24}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="bought" name="✅ Comprados" stackId="a" fill="var(--g)" radius={[0,0,0,0]}/>
              <Bar dataKey="want"   name="🛒 Pendentes" stackId="a" fill="var(--go)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
            {[{l:"Comprados",c:"var(--g)"},{l:"Pendentes",c:"var(--go)"}].map((x,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--tx3)" }}>
                <div style={{ width:10, height:10, borderRadius:3, background:x.c }}/>
                {x.l}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gráfico pizza: distribuição de gastos ── */}
      {chartType === "pie" && (
        pieData.length === 0 ? (
          <p style={{ textAlign:"center", color:"var(--tx3)", fontSize:13, padding:"24px 0" }}>
            Adicione preços nos itens para ver a distribuição por cômodo.
          </p>
        ) : (
          <div>
            <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 10 }}>
              Distribuição do valor estimado por cômodo
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  dataKey="value" labelLine={false} label={renderPieLabel}>
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="var(--bg)" strokeWidth={2}/>
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip/>}/>
              </RechartsPieChart>
            </ResponsiveContainer>
            {/* Custom legend below chart */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", justifyContent:"center", marginTop:6 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
                  <span style={{ color:"var(--tx2)" }}>{d.name}</span>
                  <span style={{ color:"var(--tx3)", fontWeight:600 }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default RoomCharts;
