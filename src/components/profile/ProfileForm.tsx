"use client";

import { useState, useTransition } from 'react';
import Swal from 'sweetalert2';

interface ProfileFormProps {
  user: any;
  updateAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export default function ProfileForm({ user, updateAction }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create initials for avatar fallback
  const initials = user.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'ST';

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateAction(formData);
      if (result.error) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: result.error,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Profile updated successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        setIsEditing(false);
      }
    });
  };

  return (
    <form action={handleAction} className="px-6 sm:px-10 pb-10">
      
      {/* Avatar & Title */}
      <div className="relative flex justify-between items-end pt-6 md:pt-10 mb-8">
        <div className="flex items-end gap-6">
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-md relative overflow-hidden ${isEditing ? 'group' : ''}`}>
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-3xl md:text-5xl font-bold text-purple-600">
                {initials}
              </div>
            )}
            
            {isEditing && (
              <>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold backdrop-blur-sm pointer-events-none">
                  Change Photo
                </div>
                <input 
                  type="file" 
                  name="avatar" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  title="Upload new avatar"
                />
              </>
            )}
          </div>
          <div className="mb-2 md:mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{user.name || 'Student Name'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <div className="hidden sm:flex gap-3 mb-2">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => setIsEditing(true)}
            className="hidden sm:inline-flex px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm mb-2"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-3xl">
        {/* Personal Info */}
        <div className="space-y-6">
          <div className="border border-slate-100 rounded-2xl p-6 md:p-8 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-purple-600">👤</span> Personal Information
            </h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    defaultValue={user.name || ''} 
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-colors
                      ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={user.email} 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 bg-slate-100 text-slate-500 shadow-sm opacity-70 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed directly.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Bio</label>
                <textarea 
                  rows={5}
                  name="bio"
                  defaultValue={user.bio || ''}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm resize-none transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="Write a short bio about yourself and your learning goals..."
                ></textarea>
              </div>

              {user.role === 'TUTOR' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">What to expect in our Trial Call (One point per line)</label>
                  <textarea 
                    rows={4}
                    name="trialExpectations"
                    defaultValue={user.trialExpectations ? user.trialExpectations.join('\n') : ''}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm resize-none transition-colors
                      ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                    placeholder="Enter expectations, one on each line..."
                  ></textarea>
                </div>
              )}

              {/* Mobile Buttons */}
              <div className="pt-4 flex justify-end sm:hidden">
                {isEditing ? (
                  <div className="flex flex-col w-full gap-3">
                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-70"
                    >
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="w-full px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
