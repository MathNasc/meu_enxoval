"use client";
import {
  Search, Plus, Zap, X, Home, Filter, Star, BadgePercent,
  Flame, ArrowUpDown, Grid3X3, List, Sparkles, Loader2, DollarSign,
  ShoppingCart,
} from "lucide-react";
import { getRoomSuggestions } from "../lib/constants/index";
import ItemCard from "../components/items/ItemCard";

  export default function ItemsView({ activeItems, filtered, rooms, itemsLoading, filters, dispatchFilter, hasFilters, openAdd, setQuickModal, setItemModal, handleDeleteItem, itemsHook }) {
    const clearFilters = ()=> dispatchFilter({ type:"CLEAR" });
    const suggs = fRoom!=="all" ? getRoomSuggestions(fRoom,rooms,activeItems) : [];

    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 className="fd" style={{fontSize:27,fontWeight:600}}>Meus Itens</h1>
            <p style={{color:"var(--tx2)",fontSize:13,marginTop:2}}>
              {filtered.length} de {activeItems.length} · {activeItems.filter(i=>i.status==="bought").length} comprados
            </p>
          </div>
          <div style={{display:"flex",gap:7}}>
            <button className="btn btn-s" style={{fontSize:12.5}} onClick={()=>setQuickModal(true)}><Zap size={13}/>Rápido</button>
            <button className="btn btn-p" style={{fontSize:12.5}} onClick={()=>openAdd()}><Plus size={13}/>Adicionar</button>
          </div>
        </div>

        {/* ── Search bar ─────────────────────────────── */}
        <div style={{position:"relative"}}>
          <Search size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"var(--tx3)"}}/>
          <input className="inp" placeholder="Buscar por nome, observação..."
            value={search}
            onChange={e=>dispatchFilter({type:"SET_SEARCH",payload:e.target.value})}
            style={{paddingLeft:37,paddingRight:search?36:14}}/>
          {search&&(
            <button className="btn btn-g bico"
              onClick={()=>dispatchFilter({type:"SET_SEARCH",payload:""})}
              style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)"}}>
              <X size={13}/>
            </button>
          )}
        </div>

        {/* ── Filter bar: sort + view + toggle panel ─── */}
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
          {/* Sort */}
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:180}}>
            <ArrowUpDown size={13} style={{color:"var(--tx3)",flexShrink:0}}/>
            <select className="inp" value={sort}
              onChange={e=>dispatchFilter({type:"SET_SORT",payload:e.target.value})}
              style={{flex:1,padding:"7px 10px",fontSize:12.5,cursor:"pointer"}}>
              <option value="recent">🕐 Mais recente</option>
              <option value="name">🔤 Nome A–Z</option>
              <option value="price_desc">💰 Maior preço</option>
              <option value="price_asc">💸 Menor preço</option>
              <option value="prio">⚡ Prioridade</option>
            </select>
          </div>
          {/* View toggle */}
          <div style={{display:"flex",gap:3}}>
            <button className="btn btn-g bico" title="Grade"
              onClick={()=>dispatchFilter({type:"SET_VW",payload:"grid"})}
              style={vw==="grid"?{background:"var(--bg3)",color:"var(--p)"}:{}}>
              <Grid3X3 size={14}/>
            </button>
            <button className="btn btn-g bico" title="Lista"
              onClick={()=>dispatchFilter({type:"SET_VW",payload:"list"})}
              style={vw==="list"?{background:"var(--bg3)",color:"var(--p)"}:{}}>
              <List size={14}/>
            </button>
          </div>
          {/* Filter panel toggle button */}
          <button
            onClick={()=>dispatchFilter({type:"TOGGLE_PANEL"})}
            className={`btn ${filtersOpen?"btn-p":"btn-s"}`}
            style={{fontSize:12.5,gap:6,padding:"7px 13px",position:"relative"}}>
            <Filter size={13}/>
            Filtros
            {hasFilters&&(
              <span style={{
                position:"absolute",top:-5,right:-5,
                width:17,height:17,borderRadius:"50%",
                background:"var(--r)",color:"white",
                fontSize:9,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                {[fRoom!=="all",fStatus!=="all",fPrio!=="all",fStar,fPromo,
                  minPrice!=="",maxPrice!==""].filter(Boolean).length}
              </span>
            )}
          </button>
          {/* Clear — only when filters active */}
          {hasFilters&&(
            <button className="btn btn-g" onClick={clearFilters}
              style={{fontSize:11.5,color:"var(--r)",gap:4,padding:"5px 9px"}}>
              <X size={11}/>Limpar
            </button>
          )}
        </div>

        {/* ── Filter panel (collapsible) ──────────────── */}
        {filtersOpen&&(
          <div style={{
            background:"var(--bg2)",border:"1.5px solid var(--bdr)",
            borderRadius:14,padding:"16px 18px",
            display:"flex",flexDirection:"column",gap:16,
          }}>
            {/* Cômodo */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <Home size={10}/>Cômodo
              </p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[{id:"all",name:"Todos"},...rooms].map(r=>(
                  <button key={r.id}
                    className={`chip ${fRoom===r.id?"on":""}`}
                    onClick={()=>dispatchFilter({type:"SET_ROOM",payload:r.id})}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <ShoppingCart size={10}/>Status
              </p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[{id:"all",l:"Todos"},{id:"want",l:"🛒 Pendentes"},{id:"bought",l:"✅ Comprados"}].map(s=>(
                  <button key={s.id}
                    className={`chip ${fStatus===s.id?"on":""}`}
                    onClick={()=>dispatchFilter({type:"SET_STATUS",payload:s.id})}>
                    {s.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <Flame size={10}/>Prioridade
              </p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[
                  {id:"all",    l:"Todas",       color:null},
                  {id:"high",   l:"⚡ Alta",      color:"var(--r)"},
                  {id:"normal", l:"🔵 Normal",    color:"var(--p)"},
                  {id:"low",    l:"📌 Baixa",     color:"var(--tx3)"},
                ].map(p=>(
                  <button key={p.id}
                    className={`chip ${fPrio===p.id?"on":""}`}
                    onClick={()=>dispatchFilter({type:"SET_PRIO",payload:p.id})}
                    style={fPrio===p.id&&p.color?{background:p.color,borderColor:p.color}:{}}>
                    {p.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Faixa de preço */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <DollarSign size={10}/>Faixa de preço (R$)
              </p>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="number" min="0" step="50"
                  placeholder="Mín"
                  value={minPrice}
                  onChange={e=>dispatchFilter({type:"SET_MIN_PRICE",payload:e.target.value})}
                  style={{
                    flex:1,padding:"8px 10px",background:"var(--bg)",
                    border:"1.5px solid var(--bdr)",borderRadius:8,
                    fontFamily:"var(--f)",fontSize:13,color:"var(--tx)",outline:"none",
                    transition:"border-color .2s",
                  }}
                  onFocus={e=>e.target.style.borderColor="var(--p)"}
                  onBlur={e=>e.target.style.borderColor="var(--bdr)"}
                />
                <span style={{color:"var(--tx3)",fontSize:12,flexShrink:0}}>até</span>
                <input type="number" min="0" step="50"
                  placeholder="Máx"
                  value={maxPrice}
                  onChange={e=>dispatchFilter({type:"SET_MAX_PRICE",payload:e.target.value})}
                  style={{
                    flex:1,padding:"8px 10px",background:"var(--bg)",
                    border:"1.5px solid var(--bdr)",borderRadius:8,
                    fontFamily:"var(--f)",fontSize:13,color:"var(--tx)",outline:"none",
                    transition:"border-color .2s",
                  }}
                  onFocus={e=>e.target.style.borderColor="var(--p)"}
                  onBlur={e=>e.target.style.borderColor="var(--bdr)"}
                />
                {(minPrice||maxPrice)&&(
                  <button className="btn btn-g bico"
                    onClick={()=>{
                      dispatchFilter({type:"SET_MIN_PRICE",payload:""});
                      dispatchFilter({type:"SET_MAX_PRICE",payload:""});
                    }}>
                    <X size={12}/>
                  </button>
                )}
              </div>
              {/* Quick price presets */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
                {[
                  {l:"Até R$100",   min:"",    max:"100" },
                  {l:"R$100–500",   min:"100", max:"500" },
                  {l:"R$500–1000",  min:"500", max:"1000"},
                  {l:"Acima R$1k",  min:"1000",max:""    },
                ].map(p=>{
                  const active = minPrice===p.min && maxPrice===p.max;
                  return (
                    <button key={p.l}
                      className={`chip ${active?"on":""}`}
                      style={{fontSize:11.5}}
                      onClick={()=>{
                        dispatchFilter({type:"SET_MIN_PRICE",payload:active?"":p.min});
                        dispatchFilter({type:"SET_MAX_PRICE",payload:active?"":p.max});
                      }}>
                      {p.l}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Especiais */}
            <div>
              <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
                <Star size={10}/>Especiais
              </p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <button
                  className={`chip ${fStar?"on":""}`}
                  onClick={()=>dispatchFilter({type:"TOGGLE_STAR"})}
                  style={{display:"flex",alignItems:"center",gap:4}}>
                  <Star size={11}/>Favoritos
                </button>
                <button
                  className={`chip ${fPromo?"on":""}`}
                  onClick={()=>dispatchFilter({type:"TOGGLE_PROMO"})}
                  style={{display:"flex",alignItems:"center",gap:4}}>
                  <BadgePercent size={11}/>Em promoção
                </button>
              </div>
            </div>

            {/* Active filter summary */}
            {hasFilters&&(
              <div style={{
                paddingTop:12,borderTop:"1px solid var(--bdr)",
                display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,
              }}>
                <p style={{fontSize:12,color:"var(--tx2)"}}>
                  <b style={{color:"var(--p)"}}>{filtered.length}</b> resultado{filtered.length!==1?"s":""} com os filtros atuais
                </p>
                <button className="btn btn-g" onClick={clearFilters}
                  style={{fontSize:12,color:"var(--r)",gap:4}}>
                  <X size={11}/>Limpar todos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Room suggestions */}
        {suggs.length>0&&(
          <div style={{background:"var(--bg2)",border:"1.5px dashed var(--bdr2)",borderRadius:12,padding:"13px 15px"}}>
            <p style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:9,display:"flex",alignItems:"center",gap:5}}>
              <Sparkles size={11}/>Sugestões — {rooms.find(r=>r.id===fRoom)?.name}
            </p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {suggs.map(s=><button key={s} className="sch" onClick={()=>openAdd({prefillName:s,prefillRoom:fRoom})}><Plus size={9}/>{s}</button>)}
            </div>
          </div>
        )}

        {/* Items grid/list */}
        {itemsLoading ? (
          <div style={{display:"flex",justifyContent:"center",padding:40}}>
            <Loader2 size={24} style={{color:"var(--p)",animation:"spin 1s linear infinite"}}/>
          </div>
        ) : filtered.length===0 ? (
          <div className="empty">
            <div className="eico"><Search size={26} style={{color:"var(--tx3)"}}/></div>
            <p style={{fontWeight:700,fontSize:15}}>Nenhum item encontrado</p>
            <p style={{fontSize:13,color:"var(--tx3)"}}>
              {hasFilters?"Ajuste os filtros ou ":""}
              <button className="btn btn-p" onClick={()=>openAdd()} style={{marginLeft:hasFilters?8:0}}><Plus size={13}/>Adicionar</button>
            </p>
            {hasFilters&&<button className="btn btn-s" style={{marginTop:4,fontSize:12}} onClick={clearFilters}><X size={12}/>Limpar filtros</button>}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:vw==="grid"?"repeat(auto-fill,minmax(280px,1fr))":"1fr",gap:9}}>
            {filtered.map(item=>(
              <ItemCard key={item.id} item={item} rooms={rooms}
                onToggle={itemsHook.toggleStatus}
                onEdit={setItemModal}
                onDelete={handleDeleteItem}
                onDuplicate={itemsHook.duplicateItem}
                onStar={itemsHook.toggleStar}
                onUpdatePrice={itemsHook.updatePriceOffers}/>
            ))}
          </div>
        )}
      </div>
    );
  };

