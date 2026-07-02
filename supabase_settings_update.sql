-- ================================================
-- BAKSO KALIJOGO SURABAYA - SETTINGS SCHEMA UPDATE
-- ================================================

-- Create settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Only allow one row
  restaurant_name TEXT NOT NULL DEFAULT 'Bakso Kalijogo Surabaya',
  whatsapp_number TEXT NOT NULL DEFAULT '0812-3456-7890',
  address TEXT NOT NULL DEFAULT 'Jl. Kalijogo No.12, Surabaya',
  service_fee NUMERIC(12, 0) NOT NULL DEFAULT 1000,
  delivery_fee_default NUMERIC(12, 0) NOT NULL DEFAULT 8000,
  print_template JSONB NOT NULL DEFAULT '{"header": "BAKSO KALIJOGO\nJl. Kalijogo No.12\n0812-3456-7890", "footer": "Terima Kasih\nSelamat Menikmati", "paperSize": "58mm"}',
  website_config JSONB NOT NULL DEFAULT '{"logoUrl": "", "bannerUrl": "", "isOpen": true, "announcement": "", "about": "Bakso Kalijogo berdiri sejak 1995 di Surabaya. Kami memakai daging sapi pilihan dan kuah kaldu yang dimasak perlahan untuk rasa yang konsisten.", "locationUrl": ""}',
  payment_config JSONB NOT NULL DEFAULT '{"cashEnabled": true, "transferEnabled": true, "qrisEnabled": true, "bankName": "BCA", "bankAccountNumber": "", "bankAccountHolder": "Bakso Kalijogo", "qrisImageUrl": ""}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS payment_config JSONB NOT NULL DEFAULT '{"cashEnabled": true, "transferEnabled": true, "qrisEnabled": true, "bankName": "BCA", "bankAccountNumber": "", "bankAccountHolder": "Bakso Kalijogo", "qrisImageUrl": ""}';

UPDATE store_settings
SET website_config = '{"logoUrl": "", "bannerUrl": "", "isOpen": true, "announcement": "", "about": "Bakso Kalijogo berdiri sejak 1995 di Surabaya. Kami memakai daging sapi pilihan dan kuah kaldu yang dimasak perlahan untuk rasa yang konsisten.", "locationUrl": ""}'::jsonb || website_config
WHERE id = 1;

-- Insert the default row if it doesn't exist
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (for customer app)
CREATE POLICY "store_settings_select_all" ON store_settings FOR SELECT USING (true);

-- Only authenticated admins can update
CREATE POLICY "store_settings_update_admin" ON store_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "store_settings_insert_admin" ON store_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Updated At Trigger
CREATE TRIGGER trg_store_settings_updated_at 
  BEFORE UPDATE ON store_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION set_updated_at();

-- Add real-time publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE store_settings;
EXCEPTION
  WHEN duplicate_object OR undefined_object THEN NULL;
END $$;
