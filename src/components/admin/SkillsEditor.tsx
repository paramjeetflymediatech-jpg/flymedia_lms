'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

// Devicons = full color. Simpleicons with color hex = visible. emoji = always works.
const ICON_LIBRARY = [
  { name: 'React', icon: 'react', source: 'devicon', emoji: '⚛️' },
  { name: 'Node.js', icon: 'nodejs', source: 'devicon', emoji: '🟢' },
  { name: 'MongoDB', icon: 'mongodb', source: 'devicon', emoji: '🍃' },
  { name: 'Express.js', icon: 'express', source: 'devicon', emoji: '🚂' },
  { name: 'JavaScript', icon: 'javascript', source: 'devicon', emoji: '⚡' },
  { name: 'TypeScript', icon: 'typescript', source: 'devicon', emoji: '🔷' },
  { name: 'HTML5', icon: 'html5', source: 'devicon', emoji: '🌐' },
  { name: 'CSS3', icon: 'css3', source: 'devicon', emoji: '🎨' },
  { name: 'Bootstrap', icon: 'bootstrap', source: 'devicon', emoji: '🅱️' },
  { name: 'Tailwind CSS', icon: 'tailwindcss', source: 'devicon', emoji: '💨' },
  { name: 'Redux', icon: 'redux', source: 'devicon', emoji: '🔄' },
  { name: 'React Router', icon: 'reactrouter', source: 'devicon', emoji: '🔀' },
  { name: 'Next.js', icon: 'nextjs', source: 'devicon', emoji: '▲' },
  { name: 'Vue.js', icon: 'vuejs', source: 'devicon', emoji: '💚' },
  { name: 'Angular', icon: 'angular', source: 'devicon', emoji: '🔴' },
  { name: 'Python', icon: 'python', source: 'devicon', emoji: '🐍' },
  { name: 'Django', icon: 'django', source: 'devicon', emoji: '🎸' },
  { name: 'PHP', icon: 'php', source: 'devicon', emoji: '🐘' },
  { name: 'Laravel', icon: 'laravel', source: 'devicon', emoji: '🔺' },
  { name: 'MySQL', icon: 'mysql', source: 'devicon', emoji: '🐬' },
  { name: 'PostgreSQL', icon: 'postgresql', source: 'devicon', emoji: '🐘' },
  { name: 'Firebase', icon: 'firebase', source: 'devicon', emoji: '🔥' },
  { name: 'Redis', icon: 'redis', source: 'devicon', emoji: '🔴' },
  { name: 'GraphQL', icon: 'graphql', source: 'devicon', emoji: '◉' },
  { name: 'Git', icon: 'git', source: 'devicon', emoji: '📦' },
  { name: 'GitHub', icon: 'github', source: 'devicon', emoji: '🐙' },
  { name: 'Docker', icon: 'docker', source: 'devicon', emoji: '🐳' },
  { name: 'AWS', icon: 'amazonwebservices', source: 'devicon', emoji: '☁️' },
  { name: 'Linux', icon: 'linux', source: 'devicon', emoji: '🐧' },
  { name: 'Figma', icon: 'figma', source: 'devicon', emoji: '🎨' },
  { name: 'WordPress', icon: 'wordpress', source: 'devicon', emoji: '🅆' },
  { name: 'Sass', icon: 'sass', source: 'devicon', emoji: '💅' },
  { name: 'Java', icon: 'java', source: 'devicon', emoji: '☕' },
  { name: 'Kotlin', icon: 'kotlin', source: 'devicon', emoji: '🎯' },
  { name: 'Swift', icon: 'swift', source: 'devicon', emoji: '🐦' },
  { name: 'Blender', icon: 'blender', source: 'devicon', emoji: '🎭' },
  { name: 'Sketch', icon: 'sketch', source: 'devicon', emoji: '💎' },
  { name: 'GIMP', icon: 'gimp', source: 'devicon', emoji: '🐾' },
  { name: 'Notion', icon: 'notion', source: 'devicon', emoji: '📓' },
  { name: 'Trello', icon: 'trello', source: 'devicon', emoji: '📋' },
  { name: 'Slack', icon: 'slack', source: 'devicon', emoji: '💬' },
  { name: 'LinkedIn', icon: 'linkedin', source: 'devicon', emoji: '💼' },
  { name: 'Adobe Photoshop', icon: 'adobephotoshop', source: 'simpleicon', emoji: '🖼️' },
  { name: 'Adobe Illustrator', icon: 'adobeillustrator', source: 'simpleicon', emoji: '🖊️' },
  { name: 'Adobe Premiere Pro', icon: 'adobepremierepro', source: 'simpleicon', emoji: '🎬' },
  { name: 'Adobe After Effects', icon: 'adobeaftereffects', source: 'simpleicon', emoji: '✨' },
  { name: 'Adobe XD', icon: 'adobexd', source: 'simpleicon', emoji: '🎯' },
  { name: 'Canva', icon: 'canva', source: 'simpleicon', emoji: '🖌️' },
  { name: 'CapCut', icon: 'capcut', source: 'simpleicon', emoji: '✂️' },
  { name: 'DaVinci Resolve', icon: 'davinciresolve', source: 'simpleicon', emoji: '🎥' },
  { name: 'Google Analytics', icon: 'googleanalytics', source: 'simpleicon', emoji: '📊' },
  { name: 'Google Ads', icon: 'googleads', source: 'simpleicon', emoji: '📣' },
  { name: 'SEMrush', icon: 'semrush', source: 'simpleicon', emoji: '🔎' },
  { name: 'YouTube', icon: 'youtube', source: 'simpleicon', emoji: '▶️' },
  { name: 'Instagram', icon: 'instagram', source: 'simpleicon', emoji: '📷' },
  { name: 'ChatGPT / AI', icon: 'openai', source: 'simpleicon', emoji: '🤖' },
  { name: 'Vercel', icon: 'vercel', source: 'devicon', emoji: '▲' },
  // Concept icons (no tech logo, use meaningful emoji)
  { name: 'Full Stack', icon: '', source: 'emoji', emoji: '🏗️' },
  { name: 'API Design', icon: '', source: 'emoji', emoji: '🔗' },
  { name: 'Authentication', icon: '', source: 'emoji', emoji: '🔐' },
  { name: 'Cloud', icon: '', source: 'emoji', emoji: '☁️' },
  { name: 'Security', icon: '', source: 'emoji', emoji: '🛡️' },
  { name: 'UI/UX Design', icon: '', source: 'emoji', emoji: '🎨' },
  { name: 'Responsive Design', icon: '', source: 'emoji', emoji: '📱' },
  { name: 'State Management', icon: '', source: 'emoji', emoji: '🔄' },
  { name: 'Database Design', icon: '', source: 'emoji', emoji: '🗄️' },
  { name: 'DevOps', icon: '', source: 'emoji', emoji: '⚙️' },
  { name: 'Testing', icon: '', source: 'emoji', emoji: '🧪' },
  { name: 'AI / Machine Learning', icon: '', source: 'emoji', emoji: '🤖' },
  { name: 'SEO', icon: '', source: 'emoji', emoji: '🔍' },
  { name: 'Content Writing', icon: '', source: 'emoji', emoji: '✍️' },
  { name: 'Video Editing', icon: '', source: 'emoji', emoji: '🎬' },
  { name: 'Graphic Design', icon: '', source: 'emoji', emoji: '🖼️' },
  { name: 'Digital Marketing', icon: '', source: 'emoji', emoji: '📣' },
  { name: 'Social Media', icon: '', source: 'emoji', emoji: '📱' },
  { name: 'Problem Solving', icon: '', source: 'emoji', emoji: '🧩' },
  { name: 'Team Collaboration', icon: '', source: 'emoji', emoji: '🤝' },
  { name: 'Project Management', icon: '', source: 'emoji', emoji: '📋' },
];

function getIconUrl(item: typeof ICON_LIBRARY[0]): string | null {
  if (!item.icon) return null;
  if (item.source === 'devicon') {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${item.icon}/${item.icon}-original.svg`;
  }
  if (item.source === 'simpleicon') {
    return `https://cdn.simpleicons.org/${item.icon}/444444`;
  }
  return null;
}

function IconPreview({ url, emoji, size = 20 }: { url: string | null; emoji: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (!url || failed) return <span style={{ fontSize: size - 2, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>;
  return (
    <img
      src={url}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
      onError={() => setFailed(true)}
      alt=""
    />
  );
}

export default function SkillsEditor({ initialData = [], name = 'skills' }: { initialData: any[], name?: string }) {
  const normalized = initialData.map(item =>
    typeof item === 'string' ? { name: item, iconUrl: '', emoji: '🔧' } : { ...item, emoji: item.emoji || '🔧' }
  );

  const [items, setItems] = useState<{ name: string; iconUrl: string; emoji: string }[]>(normalized);

  // For new item form
  const [newName, setNewName] = useState('');
  const [iconSearch, setIconSearch] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<typeof ICON_LIBRARY[0] | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) setShowIconPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ICON_LIBRARY.slice(0, 35);
    return ICON_LIBRARY.filter(i => i.name.toLowerCase().includes(iconSearch.toLowerCase()));
  }, [iconSearch]);

  const addItem = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setItems(prev => [...prev, {
      name: trimmed,
      iconUrl: selectedIcon ? (getIconUrl(selectedIcon) || '') : '',
      emoji: selectedIcon ? selectedIcon.emoji : '🔧',
    }]);
    setNewName('');
    setSelectedIcon(null);
    setIconSearch('');
  };

  const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {/* Added Items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
              <IconPreview url={item.iconUrl || null} emoji={item.emoji} size={20} />
              <span className="flex-1 text-sm font-semibold text-slate-700">{item.name}</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Skill Form */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Skill</p>

        {/* Skill Name Input */}
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          placeholder="e.g. Full Stack MERN Development"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm"
        />

        {/* Icon Picker */}
        <div className="flex gap-2 items-start" ref={iconRef}>
          <div className="relative flex-1">
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={iconSearch}
                onChange={e => { setIconSearch(e.target.value); setShowIconPicker(true); }}
                onFocus={() => setShowIconPicker(true)}
                placeholder={selectedIcon ? `Icon: ${selectedIcon.name}` : 'Search icon (optional)…'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm"
              />
            </div>

            {showIconPicker && (
              <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                {/* No icon option */}
                <button
                  type="button"
                  onClick={() => { setSelectedIcon(null); setIconSearch(''); setShowIconPicker(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-left transition-colors border-b border-slate-100"
                >
                  <span className="text-base w-5 text-center">❌</span>
                  <span className="text-sm text-slate-500 italic">No icon</span>
                </button>
                <div className="max-h-52 overflow-y-auto py-1">
                  {filteredIcons.map((icon, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedIcon(icon); setIconSearch(''); setShowIconPicker(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-left transition-colors ${selectedIcon?.name === icon.name ? 'bg-blue-50' : ''}`}
                    >
                      <IconPreview url={getIconUrl(icon)} emoji={icon.emoji} size={20} />
                      <span className="text-sm font-semibold text-slate-700">{icon.name}</span>
                      {selectedIcon?.name === icon.name && <span className="ml-auto text-blue-500 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected icon preview */}
          {selectedIcon && (
            <div className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl flex-shrink-0">
              <IconPreview url={getIconUrl(selectedIcon)} emoji={selectedIcon.emoji} size={22} />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={addItem}
          disabled={!newName.trim()}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Skill
        </button>
      </div>
    </div>
  );
}
