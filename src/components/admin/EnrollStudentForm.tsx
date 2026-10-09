'use client';

import { useTransition } from 'react';
import Swal from 'sweetalert2';
import { adminCreateEnrollment } from '../../../app/actions';

interface EnrollStudentFormProps {
  users: { id: string; name: string | null; email: string }[];
  packages: { id: string; title: string }[];
}

export default function EnrollStudentForm({ users, packages }: EnrollStudentFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await adminCreateEnrollment(formData);
      if (res && res.error) {
        Swal.fire('Error', res.error, 'error');
      } else {
        Swal.fire({
          title: 'Success!',
          text: 'Student enrolled successfully.',
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student</label>
        <select name="userId" required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white">
          <option value="">Select Student...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name || 'No Name'} ({u.email})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Package</label>
        <select name="packageId" required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white">
          <option value="">Select Package...</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>
      <div>
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full inline-flex items-center justify-center px-6 py-2.5 font-bold text-white bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 rounded-xl transition-all shadow-sm text-sm disabled:opacity-50"
        >
          {isPending ? 'Enrolling...' : 'Enroll Student'}
        </button>
      </div>
    </form>
  );
}
