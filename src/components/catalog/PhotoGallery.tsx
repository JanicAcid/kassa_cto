'use client'

// ============================================================================
// PhotoGallery.tsx — большая модалка с фото + миниатюры снизу
// ============================================================================

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  alt: string
  isOpen: boolean
  onClose: () => void
  initialIdx?: number
}

export function PhotoGallery({ images, alt, isOpen, onClose, initialIdx = 0 }: Props) {
  const [idx, setIdx] = useState(initialIdx)

  useEffect(() => {
    if (isOpen) setIdx(initialIdx)
  }, [isOpen, initialIdx])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIdx(p => (p - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setIdx(p => (p + 1) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose, images.length])

  if (!isOpen || images.length === 0) return null

  const go = (delta: number) => setIdx(p => (p + delta + images.length) % images.length)

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* main image */}
        <div className="relative flex-1 flex items-center justify-center min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[idx]}
            alt={`${alt} — фото ${idx + 1}`}
            className="max-w-full max-h-[70vh] object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Назад"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Вперёд"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* counter */}
        <div className="text-center text-white/70 text-sm mt-3">
          {idx + 1} / {images.length}
        </div>

        {/* thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 justify-start sm:justify-center">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === idx ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
