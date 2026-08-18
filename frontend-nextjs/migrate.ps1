# Script migrasi database untuk tabel foremen
# Jalankan: .\migrate.ps1

Write-Host "🔄 Migrasi Database - Menambahkan Tabel Foremen" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah node_modules ada
if (!(Test-Path "node_modules")) {
    Write-Host "❌ node_modules tidak ditemukan! Jalankan: npm install" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Langkah 1: Menjalankan Prisma DB Push..." -ForegroundColor Yellow
Write-Host "⚠️  Jika ada prompt, pilih 'y' (yes) untuk melanjutkan" -ForegroundColor Yellow
Write-Host ""

# Run db push dengan accept-data-loss
$env:CI = "false"
& node "./node_modules/prisma/build/index.js" db push --accept-data-loss --skip-generate

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  DB Push mungkin butuh confirm manual atau ada masalah lain." -ForegroundColor Yellow
    Write-Host "Cek file: MIGRATION_INSTRUCTIONS.md untuk alternatif" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Langkah 2: Generate Prisma Client..." -ForegroundColor Yellow
& node "./node_modules/prisma/build/index.js" generate

Write-Host ""
Write-Host "✅ Migrasi Selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Langkah Selanjutnya:" -ForegroundColor Cyan
Write-Host "1. Jalankan dev server: npm run dev" -ForegroundColor White
Write-Host "2. Buka: http://localhost:3000" -ForegroundColor White
Write-Host "3. Cek: Master Data → Kepala Tukang" -ForegroundColor White
Write-Host ""
Write-Host "Jika masih error 500, baca: MIGRATION_INSTRUCTIONS.md" -ForegroundColor Yellow
