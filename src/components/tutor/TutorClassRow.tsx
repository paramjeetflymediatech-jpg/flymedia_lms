"use client";

import { useState } from 'react';
import { tutorUpdateMeetLink } from '../../../app/actions';

interface TutorClassRowProps {
  item: any;
  isPast: boolean;
  startTime: Date;
}

export default function TutorClassRow({ item, isPast, startTime }: TutorClassRowProps) {
  const [isEditingLink, setIsEditingLink] = useState(false);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        {isPast ? (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-500 border border-slate-200">
            Ended
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-green-50 text-green-600 border border-green-100 flex items-center gap-1.5 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Upcoming
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="font-bold text-slate-900">{item.title}</div>
        <div className="text-xs text-slate-500">{item.duration} mins</div>
      </td>
      <td className="px-6 py-4 font-semibold text-blue-600">
        {item.Package?.title || 'Unknown Package'}
      </td>
      <td className="px-6 py-4">
        <div className="text-xs font-bold text-slate-700">{startTime.toLocaleDateString()}</div>
        <div className="text-xs text-slate-500">{startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </td>
      <td className="px-6 py-4 text-right">
        {!isPast ? (
          <div className="flex flex-col items-end gap-2">
            {isEditingLink ? (
              <form 
                className="flex items-center gap-2"
                action={async (formData) => {
                  const link = formData.get('meetLink') as string;
                  const res = await tutorUpdateMeetLink(item.id, link);
                  if (res && res.success) {
                    setIsEditingLink(false);
                  } else {
                    alert(res?.error || 'Failed to update link');
                  }
                }}
              >
                <input 
                  type="url" 
                  name="meetLink"
                  defaultValue={item.meetLink || ''}
                  placeholder="https://meet.google.com/..."
                  className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                  required
                />
                <button type="submit" className="text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded">Save</button>
                <button type="button" onClick={() => setIsEditingLink(false)} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Cancel</button>
              </form>
            ) : (
              <div className="flex items-center gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsEditingLink(true)}
                  className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors border border-slate-200 px-2 py-1 rounded bg-white"
                >
                  Edit Link
                </button>
                {item.meetLink && (
                  <a 
                    href={item.meetLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-[10px] uppercase tracking-wider rounded transition-colors border border-blue-200 hover:border-blue-600"
                  >
                    Start
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No action</span>
        )}
      </td>
    </tr>
  );
}
