'use client'

// ============================================================================
// SpecsAccordion.tsx — разворачиваемые характеристики кассы
// Показывается в карточке каталога по клику на "Характеристики"
// При разворачивании контент всплывает поверх соседних карточек (absolute),
// не раздвигая grid.
// ============================================================================

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { KassaSpecGroup } from '@/config/kass-catalog'

interface Props {
  specGroups: KassaSpecGroup[]
}

export function SpecsAccordion({ specGroups }: Props) {
  const [open, setOpen] = useState(false)

  if (!specGroups || specGroups.length === 0) return null

  return (
    <div className="relative border-t border-slate-100 pt-2 mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-xs font-semibold text-[#163A5F] hover:text-[#1E4A78] py-1"
        aria-expanded={open}
      >
        <span>Характеристики</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl p-2.5 space-y-2.5 max-h-[400px] overflow-y-auto">
          {specGroups.map((group, gi) => (
            <div key={gi} className="bg-slate-50 rounded-lg p-2">
              <div className="text-[10px] font-bold text-[#163A5F] uppercase tracking-wider mb-1">
                {group.name}
              </div>
              <dl className="space-y-0.5">
                {group.specs.map((spec, si) => (
                  <div key={si} className="flex items-start justify-between gap-2 text-[11px]">
                    <dt className="text-slate-500 flex-shrink-0">{spec.label}</dt>
                    <dd className="font-medium text-[#163A5F] text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
