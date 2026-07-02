-- Tambahkan kolom email dan username di tabel profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Tambahkan constraint username: uppercase, numbers, @, .
-- Validasi huruf kapital, angka, tanpa spasi, dan karakter unik (@ atau .)
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS username_format_check;

ALTER TABLE profiles
ADD CONSTRAINT username_format_check
CHECK (username ~ '^[A-Z0-9@\.]+$');

-- Update fungsi handle_new_user untuk menyimpan email secara otomatis
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'KASIR',
    NEW.email
  );
  RETURN NEW;
END;
$$;
