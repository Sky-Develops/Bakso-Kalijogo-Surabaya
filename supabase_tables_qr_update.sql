-- Run this in Supabase SQL Editor for an existing database.
-- It enables realtime updates for dining tables and QR sessions.

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

UPDATE dining_tables
SET qr_code_url = NULL
WHERE qr_code_url = '';
