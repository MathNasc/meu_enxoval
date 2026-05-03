// src/lib/supabase.js
// Cliente Supabase — importado por hooks e rotas de API

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (typeof window !== "undefined" && (!url || !key)) {
  console.error(
    "[Supabase] Variáveis de ambiente não encontradas.\n" +
    "Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY\n" +
    "no painel do Vercel: Settings → Environment Variables"
  );
}

// Singleton — garante uma única instância no browser
export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder", {
  auth: {
    persistSession:    true,   // mantém sessão no localStorage
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
});
