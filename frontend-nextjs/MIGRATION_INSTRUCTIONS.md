# 🔧 Instruksi Migrasi Database untuk Kepala Tukang

## ⚠️ PENTING: Database belum ter-update dengan tabel `foremen` baru!

Saat ini mendapat error 500 karena:
- Prisma client sudah ter-update dengan model `Foreman` (✅ done)
- TAPI database Neon belum punya tabel `foremen` (❌ missing)
- Saat API query, Prisma mencari tabel yang tidak ada → 500 Error

---

## 🚀 Solusi: Jalankan Migrasi Database

### **Opsi 1: Via Prisma DB Push (Recommended)**

```bash
# Stop dev server dulu (Ctrl+C)

# Jalankan db push dengan accept data loss
node "./node_modules/prisma/build/index.js" db push --accept-data-loss

# Jika ada prompt, pilih "y" (yes)

# Setelah sukses, jalankan lagi dev server
npm run dev
```

### **Opsi 2: Via PostgreSQL Client (DBeaver, psql, pgAdmin)**

Copy-paste SQL ini ke database Neon:

```sql
-- Create foremen table
CREATE TABLE IF NOT EXISTS "foremen" (
    "id" BIGSERIAL PRIMARY KEY,
    "project_id" BIGINT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "foremen_project_id_fkey" FOREIGN KEY ("project_id") 
        REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index
CREATE INDEX IF NOT EXISTS "foremen_project_id_idx" ON "foremen"("project_id");

-- Remove is_foreman column from positions (if exists)
ALTER TABLE "positions" DROP COLUMN IF EXISTS "is_foreman";
```

**Langkah di DBeaver/pgAdmin:**
1. Buka **Database Console** atau **SQL Query**
2. Paste SQL di atas
3. Klik **Execute**
4. Refresh browser Next.js → Error 500 sudah hilang ✅

### **Opsi 3: Via Prisma Migration**

```bash
# Jalankan migrasi dengan nama deskriptif
node "./node_modules/prisma/build/index.js" migrate dev --name "add_foreman_table_and_remove_isforeman"

# Jika error minta reset, pilih "y" untuk reset (⚠️ hati2 production!)
```

---

## ✅ Verifikasi Sukses

Setelah migrasi, buka browser dan cek:

1. **Master Data → Kepala Tukang** → Tombol "+Tambah Kepala Tukang" bisa diklik
2. **Network tab** → Tidak ada error 500 lagi
3. **Console** → Error messages hilang

---

## 📋 Checklist Setelah Migrasi

- [ ] Buka DBeaver/pgAdmin dan lihat tabel `foremen` sudah ada
- [ ] Jalankan `npm run dev`
- [ ] Buka localhost:3000 → Master Data → Kepala Tukang
- [ ] Klik "+ Tambah Kepala Tukang" → Tidak error
- [ ] Pilih proyek → Form muncul ✅
- [ ] Isi nama & no. telp → Klik Simpan ✅
- [ ] Lihat data di tabel ✅

---

## 🆘 Jika Tetap Error

**Error: "Database schema not synced"**
- Solusi: Delete `.prisma/client` folder dan jalankan `npm run dev` ulang

**Error: "Already exists in the database"**
- Solusi: Table sudah ada, skip step ini

**Error: "Foreign key violation"**
- Solusi: Pastikan `projects` table sudah ada dan tidak kosong

---

## 📝 Database Connection Info

```
Host: ep-crimson-sunset-azxwdhrp.c-3.ap-southeast-1.aws.neon.tech
Port: 5432
Database: neondb
User: neondb_owner
URL: postgresql://neondb_owner:npg_q4Y5exWfQTFU@...
```

(Di file `.env`)

---

**Kapan selesai → Server akan berjalan tanpa error 500! 🎉**
