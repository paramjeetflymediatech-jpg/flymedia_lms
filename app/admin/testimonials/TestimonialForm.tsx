'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTestimonial, updateTestimonial } from './actions';
import ThumbnailUpload from '../../../src/components/admin/ThumbnailUpload';

export default function TestimonialForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);

    try {
      if (initialData?.id) {
        await updateTestimonial(initialData.id, formData);
      } else {
        await createTestimonial(formData);
      }
      router.push('/admin/testimonials');
    } catch (err) {
      console.error(err);
      alert('Failed to save testimonial. Make sure you have synced the database by restarting the app.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
          <input 
            type="text" 
            name="name" 
            required 
            defaultValue={initialData?.name} 
            className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Role/Position</label>
          <input 
            type="text" 
            name="role" 
            required 
            defaultValue={initialData?.role} 
            className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
            placeholder="e.g. Frontend Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Upload Avatar (Local)</label>
          <ThumbnailUpload name="avatarFile" />
          {initialData?.avatar && initialData.avatar.startsWith('/uploads') && (
            <p className="text-xs text-slate-500 mt-2">Current avatar is a local upload.</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Or enter Image URL</label>
          <input 
            type="url" 
            name="avatarUrl" 
            defaultValue={initialData?.avatar && !initialData.avatar.startsWith('/uploads') ? initialData.avatar : ''} 
            className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
        <textarea 
          name="content" 
          required 
          rows={4}
          defaultValue={initialData?.content} 
          className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
        ></textarea>
      </div>

      <div className="flex gap-8">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
          <select 
            name="rating" 
            defaultValue={initialData?.rating || 5} 
            className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            {[5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num} Stars</option>
            ))}
          </select>
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              name="isActive" 
              defaultChecked={initialData ? initialData.isActive : true}
              className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" 
            />
            <span className="text-sm font-bold text-slate-700">Active (Show on Homepage)</span>
          </label>
        </div>
      </div>

      <div className="pt-6 flex gap-4">
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="px-6 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Testimonial'}
        </button>
      </div>
    </form>
  );
}
