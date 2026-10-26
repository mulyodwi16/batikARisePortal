// Gallery data — dimuat dinamis dari assets/data/motifs.json.
// File itu di-generate oleh tools/sync-motifs.mjs (sinkron dari PlayFab MOTIF_LIST),
// jadi daftar motif di sini mengikuti yang ada di aplikasi Unity.
let galleryData = [];
let currentIndex = 0;

// Daftar cadangan kalau motifs.json gagal dimuat (mis. dibuka via file://),
// sehautomatis galeri tetap menampilkan katalog dasar.
const fallbackGallery = [
    { src: 'assets/batik/1_MotifLiris.jpg', caption: 'Motif Liris', desc: '' },
    { src: 'assets/batik/2_MotifAlunAlunContong.jpg', caption: 'Motif Alun-Alun Contong', desc: '' },
    { src: 'assets/batik/3_MotifBurungMerak.jpg', caption: 'Motif Burung Merak', desc: '' },
    { src: 'assets/batik/4_MotifSekarJagad.jpg', caption: 'Motif Sekar Jagad', desc: '' },
    { src: 'assets/batik/5_MotifParangJabon.jpg', caption: 'Motif Parang Jabon', desc: '' },
    { src: 'assets/batik/6_MotifLovePutihan.jpg', caption: 'Motif Love Putihan', desc: '' }
];

async function loadGallery() {
    const grid = document.getElementById('galeri-grid');
    const status = document.getElementById('galeri-status');
    try {
        const res = await fetch('assets/data/motifs.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        if (items.length === 0) throw new Error('Daftar motif kosong');
        galleryData = items.map(m => ({
            src: m.image || m.imageUrl || '',
            caption: m.nama || 'Motif Batik',
            desc: m.deskripsi || ''
        }));
        if (status) status.textContent = '';
    } catch (err) {
        console.warn('[galeri] Gagal memuat motifs.json, memakai daftar cadangan:', err.message);
        galleryData = fallbackGallery;
        if (status) {
            status.textContent = 'Menampilkan katalog dasar (sinkronisasi terbaru belum dimuat).';
        }
    }
    renderGallery(grid);
}

function renderGallery(grid) {
    if (!grid) return;
    grid.innerHTML = '';
    galleryData.forEach((item, index) => {
        const card = document.createElement('div');
        // Sengaja tanpa atribut data-aos: AOS.init() sudah jalan sebelum kartu ini
        // dibuat, jadi kalau pakai data-aos kartu bisa tersangkut opacity:0.
        card.className = 'gallery-item rounded-2xl overflow-hidden shadow-xl cursor-pointer';
        card.style.animation = `fadeInUp 0.6s ease-out ${(index % 3) * 0.1}s both`;
        card.addEventListener('click', () => openLightbox(index));

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
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadGallery);

// Lightbox functions
function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

function prevLightbox() {
    currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
    updateLightbox();
}

function nextLightbox() {
    currentIndex = (currentIndex + 1) % galleryData.length;
    updateLightbox();
}

function updateLightbox() {
    const img = document.getElementById('lightbox-image');
    const caption = document.getElementById('lightbox-caption');
    const desc = document.getElementById('lightbox-desc');
    const item = galleryData[currentIndex];
    if (!item) return;

    // Smooth fade effect
    img.style.opacity = '0';
    setTimeout(() => {
        img.src = item.src;
        caption.textContent = item.caption;
        if (desc) desc.textContent = item.desc || '';
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '1';
    }, 150);
}

// Scan view: tampilan bersih layar-penuh (background putih, tanpa UI)
// agar motif mudah dipindai kamera AR saat demo.
function openScanView() {
    const item = galleryData[currentIndex];
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

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const scan = document.getElementById('scan-view');
    if (scan && scan.style.display === 'flex') {
        if (e.key === 'Escape') closeScanView();
        return;
    }

    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
});

// Click outside lightbox to close
document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// Mobile menu with smooth toggle and animation
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuBtnSvg = menuBtn?.querySelector('svg');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');

        // Animate hamburger to X
        if (!isHidden) {
            menuBtn.style.transform = 'rotate(0deg)';
            menuBtnSvg.style.transform = 'rotate(0deg)';
        } else {
            menuBtn.style.transform = 'rotate(90deg)';
            menuBtnSvg.style.transform = 'rotate(90deg)';
        }
    });

    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuBtn.style.transform = 'rotate(0deg)';
            if (menuBtnSvg) menuBtnSvg.style.transform = 'rotate(0deg)';
        });
    });
}

// Navbar is now fixed with solid brown color - no scroll effects needed// Active link highlighting with smooth transition
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
    let current = '';
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('text-batik-gold');
        link.style.transform = 'scale(1)';
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('text-batik-gold');
            link.style.transform = 'scale(1.1)';
        }
    });
}, { passive: true });

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

