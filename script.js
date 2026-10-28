// Landing page (index.html): menampilkan SOROTAN motif.
// Logika inti (lightbox, scan view, menu) ada di assets/js/batik-gallery.js.
// Katalog penuh + pencarian + paginasi ada di galeri.html / galeri.js.

const FEATURED_LIMIT = 6;
const MARQUEE_LIMIT = 10;   // menahan landing agar tak menarik seluruh katalog 2x

let totalMotifs = 0;

// Dipisah dari initLanding() karena harus dijalankan ulang saat bahasa berganti.
// I18n.apply() sudah mengembalikan label CTA ke galeri.ctaAll (tanpa angka) sesaat
// sebelum event, jadi fungsi ini yang memasang kembali angkanya.
function renderLandingText() {
    const status = document.getElementById('galeri-status');
    const ctaCount = document.getElementById('galeri-cta-count');

    // Angkanya sengaja dari seluruh katalog, bukan jumlah sorotan — inilah yang
    // memberi tahu pengunjung bahwa koleksinya lebih besar dari 6 kartu ini.
    // Saat data gagal dimuat label dibiarkan apa adanya: lebih baik tanpa angka
    // daripada mengarang jumlah.
    if (ctaCount && totalMotifs > 0) {
        ctaCount.textContent = t('galeri.ctaCount', { total: totalMotifs, count: totalMotifs });
    }

    if (status) {
        status.textContent = BatikGallery.getLoadError() ? t('galeri.loadError') : '';
    }
}

async function initLanding() {
    const grid = document.getElementById('galeri-grid');

    const all = await BatikGallery.loadMotifs();
    const featured = all.slice(0, FEATURED_LIMIT);
    totalMotifs = all.length;

    // Navigasi lightbox hanya mencakup motif yang ditampilkan di preview.
    BatikGallery.setActiveList(featured);
    BatikGallery.renderMarquee(all, { limit: MARQUEE_LIMIT });

    if (grid) {
        grid.innerHTML = '';
        featured.forEach((item, i) => {
            grid.appendChild(BatikGallery.createMotifCard(item, i, BatikGallery.openLightbox));
        });
    }

    renderLandingText();
}

document.addEventListener('DOMContentLoaded', () => {
    BatikGallery.initLightboxControls();
    BatikGallery.initMobileMenu();
    BatikGallery.initAnchorScroll();
    BatikGallery.initScrollFx();
    initLanding();
});

document.addEventListener('i18n:changed', renderLandingText);

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
