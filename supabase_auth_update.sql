-- ================================================
-- AUTH / ADMIN PROFILE UPDATE
-- Jalankan di Supabase SQL Editor
-- ================================================

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
CHECK (username IS NULL OR username ~ '^[A-Z0-9@\.]+$');

-- Pastikan RLS dan policy profil sendiri tersedia
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

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
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_profile_on_signup ON auth.users;

CREATE TRIGGER trg_create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Buat row profiles untuk user lama yang belum punya profile
INSERT INTO profiles (id, full_name, role, email)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data->>'full_name', split_part(users.email, '@', 1)),
  'KASIR',
  users.email
FROM auth.users AS users
LEFT JOIN profiles ON profiles.id = users.id
WHERE profiles.id IS NULL;
