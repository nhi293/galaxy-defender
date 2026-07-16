// fix-emoji.js – chạy từ thư mục gốc của project
const fs   = require('fs');
const path = require('path');

function walk(dir, result = []) {
    fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walk(full, result);
        else if (f.endsWith('.js')) result.push(full);
    });
    return result;
}

const files = walk('src');

// Map emoji → text an toàn cho canvas Phaser (ASCII/Latin only)
const replacements = [
    [/★/g, '*'],
    [/☆/g, '*'],
    [/❤️/g, 'HP'],
    [/❤/g,  'HP'],
    [/⚡/g, '!'],
    [/⚠️/g, '!!'],
    [/⚠/g,  '!!'],
    [/✕/g,  'X'],
    [/▶️/g, '>'],
    [/▶/g,  '>'],
    [/🏆/g, 'TROPHY'],
    [/🪙/g, 'coin'],
    [/👤/g, 'USER'],
    [/⚙️/g, 'SET'],
    [/⚙/g,  'SET'],
    [/📱/g, 'MOBILE'],
    [/🔒/g, 'LOCK'],
    [/🔓/g, 'OPEN'],
    [/💎/g, 'GEM'],
    [/🛡️/g,'SHIELD'],
    [/🛡/g, 'SHIELD'],
    [/💥/g, '!!!'],
    [/🚀/g, '>'],
    [/⬆️/g, '^'],
    [/⬆/g,  '^'],
];

let totalChanged = 0;
files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    const orig = c;
    replacements.forEach(([re, rep]) => { c = c.replace(re, rep); });
    if (c !== orig) {
        fs.writeFileSync(f, c, 'utf8');
        console.log('Fixed:', path.basename(f));
        totalChanged++;
    }
});
console.log('\nTotal fixed:', totalChanged, 'files');
