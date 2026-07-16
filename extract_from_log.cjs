const fs = require('fs');

const transcriptPath = 'C:\\Users\\MSI\\.gemini\\antigravity\\brain\\ca7a8b5e-416e-4fb9-9b1c-fdd33a63bc49\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n').filter(l => l.trim().length > 0);

const filesToRestore = [
    'src/scenes/GameScene.js',
    'src/objects/Enemy.js',
    'src/objects/Item.js',
    'src/objects/Player.js',
    'src/configs/EnemyConfig.js',
    'src/configs/StageConfig.js',
    'src/configs/GameConfig.js',
    'src/managers/WaveManager.js'
];

let fileStates = {}; // filename -> { content, step }

for (const line of lines) {
    try {
        const step = JSON.parse(line);
        // Only consider steps up to 1013 (the point right after the fixes were applied)
        if (step.step_index > 1013) continue;

        if (step.type === 'VIEW_FILE' && step.content) {
            const match = step.content.match(/File Path: `file:\/\/\/([^`]+)`/);
            if (match) {
                let path = match[1];
                if (path.includes('galaxy-defender')) {
                    // Normalize path
                    path = path.substring(path.indexOf('galaxy-defender/') + 'galaxy-defender/'.length);
                    if (filesToRestore.includes(path)) {
                        // The content in VIEW_FILE has line numbers added like "1: // ..."
                        // We need to strip them.
                        const contentLines = step.content.split('\n');
                        let actualCodeLines = [];
                        let isCode = false;
                        for(let cl of contentLines) {
                            if (cl.startsWith('1: ')) isCode = true;
                            if (cl.startsWith('The above content shows the entire')) isCode = false;
                            
                            if (isCode) {
                                // Match the `<line_number>: <content>` pattern
                                const lineMatch = cl.match(/^\d+:\s?(.*)$/);
                                if (lineMatch) {
                                    actualCodeLines.push(lineMatch[1]);
                                }
                            }
                        }
                        if (actualCodeLines.length > 0) {
                            fileStates[path] = { content: actualCodeLines.join('\n'), step: step.step_index };
                        }
                    }
                }
            }
        }
        
        // Let's also check CODE_ACTION or any replacement tool calls
        if (step.type === 'TOOL_CALL' && step.tool_calls) {
            for (let tc of step.tool_calls) {
                if (tc.name === 'default_api:write_to_file' || tc.name === 'default_api:replace_file_content' || tc.name === 'default_api:multi_replace_file_content') {
                    // This is harder to reconstruct perfectly from tool calls, but VIEW_FILE is usually called after edits.
                    // We'll rely primarily on VIEW_FILE for the exact snapshot if available.
                }
            }
        }
    } catch(e) {}
}

for (const path of filesToRestore) {
    if (fileStates[path]) {
        console.log(`Restoring ${path} from step ${fileStates[path].step}...`);
        fs.writeFileSync('C:\\Users\\MSI\\OneDrive\\Desktop\\game\\galaxy-defender\\' + path, fileStates[path].content, 'utf-8');
    } else {
        console.log(`Could not find history for ${path}`);
    }
}
