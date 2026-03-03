-- ═══════════════════════════════════════════════════════════════════════════
-- ORI APP — Migration 002: Ensure all tables exist
-- Idempotent — safe to run even if some tables already exist.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Shared updated_at trigger function ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Profiles (may already exist) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT         NOT NULL,
  phone         TEXT         NOT NULL,
  patient_id    TEXT,
  patient_state TEXT,
  is_21_plus    BOOLEAN      NOT NULL DEFAULT false,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, patient_id, patient_state, is_21_plus)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.raw_user_meta_data->>'patient_id',
    NEW.raw_user_meta_data->>'patient_state',
    COALESCE((NEW.raw_user_meta_data->>'is_21_plus')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Menu ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  icon        TEXT,
  sort_order  INTEGER     DEFAULT 0,
  active      BOOLEAN     DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.menu_products (
  id               UUID           DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id      UUID           REFERENCES public.menu_categories(id),
  name             TEXT           NOT NULL,
  description      TEXT,
  price            DECIMAL(10,2)  NOT NULL,
  unit             TEXT           NOT NULL,
  image_url        TEXT,
  strain_type      TEXT           CHECK (strain_type IN ('indica','sativa','hybrid','cbd','balanced')),
  thc_percentage   DECIMAL(5,2),
  cbd_percentage   DECIMAL(5,2),
  effects          TEXT[],
  terpenes         TEXT[],
  available        BOOLEAN        DEFAULT true,
  featured         BOOLEAN        DEFAULT false,
  sort_order       INTEGER        DEFAULT 0,
  created_at       TIMESTAMPTZ    DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS menu_products_updated_at ON public.menu_products;
CREATE TRIGGER menu_products_updated_at BEFORE UPDATE ON public.menu_products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Reservations ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reservations (
  id               UUID           DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID           REFERENCES public.profiles(id) ON DELETE CASCADE,
  status           TEXT           NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','confirmed','completed','cancelled','expired')),
  pickup_date      DATE           NOT NULL,
  pickup_time      TIME           NOT NULL,
  notes            TEXT,
  reservation_code TEXT           UNIQUE NOT NULL,
  qr_data          TEXT,
  expires_at       TIMESTAMPTZ    NOT NULL,
  email_sent       BOOLEAN        DEFAULT false,
  created_at       TIMESTAMPTZ    DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS reservations_updated_at ON public.reservations;
CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.reservation_items (
  id               UUID           DEFAULT uuid_generate_v4() PRIMARY KEY,
  reservation_id   UUID           REFERENCES public.reservations(id) ON DELETE CASCADE,
  product_id       UUID           REFERENCES public.menu_products(id),
  product_name     TEXT           NOT NULL,
  product_unit     TEXT           NOT NULL,
  quantity         INTEGER        NOT NULL DEFAULT 1,
  unit_price       DECIMAL(10,2)  NOT NULL,
  created_at       TIMESTAMPTZ    DEFAULT NOW()
);

-- ─── Shop ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_categories (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  sort_order  INTEGER     DEFAULT 0,
  active      BOOLEAN     DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.shop_products (
  id                UUID           DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id       UUID           REFERENCES public.shop_categories(id),
  name              TEXT           NOT NULL,
  description       TEXT,
  price             DECIMAL(10,2)  NOT NULL,
  compare_at_price  DECIMAL(10,2),
  images            TEXT[]         DEFAULT '{}',
  variants          JSONB          DEFAULT '[]',
  total_inventory   INTEGER        DEFAULT 0,
  available         BOOLEAN        DEFAULT true,
  featured          BOOLEAN        DEFAULT false,
  weight_grams      DECIMAL(10,2),
  sort_order        INTEGER        DEFAULT 0,
  created_at        TIMESTAMPTZ    DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS shop_products_updated_at ON public.shop_products;
CREATE TRIGGER shop_products_updated_at BEFORE UPDATE ON public.shop_products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                         UUID           DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                    UUID           REFERENCES public.profiles(id) ON DELETE SET NULL,
  stripe_payment_intent_id   TEXT           UNIQUE,
  stripe_checkout_session_id TEXT,
  status                     TEXT           NOT NULL DEFAULT 'pending'
                                            CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  subtotal                   DECIMAL(10,2)  NOT NULL,
  tax                        DECIMAL(10,2)  DEFAULT 0,
  shipping                   DECIMAL(10,2)  DEFAULT 0,
  total                      DECIMAL(10,2)  NOT NULL,
  shipping_address           JSONB,
  tracking_number            TEXT,
  email_receipt_sent         BOOLEAN        DEFAULT false,
  notes                      TEXT,
  created_at                 TIMESTAMPTZ    DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID           DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id      UUID           REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    UUID           REFERENCES public.shop_products(id),
  product_name  TEXT           NOT NULL,
  product_image TEXT,
  quantity      INTEGER        NOT NULL,
  unit_price    DECIMAL(10,2)  NOT NULL,
  variant_info  JSONB,
  created_at    TIMESTAMPTZ    DEFAULT NOW()
);

-- ─── Events ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title        TEXT        NOT NULL,
  description  TEXT,
  date         DATE        NOT NULL,
  start_time   TIME,
  end_time     TIME,
  location     TEXT,
  address      TEXT,
  external_url TEXT,
  image_url    TEXT,
  is_free      BOOLEAN     DEFAULT true,
  ticket_url   TEXT,
  active       BOOLEAN     DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Content Blocks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  section    TEXT        NOT NULL,
  key        TEXT        NOT NULL,
  value      TEXT,
  sort_order INTEGER     DEFAULT 0,
  active     BOOLEAN     DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);

DROP TRIGGER IF EXISTS content_blocks_updated_at ON public.content_blocks;
CREATE TRIGGER content_blocks_updated_at BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Chat ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id  UUID        REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('user','assistant','system')),
  content     TEXT        NOT NULL,
  token_count INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Knowledge Docs (RAG) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_docs (
  id         UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  title      TEXT         NOT NULL,
  content    TEXT         NOT NULL,
  category   TEXT,
  tags       TEXT[],
  embedding  vector(1536),
  active     BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Vector index (only works if pgvector ivfflat is available on this plan)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_knowledge_docs_embedding
    ON public.knowledge_docs
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RAG function (requires pgvector; skip silently if unavailable)
DO $$ BEGIN
  EXECUTE $func$
    CREATE OR REPLACE FUNCTION match_knowledge_docs(
      query_embedding vector(1536),
      match_threshold float DEFAULT 0.75,
      match_count     int   DEFAULT 5
    )
    RETURNS TABLE (
      id         UUID,
      title      TEXT,
      content    TEXT,
      category   TEXT,
      similarity float
    )
    LANGUAGE sql STABLE AS $inner$
      SELECT id, title, content, category,
             1 - (knowledge_docs.embedding <=> query_embedding) AS similarity
      FROM knowledge_docs
      WHERE active = true
        AND 1 - (knowledge_docs.embedding <=> query_embedding) > match_threshold
      ORDER BY knowledge_docs.embedding <=> query_embedding
      LIMIT match_count;
    $inner$
  $func$;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ─── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_menu_products_category   ON public.menu_products(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_products_available  ON public.menu_products(available);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id     ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_code        ON public.reservations(reservation_code);
CREATE INDEX IF NOT EXISTS idx_shop_products_category   ON public.shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id           ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi         ON public.orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id    ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session    ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_section   ON public.content_blocks(section);
CREATE INDEX IF NOT EXISTS idx_events_date              ON public.events(date);

-- ─── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_docs    ENABLE ROW LEVEL SECURITY;

-- Policies — use DO blocks to skip if already exists
DO $$ BEGIN
  CREATE POLICY "profiles: users manage own" ON public.profiles FOR ALL USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "menu_categories: public read" ON public.menu_categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "menu_products: public read" ON public.menu_products FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "reservations: users manage own" ON public.reservations FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "reservation_items: users manage own via reservation"
    ON public.reservation_items FOR ALL USING (
      EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "shop_categories: public read" ON public.shop_categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "shop_products: public read" ON public.shop_products FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "orders: users manage own" ON public.orders FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "order_items: users manage own via order"
    ON public.order_items FOR ALL USING (
      EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "events: public read" ON public.events FOR SELECT USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "content_blocks: public read" ON public.content_blocks FOR SELECT USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "chat_sessions: users manage own" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "chat_messages: users manage own via session"
    ON public.chat_messages FOR ALL USING (
      EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "knowledge_docs: authenticated read" ON public.knowledge_docs FOR SELECT USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
