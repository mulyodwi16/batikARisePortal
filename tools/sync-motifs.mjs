#!/usr/bin/env node
// Sinkronisasi katalog motif portal dari PlayFab MOTIF_LIST (sumber yang sama
// dengan aplikasi Unity). Dijalankan GitHub Actions tiap hari + bisa manual.
//
// Alurnya:
//   1. Login PlayFab dengan akun terdaftar. Login anonim TIDAK bisa dipakai:
//      title ini menolak LoginWithCustomID dengan "PlayerCreationDisabled"
//      (errorCode 22000), jadi email/password wajib ada.
//   2. GetTitleData(MOTIF_LIST) -> daftar motif global semua Batik Artist.
//   3. Tiap imageUrl di-resolve: URL http(s) lama dipakai langsung; path Supabase
//      ditukar signed URL lewat Edge Function get-download-url (butuh ticket).
//   4. Download tiap gambar ke assets/batik/, buang file yang sudah tak dirujuk,
//      lalu tulis assets/data/motifs.json.
//
// Portal cuma membaca motifs.json -> tetap 100% statis & anti-gagal saat demo,
// tapi isinya identik dengan yang dilihat user di aplikasi.
//
// WAJIB dilanjutkan `npm run optimize`: langkah 4 menyimpan gambar MENTAH dari
// Supabase (~1 MB/motif) dan belum membuat thumbnail yang dirujuk field `thumb`.
//
// Pemakaian:
//   isi .env (lihat .env.example), lalu `npm run sync`
//
// Env opsional:
//   PLAYFAB_TITLE_ID   (default 116550)
//   SUPABASE_URL       (default https://cltghzfmtxxjodpkdesr.supabase.co)
//   SUPABASE_ANON_KEY  (default anon key publik aplikasi)
//   TITLE_DATA_KEY     (default MOTIF_LIST)

import { writeFile, readFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IMG_DIR = join(ROOT, 'assets', 'batik');
const THUMB_DIR = join(IMG_DIR, 'thumb');
const DATA_FILE = join(ROOT, 'assets', 'data', 'motifs.json');

// Di lokal kredensial datang dari .env; di CI dari GitHub Secrets (tanpa file).
try { process.loadEnvFile(join(ROOT, '.env')); } catch { /* tanpa .env: pakai env proses */ }

const TITLE_ID = process.env.PLAYFAB_TITLE_ID || '116550';
const EMAIL = process.env.PLAYFAB_EMAIL;
const PASSWORD = process.env.PLAYFAB_PASSWORD;
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://cltghzfmtxxjodpkdesr.supabase.co').replace(/\/+$/, '');
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'sb_publishable_bxzsRmknYn9s66NDgjEEyA_68_AUk60';
const TITLE_DATA_KEY = process.env.TITLE_DATA_KEY || 'MOTIF_LIST';

function die(msg) {
    console.error('\n[sync-motifs] ERROR: ' + msg + '\n');
    process.exit(1);
}

function slugify(s) {
    return (s || 'motif')
        .toLowerCase()
        .normalize('NFKD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'motif';
}

function isHttp(v) {
    return typeof v === 'string' && /^https?:\/\//i.test(v);
}

function extFromPath(p) {
    const e = extname((p || '').split('?')[0]).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(e) ? e : '.jpg';
}

// Nama file sengaja TIDAK memakai prefiks indeks: indeks bergeser setiap ada
// motif disisipkan/dihapus, sehingga seluruh gambar tertulis ulang di git tiap
// sinkronisasi. Suffiks hash batikId menjaga nama tetap unik kalau dua motif
// kebetulan bernama sama.
function baseNameFor(m) {
    const hash = createHash('sha1').update(String(m.batikId || m.nama || '')).digest('hex').slice(0, 6);
    return slugify(m.nama) + '-' + hash;
}

async function playfabLogin() {
    if (!EMAIL || !PASSWORD) {
        die('Set PLAYFAB_EMAIL dan PLAYFAB_PASSWORD (lihat .env.example).\n'
            + '  Login anonim tidak tersedia: title ini menolak LoginWithCustomID\n'
            + '  dengan "PlayerCreationDisabled" (errorCode 22000).');
    }
    const res = await fetch(`https://${TITLE_ID}.playfabapi.com/Client/LoginWithEmailAddress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TitleId: TITLE_ID, Email: EMAIL, Password: PASSWORD })
    });
    const json = await res.json();
    if (!res.ok || !json.data || !json.data.SessionTicket) {
        die('Login PlayFab gagal: ' + (json.errorMessage || res.status));
    }
    console.log('[sync-motifs] Login PlayFab OK (PlayFabId=' + json.data.PlayFabId + ')');
    return json.data.SessionTicket;
}

async function getMotifList(ticket) {
    const res = await fetch(`https://${TITLE_ID}.playfabapi.com/Client/GetTitleData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Authorization': ticket },
        body: JSON.stringify({ Keys: [TITLE_DATA_KEY] })
    });
    const json = await res.json();
    if (!res.ok || !json.data) die('GetTitleData gagal: ' + (json.errorMessage || res.status));
    const raw = json.data.Data ? json.data.Data[TITLE_DATA_KEY] : null;
    if (!raw) die(`TitleData "${TITLE_DATA_KEY}" kosong.`);
    let parsed;
    try { parsed = JSON.parse(raw); } catch (e) { die('JSON MOTIF_LIST tak valid: ' + e.message); }
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    if (items.length === 0) die('MOTIF_LIST tidak berisi item.');
    console.log('[sync-motifs] MOTIF_LIST berisi ' + items.length + ' motif.');
    return items;
}

// Tukar path Supabase privat jadi signed URL via Edge Function (butuh ticket PlayFab).
async function resolveImageUrl(pathOrUrl, ticket) {
    if (isHttp(pathOrUrl)) return pathOrUrl; // URL legacy (mis. Cloudinary) sudah publik
    const res = await fetch(`${SUPABASE_URL}/functions/v1/get-download-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': 'Bearer ' + SUPABASE_ANON
        },
        body: JSON.stringify({ playFabSessionTicket: ticket, path: pathOrUrl })
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`get-download-url HTTP ${res.status}: ${text}`);
    let json;
    try { json = JSON.parse(text); } catch { throw new Error('respons get-download-url bukan JSON: ' + text); }
    if (!json.signedUrl) throw new Error('signedUrl kosong: ' + text);
    return isHttp(json.signedUrl) ? json.signedUrl : `${SUPABASE_URL}/${json.signedUrl.replace(/^\/+/, '')}`;
}

async function downloadTo(url, destPath) {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`download HTTP ${res.status}`);
    await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

async function readExistingItems() {
    try {
        const parsed = JSON.parse(await readFile(DATA_FILE, 'utf8'));
        return Array.isArray(parsed.items) ? parsed.items : null;
    } catch {
        return null;
    }
}

// Buang gambar yang tak lagi dirujuk katalog (motif dihapus artist, atau sisa
// skema nama lama). Tanpa ini assets/batik/ hanya tumbuh.
async function pruneStale(dir, keepNames) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return []; }
    const removed = [];
    for (const e of entries) {
        if (!e.isFile() || e.name.startsWith('.')) continue;
        if (keepNames.has(e.name)) continue;
        await unlink(join(dir, e.name));
        removed.push(e.name);
    }
    return removed;
}

async function main() {
    await mkdir(THUMB_DIR, { recursive: true });
    await mkdir(dirname(DATA_FILE), { recursive: true });

    const ticket = await playfabLogin();
    const motifs = await getMotifList(ticket);

    const out = [];
    const keepImages = new Set();
    const keepThumbs = new Set();

    for (let i = 0; i < motifs.length; i++) {
        const m = motifs[i];
        const base = baseNameFor(m);
        const fileName = base + extFromPath(m.imageUrl);
        const thumbName = base + '.webp';
        try {
            const url = await resolveImageUrl(m.imageUrl, ticket);
            await downloadTo(url, join(IMG_DIR, fileName));
            console.log(`[sync-motifs] (${i + 1}/${motifs.length}) ${m.nama} -> assets/batik/${fileName}`);
            keepImages.add(fileName);
            keepThumbs.add(thumbName);
            out.push({
                batikId: m.batikId || base,
                nama: m.nama || 'Motif Batik',
                deskripsi: m.deskripsi || '',
                image: 'assets/batik/' + fileName,
                thumb: 'assets/batik/thumb/' + thumbName,
                artistId: m.artistId || '',
                createdAt: m.createdAt || ''
            });
        } catch (e) {
            console.warn(`[sync-motifs] GAGAL motif "${m.nama}": ${e.message} (dilewati)`);
        }
    }

    if (out.length === 0) die('Tak ada motif yang berhasil diunduh.');

    const removed = [
        ...await pruneStale(IMG_DIR, keepImages),
        ...await pruneStale(THUMB_DIR, keepThumbs)
    ];
    for (const n of removed) console.log(`[sync-motifs] buang file tak terpakai: ${n}`);

    // `generatedAt` sengaja hanya diperbarui saat `items` benar-benar berubah.
    // Kalau selalu ditulis, CI harian akan menghasilkan commit kosong terus.
    const existing = await readExistingItems();
    if (existing && JSON.stringify(existing) === JSON.stringify(out)) {
        console.log(`\n[sync-motifs] Selesai. ${out.length} motif, katalog tidak berubah`
            + ' (motifs.json tidak ditulis ulang).');
    } else {
        await writeFile(DATA_FILE, JSON.stringify({
            generatedAt: new Date().toISOString(),
            source: 'playfab:' + TITLE_DATA_KEY,
            items: out
        }, null, 2) + '\n', 'utf8');
        const delta = existing ? out.length - existing.length : out.length;
        console.log(`\n[sync-motifs] Selesai. ${out.length} motif ditulis ke assets/data/motifs.json`
            + (existing ? ` (${delta >= 0 ? '+' : ''}${delta} dari sebelumnya)` : ''));
    }

    console.log('[sync-motifs] Lanjutkan `npm run optimize` — gambar hasil unduh masih mentah'
        + ' dan thumbnail belum dibuat.');
}

main().catch(e => die(e.stack || e.message));
