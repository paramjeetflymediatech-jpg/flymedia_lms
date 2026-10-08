'use client';

import { useState } from 'react';

interface Module {
  title: string;
  topics: string[];
}

export default function CourseModuleAccordion({ modules }: { modules: Module[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0); // first open by default
  const [search, setSearch] = useState('');

  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);

  const filtered = search.trim()
    ? modules
        .map(m => ({
          ...m,
          topics: m.topics.filter(t => t.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter(m => m.topics.length > 0 || m.title.toLowerCase().includes(search.toLowerCase()))
    : modules;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search sections..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm transition-all"
        />
      </div>

      {/* Stats */}
      <p className="text-xs text-slate-500 font-medium">
        {modules.length} modules · {totalTopics} lessons
      </p>

      {/* Accordion */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No results for "{search}"</div>
        ) : (
          filtered.map((mod, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx}>
                {/* Module Header */}
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                      isOpen ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`font-bold text-sm truncate transition-colors ${isOpen ? 'text-orange-600' : 'text-slate-800'}`}>
                      {mod.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs text-slate-400 font-medium">{mod.topics.length} topics</span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-500' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Topics list */}
                {isOpen && (
                  <div className="bg-slate-50/70 border-t border-slate-100">
                    {mod.topics.map((topic, ti) => {
                      const highlighted = search.trim()
                        ? topic.replace(new RegExp(`(${search})`, 'gi'), '<mark class="bg-orange-100 text-orange-800 rounded px-0.5">$1</mark>')
                        : topic;
                      return (
                        <div
                          key={ti}
                          className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-b-0 hover:bg-white transition-colors group/topic"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover/topic:border-orange-300 transition-colors">
                            <svg className="w-3 h-3 text-slate-400 group-hover/topic:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span
                            className="text-sm text-slate-700 font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: highlighted }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
