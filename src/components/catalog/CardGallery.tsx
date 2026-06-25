'use client'

// ============================================================================
// CardGallery.tsx — мини-галерея на карточке товара
// Стрелки ◀ ▶, точки, счётчик "1/5"
// Клик по фото открывает большую галерею (PhotoGallery)
// ============================================================================

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { PhotoGallery } from './PhotoGallery'

interface Props {
  images: string[]
  alt: string
  badge?: string
}

export function CardGallery({ images, alt, badge }: Props) {
  const [idx, setIdx] = useState(0)
  const [showFull, setShowFull] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
        Нет фото
      </div>
    )
  }

  // если фото одно — без стрелок
  if (images.length === 1) {
    return (
      <>
        <button
          onClick={() => setShowFull(true)}
          className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden group block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0]} alt={alt} className="w-full h-full object-cover" />
          {badge && (
            <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-1 rounded-md bg-amber-500 text-white shadow">
              {badge}
            </span>
          )}
          <span className="absolute top-2 right-2 w-7 h-7 rounded-md bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Expand className="w-4 h-4 text-[#163A5F]" />
          </span>
        </button>
        <PhotoGallery
          images={images}
          alt={alt}
          isOpen={showFull}
          onClose={() => setShowFull(false)}
          initialIdx={0}
        />
      </>
    )
  }

  const go = (delta: number) => {
    setIdx(prev => (prev + delta + images.length) % images.length)
  }

  return (
    <>
      <div className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[idx]} alt={alt} className="w-full h-full object-cover" />

        {badge && (
          <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-1 rounded-md bg-amber-500 text-white shadow z-10">
            {badge}
          </span>
        )}

        {/* expand button */}
        <button
          onClick={() => setShowFull(true)}
          aria-label="Открыть фото"
          className="absolute top-2 right-2 w-7 h-7 rounded-md bg-white/80 backdrop-blur hover:bg-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-10"
        >
          <Expand className="w-4 h-4 text-[#163A5F]" />
        </button>

        {/* arrows */}
        <button
          onClick={e => { e.stopPropagation(); go(-1) }}
          aria-label="Назад"
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow flex items-center justify-center text-[#163A5F] z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); go(1) }}
          aria-label="Вперёд"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow flex items-center justify-center text-[#163A5F] z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* counter */}
        <div className="absolute bottom-1 right-2 text-[11px] font-medium px-2 py-0.5 rounded bg-black/50 text-white z-10">
          {idx + 1} / {images.length}
        </div>

        {/* dots */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i) }}
              aria-label={`Фото ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === idx ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      <PhotoGallery
        images={images}
        alt={alt}
        isOpen={showFull}
        onClose={() => setShowFull(false)}
        initialIdx={idx}
      />
    </>
  )
}
