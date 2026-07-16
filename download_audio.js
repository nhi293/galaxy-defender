const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'assets', 'audio');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const files = {
    'bgm_menu.mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'bgm_stage1.mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'bgm_stage2.mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'bgm_stage3.mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'bgm_stage4.mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'bgm_stage5.mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'bgm_boss.mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'bgm_victory.mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    
    // SFX (Sử dụng 1 file MP3 ngắn làm dummy cho các hiệu ứng, hoặc copy một phần của file trên)
    // Để cho nhanh, ta sẽ copy bgm_menu.mp3 thành sfx_shoot.mp3 v.v...
};

function download(filename, url) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(dir, filename);
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

async function main() {
    for (const [filename, url] of Object.entries(files)) {
        console.log(`Downloading ${filename}...`);
        try {
            await download(filename, url);
        } catch(e) {
            console.error(`Failed ${filename}`, e);
        }
    }
    
    // Tạo SFX dummy
    const dummyPath = path.join(dir, 'bgm_menu.mp3');
    ['sfx_shoot.mp3'
<truncated 224 bytes>