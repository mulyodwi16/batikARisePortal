#!/usr/bin/env python3
# Kompresi ulang gambar portal di tempat (nama file tidak berubah, jadi
# motifs.json dan referensi di HTML tetap valid) + buat thumbnail WebP.
#
# WAJIB dijalankan setelah `npm run sync`, karena sync mengunduh gambar mentah
# dari Supabase (~1 MB per motif) dan belum membuat thumbnail sama sekali.
#
# Pemakaian:
#   python tools/optimize-images.py            # lewati yang sudah diproses
#   python tools/optimize-images.py --force    # proses ulang semua (dipakai CI)
#
# Dimensi motif TIDAK diperkecil: file penuh dipakai lightbox dan mode "Tampilkan
# untuk dipindai", jadi ketajaman isen-isen harus dijaga untuk kamera AR. Hanya
# kualitas JPEG yang diturunkan ke level aman (q=90).
#
# Thumbnail terpisah dipakai kartu galeri (~278px) dan marquee (192px). Tanpa ini
# satu halaman galeri menarik 12 file penuh (~3,6 MB).

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit('Butuh Pillow: pip install Pillow')

ROOT = Path(__file__).resolve().parent.parent
MOTIF_DIR = ROOT / 'assets' / 'batik'
THUMB_DIR = MOTIF_DIR / 'thumb'

# sync-motifs.mjs (extFromPath) bisa menghasilkan keempat ekstensi ini.
MOTIF_EXT = ('.jpg', '.jpeg', '.png', '.webp')
MOTIF_QUALITY = 90
THUMB_MAX_PX = 560   # kartu galeri dirender ~278x288px -> 560px = tepat 2x DPI
THUMB_QUALITY = 78
LOGO_MAX_PX = 256    # logo tampil setinggi 56px; 256px cukup untuk layar 3x DPI


def optimize_motif(path: Path, force: bool):
    with Image.open(path) as im:
        if path.suffix.lower() in ('.jpg', '.jpeg'):
            # Tanpa --force, flag progressive dipakai sebagai penanda "pernah
            # diproses". Penanda ini TIDAK bisa dipercaya untuk file yang baru
            # diunduh: JPEG progressive hasil unggahan artist akan dilewati dan
            # file mentahnya ikut ter-commit. Karena itu CI selalu pakai --force.
            if not force and (im.info.get('progressive') or im.info.get('progression')):
                return False
            im.convert('RGB').save(
                path, 'JPEG', quality=MOTIF_QUALITY, optimize=True, progressive=True
            )
        elif path.suffix.lower() == '.png':
            im.save(path, 'PNG', optimize=True)
        else:
            im.save(path, 'WEBP', quality=MOTIF_QUALITY, method=6)
    return True


def make_thumb(path: Path, force: bool):
    dest = THUMB_DIR / (path.stem + '.webp')
    if dest.exists() and not force:
        return None
    with Image.open(path) as im:
        im = im.convert('RGB')
        im.thumbnail((THUMB_MAX_PX, THUMB_MAX_PX), Image.LANCZOS)
        im.save(dest, 'WEBP', quality=THUMB_QUALITY, method=6)
    return dest


def optimize_logo(path: Path, force: bool):
    with Image.open(path) as im:
        if max(im.size) <= LOGO_MAX_PX:
            return False
        im = im.convert('RGBA')
        scale = LOGO_MAX_PX / max(im.size)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        im.save(path, 'PNG', optimize=True)
    return True


def main():
    ap = argparse.ArgumentParser(description='Optimasi gambar portal + thumbnail.')
    ap.add_argument('--force', action='store_true',
                    help='proses ulang walaupun file terlihat sudah optimal')
    force = ap.parse_args().force

    motifs = [p for p in sorted(MOTIF_DIR.glob('*'))
              if p.is_file() and p.suffix.lower() in MOTIF_EXT]
    logos = [ROOT / 'assets' / n for n in ('sponsor1.png', 'sponsor2.png', 'sponsor3.png')]
    logos = [p for p in logos if p.exists()]

    if not motifs and not logos:
        sys.exit('Tidak ada gambar untuk dioptimasi.')

    THUMB_DIR.mkdir(parents=True, exist_ok=True)

    before_total = after_total = thumb_total = 0
    changed = thumbs = 0

    for path in motifs + logos:
        fn = optimize_motif if path in motifs else optimize_logo
        before = path.stat().st_size
        if fn(path, force):
            changed += 1
            after = path.stat().st_size
            print(f'{path.name:40} {before/1024:7.0f}K -> {after/1024:6.0f}K')
        else:
            after = before
            print(f'{path.name:40} {before/1024:7.0f}K    (sudah optimal, dilewati)')
        before_total += before
        after_total += after

        if path in motifs:
            dest = make_thumb(path, force)
            if dest is None:
                dest = THUMB_DIR / (path.stem + '.webp')
                thumb_total += dest.stat().st_size
                print(f'  thumb/{dest.name:33} {dest.stat().st_size/1024:6.0f}K    (sudah ada)')
            else:
                thumbs += 1
                thumb_total += dest.stat().st_size
                print(f'  thumb/{dest.name:33} {dest.stat().st_size/1024:6.0f}K')

    if changed:
        saved = 100 - after_total * 100 / before_total
        print(f'\n{changed} gambar dioptimasi. Total {before_total/1024/1024:.2f} MB'
              f' -> {after_total/1024/1024:.2f} MB ({saved:.1f}% turun)')
    else:
        print(f'\nSemua gambar sudah optimal ({after_total/1024/1024:.2f} MB).')
    print(f'{len(motifs)} thumbnail ({thumbs} dibuat ulang), total {thumb_total/1024:.0f}K'
          f' — inilah yang diunduh pengunjung di galeri.')


if __name__ == '__main__':
    main()
