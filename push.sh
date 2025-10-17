#!/bin/bash
# =====================================================
# Script Push Otomatis ke GitHub (Linux/Mac)
# Repository: batikARisePortal
# =====================================================

echo "=================================="
echo "  BatikAR - Auto Push to GitHub"
echo "=================================="
echo ""

# Cek apakah ada perubahan
if [ -z "$(git status --porcelain)" ]; then
    echo "✓ Tidak ada perubahan untuk di-commit"
    echo ""
    read -p "Tekan Enter untuk keluar..."
    exit 0
fi

# Tampilkan file yang berubah
echo "File yang berubah:"
git status --short
echo ""

# Minta konfirmasi
read -p "Push perubahan ke GitHub? (Y/n): " confirm
if [ "$confirm" = "n" ] || [ "$confirm" = "N" ]; then
    echo "✗ Push dibatalkan"
    exit 0
fi

# Minta commit message
read -p "Commit message (kosongkan untuk default): " message
if [ -z "$message" ]; then
    timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    message="Update: $timestamp"
fi

echo ""
echo "→ Menambahkan file ke staging..."
git add .

echo "→ Membuat commit..."
git commit -m "$message"

echo "→ Push ke GitHub..."
git push origin main

# Cek hasil
if [ $? -eq 0 ]; then
    echo ""
    echo "====================================="
    echo "  ✓ Berhasil push ke GitHub!"
    echo "====================================="
    echo ""
    echo "Website Anda:"
    echo "https://mulyodwi16.github.io/batikARisePortal/"
    echo ""
    echo "Tunggu 1-2 menit untuk deploy otomatis"
else
    echo ""
    echo "✗ Gagal push ke GitHub"
    echo "Periksa koneksi internet atau SSH key Anda"
fi

echo ""
read -p "Tekan Enter untuk keluar..."
