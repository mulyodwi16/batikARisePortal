# =====================================================
# Script Push Otomatis ke GitHub (Updated)
# Repository: batikARisePortal
# Note: node_modules diabaikan dengan .gitignore
# =====================================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  BatikARise - Auto Push to GitHub" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Cek apakah ada perubahan yang perlu di-track
Write-Host "[1/5] Memeriksa status repository..." -ForegroundColor Cyan
$status = git status --porcelain

if ([string]::IsNullOrEmpty($status)) {
    Write-Host "[INFO] Tidak ada perubahan untuk di-commit" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit 0
}

# Step 2: Tampilkan file yang berubah
Write-Host "[2/5] File yang berubah:" -ForegroundColor Green
git status --short
Write-Host ""

# Step 3: Minta konfirmasi
$confirm = Read-Host "Lanjutkan push ke GitHub? (Y/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Host "[INFO] Push dibatalkan" -ForegroundColor Yellow
    exit 0
}

# Step 4: Minta commit message
$message = Read-Host "Masukkan commit message (kosongkan untuk auto-generate)"
if ([string]::IsNullOrWhiteSpace($message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $message = "Update: $timestamp"
}

Write-Host ""
Write-Host "[3/5] Menambahkan file ke staging (node_modules diabaikan)..." -ForegroundColor Cyan
git add .

Write-Host "[4/5] Membuat commit: '$message'" -ForegroundColor Cyan
git commit -m "$message"

Write-Host "[5/5] Pushing ke GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push berhasil!" -ForegroundColor Green
    Write-Host "🌐 Repository: https://github.com/mulyodwi16/batikARisePortal" -ForegroundColor Cyan
    Write-Host "📄 Pages: https://mulyodwi16.github.io/batikARisePortal/" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push gagal! Periksa error di atas." -ForegroundColor Red
}

Write-Host ""
Read-Host "Tekan Enter untuk keluar"
