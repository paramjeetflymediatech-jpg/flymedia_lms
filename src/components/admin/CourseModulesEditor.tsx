'use client';

import { useState } from 'react';

type Module = { title: string; topics: string[] };

export default function CourseModulesEditor({ initialData = [] }: { initialData: Module[] }) {
  const [modules, setModules] = useState<Module[]>(initialData);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const addModule = () => {
    setModules([...modules, { title: 'New Module', topics: ['New Topic'] }]);
    setOpenIndex(modules.length);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModuleTitle = (index: number, title: string) => {
    const updated = [...modules];
    updated[index].title = title;
    setModules(updated);
  };

  const addTopic = (moduleIndex: number) => {
    const updated = [...modules];
    updated[moduleIndex].topics.push('New Topic');
    setModules(updated);
  };

  const updateTopic = (moduleIndex: number, topicIndex: number, value: string) => {
    const updated = [...modules];
    updated[moduleIndex].topics[topicIndex] = value;
    setModules(updated);
  };

  const removeTopic = (moduleIndex: number, topicIndex: number) => {
    const updated = [...modules];
    updated[moduleIndex].topics = updated[moduleIndex].topics.filter((_, i) => i !== topicIndex);
    setModules(updated);
  };

  return (
    <div className="space-y-4">
      {/* Hidden input to pass data to server action */}
      <input type="hidden" name="courseModules" value={JSON.stringify(modules)} />

      {modules.map((module, mIdx) => (
        <div key={mIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div 
            className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setOpenIndex(openIndex === mIdx ? null : mIdx)}
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                <svg className={`w-5 h-5 transition-transform ${openIndex === mIdx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
              <span className="font-bold text-slate-800 text-sm">Module {mIdx + 1}: {module.title || 'Untitled'}</span>
              <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {module.topics.length} topics
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeModule(mIdx); }}
              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

          {openIndex === mIdx && (
            <div className="p-4 space-y-4 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Module Title</label>
                <input
                  type="text"
                  value={module.title}
                  onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topics</label>
                {module.topics.map((topic, tIdx) => (
                  <div key={tIdx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => updateTopic(mIdx, tIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeTopic(mIdx, tIdx)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addTopic(mIdx)}
                  className="mt-2 text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Topic
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addModule}
        className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 hover:border-orange-400 hover:text-orange-600 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Module
      </button>
    </div>
  );
}
