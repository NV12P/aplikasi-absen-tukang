# Migration Instructions - Cross-Project Attendance Validation

## Perubahan Database
Sistem sekarang mendukung validasi absensi antar proyek. Pekerja tidak bisa hadir di 2 proyek sekaligus pada hari yang sama.

## Langkah Migration

### 1. Deploy Migration Prisma
```bash
cd frontend-nextjs
npx prisma migrate deploy
```

### 2. Generate Prisma Client Baru
```bash
npx prisma generate
```

### 3. Restart Development Server
```bash
npm run dev
```

## Perubahan Schema
- Tabel `attendances` sekarang memiliki kolom `project_id`
- Unique constraint berubah dari `(worker_id, date)` menjadi `(worker_id, project_id, date)`
- Pekerja bisa diabsen di proyek berbeda pada hari yang sama, TAPI hanya bisa status "hadir" di 1 proyek

## Fitur Baru
✅ Validasi: pekerja tidak bisa hadir di 2 proyek sekaligus  
✅ Warning UI: tampil otomatis jika sudah hadir di proyek lain  
✅ Auto-disable tombol "Hadir" jika sudah hadir di tempat lain  
✅ Status lain (Lembur, Cor, Alpha) tetap bisa dipilih  

## Catatan Penting
- Data existing akan otomatis dimigrasi (project_id diisi dari worker's project)
- Tidak ada data yang hilang
- Migration bersifat irreversible (tidak bisa rollback otomatis)

