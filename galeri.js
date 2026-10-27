// galeri.html: katalog penuh dengan pencarian + paginasi sisi-klien.
// Inti (lightbox, scan view, kartu, menu) ada di assets/js/batik-gallery.js.

const PAGE_SIZE = 12;

let allMotifs = [];   // seluruh katalog
let filtered = [];    // hasil pencarian saat ini
let currentPage = 1;

const grid = () => document.getElementById('galeri-grid');
const resultCount = () => document.getElementById('result-count');
const emptyState = () => document.getElementById('empty-state');
const pagination = () => document.getElementById('pagination');
const pageInfo = () => document.getElementById('page-info');
const prevBtn = () => document.getElementById('page-prev');
const nextBtn = () => document.getElementById('page-next');

function totalPages() {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
}

function pageSlice() {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
}

function render() {
    const g = grid();
    const items = pageSlice();

    // Navigasi lightbox hanya mencakup motif di halaman yang sedang tampil.
    BatikGallery.setActiveList(items);

    g.innerHTML = '';
    items.forEach((item, i) => {
        g.appendChild(BatikGallery.createMotifCard(item, i, BatikGallery.openLightbox));
    });

    // Empty state vs grid
    const isEmpty = filtered.length === 0;
    emptyState().style.display = isEmpty ? 'block' : 'none';
    g.style.display = isEmpty ? 'none' : 'grid';

    // Hitungan hasil
    if (isEmpty) {
        resultCount().textContent = '';
    } else {
        resultCount().textContent = `Menampilkan ${items.length} dari ${filtered.length} motif`;
    }

    // Paginasi: sembunyikan kalau cuma 1 halaman
    const pages = totalPages();
    if (isEmpty || pages <= 1) {
        pagination().style.display = 'none';
    } else {
        pagination().style.display = 'flex';
        pageInfo().textContent = `Halaman ${currentPage} / ${pages}`;
        prevBtn().disabled = currentPage <= 1;
        nextBtn().disabled = currentPage >= pages;
    }
}

function applySearch(query) {
    const q = query.trim().toLowerCase();
    filtered = q === ''
        ? allMotifs.slice()
        : allMotifs.filter(m => (m.caption || '').toLowerCase().includes(q));
    currentPage = 1;
    render();
}

function goToPage(p) {
    const pages = totalPages();
    currentPage = Math.min(Math.max(1, p), pages);
    render();
    // Scroll ke atas grid agar user tahu halaman berganti.
    document.querySelector('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function initGaleri() {
    BatikGallery.initLightboxControls();
    BatikGallery.initMobileMenu();
    BatikGallery.initScrollFx();

    allMotifs = await BatikGallery.loadMotifs();
    filtered = allMotifs.slice();
    render();

    // Search
    const input = document.getElementById('search-input');
    const clear = document.getElementById('search-clear');
    input.addEventListener('input', () => {
        clear.classList.toggle('show', input.value.length > 0);
        applySearch(input.value);
    });
    clear.addEventListener('click', () => {
        input.value = '';
        clear.classList.remove('show');
        applySearch('');
        input.focus();
    });

    // Pagination
    prevBtn().addEventListener('click', () => goToPage(currentPage - 1));
    nextBtn().addEventListener('click', () => goToPage(currentPage + 1));
}

document.addEventListener('DOMContentLoaded', initGaleri);
