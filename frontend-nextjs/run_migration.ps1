# Script untuk menjalankan migration secara manual
# Jalankan: .\run_migration.ps1

Write-Host "🔄 Memulai Prisma DB Push..." -ForegroundColor Cyan

# Try db push dengan accept-data-loss menggunakan echo
echo "" | node "./node_modules/prisma/build/index.js" db push --accept-data-loss --skip-generate 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration berhasil!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Migration mungkin perlu confirm manual. Coba jalankan:" -ForegroundColor Yellow
    Write-Host "node ./node_modules/prisma/build/index.js db push --accept-data-loss" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 Generating Prisma Client..." -ForegroundColor Cyan
node "./node_modules/prisma/build/index.js" generate

Write-Host ""
Write-Host "✅ Done! Silakan restart dev server dengan: npm run dev" -ForegroundColor Green
