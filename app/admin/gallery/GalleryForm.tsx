'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGalleryItem, updateGalleryItem } from './actions';
import Link from 'next/link';
import ImageCropModal from './ImageCropModal';

interface GalleryFormProps {
  initialData?: any;
}

type FitMode = 'cover' | 'contain' | 'original';

async function resizeImageToCardRatio(
  file: File,
  fitMode: FitMode = 'cover',
  targetWidth = 1280,
  targetHeight = 720
): Promise<{ file: File; dataUrl: string; originalSize: number; newSize: number; dimensions: string }> {
  const originalSize = file.size;

  if (fitMode === 'original' || !file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    return {
      file,
      dataUrl: url,
      originalSize,
      newSize: originalSize,
      dimensions: 'Original',
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const url = URL.createObjectURL(file);
          resolve({ file, dataUrl: url, originalSize, newSize: originalSize, dimensions: `${img.width}×${img.height}` });
          return;
        }

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        const imgAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let drawWidth = targetWidth;
        let drawHeight = targetHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (fitMode === 'cover') {
          if (imgAspect > targetAspect) {
            drawWidth = targetHeight * imgAspect;
            offsetX = (targetWidth - drawWidth) / 2;
          } else {
            drawHeight = targetWidth / imgAspect;
            offsetY = (targetHeight - drawHeight) / 2;
          }
        } else {
          // contain
          if (imgAspect > targetAspect) {
            drawHeight = targetWidth / imgAspect;
            offsetY = (targetHeight - drawHeight) / 2;
          } else {
            drawWidth = targetHeight * imgAspect;
            offsetX = (targetWidth - drawWidth) / 2;
          }
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              const url = URL.createObjectURL(file);
              resolve({ file, dataUrl: url, originalSize, newSize: originalSize, dimensions: `${img.width}×${img.height}` });
              return;
            }
            const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '');
            const newFile = new File([blob], `${cleanBase}-16x9.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            const dataUrl = canvas.toDataURL('image/webp', 0.92);
            resolve({
              file: newFile,
              dataUrl,
              originalSize,
              newSize: blob.size,
              dimensions: `${targetWidth} × ${targetHeight} px (16:9 Card)`,
            });
          },
          'image/webp',
          0.92
        );
      };
      img.onerror = () => {
        const url = URL.createObjectURL(file);
        resolve({ file, dataUrl: url, originalSize, newSize: originalSize, dimensions: 'Original' });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      const url = URL.createObjectURL(file);
      resolve({ file, dataUrl: url, originalSize, newSize: originalSize, dimensions: 'Original' });
    };
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function GalleryForm({ initialData }: GalleryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>(initialData?.mediaType || 'IMAGE');
  const [mediaSource, setMediaSource] = useState<'FILE' | 'URL'>('FILE');
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.mediaUrl || '');
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string>(initialData?.thumbnailUrl || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Sizing & Optimization State
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [rawMediaFile, setRawMediaFile] = useState<File | null>(null);
  const [processedMediaFile, setProcessedMediaFile] = useState<File | null>(null);
  const [mediaStats, setMediaStats] = useState<{ originalSize: number; newSize: number; dimensions: string } | null>(null);

  const [rawThumbFile, setRawThumbFile] = useState<File | null>(null);
  const [processedThumbFile, setProcessedThumbFile] = useState<File | null>(null);
  const [thumbStats, setThumbStats] = useState<{ originalSize: number; newSize: number; dimensions: string } | null>(null);

  // Interactive Crop Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'media' | 'thumb'>('media');
  const [cropSourceUrl, setCropSourceUrl] = useState<string>('');

  // Form input live values for card simulator
  const [liveTitle, setLiveTitle] = useState(initialData?.title || '');
  const [liveStudent, setLiveStudent] = useState(initialData?.studentName || '');
  const [liveCourse, setLiveCourse] = useState(initialData?.courseName || '');
  const [liveSalary, setLiveSalary] = useState(initialData?.salaryPackage || '');

  const openCropperForMedia = () => {
    if (rawMediaFile) {
      setCropSourceUrl(URL.createObjectURL(rawMediaFile));
      setCropTarget('media');
      setIsCropModalOpen(true);
    } else if (previewUrl) {
      setCropSourceUrl(previewUrl);
      setCropTarget('media');
      setIsCropModalOpen(true);
    }
  };

  const openCropperForThumb = () => {
    if (rawThumbFile) {
      setCropSourceUrl(URL.createObjectURL(rawThumbFile));
      setCropTarget('thumb');
      setIsCropModalOpen(true);
    } else if (thumbPreviewUrl) {
      setCropSourceUrl(thumbPreviewUrl);
      setCropTarget('thumb');
      setIsCropModalOpen(true);
    }
  };

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawMediaFile(file);
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setCropSourceUrl(objectUrl);
        setCropTarget('media');
        // Auto-open interactive crop modal so admin can position perfectly
        setIsCropModalOpen(true);

        // Also prepare default 16:9 crop as initial preview
        const result = await resizeImageToCardRatio(file, fitMode);
        setProcessedMediaFile(result.file);
        setPreviewUrl(result.dataUrl);
        setMediaStats({
          originalSize: result.originalSize,
          newSize: result.newSize,
          dimensions: result.dimensions,
        });
      } else {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setProcessedMediaFile(null);
        setMediaStats(null);
      }
    }
  };

  const handleFitModeChange = async (newMode: FitMode) => {
    setFitMode(newMode);
    if (rawMediaFile && rawMediaFile.type.startsWith('image/')) {
      const result = await resizeImageToCardRatio(rawMediaFile, newMode);
      setProcessedMediaFile(result.file);
      setPreviewUrl(result.dataUrl);
      setMediaStats({
        originalSize: result.originalSize,
        newSize: result.newSize,
        dimensions: result.dimensions,
      });
    }
  };

  const handleThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawThumbFile(file);
      const objectUrl = URL.createObjectURL(file);
      setCropSourceUrl(objectUrl);
      setCropTarget('thumb');
      setIsCropModalOpen(true);

      const result = await resizeImageToCardRatio(file, 'cover');
      setProcessedThumbFile(result.file);
      setThumbPreviewUrl(result.dataUrl);
      setThumbStats({
        originalSize: result.originalSize,
        newSize: result.newSize,
        dimensions: result.dimensions,
      });
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    formData.set('mediaType', mediaType);

    if (processedMediaFile) {
      formData.set('mediaFile', processedMediaFile);
    }
    if (processedThumbFile) {
      formData.set('thumbFile', processedThumbFile);
    }

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
            onChange={(e) => setLiveTitle(e.target.value)}
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
              onChange={(e) => setLiveStudent(e.target.value)}
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
              onChange={(e) => setLiveCourse(e.target.value)}
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
              onChange={(e) => setLiveSalary(e.target.value)}
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
          <div className="space-y-3">
            <input
              type="file"
              name="mediaFile"
              accept={mediaType === 'VIDEO' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
              onChange={handleMediaFileChange}
              className="w-full border border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
            />

            {/* 16:9 Card Auto-Sizing Controls for Images */}
            {mediaType === 'IMAGE' && (
              <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Card Size Optimization (16:9 Aspect Ratio)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={openCropperForMedia}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-white font-extrabold hover:bg-orange-600 shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>✂️ Open Interactive Cropper</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFitModeChange('cover')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        fitMode === 'cover'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Fill Card
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFitModeChange('contain')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        fitMode === 'contain'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Padding
                    </button>
                  </div>
                </div>

                {mediaStats ? (
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 pt-1">
                    <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ✓ Formatted: {mediaStats.dimensions}
                    </span>
                    <span>Optimized File: <strong>{formatBytes(mediaStats.newSize)}</strong> (Original: {formatBytes(mediaStats.originalSize)})</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Uploaded photos will be automatically formatted to 1280 × 720 (16:9) to fit gallery cards without distortion on web and mobile. Click "✂️ Open Interactive Cropper" to zoom and pan.
                  </p>
                )}
              </div>
            )}
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

        {/* Live 16:9 Card Simulator Preview */}
        {previewUrl && (
          <div className="mt-4 p-5 bg-slate-950 rounded-3xl border border-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                Live 16:9 Gallery Card Simulator
              </span>
              <div className="flex items-center gap-2">
                {mediaType === 'IMAGE' && (
                  <button
                    type="button"
                    onClick={openCropperForMedia}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-all shadow-md shadow-orange-500/30 cursor-pointer"
                  >
                    <span>✂️ Crop &amp; Reposition</span>
                  </button>
                )}
                <span className="text-[11px] font-bold text-slate-400 bg-white/10 px-2.5 py-1 rounded-full hidden sm:inline-block">
                  Matches Web &amp; Mobile App Card
                </span>
              </div>
            </div>

            {mediaType === 'VIDEO' ? (
              previewUrl.includes('youtube.com') || previewUrl.includes('youtu.be') ? (
                <div className="aspect-video w-full max-w-lg rounded-2xl overflow-hidden bg-black border border-white/15 relative">
                  <p className="text-xs text-slate-400 p-4">YouTube: {previewUrl}</p>
                </div>
              ) : (
                <div className="aspect-video w-full max-w-lg rounded-2xl overflow-hidden bg-black border border-white/15">
                  <video src={previewUrl} controls className="w-full h-full object-contain" />
                </div>
              )
            ) : (
              <div className="aspect-video w-full max-w-lg rounded-2xl overflow-hidden bg-slate-950 border border-white/15 relative shadow-xl">
                <img
                  src={previewUrl}
                  alt="Card Preview"
                  className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                />
                {/* Live Card Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent pointer-events-none" />
                <div className="absolute bottom-3.5 left-4 right-4 pointer-events-none">
                  <p className="text-white font-extrabold text-sm line-clamp-1 drop-shadow-md">
                    {liveTitle || 'Story / Placement Title Preview'}
                  </p>
                  {(liveStudent || liveCourse || liveSalary) && (
                    <p className="text-xs text-orange-300 font-bold mt-0.5 drop-shadow">
                      {liveStudent ? liveStudent : 'Student Name'}
                      {liveCourse ? ` • ${liveCourse}` : ''}
                      {liveSalary ? ` • ${liveSalary}` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Thumbnail Upload (If video) */}
      {mediaType === 'VIDEO' && (
        <div className="space-y-3 p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Video Cover Thumbnail (16:9 Card Ratio)
            </label>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
              Auto-sizes to 1280 × 720
            </span>
          </div>
          <input
            type="file"
            name="thumbFile"
            accept="image/*"
            onChange={handleThumbFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 cursor-pointer"
          />
          {thumbPreviewUrl && (
            <div className="mt-3 flex items-start gap-4">
              <div className="aspect-video w-56 rounded-xl overflow-hidden bg-black border border-slate-300 relative shadow-sm shrink-0">
                <img src={thumbPreviewUrl} alt="Thumb Preview" className="w-full h-full object-cover" />
                <div className="absolute top-1.5 left-1.5 bg-black/75 px-2 py-0.5 rounded text-[10px] font-extrabold text-orange-400">
                  16:9 Cover
                </div>
                {thumbStats && (
                  <div className="absolute bottom-1 right-1 bg-black/85 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                    {formatBytes(thumbStats.newSize)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={openCropperForThumb}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <span>✂️ Crop Thumbnail</span>
              </button>
            </div>
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

      {/* Interactive Image Cropper Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={cropSourceUrl}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={(file, dataUrl, size) => {
          if (cropTarget === 'media') {
            setProcessedMediaFile(file);
            setPreviewUrl(dataUrl);
            setMediaStats({
              originalSize: rawMediaFile ? rawMediaFile.size : size,
              newSize: size,
              dimensions: '1280 × 720 px (16:9 Card)',
            });
          } else {
            setProcessedThumbFile(file);
            setThumbPreviewUrl(dataUrl);
            setThumbStats({
              originalSize: rawThumbFile ? rawThumbFile.size : size,
              newSize: size,
              dimensions: '1280 × 720 px (16:9 Cover)',
            });
          }
        }}
        targetFileName={cropTarget === 'media' ? 'gallery-media-card.webp' : 'video-thumb-card.webp'}
        defaultAspect={16 / 9}
      />
    </form>
  );
}
