const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, cb);
    else cb(p);
  });
}

function replaceColors(dir) {
  walk(dir, p => {
    if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      let o = c;

      // Gradients
      c = c.replace(/from-purple-600 to-indigo-600/g, 'from-rose-500 via-red-500 to-orange-500');
      
      // Indigo/Purple -> Orange/Rose replacements
      c = c.replace(/text-purple-(\d+)/g, 'text-orange-$1');
      c = c.replace(/text-indigo-(\d+)/g, 'text-orange-$1');
      c = c.replace(/bg-purple-(\d+)/g, 'bg-orange-$1');
      c = c.replace(/bg-indigo-(\d+)/g, 'bg-orange-$1');
      c = c.replace(/border-purple-(\d+)/g, 'border-orange-$1');
      c = c.replace(/border-indigo-(\d+)/g, 'border-orange-$1');
      c = c.replace(/ring-purple-(\d+)/g, 'ring-orange-$1');
      c = c.replace(/ring-indigo-(\d+)/g, 'ring-orange-$1');
      c = c.replace(/hover:text-purple-(\d+)/g, 'hover:text-orange-$1');
      c = c.replace(/hover:text-indigo-(\d+)/g, 'hover:text-orange-$1');
      c = c.replace(/hover:bg-purple-(\d+)/g, 'hover:bg-orange-$1');
      c = c.replace(/hover:bg-indigo-(\d+)/g, 'hover:bg-orange-$1');
      c = c.replace(/hover:border-purple-(\d+)/g, 'hover:border-orange-$1');
      c = c.replace(/hover:border-indigo-(\d+)/g, 'hover:border-orange-$1');

      // Special Buttons (bg-slate-900 / bg-purple-600 / bg-indigo-600) -> Brand Gradient
      const gradientClass = 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600';
      c = c.replace(/bg-slate-900([^>]*?)hover:bg-slate-800/g, gradientClass + '$1');
      
      // Avoid replacing if it's already a gradient
      if (c !== o) {
        fs.writeFileSync(p, c, 'utf8');
        console.log('Updated ' + p);
      }
    }
  });
}

replaceColors('app/dashboard');
replaceColors('src/components');
