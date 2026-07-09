-- =========================================================
-- FIX: pulihkan akses admin/owner
-- =========================================================
-- Jalankan di Supabase Dashboard -> SQL Editor

-- Pastikan kolom email ada. Database lama dari schema awal belum punya kolom ini.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 1) Cek semua akun dan role saat ini.
SELECT
  users.email,
  profiles.id,
  profiles.role,
  profiles.full_name
FROM auth.users AS users
LEFT JOIN profiles ON profiles.id = users.id
ORDER BY users.created_at;

-- 2) Ganti email di bawah dengan email login admin kamu, lalu jalankan.
-- Query ini juga membuat row profiles kalau trigger signup dulu belum berjalan.
INSERT INTO profiles (id, full_name, role, email)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data->>'Tegar MI', split_part(users.email, '@', 1)),
  'OWNER',
  users.email
FROM auth.users AS users
WHERE users.email = 'tegarmi839@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'OWNER',
  email = EXCLUDED.email,
  full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);

-- 3) Jika hanya ada 1 user di database development lokal, ini boleh dipakai.
-- UPDATE profiles SET role = 'OWNER';
