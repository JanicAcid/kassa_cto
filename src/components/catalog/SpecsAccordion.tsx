'use client'

// ============================================================================
// SpecsAccordion.tsx — разворачиваемые характеристики кассы
// Показывается в карточке каталога по клику на "Характеристики"
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
    <div className="mt-2 border-t border-slate-100 pt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-xs font-semibold text-[#163A5F] hover:text-[#1E4A78] py-1"
        aria-expanded={open}
      >
        <span>Характеристики</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-2 space-y-3">
          {specGroups.map((group, gi) => (
            <div key={gi} className="bg-slate-50 rounded-lg p-2.5">
              <div className="text-[11px] font-bold text-[#163A5F] uppercase tracking-wider mb-1.5">
                {group.name}
              </div>
              <dl className="space-y-1">
                {group.specs.map((spec, si) => (
                  <div key={si} className="flex items-start justify-between gap-2 text-xs">
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
