import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filePath: string) => void) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replaceInDir = (dirPath: string) => {
    walk(dirPath, (filePath) => {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Black buttons -> Gradient
            content = content.replace(/bg-slate-900 hover:bg-slate-800/g, 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600');
            
            // Search buttons have slightly different order sometimes:
            content = content.replace(/bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800/g, 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white font-bold rounded-xl');

            fs.writeFileSync(filePath, content, 'utf8');
        }
    });
};

['./app/admin', './app/dashboard', './app/tutor'].forEach(replaceInDir);
console.log('Black buttons replaced successfully!');
