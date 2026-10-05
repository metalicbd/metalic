import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Check, Crop, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // মোডাল ওপেন হলে পজিশন ও স্কেল রিসেট
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // মাউস ড্র্যাগ হ্যান্ডলার
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
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

  // টাচ স্ক্রিনের জন্য ড্র্যাগ হ্যান্ডলার
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // ১:১ স্কয়ার রেশিওতে ক্রপ সম্পন্ন করা (HTML5 Canvas এক্সপোর্ট)
  const handleApplyCrop = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // ১:১ রেশিও অনুযায়ী ১২০০x১২০০ পিক্সেল হাই-রেজোলিউশন স্কয়ার ক্যানভাস
    const canvas = document.createElement('canvas');
    const CANVAS_SIZE = 1200;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // বর্তমান প্রিভিউ বক্সের সাইজ
    const cropBoxW = container.clientWidth;
    const cropBoxH = container.clientHeight;
    const ratioX = CANVAS_SIZE / cropBoxW;
    const ratioY = CANVAS_SIZE / cropBoxH;

    ctx.save();
    // ক্যানভাসের সেন্টারে ট্রান্সলেট করা
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.translate(position.x * ratioX, position.y * ratioY);
    ctx.scale(scale * ratioX, scale * ratioY);

    const drawWidth = img.naturalWidth || CANVAS_SIZE;
    const drawHeight = img.naturalHeight || CANVAS_SIZE;

    // ইমেজ ফিট ফ্যাক্টর (Cover)
    const fitScale = Math.max(cropBoxW / drawWidth, cropBoxH / drawHeight);
    const finalW = drawWidth * fitScale;
    const finalH = drawHeight * fitScale;

    try {
      ctx.drawImage(img, -finalW / 2, -finalH / 2, finalW, finalH);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-poster-1x1.webp', { type: 'image/webp' });
          const previewUrl = URL.createObjectURL(blob);
          onCropComplete(file, previewUrl);
        }
      }, 'image/webp', 0.95);
    } catch (err) {
      console.warn('Canvas export fallback:', err);
      // CORS ফলব্যাক
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const fallbackFile = new File([blob], 'cropped-poster.webp', { type: 'image/webp' });
          onCropComplete(fallbackFile, imageSrc);
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col space-y-4 text-left relative">
        
        {/* হেডার */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Crop className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-black uppercase text-black font-sans">
              1:1 Square Aspect Ratio Cropper
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          মাউস দিয়ে টেনে ও জুম করে ছবির যে অংশটুকু ১:১ স্কয়ার ফ্রেমে রাখতে চান, তা সিলেক্ট করুন:
        </p>

        {/* ইন্টারঅ্যাক্টিভ ১:১ স্কয়ার ভিউপোর্ট ফ্রেম */}
        <div className="flex justify-center py-2 select-none">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-blue-500 shadow-inner flex items-center justify-center cursor-move"
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              crossOrigin="anonymous"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                maxWidth: 'none',
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
              className="transition-transform duration-75 select-none"
            />

            {/* ১:১ গ্রিড ওভারলে */}
            <div className="absolute inset-0 border border-white/30 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div />
            </div>

            <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/20">
              1:1 Square Frame
            </span>
          </div>
        </div>

        {/* জুম কন্ট্রোল বার */}
        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(1, s - 0.2))}
            className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:text-black cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-black cursor-pointer"
          />

          <button
            type="button"
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:text-black cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            title="Reset position"
            className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-500 hover:text-black cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-700 text-xs uppercase font-bold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleApplyCrop}
            leftIcon={<Check className="w-4 h-4" />}
            className="bg-black text-white hover:bg-neutral-800 text-xs uppercase font-bold px-6 shadow-md cursor-pointer"
          >
            Apply 1:1 Crop
          </Button>
        </div>

      </div>
    </div>
  );
};

ImageCropModal.displayName = 'ImageCropModal';