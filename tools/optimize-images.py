#!/usr/bin/env python3
# Kompresi ulang gambar portal di tempat (nama file tidak berubah, jadi
# motifs.json dan referensi di HTML tetap valid).
#
# WAJIB dijalankan setelah `npm run sync`, karena sync mengunduh gambar mentah
# dari Supabase yang ukurannya bisa ~1 MB per motif.
#
# Pemakaian:  python tools/optimize-images.py
#
# Dimensi motif TIDAK diperkecil: gambar ini ditampilkan di layar untuk dipindai
# kamera AR, jadi ketajaman isen-isen harus dijaga. Hanya kualitas JPEG yang
# diturunkan ke level yang masih aman (q=90).

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit('Butuh Pillow: pip install Pillow')

ROOT = Path(__file__).resolve().parent.parent
MOTIF_QUALITY = 90
LOGO_MAX_PX = 256  # logo tampil setinggi 56px; 256px sudah cukup untuk layar 3x DPI


def optimize_motif(path: Path):
    with Image.open(path) as im:
        # Hasil skrip ini selalu progressive. Kalau sudah progressive berarti
        # pernah diproses, kompresi ulang cuma menambah kehilangan kualitas.
        if im.info.get('progressive') or im.info.get('progression'):
            return False
        im.convert('RGB').save(
            path, 'JPEG', quality=MOTIF_QUALITY, optimize=True, progressive=True
        )
    return True


def optimize_logo(path: Path):
    with Image.open(path) as im:
        if max(im.size) <= LOGO_MAX_PX:
            return False
        im = im.convert('RGBA')
        scale = LOGO_MAX_PX / max(im.size)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        im.save(path, 'PNG', optimize=True)
    return True


def main():
    targets = []
    for p in sorted((ROOT / 'assets' / 'batik').glob('*')):
        if p.suffix.lower() in ('.jpg', '.jpeg'):
            targets.append((p, optimize_motif))
    for name in ('sponsor1.png', 'sponsor2.png', 'sponsor3.png'):
        p = ROOT / 'assets' / name
        if p.exists():
            targets.append((p, optimize_logo))

    if not targets:
        sys.exit('Tidak ada gambar untuk dioptimasi.')

    before_total = after_total = 0
    changed = 0
    for path, fn in targets:
        before = path.stat().st_size
        if fn(path):
            changed += 1
            after = path.stat().st_size
            print(f'{path.name:34} {before/1024:7.0f}K -> {after/1024:6.0f}K')
        else:
            after = before
            print(f'{path.name:34} {before/1024:7.0f}K    (sudah optimal, dilewati)')
        before_total += before
        after_total += after

    if changed == 0:
        print(f'\nSemua gambar sudah optimal ({after_total/1024/1024:.2f} MB).')
    else:
        saved = 100 - after_total * 100 / before_total
        print(
            f'\n{changed} gambar dioptimasi. Total {before_total/1024/1024:.2f} MB'
            f' -> {after_total/1024/1024:.2f} MB ({saved:.1f}% turun)'
        )


if __name__ == '__main__':
    main()
