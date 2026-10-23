'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGalleryItem, updateGalleryItem } from './actions';
import Link from 'next/link';

interface GalleryFormProps {
  initialData?: any;
}

export default function GalleryForm({ initialData }: GalleryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>(initialData?.mediaType || 'IMAGE');
  const [mediaSource, setMediaSource] = useState<'FILE' | 'URL'>('FILE');
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.mediaUrl || '');
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string>(initialData?.thumbnailUrl || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleThumbFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbPreviewUrl(url);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    formData.set('mediaType', mediaType);

    try {
      if (initialData?.id) {
        await updateGalleryItem(initialData.id, formData);
      } else {
        await createGalleryItem(formData);
      }
      router.push('/admin/gallery');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save gallery item.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-sm">
          {errorMsg}
        </div>
      )}

      {/* Media Type Toggle */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Media Type</label>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <button
            type="button"
            onClick={() => setMediaType('IMAGE')}
            className={`py-3 px-5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
              mediaType === 'IMAGE'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent shadow-md shadow-orange-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>📷 Success Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaType('VIDEO')}
            className={`py-3 px-5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
              mediaType === 'VIDEO'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent shadow-md shadow-orange-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>🎥 Video Review / Demo</span>
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Story / Review Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={initialData?.title}
            placeholder="e.g. Rahul Sharma Placed as MERN Developer at Tech Mahindra"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Category</label>
          <select
            name="category"
            defaultValue={initialData?.category || 'SUCCESS_STORY'}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900"
          >
            <option value="SUCCESS_STORY">Success Story</option>
            <option value="PLACEMENT">Job Placement & Offer</option>
            <option value="VIDEO_REVIEW">Student Video Review</option>
            <option value="PROJECT_DEMO">Live Project Demo</option>
            <option value="CAMPUS">Campus & Lab Highlights</option>
          </select>
        </div>
      </div>

      {/* Student Details */}
      <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <span>🎓</span> Student & Placement Details (Optional)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Student Name</label>
            <input
              type="text"
              name="studentName"
              defaultValue={initialData?.studentName}
              placeholder="e.g. Rahul Sharma"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Program / Course</label>
            <input
              type="text"
              name="courseName"
              defaultValue={initialData?.courseName}
              placeholder="e.g. Full Stack MERN"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Hired By / Company</label>
            <input
              type="text"
              name="companyPlaced"
              defaultValue={initialData?.companyPlaced}
              placeholder="e.g. Infosys / Wipro"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Salary Package / Hike</label>
            <input
              type="text"
              name="salaryPackage"
              defaultValue={initialData?.salaryPackage}
              placeholder="e.g. ₹6.5 LPA"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Media Upload / URL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
            {mediaType === 'VIDEO' ? 'Video File / Link' : 'Image File / Link'} <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMediaSource('FILE')}
              className={`px-3 py-1 rounded-lg ${mediaSource === 'FILE' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMediaSource('URL')}
              className={`px-3 py-1 rounded-lg ${mediaSource === 'URL' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Or Enter URL / YouTube
            </button>
          </div>
        </div>

        {mediaSource === 'FILE' ? (
          <div>
            <input
              type="file"
              name="mediaFile"
              accept={mediaType === 'VIDEO' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
              onChange={handleMediaFileChange}
              className="w-full border border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-2">
              {mediaType === 'VIDEO'
                ? 'Supported video formats: MP4, WebM, MOV (Max 50MB)'
                : 'Supported image formats: PNG, JPG, WebP (Max 10MB)'}
            </p>
          </div>
        ) : (
          <div>
            <input
              type="text"
              name="mediaUrl"
              defaultValue={initialData?.mediaUrl}
              placeholder={mediaType === 'VIDEO' ? 'e.g. https://www.youtube.com/watch?v=... or https://.../video.mp4' : 'https://example.com/image.jpg'}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white text-slate-900 font-medium"
            />
          </div>
        )}

        {/* Existing / Preview Media */}
        {previewUrl && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 mb-2">Media Preview:</p>
            {mediaType === 'VIDEO' ? (
              previewUrl.includes('youtube.com') || previewUrl.includes('youtu.be') ? (
                <div className="aspect-video w-full max-w-md rounded-xl overflow-hidden bg-black">
                  <p className="text-xs text-slate-400 p-4">YouTube Link: {previewUrl}</p>
                </div>
              ) : (
                <video src={previewUrl} controls className="max-w-md rounded-xl border max-h-64 object-cover" />
              )
            ) : (
              <img src={previewUrl} alt="Preview" className="max-w-xs max-h-56 rounded-xl object-cover border" />
            )}
          </div>
        )}
      </div>

      {/* Video Thumbnail Upload (If video) */}
      {mediaType === 'VIDEO' && (
        <div className="space-y-2 p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
            Video Cover Thumbnail (Optional)
          </label>
          <input
            type="file"
            name="thumbFile"
            accept="image/*"
            onChange={handleThumbFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700"
          />
          {thumbPreviewUrl && (
            <img src={thumbPreviewUrl} alt="Thumb Preview" className="mt-3 w-32 h-20 rounded-lg object-cover border" />
          )}
        </div>
      )}

      {/* Review Content / Description */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
          Story / Student Review Quote / Description
        </label>
        <textarea
          name="description"
          rows={4}
          defaultValue={initialData?.description}
          placeholder="Quote from the student about their learning experience, mentors, live projects, and placement journey..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white text-slate-900 font-medium text-sm"
        />
      </div>

      {/* Rating & Display Order */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Rating (Stars)</label>
          <select
            name="rating"
            defaultValue={initialData?.rating || 5}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 font-bold"
          >
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Display Order</label>
          <input
            type="number"
            name="order"
            defaultValue={initialData?.order || 0}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 font-bold"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked={initialData ? initialData.isActive : true}
            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 border-slate-300"
          />
          <label htmlFor="isActive" className="text-sm font-bold text-slate-800 cursor-pointer">
            Publish on Website & Mobile App
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
        <Link
          href="/admin/gallery"
          className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-extrabold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-60 text-sm cursor-pointer"
        >
          {loading ? 'Saving Media...' : initialData?.id ? 'Update Gallery Item' : 'Publish Gallery Media'}
        </button>
      </div>
    </form>
  );
}
