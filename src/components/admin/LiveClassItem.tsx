"use client";

import { useState } from 'react';
import { adminDeleteLiveClass, adminUpdateLiveClass } from '../../../app/actions';
import DeleteConfirmButton from './DeleteConfirmButton';

interface LiveClassItemProps {
  lc: any;
  pkgId: string;
  tutors: any[];
}

export default function LiveClassItem({ lc, pkgId, tutors }: LiveClassItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    // Return an edit form
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-blue-100 pb-2">
          <h5 className="font-bold text-xs text-blue-800 uppercase tracking-wider">Edit Live Class</h5>
          <button 
            type="button" 
            onClick={() => setIsEditing(false)} 
            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-2 py-1 bg-white border border-blue-200 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
        <form
          action={async (formData: FormData) => {
            const res = await adminUpdateLiveClass(lc.id, pkgId, formData);
            if (res && res.success) {
              setIsEditing(false);
            } else {
              alert(res?.error || 'Failed to update live class');
            }
          }}
          className="space-y-3"
        >
          <input
            name="title"
            type="text"
            required
            defaultValue={lc.title}
            placeholder="Class Title"
            className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="startTime"
              type="datetime-local"
              required
              defaultValue={new Date(new Date(lc.startTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900"
            />
            <input
              name="duration"
              type="number"
              defaultValue={lc.duration}
              placeholder="Duration (mins)"
              className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900"
            />
          </div>
          <input
            name="meetLink"
            type="url"
            defaultValue={lc.meetLink || ''}
            placeholder="Google Meet Link (https://...)"
            className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900"
          />
          <select
            name="tutorId"
            defaultValue={lc.tutorId || ''}
            className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900"
          >
            <option value="">Select Tutor (Optional)</option>
            {tutors.map((tutor: any) => (
              <option key={tutor.id} value={tutor.id}>{tutor.name} ({tutor.email})</option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={lc.status || 'SCHEDULED'}
            className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow"
          >
            Save Changes
          </button>
        </form>
      </div>
    );
  }

  // Display mode
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2 group hover:border-blue-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h5 className="font-extrabold text-sm text-slate-900">{lc.title}</h5>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-2 py-1 bg-blue-50 rounded-md transition-colors"
          >
            Edit
          </button>
          <DeleteConfirmButton
            itemType="Live Class"
            onDelete={async () => {
              await adminDeleteLiveClass(lc.id, pkgId);
            }}
            className="text-[10px] text-red-500 hover:text-red-600 font-bold px-2 py-1 bg-red-50 rounded-md transition-colors"
          >
            Delete
          </DeleteConfirmButton>
        </div>
      </div>
      <div className="text-xs text-slate-600 space-y-1">
        <p><strong>Time:</strong> {new Date(lc.startTime).toLocaleString()} ({lc.duration} mins)</p>
        <p><strong>Tutor:</strong> {lc.tutor ? lc.tutor.name : 'Unassigned'}</p>
        <p className="flex items-center gap-2">
          <strong>Meet Link:</strong>{' '}
          {lc.meetLink ? (
            <a href={lc.meetLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
              {lc.meetLink}
            </a>
          ) : 'None'}
        </p>
      </div>
    </div>
  );
}
