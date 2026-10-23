"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AvatarAdjustModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

export default function AvatarAdjustModal({
  isOpen,
  imageSrc,
  onClose,
  onConfirm,
}: AvatarAdjustModalProps) {
  const CROP_SIZE = 240; // Diameter of crop circle in UI
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 400, height: 400 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Measure natural dimensions whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setNaturalSize({
        width: img.naturalWidth || 400,
        height: img.naturalHeight || 400,
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1.0);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Compute UI dimensions to cover CROP_SIZE
  const aspect = naturalSize.width / naturalSize.height;
  const uiWidth = aspect >= 1 ? CROP_SIZE * aspect : CROP_SIZE;
  const uiHeight = aspect >= 1 ? CROP_SIZE : CROP_SIZE / aspect;

  // Generate cropped preview data url (WYSIWYG)
  const generateCroppedImage = useCallback(
    (outputSize = 500): string => {
      const img = imageRef.current;
      if (!img) return '';

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Circle clipping mask
      ctx.save();
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      const factor = outputSize / CROP_SIZE;

      // 2. Translate to center of canvas
      ctx.translate(outputSize / 2, outputSize / 2);

      // 3. User pan offset (scaled to canvas)
      ctx.translate(position.x * factor, position.y * factor);

      // 4. Rotation around center
      ctx.rotate((rotation * Math.PI) / 180);

      // 5. User zoom
      ctx.scale(scale, scale);

      // 6. Draw image centered
      const drawW = uiWidth * factor;
      const drawH = uiHeight * factor;
      try {
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      } catch (err) {
        console.warn('Canvas draw error:', err);
        return '';
      }
      ctx.restore();

      try {
        return canvas.toDataURL('image/jpeg', 0.92);
      } catch (e) {
        console.warn('Canvas toDataURL failed (possible CORS issue):', e);
        return '';
      }
    },
    [scale, rotation, position, uiWidth, uiHeight]
  );

  // Non-passive wheel listener for smooth zoom without page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.0025;
      setScale(prev => Math.min(Math.max(0.5, prev + delta), 3.5));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [isOpen]);

  // Update miniature live preview
  useEffect(() => {
    if (isOpen && imageSrc) {
      const timer = setTimeout(() => {
        try {
          const preview = generateCroppedImage(160);
          if (preview) setLivePreviewUrl(preview);
        } catch (_) {}
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, imageSrc, generateCroppedImage]);

  // Drag handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleApply = () => {
    const cropped = generateCroppedImage(500);
    if (cropped) {
      onConfirm(cropped);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col"
        onMouseUp={handleMouseUp}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-orange-50/30">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>✂️</span> Adjust Profile Picture
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Drag to reposition, slider to zoom and frame your photo</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Viewport and Preview Container */}
        <div className="p-6 flex flex-col items-center">
          {/* Circular Cropping Frame Viewport */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-[280px] h-[280px] bg-slate-900 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-inner flex items-center justify-center"
          >
            {/* The Image being transformed */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Adjustment Target"
              className="max-w-none pointer-events-none transition-transform duration-75 select-none"
              style={{
                width: `${uiWidth}px`,
                height: `${uiHeight}px`,
                objectFit: 'cover',
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
              }}
              draggable={false}
            />

            {/* Circular Crop Vignette Mask */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Dark overlay surrounding circle */}
              <div 
                className="w-full h-full absolute inset-0"
                style={{
                  background: 'radial-gradient(circle 120px at center, transparent 120px, rgba(15, 23, 42, 0.72) 121px)',
                }}
              />

              {/* Crisp circular boundary ring with rule of thirds grid */}
              <div className="w-[240px] h-[240px] rounded-full border-2 border-white/90 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                {/* Rule of thirds grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
              </div>
            </div>

            {/* Instruction tooltip */}
            <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
              <span className="bg-black/60 text-white/90 text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                ✋ Drag to position • Scroll to zoom
              </span>
            </div>
          </div>

          {/* Controls: Zoom slider & Rotate / Center tools */}
          <div className="w-full max-w-sm mt-5 space-y-4">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
                  Zoom Scale
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{Math.round(scale * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScale(prev => Math.max(0.6, prev - 0.15))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
                  title="Zoom Out"
                >
                  −
                </button>
                <input
                  type="range"
                  min="0.6"
                  max="3.0"
                  step="0.05"
                  value={scale}
                  onChange={e => setScale(parseFloat(e.target.value))}
                  className="flex-1 accent-orange-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setScale(prev => Math.min(3.0, prev + 0.15))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
                  title="Zoom In"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rotation & Reset Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Rotate 90° ({rotation}°)
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  Center Photo
                </button>
              </div>

              {/* Miniature live preview */}
              {livePreviewUrl && (
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-medium">Preview</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-orange-500 overflow-hidden shadow-sm bg-slate-100 shrink-0">
                    <img src={livePreviewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-sm transition-all"
          >
            ✓ Apply & Save Cropped Picture
          </button>
        </div>
      </div>
    </div>
  );
}
