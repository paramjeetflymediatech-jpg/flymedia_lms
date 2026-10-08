'use client';

import { useState } from 'react';

type ProjectStage = { title: string; content: string };
type ProjectDetails = { description: string; stages: ProjectStage[] };

export default function ProjectDetailsEditor({ initialData = null }: { initialData: ProjectDetails | null }) {
  const [details, setDetails] = useState<ProjectDetails>(
    initialData || { description: '', stages: [] }
  );
  
  const addStage = () => {
    setDetails({
      ...details,
      stages: [...details.stages, { title: 'New Stage', content: '' }]
    });
  };

  const removeStage = (index: number) => {
    setDetails({
      ...details,
      stages: details.stages.filter((_, i) => i !== index)
    });
  };

  const updateStage = (index: number, field: string, value: string) => {
    const updatedStages = [...details.stages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    setDetails({ ...details, stages: updatedStages });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="projectDetails" value={JSON.stringify(details)} />

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Project Description</label>
        <textarea
          rows={3}
          value={details.description}
          onChange={(e) => setDetails({ ...details, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm bg-slate-50"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 mb-1">Project Stages</label>
        
        {details.stages.map((stage, idx) => (
          <div key={idx} className="flex gap-3 bg-white p-3 border border-slate-200 rounded-xl">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={stage.title}
                onChange={(e) => updateStage(idx, 'title', e.target.value)}
                placeholder="Stage Title (e.g. Frontend Development)"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm font-bold"
              />
              <input
                type="text"
                value={stage.content}
                onChange={(e) => updateStage(idx, 'content', e.target.value)}
                placeholder="What you will do..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeStage(idx)}
              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors self-start"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addStage}
          className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Stage
        </button>
      </div>
    </div>
  );
}
