'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

// devicons = full-color SVGs. simpleicons = monochrome (may be invisible on white). emoji = always visible fallback.
type IconSource = 'devicon' | 'simpleicon' | 'emoji';

const ALL_TECH: { name: string; icon: string; source: IconSource; emoji: string }[] = [
  // --- Web Core ---
  { name: 'HTML5', icon: 'html5', source: 'devicon', emoji: '🌐' },
  { name: 'CSS3', icon: 'css3', source: 'devicon', emoji: '🎨' },
  { name: 'JavaScript', icon: 'javascript', source: 'devicon', emoji: '⚡' },
  { name: 'TypeScript', icon: 'typescript', source: 'devicon', emoji: '🔷' },
  { name: 'jQuery', icon: 'jquery', source: 'devicon', emoji: '💻' },

  // --- CSS Frameworks ---
  { name: 'Bootstrap', icon: 'bootstrap', source: 'devicon', emoji: '🅱️' },
  { name: 'Tailwind CSS', icon: 'tailwindcss', source: 'devicon', emoji: '💨' },
  { name: 'Sass', icon: 'sass', source: 'devicon', emoji: '💅' },
  { name: 'Material UI', icon: 'materialui', source: 'devicon', emoji: '🎨' },

  // --- Frontend Frameworks ---
  { name: 'React.js', icon: 'react', source: 'devicon', emoji: '⚛️' },
  { name: 'React Router', icon: 'reactrouter', source: 'devicon', emoji: '🔀' },
  { name: 'Redux Toolkit', icon: 'redux', source: 'devicon', emoji: '🔄' },
  { name: 'Next.js', icon: 'nextjs', source: 'devicon', emoji: '▲' },
  { name: 'Vue.js', icon: 'vuejs', source: 'devicon', emoji: '💚' },
  { name: 'Angular', icon: 'angular', source: 'devicon', emoji: '🔴' },
  { name: 'Svelte', icon: 'svelte', source: 'devicon', emoji: '🔥' },

  // --- Backend ---
  { name: 'Node.js', icon: 'nodejs', source: 'devicon', emoji: '🟢' },
  { name: 'Express.js', icon: 'express', source: 'devicon', emoji: '🚂' },
  { name: 'PHP', icon: 'php', source: 'devicon', emoji: '🐘' },
  { name: 'Laravel', icon: 'laravel', source: 'devicon', emoji: '🔺' },
  { name: 'Python', icon: 'python', source: 'devicon', emoji: '🐍' },
  { name: 'Django', icon: 'django', source: 'devicon', emoji: '🎸' },
  { name: 'FastAPI', icon: 'fastapi', source: 'devicon', emoji: '⚡' },
  { name: 'Java', icon: 'java', source: 'devicon', emoji: '☕' },
  { name: 'Spring Boot', icon: 'spring', source: 'devicon', emoji: '🌿' },
  { name: 'C#', icon: 'csharp', source: 'devicon', emoji: '#️⃣' },
  { name: 'C++', icon: 'cplusplus', source: 'devicon', emoji: '⚙️' },

  // --- Databases ---
  { name: 'MongoDB', icon: 'mongodb', source: 'devicon', emoji: '🍃' },
  { name: 'MongoDB Atlas', icon: 'mongodb', source: 'devicon', emoji: '☁️' },
  { name: 'MySQL', icon: 'mysql', source: 'devicon', emoji: '🐬' },
  { name: 'PostgreSQL', icon: 'postgresql', source: 'devicon', emoji: '🐘' },
  { name: 'Firebase', icon: 'firebase', source: 'devicon', emoji: '🔥' },
  { name: 'Redis', icon: 'redis', source: 'devicon', emoji: '🔴' },
  { name: 'SQLite', icon: 'sqlite', source: 'devicon', emoji: '🗃️' },

  // --- APIs & Integration ---
  { name: 'REST APIs', icon: '', source: 'emoji', emoji: '🔗' },
  { name: 'GraphQL', icon: 'graphql', source: 'devicon', emoji: '◉' },
  { name: 'AI/LLM APIs', icon: '', source: 'emoji', emoji: '🤖' },
  { name: 'WebSockets', icon: '', source: 'emoji', emoji: '🔌' },

  // --- DevOps & Tools ---
  { name: 'Git', icon: 'git', source: 'devicon', emoji: '📦' },
  { name: 'GitHub', icon: 'github', source: 'devicon', emoji: '🐙' },
  { name: 'Docker', icon: 'docker', source: 'devicon', emoji: '🐳' },
  { name: 'Kubernetes', icon: 'kubernetes', source: 'devicon', emoji: '☸️' },
  { name: 'AWS', icon: 'amazonwebservices', source: 'devicon', emoji: '☁️' },
  { name: 'Linux', icon: 'linux', source: 'devicon', emoji: '🐧' },
  { name: 'Nginx', icon: 'nginx', source: 'devicon', emoji: '🌿' },
  { name: 'Vercel', icon: 'vercel', source: 'devicon', emoji: '▲' },

  // --- Video Editing ---
  { name: 'Adobe Premiere Pro', icon: 'adobepremierepro', source: 'simpleicon', emoji: '🎬' },
  { name: 'Adobe After Effects', icon: 'adobeaftereffects', source: 'simpleicon', emoji: '✨' },
  { name: 'DaVinci Resolve', icon: 'davinciresolve', source: 'simpleicon', emoji: '🎥' },
  { name: 'Final Cut Pro', icon: 'finalcutpro', source: 'simpleicon', emoji: '🎞️' },
  { name: 'CapCut', icon: 'capcut', source: 'simpleicon', emoji: '✂️' },
  { name: 'OBS Studio', icon: 'obsstudio', source: 'simpleicon', emoji: '📹' },
  { name: 'Filmora', icon: '', source: 'emoji', emoji: '🎬' },
  { name: 'Sony Vegas Pro', icon: '', source: 'emoji', emoji: '🎬' },

  // --- Graphic Design ---
  { name: 'Adobe Photoshop', icon: 'adobephotoshop', source: 'simpleicon', emoji: '🖼️' },
  { name: 'Adobe Illustrator', icon: 'adobeillustrator', source: 'simpleicon', emoji: '🖊️' },
  { name: 'Adobe InDesign', icon: 'adobeindesign', source: 'simpleicon', emoji: '📰' },
  { name: 'Adobe XD', icon: 'adobexd', source: 'simpleicon', emoji: '🎯' },
  { name: 'Figma', icon: 'figma', source: 'devicon', emoji: '🎨' },
  { name: 'Canva', icon: 'canva', source: 'simpleicon', emoji: '🖼️' },
  { name: 'Sketch', icon: 'sketch', source: 'devicon', emoji: '💎' },
  { name: 'GIMP', icon: 'gimp', source: 'devicon', emoji: '🐾' },
  { name: 'Inkscape', icon: 'inkscape', source: 'devicon', emoji: '🖊️' },
  { name: 'CorelDRAW', icon: '', source: 'emoji', emoji: '🎨' },
  { name: 'Affinity Designer', icon: 'affinitydesigner', source: 'simpleicon', emoji: '🔷' },

  // --- 3D & Animation ---
  { name: 'Blender', icon: 'blender', source: 'devicon', emoji: '🎭' },
  { name: 'Cinema 4D', icon: 'cinema4d', source: 'simpleicon', emoji: '🌀' },
  { name: 'Adobe Animate', icon: '', source: 'emoji', emoji: '🎭' },
  { name: 'Spline', icon: '', source: 'emoji', emoji: '🌀' },

  // --- SEO ---
  { name: 'Google Search Console', icon: 'googlesearchconsole', source: 'simpleicon', emoji: '🔍' },
  { name: 'Google Analytics', icon: 'googleanalytics', source: 'simpleicon', emoji: '📊' },
  { name: 'SEMrush', icon: 'semrush', source: 'simpleicon', emoji: '🔎' },
  { name: 'Ahrefs', icon: '', source: 'emoji', emoji: '🔗' },
  { name: 'Moz', icon: '', source: 'emoji', emoji: '📈' },
  { name: 'Yoast SEO', icon: '', source: 'emoji', emoji: '🟢' },
  { name: 'RankMath', icon: '', source: 'emoji', emoji: '📈' },
  { name: 'Ubersuggest', icon: '', source: 'emoji', emoji: '💡' },
  { name: 'Google Ads', icon: 'googleads', source: 'simpleicon', emoji: '📣' },

  // --- Content & Planning ---
  { name: 'Notion', icon: 'notion', source: 'devicon', emoji: '📓' },
  { name: 'Trello', icon: 'trello', source: 'devicon', emoji: '📋' },
  { name: 'Slack', icon: 'slack', source: 'devicon', emoji: '💬' },
  { name: 'Asana', icon: 'asana', source: 'simpleicon', emoji: '🎯' },
  { name: 'ClickUp', icon: 'clickup', source: 'simpleicon', emoji: '✅' },
  { name: 'Grammarly', icon: 'grammarly', source: 'simpleicon', emoji: '✅' },
  { name: 'ChatGPT', icon: 'openai', source: 'simpleicon', emoji: '🤖' },
  { name: 'Microsoft Word', icon: 'word', source: 'devicon', emoji: '📘' },
  { name: 'Google Docs', icon: 'google', source: 'devicon', emoji: '📄' },

  // --- Social Media ---
  { name: 'Instagram', icon: 'instagram', source: 'simpleicon', emoji: '📷' },
  { name: 'YouTube', icon: 'youtube', source: 'simpleicon', emoji: '▶️' },
  { name: 'LinkedIn', icon: 'linkedin', source: 'devicon', emoji: '💼' },
  { name: 'TikTok', icon: 'tiktok', source: 'simpleicon', emoji: '🎵' },
  { name: 'Meta Ads', icon: 'meta', source: 'simpleicon', emoji: '📘' },
  { name: 'Mailchimp', icon: 'mailchimp', source: 'simpleicon', emoji: '🐒' },

  // --- WordPress ---
  { name: 'WordPress', icon: 'wordpress', source: 'devicon', emoji: '🅆' },
  { name: 'WooCommerce', icon: 'woocommerce', source: 'devicon', emoji: '🛒' },
];

function getIconUrl(tech: typeof ALL_TECH[0]): string | null {
  if (!tech.icon) return null;
  if (tech.source === 'devicon') {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${tech.icon}/${tech.icon}-original.svg`;
  }
  if (tech.source === 'simpleicon') {
    return `https://cdn.simpleicons.org/${tech.icon}/555555`;
  }
  return null;
}

export default function TechSelectEditor({ initialData = [], name = 'techStack' }: { initialData: any[], name?: string }) {
  const normalized = initialData.map(item =>
    typeof item === 'string' ? { name: item, iconUrl: '' } : item
  );

  const [items, setItems] = useState<{ name: string; iconUrl: string }[]>(normalized);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_TECH.slice(0, 40);
    return ALL_TECH.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const isAdded = (techName: string) => items.some(i => i.name.toLowerCase() === techName.toLowerCase());

  const select = (tech: typeof ALL_TECH[0]) => {
    if (!isAdded(tech.name)) {
      const iconUrl = getIconUrl(tech) || '';
      setItems(prev => [...prev, { name: tech.name, iconUrl }]);
    }
    setSearch('');
    setOpen(false);
  };

  const addCustom = () => {
    const trimmed = search.trim();
    if (trimmed && !isAdded(trimmed)) {
      setItems(prev => [...prev, { name: trimmed, iconUrl: '' }]);
    }
    setSearch('');
    setOpen(false);
  };

  const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const getEmoji = (techName: string) => ALL_TECH.find(t => t.name === techName)?.emoji || '🔧';

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm rounded-full pl-2 pr-1.5 py-1.5 text-sm font-semibold text-slate-700">
              <TechIcon url={item.iconUrl} name={item.name} fallback={getEmoji(item.name)} size={16} />
              <span>{item.name}</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative" ref={ref}>
        <div className="relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const exact = ALL_TECH.find(t => t.name.toLowerCase() === search.toLowerCase());
                if (exact) select(exact);
                else if (filtered.length === 1) select(filtered[0]);
                else addCustom();
              }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder="Search: React, Photoshop, SEMrush, Canva…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm"
          />
        </div>

        {open && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="max-h-60 overflow-y-auto py-1">
              {filtered.map((tech, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => select(tech)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-left transition-colors"
                >
                  <TechIcon url={getIconUrl(tech)} name={tech.name} fallback={tech.emoji} size={20} />
                  <span className="text-sm font-semibold text-slate-700 flex-1">{tech.name}</span>
                  {isAdded(tech.name) && <span className="text-xs text-blue-500 font-bold">✓</span>}
                </button>
              ))}
              {search.trim() && !ALL_TECH.find(t => t.name.toLowerCase() === search.toLowerCase()) && (
                <button
                  type="button"
                  onClick={addCustom}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-semibold text-sm transition-colors border-t border-slate-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add &ldquo;{search.trim()}&rdquo; (no icon)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">Search from 100+ tools or type any name and press Enter to add custom</p>
    </div>
  );
}

// Sub-component: tries image, falls back to emoji
function TechIcon({ url, name, fallback, size }: { url: string | null; name: string; fallback: string; size: number }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return <span style={{ fontSize: size - 2, lineHeight: 1 }}>{fallback}</span>;
  }

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  );
}
