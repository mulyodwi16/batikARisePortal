@echo off
REM =====================================================
REM Script Push Otomatis ke GitHub (Windows Batch)
REM Repository: batikARisePortal
REM =====================================================

echo ==================================
echo   BatikAR - Auto Push to GitHub
echo ==================================
echo.

REM Cek apakah ada perubahan
git status --porcelain > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Bukan Git repository atau Git tidak terinstall
    pause
    exit /b 1
)

REM Tampilkan status
echo File yang berubah:
git status --short
echo.

REM Konfirmasi
set /p confirm="Push perubahan ke GitHub? (Y/n): "
if /i "%confirm%"=="n" (
    echo [INFO] Push dibatalkan
    pause
    exit /b 0
)

REM Minta commit message
set /p message="Commit message (kosongkan untuk default): "
if "%message%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set tanggal=%%c-%%a-%%b
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set waktu=%%a:%%b
    set message=Update: %tanggal% %waktu%
)

echo.
echo [1/3] Menambahkan file ke staging...
git add .

echo [2/3] Membuat commit...
git commit -m "%message%"

echo [3/3] Push ke GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo =====================================
    echo   [SUCCESS] Berhasil push ke GitHub!
    echo =====================================
    echo.
    echo Website Anda:
    echo https://mulyodwi16.github.io/batikARisePortal/
    echo.
    echo Tunggu 1-2 menit untuk deploy otomatis
) else (
    echo.
    echo [ERROR] Gagal push ke GitHub
    echo Periksa koneksi internet atau SSH key Anda
)

echo.
pause
