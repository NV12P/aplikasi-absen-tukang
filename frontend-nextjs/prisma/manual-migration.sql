-- =============================================================================
-- MANUAL MIGRATION — Jalankan di Neon SQL Editor
-- https://console.neon.tech → pilih project → SQL Editor
--
-- Tujuan: Tambahkan HANYA tabel admin_users (untuk NextAuth JWT)
-- Tidak ada perubahan pada tabel Laravel yang sudah ada.
-- =============================================================================

-- Buat tabel admin_users untuk autentikasi NextAuth
CREATE TABLE IF NOT EXISTS admin_users (
    id          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    name        TEXT        NOT NULL,
    email       TEXT        NOT NULL,
    password    TEXT        NOT NULL,  -- bcrypt hash
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT admin_users_pkey       PRIMARY KEY (id),
    CONSTRAINT admin_users_email_key  UNIQUE (email)
);

-- =============================================================================
-- SEED: Buat admin user pertama
-- Password di bawah adalah bcrypt hash dari: "Admin@1234"
-- Ganti email dan password sesuai kebutuhan sebelum menjalankan.
--
-- Untuk generate hash baru, jalankan di terminal:
--   node -e "const b=require('bcryptjs');b.hash('PASSWORD_BARU',12).then(console.log)"
-- =============================================================================

INSERT INTO admin_users (name, email, password)
VALUES (
    'Administrator',
    'admin@absensitukang.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    -- Hash di atas adalah dari kata sandi: "password"
    -- WAJIB DIGANTI sebelum production!
)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- VERIFIKASI: Cek apakah tabel berhasil dibuat
-- =============================================================================
SELECT id, name, email, created_at FROM admin_users;
