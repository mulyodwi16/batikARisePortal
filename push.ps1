# =====================================================
# Script Push Otomatis ke GitHub
# Repository: batikARisePortal
# =====================================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  BatikAR - Auto Push to GitHub" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah ada perubahan
$status = git status --porcelain

if ([string]::IsNullOrEmpty($status)) {
    Write-Host "[INFO] Tidak ada perubahan untuk di-commit" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit 0
}

# Tampilkan file yang berubah
Write-Host "File yang berubah:" -ForegroundColor Green
git status --short
Write-Host ""

# Minta konfirmasi
$confirm = Read-Host "Push perubahan ke GitHub? (Y/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Host "[INFO] Push dibatalkan" -ForegroundColor Red
    exit 0
}

# Minta commit message (optional)
$message = Read-Host "Commit message (kosongkan untuk default)"
if ([string]::IsNullOrWhiteSpace($message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $message = "Update: $timestamp"
}

Write-Host ""
Write-Host "[1/3] Menambahkan file ke staging..." -ForegroundColor Cyan

# Add semua perubahan
git add .

Write-Host "[2/3] Membuat commit..." -ForegroundColor Cyan

# Commit dengan message
git commit -m "$message"

Write-Host "[3/3] Push ke GitHub..." -ForegroundColor Cyan

# Push ke GitHub
git push origin main

# Cek hasil
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] Berhasil push ke GitHub!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Website Anda:" -ForegroundColor Cyan
    Write-Host "https://mulyodwi16.github.io/batikARisePortal/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tunggu 1-2 menit untuk deploy otomatis" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "[ERROR] Gagal push ke GitHub" -ForegroundColor Red
    Write-Host "Periksa koneksi internet atau SSH key Anda" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Tekan Enter untuk keluar"
