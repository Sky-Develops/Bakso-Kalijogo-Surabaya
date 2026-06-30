-- Run this in Supabase SQL Editor for an existing database.
-- It upgrades menu_items so customer/admin menu uses real photos, stock,
-- richer product details, and accurate menu_item_id references.

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 20 CHECK (stock_quantity >= 0),
  ADD COLUMN IF NOT EXISTS spice_level TEXT,
  ADD COLUMN IF NOT EXISTS toppings TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS serving_time TEXT,
  ADD COLUMN IF NOT EXISTS recommendations TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

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

DROP TRIGGER IF EXISTS trg_decrement_menu_stock ON order_items;
CREATE TRIGGER trg_decrement_menu_stock
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION decrement_menu_stock();
