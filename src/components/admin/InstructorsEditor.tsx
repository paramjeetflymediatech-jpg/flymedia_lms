'use client';

import { useState } from 'react';

export default function InstructorsEditor({ initialData = [] }: { initialData: any[] }) {
  const [instructors, setInstructors] = useState<{ name: string; role: string; bio: string; avatar: string }[]>(initialData);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const addInstructor = () => {
    setInstructors([...instructors, { name: 'New Instructor', role: '', bio: '', avatar: '' }]);
    setOpenIndex(instructors.length);
  };

  const removeInstructor = (index: number) => {
    setInstructors(instructors.filter((_, i) => i !== index));
  };

  const updateInstructor = (index: number, field: string, value: string) => {
    const updated = [...instructors];
    updated[index] = { ...updated[index], [field]: value };
    setInstructors(updated);
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="instructors" value={JSON.stringify(instructors)} />

      {instructors.map((instructor, idx) => (
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
              {instructor.avatar && (
                <img src={instructor.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
              )}
              <span className="font-bold text-slate-800 text-sm">{instructor.name || 'Untitled Instructor'}</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeInstructor(idx); }}
              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

          {openIndex === idx && (
            <div className="p-4 space-y-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={instructor.name}
                    onChange={(e) => updateInstructor(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    value={instructor.role}
                    onChange={(e) => updateInstructor(idx, 'role', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={instructor.bio}
                  onChange={(e) => updateInstructor(idx, 'bio', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload New Avatar (Optional)</label>
                <div className="flex gap-4 items-start">
                  {instructor.avatar && (
                    <img src={instructor.avatar} alt="Current" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    name={`instructor_avatar_${idx}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-all bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addInstructor}
        className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 hover:border-orange-400 hover:text-orange-600 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Instructor
      </button>
    </div>
  );
}
