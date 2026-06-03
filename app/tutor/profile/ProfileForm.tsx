"use client";

import { startTransition, useState } from 'react';
import Swal from 'sweetalert2';
import { updateTutorProfile } from '../../actions';

interface ProfileFormProps {
  initialBio: string;
  userName: string | null;
  userEmail: string;
}

export function ProfileForm({ initialBio, userName, userEmail }: ProfileFormProps) {
  const [bio, setBio] = useState(initialBio);
  const [name, setName] = useState(userName || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('name', name);
    if (avatar) formData.append('avatar', avatar);

    startTransition(async () => {
      const res = await updateTutorProfile(formData);
      setIsPending(false);

      if (res.error) {
        Swal.fire('Error', res.error, 'error');
      } else {
        setAvatar(null); // Clear selected file after success
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Your profile has been updated.',
          confirmButtonColor: '#ea580c', // orange-600
        }).then(() => {
          window.location.href = '/tutor/dashboard';
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium" 
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Profile Picture</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) setAvatar(e.target.files[0]);
            }}
            className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" 
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-bold text-slate-700">Email Address</label>
          <input 
            type="email" 
            defaultValue={userEmail} 
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 bg-slate-50 cursor-not-allowed transition-all text-sm font-medium" 
            disabled 
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-bold text-slate-700">Instructor Bio</label>
          <textarea 
            rows={4}
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio about yourself..."
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium" 
          />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
         <button 
            type="submit" 
            disabled={isPending}
            className="px-6 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving...' : 'Save Profile'}
         </button>
      </div>
    </form>
  );
}
