const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'assets', 'audio');

const files = {
    'bgm_menu.mp3': 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/oedipus_wizball_highscore.mp3',
    'bgm_stage1.mp3': 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/CatAstroPhi_shmup_normal.mp3',
    'bgm_stage2.mp3': 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/jungle.mp3',
    'sfx_shoot.wav': 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/blaster.mp3',
    'sfx_explosion.wav': 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/explosion.mp3',
    'sfx_hit.wav': 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/player_hit.wav'
};

function download(filename, url) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(dir, filename);
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if(response.statusCode !== 200) {
                file.close();
                return reject(new Error('Status ' + response.statusCode + ' for ' + url));
            }
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', reject);
    });
}

async function main() {
    for (const [filename, url] of Object.entries(files)) {
        console.log(`Downloading ${filename}...`);
        try {
            await download(filename, url);
        } catch(e) {}
    }
    console.log("Done");
}
main();
