# BatikAR - Landing Page

Website landing page untuk aplikasi BatikAR - Aplikasi pembelajaran motif Batik Jetis Sidoarjo menggunakan teknologi Augmented Reality dan Artificial Intelligence.

## 🔄 Sinkronisasi Galeri Motif (dari aplikasi Unity)

Galeri batik tidak hardcode. Frontend membaca `assets/data/motifs.json`, dan file itu
di-generate dari **katalog yang sama** yang dilihat user di aplikasi Unity (PlayFab
Title Data `MOTIF_LIST`, berisi motif dari semua Batik Artist).

### Otomatis (jalur utama)

`.github/workflows/sync-motifs.yml` menjalankan sinkronisasi **setiap hari** dan
meng-commit hasilnya, jadi katalog portal mengikuti unggahan di aplikasi tanpa
campur tangan manual. Untuk refresh langsung: tab **Actions → Sinkronisasi motif →
Run workflow**.

Prasyarat sekali pasang — **Settings → Secrets and variables → Actions**:

| Secret | Isi |
|---|---|
| `PLAYFAB_EMAIL` | email akun PlayFab terdaftar |
| `PLAYFAB_PASSWORD` | passwordnya |

Login anonim (`LoginWithCustomID`) **tidak bisa** dipakai: title ini menolaknya
dengan `PlayerCreationDisabled` (errorCode 22000), jadi akun terdaftar wajib ada.

> GitHub menonaktifkan workflow terjadwal setelah 60 hari tanpa commit di repo.
> Sinkronisasi tanpa perubahan memang tidak menghasilkan commit, jadi ini bisa
> terjadi — GitHub mengirim email, dan satu `Run workflow` mengaktifkannya lagi.

### Manual (lokal)

```bash
cp .env.example .env     # lalu isi PLAYFAB_EMAIL + PLAYFAB_PASSWORD
npm run sync             # ambil katalog + gambar, lalu kompresi + thumbnail
```

`.env` sudah masuk `.gitignore`. Skrip (`tools/sync-motifs.mjs`) akan:
1. Login PlayFab → ambil `MOTIF_LIST`.
2. Untuk tiap motif, resolve gambar (URL lama dipakai langsung; path Supabase privat
   ditukar signed URL via Edge Function `get-download-url`).
3. Download gambar ke `assets/batik/`, buang file yang tak lagi dirujuk, lalu tulis
   `assets/data/motifs.json`.

Lalu `tools/optimize-images.py --force` mengompresi gambar di tempat dan membuat
thumbnail WebP di `assets/batik/thumb/`. **Langkah ini tidak opsional**: tanpanya
gambar mentah ~1 MB/motif ikut ter-commit dan satu halaman galeri menarik ~3,6 MB.
Karena itu `npm run sync` sudah merangkai keduanya (`npm run sync:only` kalau benar-
benar hanya ingin unduh).

Gambar motif sengaja **tidak** diperkecil dimensinya — file penuh dipakai lightbox
dan mode "Tampilkan untuk dipindai", jadi ketajaman isen-isen harus dijaga untuk
kamera AR. Kartu galeri & marquee memakai thumbnail terpisah.

Hasilnya portal tetap **100% statis** (aman di GitHub Pages/Vercel/Netlify) dan **tidak
bergantung server saat demo**. Gambar yang tampil = trigger scan AR yang sama persis.

Preview lokal cepat: `npm run serve` lalu buka `http://localhost:5173`
(harus lewat http, bukan `file://`, agar `fetch` motifs.json jalan).

> **Catatan pindai (demo):** di lightbox galeri ada tombol **"Tampilkan untuk Dipindai"**
> yang membuka motif layar-penuh dengan latar putih bersih, pas untuk dipindai kamera AR.

## 📋 Fitur

- **Responsive Design**: Tampilan optimal di mobile (≥375px), tablet, dan desktop
- **Sticky Navigation**: Navbar yang mengikuti scroll dengan efek transparan
- **Hero Section**: Banner utama dengan CTA download untuk Android dan iOS
- **Cara Penggunaan**: 4 langkah mudah menggunakan aplikasi
- **Galeri Interaktif**: Lightbox untuk melihat motif batik dengan navigasi keyboard
- **Smooth Scroll**: Navigasi halus antar section dengan highlight otomatis
- **Animasi**: Fade-in animations menggunakan Intersection Observer
- **Aksesibilitas**: WAI-ARIA compliant dengan focus indicators yang jelas
- **SEO Optimized**: Meta tags lengkap termasuk Open Graph

## 🗂️ Struktur File

```
WebsiteBatikARise/
├── index.html          # File HTML utama
├── styles.css          # Stylesheet (mobile-first)
├── script.js           # JavaScript vanilla (no dependencies)
├── README.md           # Dokumentasi ini
└── assets/             # Folder untuk gambar dan aset
    ├── logo.png                        # Logo BatikAR (50x50px recommended)
    ├── hero-banner.jpg                 # Background hero section (1920x1080px recommended)
    ├── institution-logo-placeholder.png # Logo institusi pendukung
    ├── sponsor-1-placeholder.png       # Logo sponsor 1
    ├── sponsor-2-placeholder.png       # Logo sponsor 2
    ├── sponsor-3-placeholder.png       # Logo sponsor 3
    └── batik/                          # Folder khusus gambar motif batik
        ├── jetis-sekar-jagad.jpg
        ├── jetis-panji.jpg
        ├── jetis-sido-mukti.jpg
        ├── jetis-truntum.jpg
        ├── jetis-kawung.jpg
        ├── jetis-mega-mendung.jpg
        ├── jetis-semen-rama.jpg
        ├── jetis-gurda.jpg
        ├── jetis-cemukiran.jpg
        ├── jetis-udan-liris.jpg
        ├── jetis-lung-lungan.jpg
        └── jetis-nitik.jpg
```

## 🎨 Panduan Gambar

### Ukuran Rekomendasi:

- **Logo** (`logo.png`): 200x200px (PNG dengan background transparan)
- **Hero Banner** (`hero-banner.jpg`): 1920x1080px atau lebih besar
- **Galeri Batik**: 800x600px minimal (rasio 4:3 atau 3:2)
- **Logo Institusi/Sponsor**: 200x100px atau sesuai kebutuhan

### Format:
- Logo: PNG dengan transparency
- Foto: JPG untuk ukuran file lebih kecil
- Kompress gambar untuk web (gunakan tools seperti TinyPNG atau Squoosh)

## 🔗 Mengganti Link Download

### Edit File HTML

Cari baris berikut di `index.html`:

```html
<a href="#download" class="btn btn-primary btn-large">
```

Ganti `#download` dengan URL download aktual:

```html
<a href="https://example.com/downloads/batikar-v1.0.apk" class="btn btn-primary btn-large">
```

### Edit File JavaScript

Buka `script.js` dan cari section "Download Button Handling" (baris ~330), kemudian uncomment dan edit:

```javascript
downloadButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        // Ganti dengan link download APK Anda:
        window.location.href = 'https://example.com/downloads/batikar-v1.0.apk';
    });
});
```

## 🖼️ Menambah/Mengganti Gambar Galeri

### Tambah Item Baru

Edit `index.html`, tambahkan di dalam `.gallery-grid`:

```html
<div class="gallery-item">
    <img src="assets/batik/nama-motif-baru.jpg" 
         alt="Deskripsi detail motif batik" 
         width="400" 
         height="300" 
         loading="lazy">
    <div class="gallery-label">Jetis – Nama Motif</div>
</div>
```

### Tips Alt Text yang Baik:
- Deskripsikan visual motif
- Sebutkan warna dominan atau pola khas
- Contoh: "Motif Batik Jetis Sekar Jagad dengan pola geometris dan warna-warni khas"

## 📝 Kustomisasi Konten

### Ubah Nama Pembimbing

Edit `index.html` di section footer:

```html
<p class="credit">Dengan bimbingan: <strong>[Nama Pembimbing]</strong></p>
```

### Ubah Email Kontak

```html
<a href="mailto:dwimulyo@example.com" class="contact-link">
```

### Ubah Link GitHub

```html
<a href="https://github.com/dwimulyo/batikar" target="_blank" ...>
```

## 🚀 Deploy ke GitHub Pages

### Opsi 1: Deploy dari Root Repository

1. Push semua file ke repository GitHub
2. Masuk ke **Settings** > **Pages**
3. Pilih **Source**: Deploy from branch
4. Pilih **Branch**: `main` atau `master`, folder: `/ (root)`
5. Klik **Save**
6. Website akan tersedia di: `https://username.github.io/repository-name/`

### Opsi 2: Deploy dari Folder `/docs`

1. Buat folder `docs/` di root repository
2. Pindahkan semua file (index.html, styles.css, script.js, assets/) ke folder `docs/`
3. Push ke GitHub
4. Di **Settings** > **Pages**, pilih folder: `/docs`
5. Klik **Save**

### Opsi 3: Custom Domain

Setelah deploy, Anda bisa tambahkan custom domain:

1. Buat file `CNAME` di root atau `/docs` dengan isi domain Anda:
   ```
   batikar.example.com
   ```
2. Di DNS provider, tambahkan CNAME record:
   ```
   CNAME @ username.github.io
   ```
3. Di GitHub Settings > Pages, masukkan custom domain

## 🎨 Kustomisasi Warna

Edit file `styles.css` di bagian `:root` variables:

```css
:root {
    --color-dark-brown: #4E342E;  /* Warna utama navbar/footer */
    --color-cream: #F5E6D3;        /* Background terang */
    --color-gold: #C09753;         /* Aksen tombol/highlight */
    --color-dark: #1F1B16;         /* Text gelap */
}
```

## 🔧 Troubleshooting

### Gambar Tidak Muncul
- Pastikan path file benar: `assets/batik/nama-file.jpg`
- Periksa case sensitivity (huruf besar/kecil)
- Pastikan file ada di folder yang benar

### Smooth Scroll Tidak Bekerja
- Pastikan section memiliki `id` yang sesuai: `id="home"`, `id="cara"`, dll
- Periksa console browser untuk error JavaScript

### Mobile Menu Tidak Tertutup
- Clear browser cache
- Periksa apakah `script.js` ter-load dengan benar

## 📱 Testing

### Browser Support
- Chrome/Edge (modern versions)
- Firefox (modern versions)
- Safari 12+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Testing Checklist
- [ ] Test di mobile (375px)
- [ ] Test di tablet (768px)
- [ ] Test di desktop (1440px+)
- [ ] Test semua link navigasi
- [ ] Test lightbox gallery (klik, keyboard)
- [ ] Test mobile menu toggle
- [ ] Validasi HTML di [validator.w3.org](https://validator.w3.org/)
- [ ] Test performa di [PageSpeed Insights](https://pagespeed.web.dev/)

## 📄 Lisensi

© 2025 BatikAR. Dikembangkan oleh Dwi Mulyo.

---

## 💡 Tips Tambahan

1. **Optimasi Gambar**: Gunakan format WebP untuk browser modern
2. **Analytics**: Tambahkan Google Analytics untuk tracking pengunjung
3. **SEO**: Update meta description sesuai konten aktual
4. **Performance**: Enable Gzip compression di hosting
5. **Security**: Gunakan HTTPS untuk production

## 📞 Kontak Developer

Jika ada pertanyaan atau butuh bantuan:
- Email: dwimulyo@example.com
- GitHub: [@dwimulyo](https://github.com/dwimulyo)

---

**Selamat menggunakan! 🎉**
