-- ═══════════════════════════════════════════════════════
-- SCHEMA — Meu Enxoval
-- Cole este SQL no Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════

-- ── Households (casal / grupo) ──────────────────────────
CREATE TABLE IF NOT EXISTS households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'Meu Enxoval',
  invite_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 8)),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Perfis de usuário (estende auth.users do Supabase) ──
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  household_id  UUID REFERENCES households(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Cômodos ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  icon          TEXT NOT NULL DEFAULT 'home',
  color         TEXT NOT NULL DEFAULT '#1272AA',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Itens ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  room_id       UUID REFERENCES rooms(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  price         DECIMAL(10,2),
  link          TEXT,
  image_url     TEXT,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'want' CHECK (status IN ('want','bought')),
  priority      TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  starred       BOOLEAN DEFAULT false,
  deleted_at    TIMESTAMPTZ,
  price_history JSONB DEFAULT '[]',
  price_offers  JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Configurações do household ───────────────────────────
CREATE TABLE IF NOT EXISTS household_settings (
  household_id   UUID PRIMARY KEY REFERENCES households(id) ON DELETE CASCADE,
  delivery_date  DATE,
  budget_total   DECIMAL(10,2),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════
-- FUNÇÕES E TRIGGERS
-- ════════════════════════════════════════════════════════

-- Auto-criar perfil ao registrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_household_id UUID;
  new_room         RECORD;
BEGIN
  -- Cria household padrão
  INSERT INTO households (name) VALUES ('Meu Enxoval')
  RETURNING id INTO new_household_id;

  -- Cria perfil vinculado ao household
  INSERT INTO profiles (id, email, household_id)
  VALUES (NEW.id, NEW.email, new_household_id);

  -- Cria cômodos padrão
  INSERT INTO rooms (household_id, name, icon, color) VALUES
    (new_household_id, 'Quarto',   'bed',      '#D4875A'),
    (new_household_id, 'Sala',     'sofa',     '#2A9D8F'),
    (new_household_id, 'Cozinha',  'utensils', '#E9A830'),
    (new_household_id, 'Banheiro', 'bath',     '#1272AA');

  -- Cria configurações padrão
  INSERT INTO household_settings (household_id) VALUES (new_household_id);

  RETURN NEW;
END;
$$;

-- Trigger que executa ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-atualizar updated_at nos itens
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Cada usuário só vê dados do seu household
-- ════════════════════════════════════════════════════════

ALTER TABLE households          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms               ENABLE ROW LEVEL SECURITY;
ALTER TABLE items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_settings  ENABLE ROW LEVEL SECURITY;

-- Helper: retorna o household_id do usuário logado
CREATE OR REPLACE FUNCTION my_household_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid()
$$;

-- Profiles: usuário vê/edita só o próprio
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (id = auth.uid());

-- Households: membros do mesmo household
CREATE POLICY "households_member" ON households
  FOR ALL USING (id = my_household_id());

-- Rooms: membros do mesmo household
CREATE POLICY "rooms_member" ON rooms
  FOR ALL USING (household_id = my_household_id());

-- Items: membros do mesmo household
CREATE POLICY "items_member" ON items
  FOR ALL USING (household_id = my_household_id());

-- Settings: membros do mesmo household
CREATE POLICY "settings_member" ON household_settings
  FOR ALL USING (household_id = my_household_id());

-- ════════════════════════════════════════════════════════
-- REALTIME (para sincronização casal)
-- ════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE household_settings;
