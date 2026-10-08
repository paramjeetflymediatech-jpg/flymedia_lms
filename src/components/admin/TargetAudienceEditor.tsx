'use client';

import { useState } from 'react';
import StringArrayEditor from './StringArrayEditor';

type TargetAudience = { list: string[]; prerequisites: string };

export default function TargetAudienceEditor({ initialData = null }: { initialData: TargetAudience | null }) {
  const [data, setData] = useState<TargetAudience>(
    initialData || { list: [], prerequisites: '' }
  );

  return (
    <div className="space-y-4">
      <input type="hidden" name="targetAudience" value={JSON.stringify(data)} />

      <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Audience List</label>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
             <StringArrayEditor 
               initialData={data.list} 
               name="_temp_audienceList" 
               label="Audience Type" 
               onChange={(newList) => setData({ ...data, list: newList })}
             />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Prerequisites (Optional)</label>
          <textarea
            rows={2}
            value={data.prerequisites}
            onChange={(e) => setData({ ...data, prerequisites: e.target.value })}
            placeholder="E.g. Basic computer knowledge is required..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm bg-white"
          />
        </div>
      </div>
    </div>
  );
}
