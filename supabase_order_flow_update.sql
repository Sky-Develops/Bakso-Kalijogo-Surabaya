-- Run this in Supabase SQL Editor for an existing database.
-- It upgrades the order flow so customer checkout, history, admin, and realtime
-- can share the same Supabase data.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_area TEXT,
  ADD COLUMN IF NOT EXISTS driver_name TEXT,
  ADD COLUMN IF NOT EXISTS driver_phone TEXT;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_image TEXT;

DROP POLICY IF EXISTS "orders_select_customer_status" ON orders;
CREATE POLICY "orders_select_customer_status"
  ON orders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "order_items_select_customer_status" ON order_items;
CREATE POLICY "order_items_select_customer_status"
  ON order_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "payments_insert_anyone" ON payments;
CREATE POLICY "payments_insert_anyone"
  ON payments FOR INSERT
  WITH CHECK (true);

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
