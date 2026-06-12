"use client";

import { useState } from 'react';
import { tutorUpdateMeetLink, tutorUpdateClassStatus } from '../../../app/actions';

interface TutorClassRowProps {
  item: any;
  isPast: boolean;
  startTime: Date;
}

export default function TutorClassRow({ item, isPast, startTime }: TutorClassRowProps) {
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const status = item.status || 'SCHEDULED';

  const handleStatusUpdate = async (newStatus: 'COMPLETED' | 'CANCELLED') => {
    setIsUpdatingStatus(true);
    const res = await tutorUpdateClassStatus(item.id, newStatus);
    if (!res || !res.success) {
      alert(res?.error || 'Failed to update status');
    }
    setIsUpdatingStatus(false);
  };

  // Extract student name(s)
  const enrollments = item.Package?.enrollments || [];
  const studentNames = enrollments.length > 0 
    ? enrollments.map((e: any) => e.User?.name).filter(Boolean).join(', ')
    : 'No Students';

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      {/* Student */}
      <td className="px-6 py-4">
        <div className="font-bold text-slate-900">{studentNames || 'TBD'}</div>
      </td>

      {/* Course */}
      <td className="px-6 py-4">
        <div className="font-bold text-blue-600">{item.Package?.title || 'Unknown Package'}</div>
        <div className="text-xs text-slate-500">{item.title}</div>
      </td>

      {/* Schedule */}
      <td className="px-6 py-4">
        <div suppressHydrationWarning className="text-sm font-bold text-slate-700">{startTime.toLocaleDateString()}</div>
      </td>

      {/* Time */}
      <td className="px-6 py-4">
        <div suppressHydrationWarning className="text-sm font-bold text-slate-700">
          {startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
        <div className="text-xs text-slate-500">{item.duration} mins</div>
      </td>

      {/* Meeting Link */}
      <td className="px-6 py-4">
        {isEditingLink ? (
          <form 
            className="flex flex-col gap-2"
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
              placeholder="https://meet..."
              className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded flex-1">Save</button>
              <button type="button" onClick={() => setIsEditingLink(false)} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded flex-1">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-1 items-start">
            {item.meetLink ? (
              <a 
                href={item.meetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs font-semibold truncate max-w-[150px] inline-block"
                title={item.meetLink}
              >
                Join Meeting
              </a>
            ) : (
              <span className="text-xs text-slate-400 italic">No link set</span>
            )}
            <button 
              type="button" 
              onClick={() => setIsEditingLink(true)}
              className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              {item.meetLink ? 'Edit Link' : '+ Add Link'}
            </button>
          </div>
        )}
      </td>

      {/* Current Status */}
      <td className="px-6 py-4">
        {status === 'COMPLETED' ? (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-500 border border-slate-200">
            Completed
          </span>
        ) : status === 'CANCELLED' ? (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-red-50 text-red-600 border border-red-100">
            Cancelled
          </span>
        ) : isPast ? (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-amber-50 text-amber-600 border border-amber-100">
            Overdue
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-green-50 text-green-600 border border-green-100 flex items-center gap-1.5 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Scheduled
          </span>
        )}
      </td>

      {/* Action */}
      <td className="px-6 py-4 text-right">
        {status === 'SCHEDULED' ? (
          <div className="flex flex-col items-end gap-2">
            <button 
              type="button" 
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={isUpdatingStatus}
              className="text-[10px] font-bold text-green-600 hover:text-white hover:bg-green-600 transition-colors border border-green-200 px-2 py-1 rounded bg-green-50 disabled:opacity-50 w-full"
            >
              Mark Completed
            </button>
            <button 
              type="button" 
              onClick={() => {
                if (confirm('Are you sure you want to cancel this class?')) {
                  handleStatusUpdate('CANCELLED');
                }
              }}
              disabled={isUpdatingStatus}
              className="text-[10px] font-bold text-red-600 hover:text-white hover:bg-red-600 transition-colors border border-red-200 px-2 py-1 rounded bg-red-50 disabled:opacity-50 w-full"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">N/A</span>
        )}
      </td>
    </tr>
  );
}
