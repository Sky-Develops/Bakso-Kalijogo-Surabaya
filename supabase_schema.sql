-- ================================================
-- BAKSO KALIJOGO SURABAYA - SUPABASE SQL SCHEMA
-- Complete Production-Ready Database Setup
-- ================================================

-- ----------------------------------------
-- 1. ENUM TYPES
-- ----------------------------------------
CREATE TYPE order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'DELIVERING',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE order_type AS ENUM (
  'DINE_IN',
  'TAKEAWAY',
  'ONLINE'
);

CREATE TYPE payment_method AS ENUM (
  'CASH',
  'QRIS',
  'TRANSFER_BANK'
);

CREATE TYPE payment_status AS ENUM (
  'UNPAID',
  'PAID',
  'REFUNDED'
);

CREATE TYPE table_status AS ENUM (
  'AVAILABLE',
  'OCCUPIED',
  'RESERVED',
  'CLEANING'
);

CREATE TYPE user_role AS ENUM (
  'OWNER',
  'ADMIN',
  'KASIR',
  'DAPUR'
);

-- ----------------------------------------
-- 2. PROFILES (extends Supabase auth.users)
-- ----------------------------------------
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  role       user_role NOT NULL DEFAULT 'KASIR',
  phone      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------
-- 3. MENU CATEGORIES
-- ----------------------------------------
CREATE TABLE menu_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  icon       TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------
-- 4. MENU ITEMS
-- ----------------------------------------
CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(12, 0) NOT NULL CHECK (price >= 0),
  image_url     TEXT,
  image_alt     TEXT,
  is_available  BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INT NOT NULL DEFAULT 20 CHECK (stock_quantity >= 0),
  badge         TEXT CHECK (badge IN ('Terlaris', 'Baru', NULL)),
  rating        NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  sold_count    INT NOT NULL DEFAULT 0,
  spice_level   TEXT,
  toppings      TEXT[] NOT NULL DEFAULT '{}',
  serving_time  TEXT,
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------
-- 5. TABLES (Dining Tables)
-- ----------------------------------------
CREATE TABLE dining_tables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number      INT NOT NULL UNIQUE CHECK (number > 0),
  capacity    INT NOT NULL DEFAULT 4 CHECK (capacity > 0),
  status      table_status NOT NULL DEFAULT 'AVAILABLE',
  qr_code_url TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------
-- 6. ORDERS
-- ----------------------------------------
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT NOT NULL UNIQUE,
  status          order_status NOT NULL DEFAULT 'PENDING',
  order_type      order_type NOT NULL,
  payment_method  payment_method,
  payment_status  payment_status NOT NULL DEFAULT 'UNPAID',
  subtotal        NUMERIC(12, 0) NOT NULL DEFAULT 0,
  shipping_fee    NUMERIC(12, 0) NOT NULL DEFAULT 0,
  service_fee     NUMERIC(12, 0) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(12, 0) NOT NULL DEFAULT 0,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  delivery_address TEXT,
  delivery_area    TEXT,
  driver_name      TEXT,
  driver_phone     TEXT,
  table_number    TEXT,
  notes           TEXT,
  -- Relations
  table_id        UUID REFERENCES dining_tables(id) ON DELETE SET NULL,
  cashier_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------
-- 7. ORDER ITEMS
-- ----------------------------------------
CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity     INT NOT NULL CHECK (quantity > 0),
  price        NUMERIC(12, 0) NOT NULL,
  subtotal     NUMERIC(12, 0) GENERATED ALWAYS AS (quantity * price) STORED,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------
-- 8. QR SESSIONS
-- ----------------------------------------
CREATE TABLE qr_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id     UUID NOT NULL REFERENCES dining_tables(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  token        TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '12 hours'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------
-- 9. PAYMENTS
-- ----------------------------------------
CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method         payment_method NOT NULL,
  amount         NUMERIC(12, 0) NOT NULL,
  status         payment_status NOT NULL DEFAULT 'UNPAID',
  reference_code TEXT,
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------
-- 10. INDEXES
-- ----------------------------------------
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_qr_sessions_table_id ON qr_sessions(table_id);
CREATE INDEX idx_qr_sessions_token ON qr_sessions(token);
CREATE INDEX idx_payments_order_id ON payments(order_id);

-- Realtime publication for live admin/customer order updates
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION
  WHEN duplicate_object OR undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
EXCEPTION
  WHEN duplicate_object OR undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE payments;
EXCEPTION
  WHEN duplicate_object OR undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE dining_tables;
EXCEPTION
  WHEN duplicate_object OR undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE qr_sessions;
EXCEPTION
  WHEN duplicate_object OR undefined_object THEN NULL;
END $$;

-- ----------------------------------------
-- 11. UPDATED_AT TRIGGERS
-- ----------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at       BEFORE UPDATE ON profiles       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_menu_items_updated_at      BEFORE UPDATE ON menu_items      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_dining_tables_updated_at   BEFORE UPDATE ON dining_tables   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at          BEFORE UPDATE ON orders          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated_at        BEFORE UPDATE ON payments        FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------
-- 12. AUTO-UPDATE TABLE STATUS ON ORDER
-- ----------------------------------------
CREATE OR REPLACE FUNCTION update_table_status_on_order()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.order_type = 'DINE_IN' AND NEW.table_id IS NOT NULL THEN
    IF NEW.status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING') THEN
      UPDATE dining_tables SET status = 'OCCUPIED' WHERE id = NEW.table_id;
    ELSIF NEW.status IN ('DELIVERED', 'CANCELLED') THEN
      UPDATE dining_tables SET status = 'AVAILABLE' WHERE id = NEW.table_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_table_status
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION update_table_status_on_order();

-- ----------------------------------------
-- 13. AUTO-INCREMENT SOLD COUNT
-- ----------------------------------------
CREATE OR REPLACE FUNCTION increment_sold_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.menu_item_id IS NOT NULL THEN
    UPDATE menu_items 
    SET sold_count = sold_count + NEW.quantity 
    WHERE id = NEW.menu_item_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_sold_count
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION increment_sold_count();

CREATE OR REPLACE FUNCTION decrement_menu_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.menu_item_id IS NOT NULL THEN
    UPDATE menu_items
    SET
      stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
      is_available = CASE
        WHEN GREATEST(stock_quantity - NEW.quantity, 0) <= 0 THEN false
        ELSE is_available
      END
    WHERE id = NEW.menu_item_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_decrement_menu_stock
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION decrement_menu_stock();

-- ----------------------------------------
-- 14. PROFILE AUTO-CREATE ON SIGNUP
-- ----------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'KASIR'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ----------------------------------------
-- 15. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_tables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments        ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view/edit their own profile; admins can see all
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Menu Categories: Public read, authenticated write
CREATE POLICY "menu_categories_select_all"    ON menu_categories FOR SELECT USING (true);
CREATE POLICY "menu_categories_insert_admin"  ON menu_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "menu_categories_update_admin"  ON menu_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "menu_categories_delete_admin"  ON menu_categories FOR DELETE USING (auth.role() = 'authenticated');

-- Menu Items: Public read, authenticated write
CREATE POLICY "menu_items_select_all"    ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_insert_admin"  ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "menu_items_update_admin"  ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "menu_items_delete_admin"  ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- Dining Tables: Public read (needed for QR), authenticated write
CREATE POLICY "dining_tables_select_all"    ON dining_tables FOR SELECT USING (true);
CREATE POLICY "dining_tables_insert_admin"  ON dining_tables FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "dining_tables_update_admin"  ON dining_tables FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "dining_tables_delete_admin"  ON dining_tables FOR DELETE USING (auth.role() = 'authenticated');

-- Orders: Anyone can insert (for customer ordering), authenticated can manage
CREATE POLICY "orders_insert_anyone"       ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_select_authenticated" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "orders_select_customer_status" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update_authenticated" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Order Items: Anyone insert (part of order creation), public read for customer order status
CREATE POLICY "order_items_insert_anyone"       ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_select_authenticated" ON order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "order_items_select_customer_status" ON order_items FOR SELECT USING (true);

-- QR Sessions: Public read (customers scan QR), authenticated write
CREATE POLICY "qr_sessions_select_all"    ON qr_sessions FOR SELECT USING (true);
CREATE POLICY "qr_sessions_insert_admin"  ON qr_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "qr_sessions_update_admin"  ON qr_sessions FOR UPDATE USING (auth.role() = 'authenticated');

-- Payments: Customers can create payment records; admins manage verification
CREATE POLICY "payments_select_authenticated" ON payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "payments_insert_anyone" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "payments_insert_authenticated" ON payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "payments_update_authenticated" ON payments FOR UPDATE USING (auth.role() = 'authenticated');

-- ----------------------------------------
-- 16. SEED DATA - CATEGORIES
-- ----------------------------------------
INSERT INTO menu_categories (name, icon, sort_order) VALUES
  ('Bakso',    '🍜', 1),
  ('Mie Ayam', '🍝', 2),
  ('Minuman',  '🧋', 3),
  ('Tambahan', '🍡', 4);

-- ----------------------------------------
-- 17. SEED DATA - MENU ITEMS
-- ----------------------------------------
WITH cats AS (
  SELECT id, name FROM menu_categories
)
INSERT INTO menu_items (category_id, name, description, price, image_url, badge, rating, sold_count)
SELECT
  c.id,
  m.name,
  m.description,
  m.price,
  m.emoji,
  m.badge,
  m.rating,
  m.sold_count
FROM (VALUES
  ('Bakso',    'Bakso Spesial',    'Bakso daging sapi segar pilihan, kenyal sempurna dengan kuah kaldu sapi yang gurih.',           18000, '🍜', 'Terlaris', 4.9, 250),
  ('Bakso',    'Bakso Urat',       'Bakso dengan isian urat sapi pilihan, bertekstur kenyal dan gurih.',                             15000, '🥣', NULL,        4.7, 120),
  ('Bakso',    'Bakso Halus',      'Bakso dengan tekstur halus lembut, cocok untuk semua usia.',                                     14000, '🍲', NULL,        4.6, 98),
  ('Bakso',    'Bakso Jumbo',      'Bakso berukuran jumbo dengan isian daging cincang pilihan yang melimpah.',                       22000, '🎁', 'Baru',      4.8, 45),
  ('Bakso',    'Bakso Bakar',      'Bakso panggang dengan bumbu kecap manis pedas yang menggugah selera.',                          20000, '🔥', NULL,        4.7, 88),
  ('Bakso',    'Bakso Kuah Sapi',  'Kuah kaldu sapi asli yang kaya rasa dengan irisan daging sapi lembut.',                        16000, '🥘', NULL,        4.8, 110),
  ('Mie Ayam', 'Mie Ayam Biasa',   'Mie ayam klasik dengan topping ayam cincang bumbu kecap yang lezat.',                           14000, '🍜', NULL,        4.5, 75),
  ('Mie Ayam', 'Mie Ayam Spesial', 'Mie ayam premium dengan double topping ayam dan pangsit goreng renyah.',                        18000, '🌶️', 'Terlaris', 4.9, 195),
  ('Minuman',  'Es Teh Manis',     'Teh manis segar dengan es batu pilihan.',                                                        5000, '🧋', NULL,        4.6, 300),
  ('Minuman',  'Es Jeruk',         'Jeruk peras segar dengan es batu dan gula asli.',                                                7000, '🍊', NULL,        4.7, 180),
  ('Minuman',  'Air Mineral',      'Air mineral kemasan 600ml.',                                                                     4000, '💧', NULL,        4.5, 400),
  ('Tambahan', 'Tahu Goreng',      'Tahu goreng renyah dengan cocolan sambal kacang.',                                               3000, '🟨', NULL,        4.5, 220),
  ('Tambahan', 'Pangsit Goreng',   'Pangsit isi daging ayam, digoreng renyah keemasan.',                                            5000, '🥟', NULL,        4.8, 165)
) AS m(cat_name, name, description, price, emoji, badge, rating, sold_count)
JOIN cats c ON c.name = m.cat_name;

UPDATE menu_categories
SET icon = CASE name
  WHEN 'Bakso' THEN 'Bowl'
  WHEN 'Mie Ayam' THEN 'Noodle'
  WHEN 'Minuman' THEN 'Drink'
  WHEN 'Tambahan' THEN 'Side'
  ELSE COALESCE(icon, 'Menu')
END;

WITH menu_seed AS (
  SELECT *
  FROM (VALUES
    ('Bakso Spesial', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80', 'Bakso spesial dengan kuah sapi', 40, 'Sedang', ARRAY['Bakso halus','Bakso urat','Tahu','Mie kuning'], '10-15 menit', ARRAY['Es Teh Manis','Pangsit Goreng'], 1),
    ('Bakso Urat', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80', 'Bakso urat sapi', 30, 'Sedang', ARRAY['Bakso urat','Tahu','Bihun'], '10-15 menit', ARRAY['Es Jeruk','Tahu Goreng'], 2),
    ('Bakso Halus', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80', 'Bakso halus kuah kaldu', 35, 'Tidak pedas', ARRAY['Bakso halus','Mie','Seledri'], '8-12 menit', ARRAY['Air Mineral','Pangsit Goreng'], 3),
    ('Bakso Jumbo', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=80', 'Bakso jumbo isi daging', 18, 'Sedang', ARRAY['Bakso jumbo','Tahu','Mie kuning'], '12-18 menit', ARRAY['Es Teh Manis'], 4),
    ('Bakso Bakar', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=900&q=80', 'Bakso bakar bumbu kecap', 22, 'Pedas sedang', ARRAY['Bakso bakar','Sambal kecap','Bawang goreng'], '12-16 menit', ARRAY['Es Jeruk'], 5),
    ('Bakso Kuah Sapi', 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=80', 'Bakso kuah sapi hangat', 28, 'Sedang', ARRAY['Bakso sapi','Irisan daging','Bihun'], '10-15 menit', ARRAY['Tahu Goreng'], 6),
    ('Mie Ayam Biasa', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80', 'Mie ayam klasik', 26, 'Tidak pedas', ARRAY['Mie','Ayam kecap','Sawi'], '8-12 menit', ARRAY['Bakso Halus','Es Teh Manis'], 7),
    ('Mie Ayam Spesial', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', 'Mie ayam spesial bakso pangsit', 32, 'Sedang', ARRAY['Mie','Double ayam','Bakso','Pangsit'], '10-15 menit', ARRAY['Es Teh Manis'], 8),
    ('Es Teh Manis', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80', 'Es teh manis segar', 80, 'Tidak pedas', ARRAY['Teh','Es batu'], '2-4 menit', ARRAY['Bakso Spesial'], 9),
    ('Es Jeruk', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80', 'Es jeruk peras', 60, 'Tidak pedas', ARRAY['Jeruk peras','Es batu'], '3-5 menit', ARRAY['Bakso Bakar'], 10),
    ('Air Mineral', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80', 'Air mineral botol', 120, 'Tidak pedas', ARRAY['Botol 600ml'], '1 menit', ARRAY['Mie Ayam Biasa'], 11),
    ('Tahu Goreng', 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=80', 'Tahu goreng renyah', 70, 'Sedang', ARRAY['Tahu','Sambal kacang'], '5-8 menit', ARRAY['Bakso Urat'], 12),
    ('Pangsit Goreng', 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=900&q=80', 'Pangsit goreng renyah', 65, 'Tidak pedas', ARRAY['Pangsit','Isi ayam'], '5-8 menit', ARRAY['Mie Ayam Spesial'], 13)
  ) AS seed(name, image_url, image_alt, stock_quantity, spice_level, toppings, serving_time, recommendations, sort_order)
)
UPDATE menu_items mi
SET
  image_url = seed.image_url,
  image_alt = seed.image_alt,
  stock_quantity = seed.stock_quantity,
  spice_level = seed.spice_level,
  toppings = seed.toppings,
  serving_time = seed.serving_time,
  recommendations = seed.recommendations,
  sort_order = seed.sort_order,
  is_available = seed.stock_quantity > 0
FROM menu_seed seed
WHERE mi.name = seed.name;

-- ----------------------------------------
-- 18. SEED DATA - DINING TABLES
-- ----------------------------------------
INSERT INTO dining_tables (number, capacity, status) VALUES
  (1,  4, 'AVAILABLE'),
  (2,  4, 'AVAILABLE'),
  (3,  4, 'AVAILABLE'),
  (4,  6, 'AVAILABLE'),
  (5,  6, 'AVAILABLE'),
  (6,  4, 'AVAILABLE'),
  (7,  4, 'AVAILABLE'),
  (8,  2, 'AVAILABLE'),
  (9,  2, 'AVAILABLE'),
  (10, 8, 'AVAILABLE');

-- ----------------------------------------
-- SETUP COMPLETE!
-- 
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Go to Authentication > Users > Add User to create your admin
-- 3. Update the role to 'OWNER' or 'ADMIN' in the profiles table
-- 4. Set your DATABASE_URL in .env for Prisma
-- ----------------------------------------
