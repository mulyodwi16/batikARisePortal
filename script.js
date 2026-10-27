// Landing page (index.html): menampilkan SOROTAN motif (maks. 8).
// Logika inti (lightbox, scan view, menu) ada di assets/js/batik-gallery.js.
// Katalog penuh + pencarian + paginasi ada di galeri.html / galeri.js.

const FEATURED_LIMIT = 6;

async function initLanding() {
    const grid = document.getElementById('galeri-grid');
    const status = document.getElementById('galeri-status');

    const all = await BatikGallery.loadMotifs();
    const featured = all.slice(0, FEATURED_LIMIT);

    // Navigasi lightbox hanya mencakup motif yang ditampilkan di preview.
    BatikGallery.setActiveList(featured);

    if (grid) {
        grid.innerHTML = '';
        featured.forEach((item, i) => {
            grid.appendChild(BatikGallery.createMotifCard(item, i, BatikGallery.openLightbox));
        });
    }

    if (status) {
        if (BatikGallery.didUseFallback()) {
            status.textContent = 'Menampilkan katalog dasar (sinkronisasi terbaru belum dimuat).';
        } else {
            status.textContent = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    BatikGallery.initLightboxControls();
    BatikGallery.initMobileMenu();
    BatikGallery.initAnchorScroll();
    BatikGallery.initScrollFx();
    initLanding();
});

// Highlight link navigasi aktif saat scroll (khusus landing dengan section anchor).
// Hanya section yang punya id dan dirujuk nav yang dihitung, biar section dekoratif
// tanpa id tidak mereset penanda aktif.
const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));

window.addEventListener('scroll', () => {
    let current = '';
    navLinks.forEach(link => {
        const section = document.getElementById(link.getAttribute('href').slice(1));
        if (section && window.scrollY >= section.offsetTop - 200) {
            current = section.id;
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href').slice(1) === current);
    });
}, { passive: true });
