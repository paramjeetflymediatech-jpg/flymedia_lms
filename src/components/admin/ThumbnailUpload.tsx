"use client";

import { useState, ChangeEvent } from 'react';

export default function ThumbnailUpload({ name }: { name: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-3">
      {previewUrl && (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <input
        name={name}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
      />
    </div>
  );
}
