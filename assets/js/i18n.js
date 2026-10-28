// ===========================================================================
// i18n.js: runtime dwibahasa ID/EN untuk chrome portal.
//
// Markup:
//   data-i18n="kunci"                          -> textContent
//   data-i18n-html="kunci"                     -> innerHTML, hanya untuk teks
//                                                 yang memang punya markup inline
//   data-i18n-attr="placeholder:k1;alt:k2"     -> atribut
//
// String dinamis dari JS lewat t('kunci', { nama: nilai }). Angka diformat
// Intl.NumberFormat, dan kunci bersuffiks _one/_other dipilih Intl.PluralRules
// (perlu karena "Showing 1 of 1 motif" benar-benar terjadi saat pencarian).
//
// Halaman yang merender ulang teksnya sendiri harus mendengarkan event
// 'i18n:changed' di document.
//
// File ini dimuat di AKHIR <body>, setelah assets/i18n/dict.js. Keduanya script
// sinkron, jadi terjemahan terpasang sebelum frame pertama dan tidak perlu
// menyembunyikan <body> untuk mencegah kedipan teks.
//
// Jalankan dengan ?i18n=debug untuk mengaudit kunci.
// ===========================================================================

const I18n = (() => {
    const STORAGE_KEY = 'batikarise.lang';
    const DEFAULT_LANG = 'id';
    const SUPPORTED = ['id', 'en'];
    const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

    // Kunci yang hanya dipakai dari JS. Didaftarkan supaya mode audit tidak
    // melaporkannya sebagai kunci yatim.
    const DYNAMIC_KEYS = [
        'galeri.ctaCount', 'galeri.loadError',
        'galeriPage.resultCount', 'galeriPage.pageInfo',
        'galeriPage.errorTitle', 'galeriPage.errorHint',
        'common.langAnnounce'
    ];

    let lang = DEFAULT_LANG;

    function dict(l) {
        return (window.I18N && window.I18N[l]) || {};
    }

    // Sengaja TIDAK melihat navigator.language. Konten kanoniknya berbahasa
    // Indonesia dan audiensnya Indonesia, jadi auto-switch hanya menambah
    // risiko salah bahasa tanpa manfaat.
    function storedLang() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
        } catch {
            return DEFAULT_LANG;   // localStorage diblokir (mode privat)
        }
    }

    function getLang() {
        return lang;
    }

    function lookup(key, count) {
        const active = dict(lang);
        if (typeof count === 'number') {
            const plural = key + '_' + new Intl.PluralRules(lang).select(count);
            if (plural in active) return active[plural];
        }
        if (key in active) return active[key];
        const fallback = dict(DEFAULT_LANG);
        return key in fallback ? fallback[key] : key;
    }

    function t(key, vars) {
        let text = lookup(key, vars && typeof vars.count === 'number' ? vars.count : undefined);
        if (!vars) return text;
        for (const name of Object.keys(vars)) {
            const value = typeof vars[name] === 'number'
                ? new Intl.NumberFormat(lang).format(vars[name])
                : vars[name];
            text = text.split('{' + name + '}').join(value);
        }
        return text;
    }

    function apply(root) {
        const scope = root || document;
        scope.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.dataset.i18n);
        });
        scope.querySelectorAll('[data-i18n-html]').forEach(el => {
            // Isinya dari kamus yang kita tulis sendiri, bukan input pengguna.
            el.innerHTML = t(el.dataset.i18nHtml);
        });
        scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
            for (const pair of el.dataset.i18nAttr.split(';')) {
                const [attr, key] = pair.split(':');
                if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
            }
        });
    }

    function syncToggles() {
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
        });
    }

    function setLang(next) {
        lang = SUPPORTED.includes(next) ? next : DEFAULT_LANG;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* mode privat */ }

        document.documentElement.lang = lang;
        apply(document);
        syncToggles();

        const live = document.getElementById('lang-live');
        if (live) live.textContent = t('common.langAnnounce');

        document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
    }

    // Tombol WAJIB <button>, bukan <a href="#">: initAnchorScroll membajak semua
    // a[href^="#"] dan initMobileMenu menutup menu pada klik <a> apa pun.
    function initToggles() {
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.addEventListener('click', () => setLang(btn.dataset.lang));
        });
        syncToggles();
    }

    // -- Mode audit (?i18n=debug) -------------------------------------------
    function markupKeys() {
        const keys = new Set(DYNAMIC_KEYS);
        document.querySelectorAll('[data-i18n]').forEach(el => keys.add(el.dataset.i18n));
        document.querySelectorAll('[data-i18n-html]').forEach(el => keys.add(el.dataset.i18nHtml));
        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            for (const pair of el.dataset.i18nAttr.split(';')) {
                const key = pair.split(':')[1];
                if (key) keys.add(key.trim());
            }
        });
        return keys;
    }

    function audit() {
        const used = markupKeys();

        // 1. Kunci yang dipakai halaman ini tapi tidak ada di salah satu kamus.
        for (const l of SUPPORTED) {
            const defined = new Set(Object.keys(dict(l)).map(k => k.replace(PLURAL_SUFFIX, '')));
            const missing = [...used].filter(k => !defined.has(k));
            if (missing.length) console.warn(`[i18n] kamus "${l}" kehilangan ${missing.length} kunci:`, missing);
            else console.log(`[i18n] kamus "${l}": lengkap untuk halaman ini.`);
        }

        // 2. Kedua kamus harus punya himpunan kunci yang sama. Ini pemeriksaan
        //    yang tidak bergantung halaman — kunci halaman lain tidak bikin bising.
        const base = new Set(Object.keys(dict('id')).map(k => k.replace(PLURAL_SUFFIX, '')));
        const other = new Set(Object.keys(dict('en')).map(k => k.replace(PLURAL_SUFFIX, '')));
        const onlyId = [...base].filter(k => !other.has(k));
        const onlyEn = [...other].filter(k => !base.has(k));
        if (onlyId.length) console.warn('[i18n] hanya ada di "id":', onlyId);
        if (onlyEn.length) console.warn('[i18n] hanya ada di "en":', onlyEn);
        if (!onlyId.length && !onlyEn.length) console.log('[i18n] kedua kamus sinkron.');

        // 3. Kunci kamus yang tak dipakai halaman mana pun tidak bisa dideteksi
        //    dari satu halaman, jadi sengaja tidak dilaporkan.
    }

    // Dijalankan langsung, bukan di DOMContentLoaded: file ini duduk di akhir
    // <body>, jadi seluruh markup sudah terparsir dan terjemahan terpasang
    // sebelum browser melukis. Menunggu DOMContentLoaded justru memunculkan
    // kedipan teks Indonesia bagi pengunjung yang memilih EN.
    lang = storedLang();
    document.documentElement.lang = lang;
    apply(document);
    initToggles();
    if (new URLSearchParams(location.search).get('i18n') === 'debug') audit();

    return { t, apply, setLang, getLang };
})();

// Dipakai langsung dari script.js / galeri.js.
const t = I18n.t;
