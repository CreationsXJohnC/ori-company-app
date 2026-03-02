-- ═══════════════════════════════════════════════════════════════════════════
-- ORI APP — Initial Database Schema
-- Run in Supabase Dashboard → SQL Editor, OR via Supabase CLI:
--   supabase db push
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;   -- pgvector for AI RAG

-- ─── User Profiles ────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields
CREATE TABLE public.profiles (
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

-- Auto-create profile when user signs up
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Menu Categories ──────────────────────────────────────────────────────────
CREATE TABLE public.menu_categories (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  icon        TEXT,
  sort_order  INTEGER     DEFAULT 0,
  active      BOOLEAN     DEFAULT true
);

-- ─── Menu Products (Cannabis) ─────────────────────────────────────────────────
CREATE TABLE public.menu_products (
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

CREATE TRIGGER menu_products_updated_at BEFORE UPDATE ON public.menu_products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Reservations ─────────────────────────────────────────────────────────────
CREATE TABLE public.reservations (
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

CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.reservation_items (
  id               UUID           DEFAULT uuid_generate_v4() PRIMARY KEY,
  reservation_id   UUID           REFERENCES public.reservations(id) ON DELETE CASCADE,
  product_id       UUID           REFERENCES public.menu_products(id),
  product_name     TEXT           NOT NULL,
  product_unit     TEXT           NOT NULL,
  quantity         INTEGER        NOT NULL DEFAULT 1,
  unit_price       DECIMAL(10,2)  NOT NULL,
  created_at       TIMESTAMPTZ    DEFAULT NOW()
);

-- ─── Shop Categories ──────────────────────────────────────────────────────────
CREATE TABLE public.shop_categories (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  sort_order  INTEGER     DEFAULT 0,
  active      BOOLEAN     DEFAULT true
);

-- ─── Shop Products (Non-Cannabis Merch) ──────────────────────────────────────
CREATE TABLE public.shop_products (
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

CREATE TRIGGER shop_products_updated_at BEFORE UPDATE ON public.shop_products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE public.orders (
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

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.order_items (
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

-- ─── Events ───────────────────────────────────────────────────────────────────
CREATE TABLE public.events (
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

-- ─── Content Blocks (CMS for About page) ─────────────────────────────────────
CREATE TABLE public.content_blocks (
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

CREATE TRIGGER content_blocks_updated_at BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Chat Sessions & Messages ─────────────────────────────────────────────────
CREATE TABLE public.chat_sessions (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id  UUID        REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('user','assistant','system')),
  content     TEXT        NOT NULL,
  token_count INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Knowledge Docs (RAG for Ori AI) ─────────────────────────────────────────
CREATE TABLE public.knowledge_docs (
  id         UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  title      TEXT         NOT NULL,
  content    TEXT         NOT NULL,
  category   TEXT,
  tags       TEXT[],
  embedding  vector(1536),   -- OpenAI text-embedding-ada-002
  active     BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_knowledge_docs_embedding
  ON public.knowledge_docs
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RAG similarity search function
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
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    title,
    content,
    category,
    1 - (knowledge_docs.embedding <=> query_embedding) AS similarity
  FROM knowledge_docs
  WHERE active = true
    AND 1 - (knowledge_docs.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_docs.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_menu_products_category   ON public.menu_products(category_id);
CREATE INDEX idx_menu_products_available  ON public.menu_products(available);
CREATE INDEX idx_menu_products_featured   ON public.menu_products(featured);
CREATE INDEX idx_reservations_user_id     ON public.reservations(user_id);
CREATE INDEX idx_reservations_status      ON public.reservations(status);
CREATE INDEX idx_reservations_code        ON public.reservations(reservation_code);
CREATE INDEX idx_reservation_items_res_id ON public.reservation_items(reservation_id);
CREATE INDEX idx_shop_products_category   ON public.shop_products(category_id);
CREATE INDEX idx_shop_products_available  ON public.shop_products(available);
CREATE INDEX idx_orders_user_id           ON public.orders(user_id);
CREATE INDEX idx_orders_status            ON public.orders(status);
CREATE INDEX idx_orders_stripe_pi         ON public.orders(stripe_payment_intent_id);
CREATE INDEX idx_order_items_order_id     ON public.order_items(order_id);
CREATE INDEX idx_chat_sessions_user_id    ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session    ON public.chat_messages(session_id);
CREATE INDEX idx_content_blocks_section   ON public.content_blocks(section);
CREATE INDEX idx_events_date              ON public.events(date);

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_docs   ENABLE ROW LEVEL SECURITY;

-- ── Profiles policies ─────────────────────────────────────────────────────────
CREATE POLICY "profiles: users manage own"
  ON public.profiles FOR ALL USING (auth.uid() = id);

-- ── Menu policies (public read) ───────────────────────────────────────────────
CREATE POLICY "menu_categories: public read"
  ON public.menu_categories FOR SELECT USING (true);

CREATE POLICY "menu_products: public read"
  ON public.menu_products FOR SELECT USING (true);

-- ── Reservation policies ──────────────────────────────────────────────────────
CREATE POLICY "reservations: users manage own"
  ON public.reservations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "reservation_items: users manage own via reservation"
  ON public.reservation_items FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = reservation_id AND r.user_id = auth.uid()
    )
  );

-- ── Shop policies (public read) ───────────────────────────────────────────────
CREATE POLICY "shop_categories: public read"
  ON public.shop_categories FOR SELECT USING (true);

CREATE POLICY "shop_products: public read"
  ON public.shop_products FOR SELECT USING (true);

-- ── Order policies ────────────────────────────────────────────────────────────
CREATE POLICY "orders: users manage own"
  ON public.orders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "order_items: users manage own via order"
  ON public.order_items FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- ── Events + Content (public read) ───────────────────────────────────────────
CREATE POLICY "events: public read"
  ON public.events FOR SELECT USING (active = true);

CREATE POLICY "content_blocks: public read"
  ON public.content_blocks FOR SELECT USING (active = true);

-- ── Chat policies ─────────────────────────────────────────────────────────────
CREATE POLICY "chat_sessions: users manage own"
  ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "chat_messages: users manage own via session"
  ON public.chat_messages FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- ── Knowledge docs (authenticated read for edge functions) ────────────────────
CREATE POLICY "knowledge_docs: authenticated read"
  ON public.knowledge_docs FOR SELECT USING (active = true);

-- ── Service role bypass (for edge functions) ──────────────────────────────────
-- Edge functions use the service role key which bypasses RLS automatically.
-- No additional policies needed for edge function access.
