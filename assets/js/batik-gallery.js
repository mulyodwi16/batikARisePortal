// ===========================================================================
// batik-gallery.js — inti bersama untuk index.html (preview) & galeri.html (penuh).
//
// Menyediakan BatikGallery global:
//   - loadMotifs()           : fetch assets/data/motifs.json (fallback ke seed)
//   - createMotifCard(item,i): bikin kartu galeri + klik -> buka lightbox
//   - setActiveList(list)    : daftar yang sedang ditampilkan (untuk navigasi lightbox)
//   - openLightbox / scan view / navigasi keyboard : dipakai kedua halaman
//   - initMobileMenu()       : toggle menu mobile (markup sama di kedua halaman)
//
// Sumber data = assets/data/motifs.json (di-generate tools/sync-motifs.mjs dari
// PlayFab MOTIF_LIST). Gambar yang tampil = trigger scan AR yang sama di Unity.
// ===========================================================================

const BatikGallery = (() => {
    // Daftar cadangan kalau motifs.json gagal dimuat (mis. dibuka via file://).
    const fallbackGallery = [
        { src: 'assets/batik/1_MotifLiris.jpg', caption: 'Motif Liris', desc: '' },
        { src: 'assets/batik/2_MotifAlunAlunContong.jpg', caption: 'Motif Alun-Alun Contong', desc: '' },
        { src: 'assets/batik/3_MotifBurungMerak.jpg', caption: 'Motif Burung Merak', desc: '' },
        { src: 'assets/batik/4_MotifSekarJagad.jpg', caption: 'Motif Sekar Jagad', desc: '' },
        { src: 'assets/batik/5_MotifParangJabon.jpg', caption: 'Motif Parang Jabon', desc: '' },
        { src: 'assets/batik/6_MotifLovePutihan.jpg', caption: 'Motif Love Putihan', desc: '' }
    ];

    // activeList = apa yang saat ini bisa dinavigasi di lightbox (hasil filter/paginasi).
    let activeList = [];
    let currentIndex = 0;
    let usedFallback = false;

    // -- Pemuatan data -------------------------------------------------------
    async function loadMotifs() {
        try {
            const res = await fetch('assets/data/motifs.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            const items = Array.isArray(data.items) ? data.items : [];
            if (items.length === 0) throw new Error('Daftar motif kosong');
            usedFallback = false;
            return items.map(m => ({
                src: m.image || m.imageUrl || '',
                caption: m.nama || 'Motif Batik',
                desc: m.deskripsi || ''
            }));
        } catch (err) {
            console.warn('[galeri] Gagal memuat motifs.json, memakai daftar cadangan:', err.message);
            usedFallback = true;
            return fallbackGallery.slice();
        }
    }

    function didUseFallback() {
        return usedFallback;
    }

    // -- Pembuatan kartu -----------------------------------------------------
    // onClick(index) dipanggil saat kartu diklik — pemanggil yang mengatur
    // setActiveList sebelum render agar index lightbox cocok.
    function createMotifCard(item, index, onClick) {
        const card = document.createElement('div');
        // Sengaja tanpa data-aos: animasi pakai CSS fadeInUp agar tak tersangkut opacity:0.
        card.className = 'gallery-item rounded-2xl overflow-hidden shadow-xl cursor-pointer';
        card.style.animation = `fadeInUp 0.5s ease-out ${(index % 3) * 0.08}s both`;
        card.addEventListener('click', () => onClick(index));

        const img = document.createElement('img');
        img.src = item.src;
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

    return {
        loadMotifs,
        didUseFallback,
        createMotifCard,
        setActiveList,
        openLightbox,
        closeLightbox,
        prevLightbox,
        nextLightbox,
        openScanView,
        closeScanView,
        initLightboxControls,
        initMobileMenu,
        initAnchorScroll
    };
})();

// Ekspos fungsi lightbox ke global agar atribut onclick="..." di HTML tetap jalan.
window.closeLightbox = BatikGallery.closeLightbox;
window.prevLightbox = BatikGallery.prevLightbox;
window.nextLightbox = BatikGallery.nextLightbox;
window.openScanView = BatikGallery.openScanView;
window.closeScanView = BatikGallery.closeScanView;
