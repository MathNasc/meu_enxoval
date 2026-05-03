-- ═══════════════════════════════════════════════════════════
-- SCHEMA v3 — Meu Enxoval
-- IMPORTANTE: execute TUDO de uma vez no SQL Editor do Supabase
-- Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════

-- ── Drop objetos anteriores (re-run seguro) ─────────────────
DROP POLICY IF EXISTS "profiles_select"     ON profiles;
DROP POLICY IF EXISTS "profiles_update"     ON profiles;
DROP POLICY IF EXISTS "profiles_insert"     ON profiles;
DROP POLICY IF EXISTS "households_select"   ON households;
DROP POLICY IF EXISTS "households_insert"   ON households;
DROP POLICY IF EXISTS "households_update"   ON households;
DROP POLICY IF EXISTS "rooms_select"        ON rooms;
DROP POLICY IF EXISTS "rooms_insert"        ON rooms;
DROP POLICY IF EXISTS "rooms_update"        ON rooms;
DROP POLICY IF EXISTS "rooms_delete"        ON rooms;
DROP POLICY IF EXISTS "items_select"        ON items;
DROP POLICY IF EXISTS "items_insert"        ON items;
DROP POLICY IF EXISTS "items_update"        ON items;
DROP POLICY IF EXISTS "items_delete"        ON items;
DROP POLICY IF EXISTS "settings_select"     ON household_settings;
DROP POLICY IF EXISTS "settings_insert"     ON household_settings;
DROP POLICY IF EXISTS "settings_update"     ON household_settings;

DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER  IF EXISTS items_updated_at     ON items;

DROP FUNCTION IF EXISTS handle_new_user()             CASCADE;
DROP FUNCTION IF EXISTS update_updated_at()           CASCADE;
DROP FUNCTION IF EXISTS my_household_id()             CASCADE;
DROP FUNCTION IF EXISTS join_household_by_code(TEXT)  CASCADE;

-- ── Tabelas ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'Meu Enxoval',
  invite_code TEXT UNIQUE NOT NULL
              DEFAULT upper(substr(md5(random()::text), 1, 8)),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT 'home',
  color        TEXT NOT NULL DEFAULT '#1272AA',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  room_id       UUID REFERENCES rooms(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  price         DECIMAL(10,2),
  link          TEXT,
  image_url     TEXT,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'want'
                CHECK (status   IN ('want','bought')),
  priority      TEXT NOT NULL DEFAULT 'normal'
                CHECK (priority IN ('low','normal','high')),
  starred       BOOLEAN DEFAULT false,
  deleted_at    TIMESTAMPTZ,
  price_history JSONB DEFAULT '[]',
  price_offers  JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS household_settings (
  household_id  UUID PRIMARY KEY REFERENCES households(id) ON DELETE CASCADE,
  delivery_date DATE,
  budget_total  DECIMAL(10,2),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- FUNÇÕES
-- ════════════════════════════════════════════════════════════

-- Retorna o household_id do usuário logado.
-- SET search_path = public evita ataques de search_path injection.
CREATE OR REPLACE FUNCTION my_household_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid()
$$;

-- ────────────────────────────────────────────────────────────
-- handle_new_user — cria household + perfil + cômodos + settings
-- ao registrar um novo usuário.
--
-- CORREÇÕES v3:
-- 1. SET search_path = public — evita search_path injection
-- 2. ON CONFLICT em profiles — evita falha em re-registros
-- 3. EXCEPTION WHEN others — captura qualquer erro e loga sem
--    abortar o registro. Sem isso, qualquer falha resulta em
--    "Database error saving new user" no Supabase Auth.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hid UUID;
BEGIN
  -- 1. Household
  INSERT INTO households (name)
  VALUES ('Meu Enxoval')
  RETURNING id INTO v_hid;

  -- 2. Perfil (ON CONFLICT protege contra re-registros do mesmo user id)
  INSERT INTO profiles (id, email, household_id)
  VALUES (NEW.id, NEW.email, v_hid)
  ON CONFLICT (id) DO UPDATE
    SET household_id = EXCLUDED.household_id,
        email        = EXCLUDED.email;

  -- 3. Cômodos padrão
  INSERT INTO rooms (household_id, name, icon, color) VALUES
    (v_hid, 'Quarto',   'bed',      '#D4875A'),
    (v_hid, 'Sala',     'sofa',     '#2A9D8F'),
    (v_hid, 'Cozinha',  'utensils', '#E9A830'),
    (v_hid, 'Banheiro', 'bath',     '#1272AA');

  -- 4. Settings iniciais
  INSERT INTO household_settings (household_id)
  VALUES (v_hid)
  ON CONFLICT (household_id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN others THEN
  -- Loga o erro mas NÃO aborta o registro do usuário.
  -- Sem este bloco, qualquer falha acima causa
  -- "Database error saving new user" no Auth.
  RAISE LOG 'handle_new_user error for user %: % (SQLSTATE: %)',
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- updated_at automático em items
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Vinculação de casal via invite_code
CREATE OR REPLACE FUNCTION join_household_by_code(p_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hid  UUID;
  v_name TEXT;
  v_my   UUID;
BEGIN
  SELECT id, name INTO v_hid, v_name
  FROM households
  WHERE invite_code = upper(trim(p_code))
  LIMIT 1;

  IF v_hid IS NULL THEN
    RETURN jsonb_build_object('error', 'Código inválido. Verifique e tente novamente.');
  END IF;

  SELECT household_id INTO v_my FROM profiles WHERE id = auth.uid();

  IF v_my = v_hid THEN
    RETURN jsonb_build_object('error', 'Você já está nesta lista!');
  END IF;

  UPDATE profiles SET household_id = v_hid WHERE id = auth.uid();

  RETURN jsonb_build_object('ok', true, 'household_id', v_hid, 'name', v_name);
END;
$$;

-- ════════════════════════════════════════════════════════════
-- TRIGGERS
-- ════════════════════════════════════════════════════════════
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- INSERT usa WITH CHECK (não USING) — USING só filtra SELECT.
-- ════════════════════════════════════════════════════════════
ALTER TABLE households         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_settings ENABLE ROW LEVEL SECURITY;

-- ── Profiles ─────────────────────────────────────────────────
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── Households ───────────────────────────────────────────────
CREATE POLICY "households_select" ON households
  FOR SELECT USING (id = my_household_id());

CREATE POLICY "households_insert" ON households
  FOR INSERT WITH CHECK (true);

CREATE POLICY "households_update" ON households
  FOR UPDATE USING (id = my_household_id())
  WITH CHECK (id = my_household_id());

-- ── Rooms ─────────────────────────────────────────────────────
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (household_id = my_household_id());

CREATE POLICY "rooms_insert" ON rooms
  FOR INSERT WITH CHECK (household_id = my_household_id());

CREATE POLICY "rooms_update" ON rooms
  FOR UPDATE USING (household_id = my_household_id())
  WITH CHECK (household_id = my_household_id());

CREATE POLICY "rooms_delete" ON rooms
  FOR DELETE USING (household_id = my_household_id());

-- ── Items ──────────────────────────────────────────────────────
CREATE POLICY "items_select" ON items
  FOR SELECT USING (household_id = my_household_id());

CREATE POLICY "items_insert" ON items
  FOR INSERT WITH CHECK (household_id = my_household_id());

CREATE POLICY "items_update" ON items
  FOR UPDATE USING (household_id = my_household_id())
  WITH CHECK (household_id = my_household_id());

CREATE POLICY "items_delete" ON items
  FOR DELETE USING (household_id = my_household_id());

-- ── Settings ──────────────────────────────────────────────────
CREATE POLICY "settings_select" ON household_settings
  FOR SELECT USING (household_id = my_household_id());

CREATE POLICY "settings_insert" ON household_settings
  FOR INSERT WITH CHECK (household_id = my_household_id());

CREATE POLICY "settings_update" ON household_settings
  FOR UPDATE USING (household_id = my_household_id())
  WITH CHECK (household_id = my_household_id());

-- ════════════════════════════════════════════════════════════
-- REALTIME
-- ════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE household_settings;
