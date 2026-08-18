# 🚀 Setup Foreman System - Quick Start

## ⚠️ Current Status
✅ Code: Ready (ForemanClient.tsx, API endpoints, etc.)  
❌ Database: Table `foremen` belum dibuat  
⚠️ Error 500: Terjadi saat API query tabel yang belum ada

Dev server berjalan di: **http://localhost:3001**

---

## 🔧 Solusi: Migrate Database

**Pilih SATU dari opsi di bawah:**

---

### **Option A: Easiest - Gunakan Script PowerShell**

**Di terminal / PowerShell:**
```powershell
cd C:\Users\athoi\USER\aplikasi-absen-tukang\frontend-nextjs
.\migrate.ps1
```

Script ini akan:
1. ✅ Run `prisma db push --accept-data-loss`
2. ✅ Generate Prisma client
3. ✅ Memberitahu kalau selesai

---

### **Option B: Manual Command**

**Di terminal:**
```bash
cd C:\Users\athoi\USER\aplikasi-absen-tukang\frontend-nextjs
node "./node_modules/prisma/build/index.js" db push --accept-data-loss
```

Jika ada prompt `Do you want to continue?` → Ketik `y` dan Enter

---

### **Option C: GUI - Via DBeaver atau pgAdmin**

1. **Buka DBeaver** atau **pgAdmin** 
2. **Connect ke Database:**
   - Host: `ep-crimson-sunset-azxwdhrp.c-3.ap-southeast-1.aws.neon.tech`
   - Database: `neondb`
   - Username: `neondb_owner`
   - Password: (Lihat di `.env`)

3. **Buka SQL Query Editor** dan paste:

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

4. **Execute** → Done!

---

## ✅ Verifikasi Sukses

Setelah migration, buka browser:

```
http://localhost:3001/dashboard/master-data
```

Cek tab **"Kepala Tukang"**:
- ✅ Halaman muncul tanpa error 500
- ✅ Tombol "+ Tambah Kepala Tukang" bisa diklik
- ✅ Dropdown proyek muncul

---

## 🎯 Langkah Selanjutnya (Setelah Migration)

### **1. Tambah Kepala Tukang**
```
Master Data → Kepala Tukang → "+ Tambah Kepala Tukang"
├─ Proyek: [Pilih proyek]
├─ Nama: [Nama kepala tukang]
└─ No. Telepon: [08...]
```

### **2. Input Pekerja**
```
Data Pekerja → Pilih Proyek → "+ Tambah Pekerja"
├─ Nama: [Nama pekerja]
├─ Jabatan: [Pilih dari master data]
└─ No. Telepon: [08...]
```

Note: Kepala tukang tidak muncul di daftar pekerja (karena di-manage terpisah)

### **3. Input Absensi**
```
Input Absensi → Pilih Proyek → Absen pekerja
```

Note: Kepala tukang tidak muncul di sini (bukan pekerja lapangan)

### **4. Download Rekap Excel**
```
Input Absensi / Rekap Absensi → Download Excel
```

Signature di pojok kanan bawah otomatis pakai nama kepala tukang ✅

---

## 📋 Checklist Completion

- [ ] Jalankan migration (Option A/B/C)
- [ ] Reload browser: http://localhost:3001
- [ ] Master Data → Kepala Tukang tab muncul
- [ ] Tombol "+ Tambah Kepala Tukang" bisa diklik
- [ ] Tidak ada error 500 di network
- [ ] Tambah satu kepala tukang sebagai test
- [ ] Lihat di tabel → Berhasil? ✅

---

## 🆘 Troubleshooting

### Error: "ENOENT: no such file or directory"
- **Solusi:** Delete `.next` folder dan refresh browser
- `Remove-Item -Recurse -Force ".next"`

### Error: "Database connection failed"
- **Solusi:** Cek DATABASE_URL di `.env`
- Pastikan Neon database aktif

### Error: "Unknown column"
- **Solusi:** Jalankan migration ulang dengan Option A/B

### Still getting 500?
- **Solusi:** Cek console server (terminal)
- Cari error message spesifik
- Tanyakan dengan error message

---

## 📞 File Referensi

- `MIGRATION_INSTRUCTIONS.md` - Penjelasan detail migrasi
- `migrate.ps1` - Script otomatis
- `prisma/migrations/manual_foreman_migration.sql` - SQL raw
- `src/app/(dashboard)/master-data/ForemanClient.tsx` - Component baru
- `src/app/api/foremen/route.ts` - API baru

---

**Selesai migration? System siap dipakai! 🎉**
