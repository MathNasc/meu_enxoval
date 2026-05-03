// src/lib/hooks/useFilters.js
// Estado dos filtros de "Meus Itens" centralizado em um hook dedicado.
//
// Por que useReducer em vez de useState separados?
//   - Cada dispatch atualiza só o campo especificado (spread parcial)
//   - Impossível sobrescrever acidentalmente outros filtros
//   - CLEAR preserva vw e filtersOpen (comportamento intencional)
//   - Ações nomeadas são autodocumentadas e fáceis de debugar
//
// Por que elevado ao App em vez de ficar no componente?
//   - Componentes como ItemsSimple são closures que se recriaram a cada
//     render do pai. Se o estado ficasse dentro deles, qualquer mudança
//     externa (novo item, realtime) destruía os filtros ativos.

import { useReducer } from "react";

// ── Estado inicial ───────────────────────────────────────
export const FILTER_INITIAL = {
  search:      "",
  fRoom:       "all",
  fStatus:     "all",
  fPrio:       "all",
  fStar:       false,
  fPromo:      false,
  minPrice:    "",      // "" = sem limite inferior
  maxPrice:    "",      // "" = sem limite superior
  sort:        "recent",
  vw:          "grid",
  filtersOpen: false,   // painel colapsável visível/oculto
};

// ── Reducer ──────────────────────────────────────────────
export function filterReducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH":    return { ...state, search:      action.payload };
    case "SET_ROOM":      return { ...state, fRoom:       action.payload };
    case "SET_STATUS":    return { ...state, fStatus:     action.payload };
    case "SET_PRIO":      return { ...state, fPrio:       action.payload };
    case "TOGGLE_STAR":   return { ...state, fStar:       !state.fStar   };
    case "TOGGLE_PROMO":  return { ...state, fPromo:      !state.fPromo  };
    case "SET_SORT":      return { ...state, sort:        action.payload };
    case "SET_VW":        return { ...state, vw:          action.payload };
    case "TOGGLE_PANEL":  return { ...state, filtersOpen: !state.filtersOpen };
    case "SET_MIN_PRICE": return { ...state, minPrice:    action.payload };
    case "SET_MAX_PRICE": return { ...state, maxPrice:    action.payload };
    // CLEAR reseta filtros mas mantém preferências de layout
    case "CLEAR":         return {
      ...FILTER_INITIAL,
      vw:          state.vw,
      filtersOpen: state.filtersOpen,
    };
    default:
      return state;
  }
}

// ── Hook público ─────────────────────────────────────────
export function useFilters() {
  const [filters, dispatch] = useReducer(filterReducer, FILTER_INITIAL);

  // Ações tipadas — IDE oferece autocompletar, menos typos nas strings
  const actions = {
    setSearch:    (v)  => dispatch({ type: "SET_SEARCH",    payload: v }),
    setRoom:      (v)  => dispatch({ type: "SET_ROOM",      payload: v }),
    setStatus:    (v)  => dispatch({ type: "SET_STATUS",    payload: v }),
    setPrio:      (v)  => dispatch({ type: "SET_PRIO",      payload: v }),
    toggleStar:   ()   => dispatch({ type: "TOGGLE_STAR"   }),
    togglePromo:  ()   => dispatch({ type: "TOGGLE_PROMO"  }),
    setSort:      (v)  => dispatch({ type: "SET_SORT",      payload: v }),
    setVw:        (v)  => dispatch({ type: "SET_VW",        payload: v }),
    togglePanel:  ()   => dispatch({ type: "TOGGLE_PANEL"  }),
    setMinPrice:  (v)  => dispatch({ type: "SET_MIN_PRICE", payload: v }),
    setMaxPrice:  (v)  => dispatch({ type: "SET_MAX_PRICE", payload: v }),
    clear:        ()   => dispatch({ type: "CLEAR"         }),
  };

  const hasActiveFilters =
    filters.fRoom    !== "all" ||
    filters.fStatus  !== "all" ||
    filters.fPrio    !== "all" ||
    filters.fStar    ||
    filters.fPromo   ||
    !!filters.search.trim() ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "";

  return { filters, dispatch, actions, hasActiveFilters };
}
