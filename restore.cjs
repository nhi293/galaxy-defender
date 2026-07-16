const fs = require('fs');

const transcriptPath = 'C:\\Users\\MSI\\.gemini\\antigravity\\brain\\ca7a8b5e-416e-4fb9-9b1c-fdd33a63bc49\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n').filter(l => l.trim().length > 0);

const filesToRestore = [
    'SettingsScene.js',
    'ProfileScene.js',
    'StageConfig.js',
    'GameScene.js',
    'WaveManager.js',
    'Item.js',
    'Enemy.js',
    'Player.js',
    'EnemyConfig.js',
    'MainMenuScene.js',
    'AudioManager.js'
];

let fileContentSnapshots = {}; // { filename: content }

for (const line of lines) {
    try {
        const step = JSON.parse(line);
        // We only want steps before 1013, which is when the user sent the prompt in the checkpoint.
        // Actually, the user's prompt in the checkpoint was step 1050! But the summary says step 1013 was when I replied to something else.
        // We want the state right before the checkpoint's current changes.
        // Let's just find the LAST VIEW_FILE before step 1013.
        if (step.step_index >= 1013) continue;

        if (step.type === 'VIEW_FILE' && step.content) {
            const match = step.content.match(/File Path: `file:\/\/\/([^`]+)`/);
            if (match) {
                const path = match[1];
                const filename = path.split('/').pop();
                if (filesToRestore.includes(filename)) {
                    if (!fileContentSnapshots[filename]) {
                        fileContentSnapshots[filename] = [];
                    }
                    fileContentSnapshots[filename].push({
                        step: step.step_index,
                        content: step.content
                    });
                }
            }
        }
    } catch(e) {}
}

for (const f of Object.keys(fileContentSnapshots)) {
    console.log(`Found ${fileContentSnapshots[f].length} views for ${f}, latest step is ${fileContentSnapshots[f][fileContentSnapshots[f].length - 1].step}`);
}
