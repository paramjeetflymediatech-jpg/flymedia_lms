'use client';

import { useState } from 'react';

export default function TechStackEditor({ initialData = [] }: { initialData: any[] }) {
  // Convert old string arrays to objects if necessary
  const normalizedData = initialData.map(item => 
    typeof item === 'string' ? { name: item, iconUrl: '' } : item
  );
  
  const [techStack, setTechStack] = useState<{ name: string; iconUrl: string }[]>(normalizedData);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const addItem = () => {
    setTechStack([...techStack, { name: 'New Tech', iconUrl: '' }]);
    setOpenIndex(techStack.length);
  };

  const removeItem = (index: number) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...techStack];
    updated[index] = { ...updated[index], [field]: value };
    setTechStack(updated);
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="techStack" value={JSON.stringify(techStack)} />

      {techStack.map((item, idx) => (
        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div 
            className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                <svg className={`w-5 h-5 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
              {item.iconUrl && (
                <img src={item.iconUrl} alt="Icon" className="w-6 h-6 object-contain" />
              )}
              <span className="font-bold text-slate-800 text-sm">{item.name || 'Untitled Tech'}</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

          {openIndex === idx && (
            <div className="p-4 space-y-4 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technology Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Icon (PNG/SVG/JPG)</label>
                <div className="flex gap-4 items-start">
                  {item.iconUrl && (
                    <img src={item.iconUrl} alt="Current Icon" className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-slate-50 p-1" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    name={`tech_icon_${idx}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 font-bold text-sm hover:border-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Tech Stack Item
      </button>
    </div>
  );
}
