const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'assets', 'audio');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/';

// Map our game bgms to phaser examples
const files = {
    'bgm_menu.mp3': baseUrl + 'oedipus_wizball_highscore.mp3',
    'bgm_stage1.mp3': baseUrl + 'CatAstroPhi_shmup_normal.mp3',
    'bgm_stage2.mp3': baseUrl + 'Scyphe-Goldrunner_(Maccie_Pimp_Me Up_Remix).mp3'.replace(/ /g, '%20'),
    'bgm_stage3.mp3': baseUrl + 'jungle.mp3',
    'bgm_stage4.mp3': baseUrl + 'bodenstaendig_2000_in_rock_4bit.mp3',
    'bgm_stage5.mp3': baseUrl + 'Dafunk%20-%20Hardcore%20Power%20(We%20Believe%20In%20Goa%20-%20Remix).mp3',
    'bgm_boss.mp3': baseUrl + 'bodenstaendig_2000_in_rock_4bit.mp3',
    'bgm_victory.mp3': baseUrl + 'oedipus_wizball_highscore.mp3',
};

function download(filename, url) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(dir, filename);
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if(response.statusCode !== 200) {
                file.close();
                fs.unlink(filepath, () => {});
                return reject(new Error('Status ' + response.statusCode + ' for ' + url));
            }
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
            console.log(`Success: ${filename}`);
        } catch(e) {
            console.error(`Failed ${filename}`, e.messag
<truncated 36 bytes>