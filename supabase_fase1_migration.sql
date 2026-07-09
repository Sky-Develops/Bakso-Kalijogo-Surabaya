-- =========================================================
-- 1A. FIX: pastikan semua kolom menu_items lengkap (termasuk sort_order)
-- Aman dijalankan berkali-kali.
-- =========================================================
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 20 CHECK (stock_quantity >= 0),
  ADD COLUMN IF NOT EXISTS spice_level TEXT,
  ADD COLUMN IF NOT EXISTS toppings TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS serving_time TEXT,
  ADD COLUMN IF NOT EXISTS recommendations TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

ALTER TABLE menu_categories
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- =========================================================
-- 1B. Fitur Booking Resto (untuk poin 5 — booking online pelanggan)
-- =========================================================
CREATE TABLE IF NOT EXISTS table_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  party_size INT NOT NULL CHECK (party_size > 0),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  table_id UUID REFERENCES dining_tables(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED')),
  notes TEXT,
  estimated_total NUMERIC(12, 0) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES table_bookings(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price NUMERIC(12, 0) NOT NULL,
  subtotal NUMERIC(12, 0) GENERATED ALWAYS AS (quantity * price) STORED
);

CREATE INDEX IF NOT EXISTS idx_table_bookings_date ON table_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_table_bookings_table_id ON table_bookings(table_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON booking_items(booking_id);

ALTER TABLE table_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "table_bookings_insert_anyone" ON table_bookings;
CREATE POLICY "table_bookings_insert_anyone" ON table_bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "table_bookings_select_all" ON table_bookings;
CREATE POLICY "table_bookings_select_all" ON table_bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "table_bookings_update_admin" ON table_bookings;
CREATE POLICY "table_bookings_update_admin" ON table_bookings FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "booking_items_insert_anyone" ON booking_items;
CREATE POLICY "booking_items_insert_anyone" ON booking_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "booking_items_select_all" ON booking_items;
CREATE POLICY "booking_items_select_all" ON booking_items FOR SELECT USING (true);

DROP TRIGGER IF EXISTS trg_table_bookings_updated_at ON table_bookings;
CREATE TRIGGER trg_table_bookings_updated_at
  BEFORE UPDATE ON table_bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE table_bookings;
EXCEPTION WHEN duplicate_object OR undefined_object THEN NULL;
END $$;

-- =========================================================
-- 1C. Storage bucket untuk upload gambar menu (poin 2 — CRUD menu dengan gambar)
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "menu_images_public_read" ON storage.objects;
CREATE POLICY "menu_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "menu_images_admin_write" ON storage.objects;
CREATE POLICY "menu_images_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "menu_images_admin_update" ON storage.objects;
CREATE POLICY "menu_images_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "menu_images_admin_delete" ON storage.objects;
CREATE POLICY "menu_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
