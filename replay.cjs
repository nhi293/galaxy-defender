const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\MSI\\.gemini\\antigravity\\brain\\ca7a8b5e-416e-4fb9-9b1c-fdd33a63bc49\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n').filter(l => l.trim().length > 0);

const fileContents = {};

for (let i = 0; i < lines.length; i++) {
    try {
        const step = JSON.parse(lines[i]);
        if (step.step_index >= 767) {
            break; // Stop replaying at step 767
        }
        if (step.type === 'PLANNER_RESPONSE' && step.tool_calls) {
            for (const call of step.tool_calls) {
                if (call.name === 'write_to_file') {
                    const args = call.args;
                    let targetPath = args.TargetFile;
                    if (targetPath) {
                        // Normalize path to lowercase for comparison, but store original
                        targetPath = targetPath.replace(/\\/g, '/').replace(/"/g, '');
                        if (targetPath.includes('galaxy-defender')) {
                            const filename = targetPath.split('galaxy-defender/')[1];
                            if (filename) {
                                fileContents[filename] = args.CodeContent.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
                            }
                        }
                    }
                } else if (call.name === 'replace_file_content') {
                    const args = call.args;
                    let targetPath = args.TargetFile;
                    if (targetPath) {
                        targetPath = targetPath.replace(/\\/g, '/').replace(/"/g, '');
                        if (targetPath.includes('galaxy-defender')) {
                            const filename = targetPath.split('galaxy-defender/')[1];
                            if (filename && fileContents[filename]) {
                                let tc = args.TargetContent.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
                                let rc = args.ReplacementContent.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
                                fileContents[filename] = fileContents[filename].replace(tc, rc);
                            }
                        }
                    }
                }
            }
        }
    } catch(e) {}
}

const outDir = 'C:\\Users\\MSI\\OneDrive\\Desktop\\game\\galaxy-defender_backup';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

for (const [filename, content] of Object.entries(fileContents)) {
    const fullPath = path.join(outDir, filename);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content);
}
console.log('Replayed files to backup dir!');
