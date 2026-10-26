'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Crop, Move } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File, croppedDataUrl: string, size: number) => void;
  targetFileName?: string;
  defaultAspect?: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  targetWidth = 1280,
  targetHeight = 720,
  fileName = 'cropped-card.webp'
): Promise<{ file: File; dataUrl: string; size: number }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size to the target 1280x720 card size
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Background filler (in case of letterbox/rotation)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // If rotated, handle rotation canvas
  if (rotation !== 0) {
    const rotCanvas = document.createElement('canvas');
    const rotCtx = rotCanvas.getContext('2d');
    if (rotCtx) {
      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
      rotCanvas.width = safeArea;
      rotCanvas.height = safeArea;

      rotCtx.translate(safeArea / 2, safeArea / 2);
      rotCtx.rotate((rotation * Math.PI) / 180);
      rotCtx.translate(-image.width / 2, -image.height / 2);
      rotCtx.drawImage(image, 0, 0);

      // Now draw from rotated canvas to target
      ctx.drawImage(
        rotCanvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
      );
    }
  } else {
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, {
          type: 'image/webp',
          lastModified: Date.now(),
        });
        const dataUrl = canvas.toDataURL('image/webp', 0.92);
        resolve({ file, dataUrl, size: blob.size });
      },
      'image/webp',
      0.92
    );
  });
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  targetFileName = 'gallery-card.webp',
  defaultAspect = 16 / 9,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(defaultAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (newCrop: Point) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handleCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const { file, dataUrl, size } = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        1280,
        720,
        targetFileName
      );
      onCropComplete(file, dataUrl, size);
      onClose();
    } catch (e) {
      console.error('Failed to crop image', e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col my-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Crop size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide uppercase">
                Crop &amp; Position Image for Card
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Drag to pan • Pinch or use slider to zoom • Formats to 1280 × 720 (16:9)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Aspect Ratio:</span>
            <button
              type="button"
              onClick={() => setAspect(16 / 9)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                aspect === 16 / 9
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              16:9 Card (Default)
            </button>
            <button
              type="button"
              onClick={() => setAspect(4 / 3)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                aspect === 4 / 3
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              4:3
            </button>
            <button
              type="button"
              onClick={() => setAspect(1)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                aspect === 1
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              1:1 Square
            </button>
          </div>

          <button
            type="button"
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCw size={12} />
            <span>Rotate 90°</span>
          </button>
        </div>

        {/* Cropper Canvas Container */}
        <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-950 overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
            showGrid={true}
            cropShape="rect"
            style={{
              containerStyle: { background: '#020617' },
              cropAreaStyle: {
                border: '2px solid #f97316',
                boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.72)',
              },
            }}
          />

          {/* Quick Helper Badge */}
          <div className="absolute bottom-3 left-3 pointer-events-none bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15 text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
            <Move size={12} className="text-orange-400" />
            <span>Drag image to position inside crop frame</span>
          </div>
        </div>

        {/* Zoom & Action Controls */}
        <div className="px-5 py-4 bg-slate-900 border-t border-white/10 space-y-4 shrink-0">
          {/* Zoom Slider */}
          <div className="flex items-center gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ZoomIn size={16} />
            </button>
            <span className="text-xs font-bold text-slate-400 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              <span>{isProcessing ? 'Processing Crop...' : 'Apply Crop & Use (1280 × 720)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
