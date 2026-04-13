// src/lib/supabase.js
// Cliente Supabase — importado por hooks e rotas de API

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local"
  );
}

// Singleton — garante uma única instância no browser
export const supabase = createClient(url, key, {
  auth: {
    persistSession:    true,   // mantém sessão no localStorage
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
});
