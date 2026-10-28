// ===========================================================================
// batik-gallery.js: inti bersama untuk index.html (preview) & galeri.html (penuh).
//
// Menyediakan BatikGallery global:
//   - loadMotifs()           : fetch assets/data/motifs.json
//   - createMotifCard(item,i): bikin kartu galeri + klik -> buka lightbox
//   - renderMarquee(items)   : isi .marquee-track di landing
//   - setActiveList(list)    : daftar yang sedang ditampilkan (untuk navigasi lightbox)
//   - openLightbox / scan view / navigasi keyboard : dipakai kedua halaman
//   - initMobileMenu()       : toggle menu mobile (markup sama di kedua halaman)
//
// Sumber data = assets/data/motifs.json (di-generate tools/sync-motifs.mjs dari
// PlayFab MOTIF_LIST). Gambar yang tampil = trigger scan AR yang sama di Unity.
//
// Tiap item punya dua URL gambar: `thumb` (WebP 560px) untuk kartu & marquee,
// `src` (JPEG ukuran penuh) untuk lightbox & mode dipindai yang butuh ketajaman.
// ===========================================================================

const BatikGallery = (() => {
    // activeList = apa yang saat ini bisa dinavigasi di lightbox (hasil filter/paginasi).
    let activeList = [];
    let currentIndex = 0;
    let loadError = '';

    // -- Pemuatan data -------------------------------------------------------
    // Sengaja TANPA katalog cadangan. Daftar seed 6 motif yang dulu dipakai di
    // sini membuat sinkronisasi yang gagal terlihat seperti galeri normal, jadi
    // katalog basi berbulan-bulan tanpa ada yang sadar.
    async function loadMotifs() {
        try {
            const res = await fetch('assets/data/motifs.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            const items = Array.isArray(data.items) ? data.items : [];
            if (items.length === 0) throw new Error('Daftar motif kosong');
            loadError = '';
            return items.map(m => ({
                src: m.image || m.imageUrl || '',
                thumb: m.thumb || m.image || m.imageUrl || '',
                caption: m.nama || 'Motif Batik',
                desc: m.deskripsi || ''
            }));
        } catch (err) {
            console.error('[galeri] Gagal memuat assets/data/motifs.json:', err.message);
            loadError = err.message;
            return [];
        }
    }

    function getLoadError() {
        return loadError;
    }

    // -- Pembuatan kartu -----------------------------------------------------
    // onClick(index) dipanggil saat kartu diklik. Pemanggil yang mengatur
    // setActiveList sebelum render agar index lightbox cocok.
    function createMotifCard(item, index, onClick) {
        const card = document.createElement('div');
        // Sengaja tanpa data-aos: animasi pakai CSS fadeInUp agar tak tersangkut opacity:0.
        card.className = 'gallery-item rounded-2xl overflow-hidden shadow-xl cursor-pointer';
        card.style.animation = `fadeInUp 0.5s ease-out ${(index % 3) * 0.08}s both`;
        card.addEventListener('click', () => onClick(index));

        // Spotlight mengikuti kursor, dibaca oleh .gallery-item::before via --mx/--my.
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });

        const img = document.createElement('img');
        img.src = item.thumb || item.src;
        img.alt = item.caption;
        img.className = 'w-full h-72 object-cover';
        img.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        const label = document.createElement('p');
        label.className = 'font-heading font-bold text-lg text-white';
        label.textContent = item.caption;
        overlay.appendChild(label);

        card.appendChild(img);
        card.appendChild(overlay);
        return card;
    }

    // -- Marquee (landing) ---------------------------------------------------
    // Track diisi dua kali: daftar asli + duplikat aria-hidden, karena animasi
    // berhenti di translateX(-50%) sehingga separuh kedua yang menutup loop.
    //
    // Durasi WAJIB dihitung dari jumlah item. CSS memakai nilai tetap, jadi
    // menambah motif mempercepat scroll (6 motif ~25px/s, 23 motif ~96px/s).
    // `limit` menahan landing agar tidak menarik seluruh katalog dua kali.
    function renderMarquee(items, options) {
        const track = document.querySelector('.marquee-track');
        if (!track) return;
        const list = items.slice(0, (options && options.limit) || 10);
        track.innerHTML = '';
        if (list.length === 0) return;

        for (const isDuplicate of [false, true]) {
            for (const item of list) {
                const link = document.createElement('a');
                link.href = 'galeri.html';
                link.className = 'marquee-item';
                if (isDuplicate) {
                    link.setAttribute('aria-hidden', 'true');
                    link.tabIndex = -1;
                }
                const img = document.createElement('img');
                img.src = item.thumb || item.src;
                img.alt = isDuplicate ? '' : item.caption;
                img.loading = 'lazy';
                link.appendChild(img);
                track.appendChild(link);
            }
        }
        track.style.animationDuration = Math.max(30, list.length * 8) + 's';
    }

    // -- Lightbox ------------------------------------------------------------
    function setActiveList(list) {
        activeList = Array.isArray(list) ? list : [];
    }

    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function prevLightbox() {
        if (activeList.length === 0) return;
        currentIndex = (currentIndex - 1 + activeList.length) % activeList.length;
        updateLightbox();
    }

    function nextLightbox() {
        if (activeList.length === 0) return;
        currentIndex = (currentIndex + 1) % activeList.length;
        updateLightbox();
    }

    function updateLightbox() {
        const img = document.getElementById('lightbox-image');
        const caption = document.getElementById('lightbox-caption');
        const desc = document.getElementById('lightbox-desc');
        const item = activeList[currentIndex];
        if (!item) return;

        img.style.opacity = '0';
        setTimeout(() => {
            img.src = item.src;
            caption.textContent = item.caption;
            if (desc) desc.textContent = item.desc || '';
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '1';
        }, 150);
    }

    // -- Scan view (layar penuh putih untuk dipindai kamera AR) --------------
    function openScanView() {
        const item = activeList[currentIndex];
        if (!item) return;
        const scan = document.getElementById('scan-view');
        document.getElementById('scan-image').src = item.src;
        document.getElementById('scan-caption').textContent = item.caption;
        scan.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    }

    function closeScanView() {
        const scan = document.getElementById('scan-view');
        scan.style.display = 'none';
        document.body.style.overflow = 'hidden'; // lightbox masih terbuka
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    }

    // -- Pasang handler global (keyboard + klik di luar) ---------------------
    function initLightboxControls() {
        document.addEventListener('keydown', (e) => {
            const scan = document.getElementById('scan-view');
            if (scan && scan.style.display === 'flex') {
                if (e.key === 'Escape') closeScanView();
                return;
            }
            const lightbox = document.getElementById('lightbox');
            if (!lightbox || !lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevLightbox();
            if (e.key === 'ArrowRight') nextLightbox();
        });

        document.getElementById('lightbox')?.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') closeLightbox();
        });
    }

    // -- Menu mobile ---------------------------------------------------------
    function initMobileMenu() {
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuBtnSvg = menuBtn?.querySelector('svg');
        if (!menuBtn || !mobileMenu) return;

        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            const deg = isHidden ? '90deg' : '0deg';
            menuBtn.style.transform = `rotate(${deg})`;
            if (menuBtnSvg) menuBtnSvg.style.transform = `rotate(${deg})`;
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuBtn.style.transform = 'rotate(0deg)';
                if (menuBtnSvg) menuBtnSvg.style.transform = 'rotate(0deg)';
            });
        });
    }

    // -- Smooth scroll untuk anchor di halaman yang sama ---------------------
    function initAnchorScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href.length < 2) return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // -- Efek saat scroll: navbar jadi kaca berembun + progress bar emas ------
    function initScrollFx() {
        const navbar = document.getElementById('navbar');
        const bar = document.getElementById('scroll-progress');
        if (!navbar && !bar) return;

        const onScroll = () => {
            const y = window.scrollY;
            if (navbar) navbar.classList.toggle('nav-scrolled', y > 40);
            if (bar) {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                bar.style.width = max > 0 ? `${Math.min(100, (y / max) * 100)}%` : '0%';
            }
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    return {
        loadMotifs,
        getLoadError,
        createMotifCard,
        renderMarquee,
        setActiveList,
        openLightbox,
        closeLightbox,
        prevLightbox,
        nextLightbox,
        openScanView,
        closeScanView,
        initLightboxControls,
        initMobileMenu,
        initAnchorScroll,
        initScrollFx
    };
})();

// Ekspos fungsi lightbox ke global agar atribut onclick="..." di HTML tetap jalan.
window.closeLightbox = BatikGallery.closeLightbox;
window.prevLightbox = BatikGallery.prevLightbox;
window.nextLightbox = BatikGallery.nextLightbox;
window.openScanView = BatikGallery.openScanView;
window.closeScanView = BatikGallery.closeScanView;
