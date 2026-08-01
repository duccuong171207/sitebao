import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Shield, Info, Maximize2 } from 'lucide-react';
import { ArticleImage } from '../types';

interface ImageLightboxProps {
  images: ArticleImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  articleTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between text-white animate-in fade-in duration-200">
      {/* Lightbox Top Header */}
      <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#990000] bg-white px-2 py-0.5 rounded-xs">
            Luiis David Photo Gallery
          </span>
          <span className="text-xs text-gray-400 truncate max-w-md hidden sm:inline">
            {articleTitle}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            ({currentIndex + 1} of {images.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-full cursor-pointer transition-colors ${
              showInfo ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Image Information & Rights"
          >
            <Info size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/20 cursor-pointer transition-colors"
            title="Close Gallery (Esc)"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 min-h-0">
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 cursor-pointer transition-all hover:scale-105 z-20"
            aria-label="Previous Image"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="relative max-w-5xl max-h-full flex flex-col items-center justify-center">
          <img
            src={currentImage.url}
            alt={currentImage.altText || currentImage.caption || 'Article photo'}
            className="max-h-[70vh] max-w-full object-contain rounded-xs shadow-2xl transition-all"
            referrerPolicy="no-referrer"
          />

          {/* Copyright overlay badge */}
          {currentImage.copyright && (
            <div className="absolute top-3 left-3 bg-black/80 text-white/90 text-[10px] font-medium px-2.5 py-1 rounded-xs backdrop-blur-xs flex items-center gap-1.5 border border-white/10">
              <Shield size={11} className="text-amber-400" />
              {currentImage.copyright}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 cursor-pointer transition-all hover:scale-105 z-20"
            aria-label="Next Image"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Info & Thumbnail Bar */}
      <div className="bg-black/90 border-t border-white/10 p-4 font-sans z-10">
        <div className="max-w-5xl mx-auto space-y-3">
          {showInfo && (
            <div className="bg-white/5 border border-white/10 p-3 rounded-xs text-xs space-y-1.5 animate-in slide-in-from-bottom-2">
              {currentImage.caption && (
                <p className="font-serif-body text-sm font-medium text-gray-100">
                  {currentImage.caption}
                </p>
              )}
              {currentImage.description && (
                <p className="text-gray-400 text-xs">{currentImage.description}</p>
              )}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-white/10">
                <span>Credit: <strong className="text-gray-200">{currentImage.credit || 'Luiis David Photography'}</strong></span>
                <span className="text-amber-400 font-medium">{currentImage.copyright || '© Luiis David — All Rights Reserved'}</span>
              </div>
            </div>
          )}

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-14 h-10 rounded-xs overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-[#990000] scale-105 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
