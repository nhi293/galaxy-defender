const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\MSI\\.gemini\\antigravity\\brain\\ca7a8b5e-416e-4fb9-9b1c-fdd33a63bc49\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n').filter(l => l.trim().length > 0);

const fileLines = {}; // { filename: { lineIndex: string } }

for (const line of lines) {
    try {
        const step = JSON.parse(line);
        if (step.type === 'VIEW_FILE' && step.content) {
            const match = step.content.match(/File Path: `file:\/\/\/([^`]+)`/);
            if (match) {
                const path = match[1];
                const filename = path.split('/').pop();
                if (!fileLines[filename]) fileLines[filename] = {};
                
                // Extract lines. The format is "<line_number>: <original_line>"
                const outputLines = step.content.split('\n');
                for (const ol of outputLines) {
                    const lineMatch = ol.match(/^(\d+):\s(.*)$/);
                    if (lineMatch) {
                        const lNum = parseInt(lineMatch[1], 10);
                        const lContent = lineMatch[2];
                        fileLines[filename][lNum] = lContent;
                    }
                }
            }
        }
    } catch(e) {}
}

const outDir = 'C:\\Users\\MSI\\OneDrive\\Desktop\\game\\galaxy-defender_reconstructed';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

for (const [filename, linesDict] of Object.entries(fileLines)) {
    const sortedKeys = Object.keys(linesDict).map(Number).sort((a, b) => a - b);
    if (sortedKeys.length === 0) continue;
    
    let content = '';
    let lastLine = 0;
    for (const key of sortedKeys) {
        if (key > lastLine + 1) {
            content += `// ... MISSING LINES ${lastLine + 1} TO ${key - 1} ...\n`;
        }
        content += linesDict[key] + '\n';
        lastLine = key;
    }
    
    const fullPath = path.join(outDir, filename);
    fs.writeFileSync(fullPath, content);
    console.log(`Reconstructed ${filename} with ${sortedKeys.length} lines`);
}
