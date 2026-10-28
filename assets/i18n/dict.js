// Kamus dwibahasa untuk chrome portal (ID kanonik, EN terjemahan).
//
// Satu file .js sinkron, bukan dua .json yang di-fetch: dengan begitu kamus
// sudah ada saat i18n.js jalan, jadi tidak pernah ada jeda di mana teks EN
// sempat tampil dalam bahasa Indonesia.
//
// JANGAN dimasukkan ke sini:
//   - nama & deskripsi motif (nama budaya + tulisan Batik Artist)
//   - nama anggota tim peneliti
//   - "batikARise", "Politeknik Elektronika Negeri Surabaya", "ARCore",
//     "SAM2", "OpenCV", "ISEN-ISEN", "ELEMENTS", "Android 8.0+", versi "3.0"
//   - teks yang identik di kedua bahasa (biarkan di markup, mis. "Android 8.0+ (API 26)")
//
// Kunci bersuffiks _one/_other dipilih Intl.PluralRules. Bahasa Indonesia tidak
// membedakan jumlah, jadi cukup kunci dasarnya.
//
// Jalankan halaman dengan ?i18n=debug untuk mengaudit kunci yang tak sinkron.

window.I18N = {
    id: {
        // -- Meta / <title> --------------------------------------------------
        'meta.index.title': 'batikARise: Kenali motif batik lewat kamera',
        'meta.index.desc': 'batikARise adalah aplikasi Android yang mengenali motif batik lewat kamera AR, mengajakmu menggambar ulang motifnya, dan membongkar elemennya jadi karya baru.',
        'meta.galeri.title': 'Galeri Motif batikARise',
        'meta.galeri.desc': 'Galeri lengkap motif batik batikARise. Cari motifnya, tampilkan layar penuh, lalu pindai dengan kamera AR di aplikasi.',

        // -- Navigasi --------------------------------------------------------
        'nav.fitur': 'Fitur',
        'nav.cara': 'Cara Pakai',
        'nav.kustomisasi': 'Kustomisasi',
        'nav.galeri': 'Galeri',
        'nav.unduhApk': 'Unduh APK',
        'nav.menuLabel': 'Buka menu',
        'nav.langGroup': 'Bahasa / Language',

        // -- Hero ------------------------------------------------------------
        'hero.titleLead': 'Kenali motif batik lewat',
        'hero.titleAccent': 'kamera ponselmu',
        'hero.lead': 'batikARise mengenali motif batik dari kamera menggunakan ARCore, mengajakmu menggambar ulang motifnya langsung di ruang nyata lalu menilai hasilnya, dan membongkar elemen batik jadi bahan desain baru.',
        'hero.ctaDownload': 'Unduh APK versi 3.0',
        'hero.ctaFeatures': 'Lihat fitur',
        'hero.pillArcore': 'Perlu ARCore & kamera',
        'hero.pillGuest': 'Bisa masuk sebagai tamu',
        'hero.scroll': 'Gulir',
        'marquee.label': 'Pratinjau koleksi motif',

        // -- Fitur -----------------------------------------------------------
        'fitur.label': 'Fitur',
        'fitur.titleLead': 'Bukan cuma galeri:',
        'fitur.titleAccent': 'batik yang bisa kamu ajak kerja',
        'fitur.lead': 'Setiap fitur di bawah ini benar-benar ada di dalam aplikasi, bukan rencana.',
        'fitur.ar.title': 'Pemindaian motif dengan AR',
        'fitur.ar.body': 'Dibangun di atas AR Foundation dan ARCore. Saat kamu memilih sebuah motif, aplikasi menyusun pustaka gambar referensi secara langsung di perangkat untuk motif itu, jadi hanya motif yang kamu pilih yang dianggap cocok. Mengarahkan kamera ke motif lain akan ditolak, bukan salah dikenali.',
        'fitur.draw.title': 'AR Draw & skor bintang',
        'fitur.draw.body': 'Setelah motif terdeteksi, tombol <em>Let’s Draw</em> membuka mode menggambar di ruang AR. Hasil gambarmu dibandingkan dengan motif aslinya oleh layanan kemiripan, lalu diubah menjadi rating 1–5 bintang yang tersimpan per motif.',
        'fitur.kuis.title': 'Kuis benar/salah',
        'fitur.kuis.body': 'Lima soal diacak dari kumpulan 25 setiap kali bermain, dengan 20 poin per jawaban benar. Jadi dua sesi tidak pernah persis sama.',
        'fitur.leaderboard.title': 'Leaderboard',
        'fitur.leaderboard.body': 'Skor kuis dikirim ke server dan diperingkat, sehingga satu kelas atau satu komunitas bisa saling berlomba.',
        'fitur.ekstraksi.title': 'Ekstraksi elemen',
        'fitur.ekstraksi.body': 'Ketuk satu elemen di foto batik dan aplikasi memotongnya jadi objek tersendiri. Mode <strong class="kw">ISEN-ISEN</strong> memakai OpenCV, mode <strong class="kw">ELEMENTS</strong> memakai model segmentasi SAM2.',
        'fitur.kanvas.title': 'Kanvas kustomisasi berlapis',
        'fitur.kanvas.body': 'Setiap elemen yang kamu ekstrak menjadi satu lapisan sendiri di kanvas, bisa digeser, diputar, dan diubah ukurannya secara terpisah. Lengkap dengan mode menggambar bebas dan pewarnaan, supaya kamu bisa menyusun motif baru dari potongan motif lama.',
        'fitur.artist.title': 'Peran Batik Artist',
        'fitur.artist.body': 'Selain pengguna biasa, ada peran Batik Artist dan Administrator yang bisa mengunggah serta mengelola motif di katalog. Motif baru langsung tersedia untuk dipindai semua pengguna.',

        // -- Cara pakai ------------------------------------------------------
        'cara.label': 'Cara Pakai',
        'cara.titleLead': 'Dari pasang sampai',
        'cara.titleAccent': 'dapat bintang',
        'cara.lead': 'Lima langkah, mengikuti alur yang benar-benar ada di aplikasi.',
        'cara.cta': 'Mulai sekarang',
        'cara.step1.title': 'Masuk, daftar, atau pakai mode tamu',
        'cara.step1.body': 'Buat akun dengan email, atau langsung lanjut sebagai tamu kalau hanya ingin mencoba. Akunmu dipakai untuk menyimpan bintang dan skor kuis.',
        'cara.step2.title': 'Pilih motif dari katalog',
        'cara.step2.body': 'Katalog motif diambil dari server, jadi daftarnya ikut bertambah setiap kali seorang Batik Artist mengunggah motif baru, tanpa perlu memperbarui aplikasi.',
        'cara.step3.title': 'Arahkan kamera ke motif itu',
        'cara.step3.body': 'Aplikasi hanya mengenali motif yang baru kamu pilih. Kamu bisa memindai kain aslinya, atau menampilkan motifnya di layar lain. Halaman <a href="galeri.html" class="link-emas">Galeri</a> di situs ini punya mode layar penuh khusus untuk itu.',
        'cara.step4.title': 'Tekan “Let’s Draw” dan gambar ulang',
        'cara.step4.body': 'Gambar ulang motifnya langsung di ruang AR. Hasilnya dinilai berdasarkan kemiripan dengan motif asli, lalu kamu dapat 1–5 bintang untuk motif tersebut.',
        'cara.step5.title': 'Main kuis dan cek leaderboard',
        'cara.step5.body': 'Uji pengetahuanmu dengan lima soal benar/salah yang diacak, lalu bandingkan skormu dengan pemain lain.',

        // -- Kustomisasi -----------------------------------------------------
        'kustomisasi.label': 'Kustomisasi',
        'kustomisasi.titleLead': 'Bongkar motif lama,',
        'kustomisasi.titleAccent': 'susun jadi motif baru',
        'kustomisasi.lead': 'Ini bagian yang paling jarang ada di aplikasi batik lain: kamu tidak hanya melihat motif, tapi memotong elemennya satu per satu dan menyusunnya ulang jadi karyamu sendiri.',
        'kustomisasi.step1.title': 'Foto atau unggah',
        'kustomisasi.step1.body': 'Ambil foto kain batik atau pilih dari galeri. Kamera memberi panduan perataan langsung di layar supaya hasil jepretannya rapi.',
        'kustomisasi.step2.title': 'Luruskan perspektif',
        'kustomisasi.step2.body': 'Foto yang miring diperbaiki jadi tampak lurus dari depan, supaya elemennya mudah dipotong.',
        'kustomisasi.step3.title': 'Pilih mode ekstraksi',
        'kustomisasi.step3.body': '<strong class="kw">ISEN-ISEN</strong> untuk isian batik yang halus, atau <strong class="kw">ELEMENTS</strong> untuk objek utuh seperti daun dan burung.',
        'kustomisasi.step4.title': 'Ketuk elemen, tekan ADD',
        'kustomisasi.step4.body': 'Ketuk satu titik pada elemen yang kamu mau. Hasil potongannya ditambahkan ke kanvas sebagai lapisan baru.',
        'kustomisasi.step5.title': 'Susun di kanvas',
        'kustomisasi.step5.body': 'Geser, putar, dan ubah ukuran tiap lapisan. Tambahkan gambar bebas dan warna untuk menyelesaikan desainmu.',

        // -- Galeri (sorotan di landing) -------------------------------------
        'galeri.label': 'Galeri',
        'galeri.titleLead': 'Motif yang',
        'galeri.titleAccent': 'siap dipindai',
        'galeri.lead': 'Gambar di sini adalah penanda yang sama dengan yang dikenali aplikasi. Klik satu motif, tampilkan layar penuh, lalu pindai dari ponsel.',
        'galeri.ctaAll': 'Lihat semua motif',
        'galeri.ctaCount': 'Lihat semua {total} motif',
        'galeri.loadError': 'Katalog motif gagal dimuat. Buka halaman ini lewat server web (bukan file://), lalu muat ulang.',

        // -- Unduh & spesifikasi ---------------------------------------------
        'unduh.label': 'Unduh',
        'unduh.titleLead': 'Siap mencoba',
        'unduh.lead': 'Pasang berkas APK-nya langsung di perangkat Android. Pastikan ponselmu mendukung ARCore agar fitur pemindaian dan menggambar di ruang AR bisa berjalan.',
        'unduh.repo': 'Repositori',
        'unduh.specPlatform': 'Platform',
        'unduh.specPlatformNote': 'API level 26 ke atas',
        'unduh.specVersion': 'Versi',
        'unduh.specVersionNote': 'Berkas APK, pasang manual',
        'unduh.specAr': 'Teknologi AR',
        'unduh.specArNote': 'Lewat Unity AR Foundation',
        'unduh.specPerms': 'Izin',
        'unduh.specPermsValue': 'Kamera & internet',
        'unduh.specPermsNote': 'Untuk AR dan sinkronisasi katalog',

        // -- Footer ----------------------------------------------------------
        'footer.about': 'Aplikasi pembelajaran motif batik berbasis Augmented Reality, dikembangkan sebagai bagian dari penelitian di Politeknik Elektronika Negeri Surabaya.',
        'footer.tim': 'Tim Peneliti',
        'footer.support': 'Didukung oleh',
        'footer.sponsorAlt': 'Logo pendukung',
        'footer.galeriAbout': 'Motif pada galeri ini disinkronkan dari katalog aplikasi, jadi yang tampil di sini sama dengan yang dapat dikenali kamera AR.',
        'footer.nav': 'Navigasi',
        'footer.navFitur': 'Fitur aplikasi',
        'footer.navCara': 'Cara pakai',
        'footer.navKustomisasi': 'Kustomisasi motif',
        'footer.backHome': 'Kembali ke beranda',

        // -- Lightbox & tampilan pindai --------------------------------------
        'lightbox.close': 'Tutup',
        'lightbox.prev': 'Motif sebelumnya',
        'lightbox.next': 'Motif berikutnya',
        'lightbox.scanCta': 'Tampilkan untuk dipindai',
        'scan.close': 'Tutup tampilan pindai',

        // -- Halaman galeri --------------------------------------------------
        'galeriPage.back': 'Beranda',
        'galeriPage.titleLead': 'Semua motif yang bisa',
        'galeriPage.titleAccent': 'dipindai aplikasi',
        'galeriPage.lead': 'Klik motif untuk melihat versi besar beserta keterangannya, lalu tekan <em class="kw-emas">Tampilkan untuk dipindai</em> supaya gambarnya memenuhi layar, lalu arahkan kamera aplikasi ke layar ini.',
        'galeriPage.searchPlaceholder': 'Cari nama motif…',
        'galeriPage.searchLabel': 'Cari motif batik',
        'galeriPage.searchClear': 'Hapus pencarian',
        'galeriPage.emptyTitle': 'Motif tidak ditemukan',
        'galeriPage.emptyHint': 'Coba kata kunci lain, misalnya “parang” atau “kawung”.',
        'galeriPage.errorTitle': 'Katalog gagal dimuat',
        'galeriPage.errorHint': 'assets/data/motifs.json tidak bisa dibaca. Buka halaman ini lewat server web (bukan file://), lalu muat ulang.',
        'galeriPage.resultCount': 'Menampilkan {shown} dari {total} motif',
        'galeriPage.pageInfo': 'Halaman {page} / {pages}',
        'galeriPage.prev': 'Sebelumnya',
        'galeriPage.next': 'Berikutnya',
        'galeriPage.prevLabel': 'Halaman sebelumnya',
        'galeriPage.nextLabel': 'Halaman berikutnya',

        'common.langAnnounce': 'Bahasa diubah ke Indonesia.'
    },

    en: {
        // -- Meta / <title> --------------------------------------------------
        'meta.index.title': 'batikARise: Recognise batik motifs with your camera',
        'meta.index.desc': 'batikARise is an Android app that recognises batik motifs through an AR camera, invites you to redraw them, and takes their elements apart into new artwork.',
        'meta.galeri.title': 'batikARise Motif Gallery',
        'meta.galeri.desc': 'The complete gallery of batikARise batik motifs. Search for a motif, show it full screen, then scan it with the AR camera in the app.',

        // -- Navigasi --------------------------------------------------------
        'nav.fitur': 'Features',
        'nav.cara': 'How It Works',
        'nav.kustomisasi': 'Customise',
        'nav.galeri': 'Gallery',
        'nav.unduhApk': 'Download APK',
        'nav.menuLabel': 'Open menu',
        'nav.langGroup': 'Bahasa / Language',

        // -- Hero ------------------------------------------------------------
        'hero.titleLead': 'Recognise batik motifs with',
        'hero.titleAccent': 'your phone camera',
        'hero.lead': 'batikARise recognises batik motifs through your camera using ARCore, invites you to redraw them right in physical space and scores the result, then takes batik elements apart into material for new designs.',
        'hero.ctaDownload': 'Download APK v3.0',
        'hero.ctaFeatures': 'See features',
        'hero.pillArcore': 'Requires ARCore & camera',
        'hero.pillGuest': 'Guest sign-in available',
        'hero.scroll': 'Scroll',
        'marquee.label': 'Motif collection preview',

        // -- Fitur -----------------------------------------------------------
        'fitur.label': 'Features',
        'fitur.titleLead': 'More than a gallery:',
        'fitur.titleAccent': 'batik you can actually work with',
        'fitur.lead': 'Every feature below is already in the app, not on a roadmap.',
        'fitur.ar.title': 'Motif scanning with AR',
        'fitur.ar.body': 'Built on AR Foundation and ARCore. When you pick a motif, the app assembles a reference image library for that motif directly on the device, so only the motif you chose counts as a match. Pointing the camera at a different motif is rejected rather than misrecognised.',
        'fitur.draw.title': 'AR Draw & star rating',
        'fitur.draw.body': 'Once a motif is detected, the <em>Let’s Draw</em> button opens drawing mode in AR space. Your drawing is compared against the original motif by a similarity service, then turned into a 1–5 star rating saved per motif.',
        'fitur.kuis.title': 'True/false quiz',
        'fitur.kuis.body': 'Five questions drawn at random from a pool of 25 each time you play, worth 20 points per correct answer. No two sessions are ever quite the same.',
        'fitur.leaderboard.title': 'Leaderboard',
        'fitur.leaderboard.body': 'Quiz scores are sent to the server and ranked, so a single class or community can compete against each other.',
        'fitur.ekstraksi.title': 'Element extraction',
        'fitur.ekstraksi.body': 'Tap an element in a batik photo and the app cuts it out as an object of its own. <strong class="kw">ISEN-ISEN</strong> mode uses OpenCV; <strong class="kw">ELEMENTS</strong> mode uses the SAM2 segmentation model.',
        'fitur.kanvas.title': 'Layered customisation canvas',
        'fitur.kanvas.body': 'Every element you extract becomes its own layer on the canvas, free to move, rotate, and resize independently. Complete with freehand drawing and colouring modes, so you can compose a new motif out of pieces of older ones.',
        'fitur.artist.title': 'The Batik Artist role',
        'fitur.artist.body': 'Beyond ordinary users there are Batik Artist and Administrator roles that can upload and manage motifs in the catalogue. New motifs become scannable for every user straight away.',

        // -- Cara pakai ------------------------------------------------------
        'cara.label': 'How It Works',
        'cara.titleLead': 'From install to',
        'cara.titleAccent': 'earning stars',
        'cara.lead': 'Five steps, following the flow that genuinely exists in the app.',
        'cara.cta': 'Get started',
        'cara.step1.title': 'Sign in, register, or use guest mode',
        'cara.step1.body': 'Create an account with your email, or carry straight on as a guest if you only want a look. Your account is what stores your stars and quiz scores.',
        'cara.step2.title': 'Pick a motif from the catalogue',
        'cara.step2.body': 'The motif catalogue is fetched from the server, so the list grows every time a Batik Artist uploads a new motif — no app update needed.',
        'cara.step3.title': 'Point your camera at that motif',
        'cara.step3.body': 'The app only recognises the motif you just selected. You can scan the real fabric, or display the motif on another screen. The <a href="galeri.html" class="link-emas">Gallery</a> page on this site has a full-screen mode made exactly for that.',
        'cara.step4.title': 'Press “Let’s Draw” and redraw it',
        'cara.step4.body': 'Redraw the motif right in AR space. The result is judged on how closely it matches the original, and you earn 1–5 stars for that motif.',
        'cara.step5.title': 'Play the quiz and check the leaderboard',
        'cara.step5.body': 'Test what you know with five randomised true/false questions, then compare your score with other players.',

        // -- Kustomisasi -----------------------------------------------------
        'kustomisasi.label': 'Customise',
        'kustomisasi.titleLead': 'Take an old motif apart,',
        'kustomisasi.titleAccent': 'build a new one from the pieces',
        'kustomisasi.lead': 'This is the part other batik apps rarely have: you do not just look at a motif, you cut its elements out one by one and reassemble them into work of your own.',
        'kustomisasi.step1.title': 'Shoot or upload',
        'kustomisasi.step1.body': 'Take a photo of batik fabric or pick one from your gallery. The camera gives live alignment guidance on screen so the shot comes out straight.',
        'kustomisasi.step2.title': 'Straighten the perspective',
        'kustomisasi.step2.body': 'A skewed photo is corrected to a straight-on view, so its elements are easy to cut out.',
        'kustomisasi.step3.title': 'Choose an extraction mode',
        'kustomisasi.step3.body': '<strong class="kw">ISEN-ISEN</strong> for the fine fill patterns of batik, or <strong class="kw">ELEMENTS</strong> for whole objects such as leaves and birds.',
        'kustomisasi.step4.title': 'Tap an element, press ADD',
        'kustomisasi.step4.body': 'Tap a single point on the element you want. The cut-out is added to the canvas as a new layer.',
        'kustomisasi.step5.title': 'Arrange on the canvas',
        'kustomisasi.step5.body': 'Move, rotate, and resize each layer. Add freehand drawing and colour to finish your design.',

        // -- Galeri (sorotan di landing) -------------------------------------
        'galeri.label': 'Gallery',
        'galeri.titleLead': 'Motifs that are',
        'galeri.titleAccent': 'ready to scan',
        'galeri.lead': 'The images here are the very same markers the app recognises. Click a motif, show it full screen, then scan it from your phone.',
        'galeri.ctaAll': 'View all motifs',
        'galeri.ctaCount_one': 'View all {total} motif',
        'galeri.ctaCount_other': 'View all {total} motifs',
        'galeri.loadError': 'The motif catalogue failed to load. Open this page over a web server (not file://), then reload.',

        // -- Unduh & spesifikasi ---------------------------------------------
        'unduh.label': 'Download',
        'unduh.titleLead': 'Ready to try',
        'unduh.lead': 'Install the APK file straight onto your Android device. Make sure your phone supports ARCore so scanning and drawing in AR space will work.',
        'unduh.repo': 'Repository',
        'unduh.specPlatform': 'Platform',
        'unduh.specPlatformNote': 'API level 26 and above',
        'unduh.specVersion': 'Version',
        'unduh.specVersionNote': 'APK file, manual install',
        'unduh.specAr': 'AR technology',
        'unduh.specArNote': 'Via Unity AR Foundation',
        'unduh.specPerms': 'Permissions',
        'unduh.specPermsValue': 'Camera & internet',
        'unduh.specPermsNote': 'For AR and catalogue sync',

        // -- Footer ----------------------------------------------------------
        'footer.about': 'An Augmented Reality batik motif learning app, developed as part of research at Politeknik Elektronika Negeri Surabaya.',
        'footer.tim': 'Research Team',
        'footer.support': 'Supported by',
        'footer.sponsorAlt': 'Supporter logo',
        'footer.galeriAbout': 'The motifs in this gallery are synced from the app catalogue, so what you see here is what the AR camera can recognise.',
        'footer.nav': 'Navigation',
        'footer.navFitur': 'App features',
        'footer.navCara': 'How it works',
        'footer.navKustomisasi': 'Motif customisation',
        'footer.backHome': 'Back to home',

        // -- Lightbox & tampilan pindai --------------------------------------
        'lightbox.close': 'Close',
        'lightbox.prev': 'Previous motif',
        'lightbox.next': 'Next motif',
        'lightbox.scanCta': 'Show for scanning',
        'scan.close': 'Close scan view',

        // -- Halaman galeri --------------------------------------------------
        'galeriPage.back': 'Home',
        'galeriPage.titleLead': 'Every motif the app',
        'galeriPage.titleAccent': 'is able to scan',
        'galeriPage.lead': 'Click a motif to see the large version along with its description, then press <em class="kw-emas">Show for scanning</em> so the image fills the screen, and point the app camera at this screen.',
        'galeriPage.searchPlaceholder': 'Search motif name…',
        'galeriPage.searchLabel': 'Search batik motifs',
        'galeriPage.searchClear': 'Clear search',
        'galeriPage.emptyTitle': 'No motifs found',
        'galeriPage.emptyHint': 'Try another keyword, for example “parang” or “kawung”.',
        'galeriPage.errorTitle': 'Catalogue failed to load',
        'galeriPage.errorHint': 'assets/data/motifs.json could not be read. Open this page over a web server (not file://), then reload.',
        'galeriPage.resultCount_one': 'Showing {shown} of {total} motif',
        'galeriPage.resultCount_other': 'Showing {shown} of {total} motifs',
        'galeriPage.pageInfo': 'Page {page} / {pages}',
        'galeriPage.prev': 'Previous',
        'galeriPage.next': 'Next',
        'galeriPage.prevLabel': 'Previous page',
        'galeriPage.nextLabel': 'Next page',

        'common.langAnnounce': 'Language changed to English.'
    }
};
