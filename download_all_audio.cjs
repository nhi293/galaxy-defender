const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'public', 'assets', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

// Tat ca nhac tu Phaser examples (CC/free) - phu hop the loai game
const files = {
    // Nhac chua co hoac muon thay the
    'bgm_menu.mp3':     'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/oedipus_wizball_highscore.mp3',
    'bgm_tutorial.mp3': 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/jungle.mp3',
    'bgm_stage1.mp3':   'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/CatAstroPhi_shmup_normal.mp3',
    'bgm_stage2.mp3':   'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3',
    'bgm_stage3.mp3':   'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/jungle.mp3',
    'bgm_stage4.mp3':   'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/oedipus_wizball_highscore.mp3',
    'bgm_stage5.mp3':   'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3',
    'bgm_boss.mp3':     'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3',
    'bgm_victory.mp3':  'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/oedipus_wizball_highscore.mp3',
    'bgm_gameover.mp3': 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/jungle.mp3',
    // SFX
    'sfx_shoot.wav':      'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/blaster.mp3',
    'sfx_explosion.wav':  'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/explosion.mp3',
    'sfx_hit.wav':        'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/player_hit.wav',
    'sfx_upgrade.mp3':    'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/coin.wav',
    'sfx_siren.mp3':      'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/explosion.mp3',
};

function download(filename, url) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(audioDir, filename);
        // Skip if already exists and > 1kb
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
            console.log(`SKIP (exists): ${filename}`);
            return resolve();
        }
        const file = fs.createWriteStream(filepath);
        const proto = url.startsWith('https') ? https : http;
        proto.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                return download(filename, res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                file.close();
                fs.unlink(filepath, () => {});
                return reject(new Error(`Status ${res.statusCode} for ${url}`));
            }
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (e) => {
            fs.unlink(filepath, () => {});
            reject(e);
        });
    });
}

async function main() {
    for (const [name, url] of Object.entries(files)) {
        process.stdout.write(`Downloading ${name}... `);
        try {
            await download(name, url);
            console.log('OK');
        } catch(e) {
            console.log('FAIL:', e.message);
        }
    }
    console.log('\nAll done!');
}
main();
