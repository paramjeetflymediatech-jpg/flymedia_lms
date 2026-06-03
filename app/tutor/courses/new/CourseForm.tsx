"use client";

import { useState, startTransition } from 'react';
import { createCourse } from '../../../actions';
import Swal from 'sweetalert2';

export function CourseForm() {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createCourse(formData);
      setIsPending(false);

      if (res.error) {
        Swal.fire('Error', res.error, 'error');
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Course Created!',
          text: 'Your new course has been saved as a draft.',
          confirmButtonColor: '#ea580c',
        }).then(() => {
          window.location.href = '/tutor/courses';
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700">Course Title</label>
        <input 
          type="text" 
          name="title"
          required
          placeholder="e.g. Advanced TypeScript Patterns"
          className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium" 
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700">Description</label>
        <textarea 
          name="description"
          rows={4}
          required
          placeholder="What will students learn in this course?"
          className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Duration (Minutes)</label>
          <input 
            type="number" 
            name="duration"
            required
            min={0}
            defaultValue={120}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium" 
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Level</label>
          <select 
            name="level"
            required
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium bg-white" 
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Price ($)</label>
          <input 
            type="number" 
            name="price"
            required
            min={0}
            step="0.01"
            defaultValue={49.99}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium" 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
         <a 
           href="/tutor/courses"
           className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm flex items-center"
         >
           Cancel
         </a>
         <button 
            type="submit" 
            disabled={isPending}
            className="px-6 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating...' : 'Create Draft'}
         </button>
      </div>
    </form>
  );
}
