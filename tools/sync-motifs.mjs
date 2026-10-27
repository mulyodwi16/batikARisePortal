#!/usr/bin/env node
// Sinkronisasi katalog motif portal dari PlayFab MOTIF_LIST (sumber yang sama
// dengan aplikasi Unity). Dijalankan manual/di CI tiap motif berubah.
//
// Alurnya persis seperti user biasa di aplikasi:
//   1. Login PlayFab (akun yang sudah ada — guest-creation dimatikan di title ini).
//   2. GetTitleData(MOTIF_LIST) -> daftar motif global semua Batik Artist.
//   3. Tiap imageUrl di-resolve: URL http(s) lama dipakai langsung; path Supabase
//      ditukar signed URL lewat Edge Function get-download-url (butuh ticket).
//   4. Download tiap gambar ke assets/batik/ dan tulis assets/data/motifs.json.
//
// Portal (script.js) cuma membaca motifs.json -> tetap 100% statis & anti-gagal
// saat demo, tapi isinya identik dengan yang dilihat user di aplikasi.
//
// Pemakaian (PowerShell/bash):
//   PLAYFAB_EMAIL=you@example.com PLAYFAB_PASSWORD=secret node tools/sync-motifs.mjs
//
// Env opsional:
//   PLAYFAB_TITLE_ID   (default 116550)
//   SUPABASE_URL       (default https://cltghzfmtxxjodpkdesr.supabase.co)
//   SUPABASE_ANON_KEY  (default anon key publik aplikasi)
//   TITLE_DATA_KEY     (default MOTIF_LIST)

import { writeFile, mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IMG_DIR = join(ROOT, 'assets', 'batik');
const DATA_FILE = join(ROOT, 'assets', 'data', 'motifs.json');

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

async function playfabLogin() {
    if (!EMAIL || !PASSWORD) {
        die('Set PLAYFAB_EMAIL dan PLAYFAB_PASSWORD (akun PlayFab yang sudah terdaftar).');
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

async function main() {
    await mkdir(IMG_DIR, { recursive: true });
    await mkdir(dirname(DATA_FILE), { recursive: true });

    const ticket = await playfabLogin();
    const motifs = await getMotifList(ticket);

    const out = [];
    for (let i = 0; i < motifs.length; i++) {
        const m = motifs[i];
        const batikId = m.batikId || slugify(m.nama) + '-' + i;
        const localName = String(i + 1).padStart(2, '0') + '_' + slugify(m.nama) + extFromPath(m.imageUrl);
        const localRel = 'assets/batik/' + localName;
        try {
            const url = await resolveImageUrl(m.imageUrl, ticket);
            await downloadTo(url, join(IMG_DIR, localName));
            console.log(`[sync-motifs] (${i + 1}/${motifs.length}) ${m.nama} -> ${localRel}`);
            out.push({
                batikId,
                nama: m.nama || 'Motif Batik',
                deskripsi: m.deskripsi || '',
                image: localRel,
                artistId: m.artistId || '',
                createdAt: m.createdAt || ''
            });
        } catch (e) {
            console.warn(`[sync-motifs] GAGAL motif "${m.nama}": ${e.message} (dilewati)`);
        }
    }

    if (out.length === 0) die('Tak ada motif yang berhasil diunduh.');

    const payload = {
        generatedAt: new Date().toISOString(),
        source: 'playfab:' + TITLE_DATA_KEY,
        items: out
    };
    await writeFile(DATA_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    console.log(`\n[sync-motifs] Selesai. ${out.length} motif ditulis ke assets/data/motifs.json`);
    console.log('[sync-motifs] Jalankan `npm run optimize` — gambar hasil unduh masih mentah (~1 MB/motif).');
}

main().catch(e => die(e.stack || e.message));
