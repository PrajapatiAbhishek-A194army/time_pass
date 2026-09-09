import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';
import Badge from './Badge';

export default function ProductGallery({
  images = [],
  productName = 'Footwear',
  badge,
  discountPercent,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  const activeImage = images[currentIndex] || images[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
      {/* Thumbnail Selector Column */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[540px] no-scrollbar shrink-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
              currentIndex === idx
                ? 'border-brand-700 shadow-soft ring-2 ring-brand-200'
                : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              className="w-full h-full object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 bg-[#F5F8F6] rounded-3xl overflow-hidden border border-slate-200/80 aspect-square sm:aspect-4/3 md:aspect-square flex items-center justify-center group select-none">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
          {badge && <Badge variant="dark" size="sm">{badge}</Badge>}
          {discountPercent && <Badge variant="accent" size="sm">-{discountPercent}% OFF</Badge>}
        </div>

        {/* Gallery Cycle Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* High-Resolution Main Sneaker Image */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-full cursor-crosshair overflow-hidden flex items-center justify-center p-6"
        >
          <img
            src={activeImage}
            alt={productName}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Zoom Overlay (Desktop) */}
          <div
            style={{
              ...zoomStyle,
              backgroundImage: `url(${activeImage})`,
              backgroundSize: '220%',
              backgroundRepeat: 'no-repeat',
            }}
            className="absolute inset-0 z-10 pointer-events-none hidden md:block"
          />
        </div>

        {/* Image Counter Indicator */}
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
