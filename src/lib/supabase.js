// src/lib/supabase.js
// Cliente Supabase com fallback mock para execução no AI Studio

import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isRealSupabase = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes("placeholder") &&
  !rawKey.includes("placeholder") &&
  rawUrl.startsWith("https://")
);

// ── In-Memory / LocalStorage Mock Supabase Client ───────────
function createMockClient() {
  const DB_STORAGE_KEY = "meu_enxoval_mock_db";
  const SESSION_STORAGE_KEY = "meu_enxoval_mock_session";

  const defaultHouseholdId = "household-demo-1";
  const defaultUserId = "user-demo-1";
  const defaultUser = {
    id: defaultUserId,
    email: "casal@meuenxoval.app",
    created_at: "2024-01-01T00:00:00.000Z",
  };

  const initialDb = {
    households: [
      {
        id: defaultHouseholdId,
        name: "Nosso Apartamento",
        invite_code: "ENXOVAL2026",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ],
    profiles: [
      {
        id: defaultUserId,
        email: defaultUser.email,
        household_id: defaultHouseholdId,
        households: {
          id: defaultHouseholdId,
          name: "Nosso Apartamento",
          invite_code: "ENXOVAL2026",
        },
      },
    ],
    rooms: [
      { id: "room-1", household_id: defaultHouseholdId, name: "Quarto",   icon: "bed",      color: "#D4875A", created_at: "2024-01-01T00:01:00.000Z" },
      { id: "room-2", household_id: defaultHouseholdId, name: "Sala",     icon: "sofa",     color: "#2A9D8F", created_at: "2024-01-01T00:02:00.000Z" },
      { id: "room-3", household_id: defaultHouseholdId, name: "Cozinha",  icon: "utensils", color: "#E9A830", created_at: "2024-01-01T00:03:00.000Z" },
      { id: "room-4", household_id: defaultHouseholdId, name: "Banheiro", icon: "bath",     color: "#1272AA", created_at: "2024-01-01T00:04:00.000Z" },
    ],
    items: [
      {
        id: "item-1",
        household_id: defaultHouseholdId,
        room_id: "room-1",
        name: "Cama Box Queen com Baú",
        price: 1899.00,
        link: "https://www.amazon.com.br",
        image_url: "",
        notes: "Molas ensacadas e estofado suede cinza",
        status: "want",
        priority: "high",
        starred: true,
        deleted_at: null,
        price_history: [{ date: "2024-01-10", price: 1999.00 }],
        price_offers: [],
        created_at: "2024-01-01T10:00:00.000Z",
      },
      {
        id: "item-2",
        household_id: defaultHouseholdId,
        room_id: "room-3",
        name: "Geladeira Frost Free Inox 410L",
        price: 2799.90,
        link: "https://www.mercadolivre.com.br",
        image_url: "",
        notes: "Tecnologia Inverter econômica",
        status: "want",
        priority: "high",
        starred: true,
        deleted_at: null,
        price_history: [],
        price_offers: [],
        created_at: "2024-01-02T10:00:00.000Z",
      },
      {
        id: "item-3",
        household_id: defaultHouseholdId,
        room_id: "room-2",
        name: "Sofá Retrátil 3 Lugares",
        price: 1490.00,
        link: "",
        image_url: "",
        notes: "Espuma D28, tecido linho",
        status: "bought",
        priority: "high",
        starred: false,
        deleted_at: null,
        price_history: [],
        price_offers: [],
        created_at: "2024-01-03T10:00:00.000Z",
      },
      {
        id: "item-4",
        household_id: defaultHouseholdId,
        room_id: "room-4",
        name: "Jogo de Toalhas Banhão 5 Peças",
        price: 179.90,
        link: "",
        image_url: "",
        notes: "100% algodão egípcio",
        status: "bought",
        priority: "normal",
        starred: false,
        deleted_at: null,
        price_history: [],
        price_offers: [],
        created_at: "2024-01-04T10:00:00.000Z",
      },
    ],
    household_settings: [
      {
        household_id: defaultHouseholdId,
        delivery_date: "2026-11-20",
        budget_total: 12000,
      },
    ],
  };

  function getDb() {
    if (typeof window === "undefined") return initialDb;
    try {
      const saved = localStorage.getItem(DB_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialDb));
      return initialDb;
    } catch {
      return initialDb;
    }
  }

  function saveDb(data) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn("[MockDB] save error", e);
      }
    }
  }

  function getSession() {
    if (typeof window === "undefined") return { user: defaultUser };
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved !== null) {
        return saved ? JSON.parse(saved) : null;
      }
      // Inicializa com sessão padrão para demo imediata
      const sess = { user: defaultUser };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sess));
      return sess;
    } catch {
      return { user: defaultUser };
    }
  }

  function setSession(sess) {
    if (typeof window !== "undefined") {
      try {
        if (sess) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sess));
        else localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (e) {
        console.warn("[MockAuth] session save error", e);
      }
    }
  }

  const authListeners = new Set();
  function notifyAuth(event, session) {
    authListeners.forEach((cb) => {
      try { cb(event, session); } catch (err) { console.error(err); }
    });
  }

  return {
    auth: {
      async getSession() {
        const session = getSession();
        return { data: { session }, error: null };
      },
      onAuthStateChange(callback) {
        authListeners.add(callback);
        const session = getSession();
        setTimeout(() => {
          callback("INITIAL_SESSION", session);
        }, 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => authListeners.delete(callback),
            },
          },
        };
      },
      async signUp({ email, password }) {
        const db = getDb();
        const userId = "user_" + Math.random().toString(36).slice(2, 9);
        const householdId = "household_" + Math.random().toString(36).slice(2, 9);
        const inviteCode = "CASAL" + Math.floor(100 + Math.random() * 900);

        const newUser = { id: userId, email, created_at: new Date().toISOString() };
        db.households = db.households || [];
        db.households.push({
          id: householdId,
          name: "Meu Enxoval",
          invite_code: inviteCode,
          created_at: new Date().toISOString(),
        });

        db.profiles = db.profiles || [];
        db.profiles.push({
          id: userId,
          email,
          household_id: householdId,
          households: { id: householdId, name: "Meu Enxoval", invite_code: inviteCode },
        });

        db.rooms = db.rooms || [];
        db.rooms.push(
          { id: "r_" + Math.random().toString(36).slice(2, 8), household_id: householdId, name: "Quarto",   icon: "bed",      color: "#D4875A", created_at: new Date().toISOString() },
          { id: "r_" + Math.random().toString(36).slice(2, 8), household_id: householdId, name: "Sala",     icon: "sofa",     color: "#2A9D8F", created_at: new Date().toISOString() },
          { id: "r_" + Math.random().toString(36).slice(2, 8), household_id: householdId, name: "Cozinha",  icon: "utensils", color: "#E9A830", created_at: new Date().toISOString() },
          { id: "r_" + Math.random().toString(36).slice(2, 8), household_id: householdId, name: "Banheiro", icon: "bath",     color: "#1272AA", created_at: new Date().toISOString() }
        );

        saveDb(db);
        const session = { user: newUser };
        setSession(session);
        notifyAuth("SIGNED_IN", session);
        return { data: { user: newUser, session }, error: null };
      },
      async signInWithPassword({ email, password }) {
        const db = getDb();
        let profile = (db.profiles || []).find((p) => p.email?.toLowerCase() === email?.toLowerCase());
        let user;
        if (profile) {
          user = { id: profile.id, email: profile.email };
        } else {
          return this.signUp({ email, password });
        }
        const session = { user };
        setSession(session);
        notifyAuth("SIGNED_IN", session);
        return { data: { user, session }, error: null };
      },
      async signOut() {
        setSession(null);
        notifyAuth("SIGNED_OUT", null);
        return { error: null };
      },
      async resetPasswordForEmail(email) {
        return { data: {}, error: null };
      },
      async updateUser({ password }) {
        const session = getSession();
        return { data: { user: session?.user || defaultUser }, error: null };
      },
    },

    channel(name) {
      return {
        on(event, filter, callback) {
          return {
            subscribe() {
              return {};
            },
          };
        },
      };
    },

    removeChannel(channel) {
      return true;
    },

    async rpc(fnName, params) {
      if (fnName === "join_household_by_code") {
        const code = params?.p_code?.toUpperCase();
        const db = getDb();
        const session = getSession();
        const household = (db.households || []).find((h) => h.invite_code?.toUpperCase() === code);
        if (!household) {
          return { data: { error: "Código do casal não encontrado." }, error: null };
        }
        if (session?.user?.id) {
          const profile = (db.profiles || []).find((p) => p.id === session.user.id);
          if (profile) {
            profile.household_id = household.id;
            profile.households = household;
            saveDb(db);
          }
        }
        return { data: { success: true }, error: null };
      }
      return { data: {}, error: null };
    },

    from(tableName) {
      const db = getDb();
      let records = [...(db[tableName] || [])];
      let isSingle = false;
      let filterFns = [];
      let sortFn = null;
      let pendingInsert = null;
      let pendingUpdate = null;
      let pendingDelete = false;

      const builder = {
        select(cols) {
          return builder;
        },
        eq(col, val) {
          filterFns.push((r) => r[col] === val);
          return builder;
        },
        in(col, vals) {
          filterFns.push((r) => Array.isArray(vals) && vals.includes(r[col]));
          return builder;
        },
        or(clause) {
          // Ex: deleted_at.is.null,deleted_at.gte.2024-01-01
          if (clause.includes("deleted_at.is.null")) {
            filterFns.push((r) => !r.deleted_at || new Date(r.deleted_at).getTime() > Date.now() - 30 * 86400000);
          }
          return builder;
        },
        order(col, { ascending = true } = {}) {
          sortFn = (a, b) => {
            const av = a[col] || 0;
            const bv = b[col] || 0;
            if (av < bv) return ascending ? -1 : 1;
            if (av > bv) return ascending ? 1 : -1;
            return 0;
          };
          return builder;
        },
        single() {
          isSingle = true;
          return builder;
        },
        insert(data) {
          const rows = Array.isArray(data) ? data : [data];
          const newRows = rows.map((r) => ({
            ...r,
            id: r.id || (tableName.slice(0, 4) + "_" + Math.random().toString(36).slice(2, 9)),
            created_at: r.created_at || new Date().toISOString(),
          }));
          db[tableName] = db[tableName] || [];
          db[tableName].push(...newRows);
          saveDb(db);
          pendingInsert = newRows;
          return builder;
        },
        update(changes) {
          pendingUpdate = changes;
          return builder;
        },
        upsert(payload, { onConflict } = {}) {
          db[tableName] = db[tableName] || [];
          const list = Array.isArray(payload) ? payload : [payload];
          for (const item of list) {
            const matchIndex = onConflict
              ? db[tableName].findIndex((r) => r[onConflict] === item[onConflict])
              : -1;
            if (matchIndex >= 0) {
              db[tableName][matchIndex] = { ...db[tableName][matchIndex], ...item };
            } else {
              db[tableName].push({
                ...item,
                id: item.id || (tableName.slice(0, 4) + "_" + Math.random().toString(36).slice(2, 9)),
                created_at: item.created_at || new Date().toISOString(),
              });
            }
          }
          saveDb(db);
          return builder;
        },
        delete() {
          pendingDelete = true;
          return builder;
        },

        then(resolve, reject) {
          try {
            if (pendingDelete) {
              const beforeCount = (db[tableName] || []).length;
              db[tableName] = (db[tableName] || []).filter((r) => !filterFns.every((fn) => fn(r)));
              saveDb(db);
              return resolve({ data: null, error: null });
            }

            if (pendingUpdate) {
              db[tableName] = (db[tableName] || []).map((r) => {
                if (filterFns.every((fn) => fn(r))) {
                  return { ...r, ...pendingUpdate };
                }
                return r;
              });
              saveDb(db);
              return resolve({ data: null, error: null });
            }

            if (pendingInsert) {
              const res = isSingle ? pendingInsert[0] : pendingInsert;
              return resolve({ data: res, error: null });
            }

            let result = (db[tableName] || []).filter((r) => filterFns.every((fn) => fn(r)));
            if (tableName === "profiles") {
              result = result.map((p) => {
                const h = (db.households || []).find((h) => h.id === p.household_id);
                return { ...p, households: h || { id: p.household_id, name: "Meu Enxoval", invite_code: "CASAL123" } };
              });
            }
            if (sortFn) result.sort(sortFn);

            const out = isSingle ? (result[0] || null) : result;
            return resolve({ data: out, error: null });
          } catch (err) {
            return resolve({ data: isSingle ? null : [], error: err });
          }
        },
      };

      return builder;
    },
  };
}

export const supabase = isRealSupabase
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createMockClient();

