// ============================================================
// download_assets.cjs – Tải audio phù hợp từ nguồn CC0/free
// Chạy: node download_assets.cjs
// ============================================================
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const audioDir = path.join(__dirname, 'public', 'assets', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

function download(filename, url) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(audioDir, filename);
        const file = fs.createWriteStream(filepath);
        const client = url.startsWith('https') ? https : http;
        client.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                fs.unlink(filepath, () => {});
                return download(filename, response.headers.location).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(filepath, () => {});
                return reject(new Error(`Status ${response.statusCode} for ${url}`));
            }
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

// ── Kenney Impact Sounds (CC0) ──────────────────────────────
// Dùng các bài có sẵn từ Phaser Examples làm nhạc game
const basePhaser = 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/';

// Nhạc BGM từ Phaser examples (CC/free)
const bgmTracks = {
    'bgm_menu.mp3':    basePhaser + 'oedipus_wizball_highscore.mp3',
    'bgm_tutorial.mp3': basePhaser + 'jungle.mp3',
    'bgm_stage1
<truncated 2145 bytes>