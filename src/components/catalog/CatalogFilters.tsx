'use client'

// ============================================================================
// CatalogFilters.tsx — фильтр и сортировка каталога касс
// Поддерживает: бренд, тип, эквайринг, наличие, поиск + сортировка
// ============================================================================

import { useMemo } from 'react'
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { KASSA_CATALOG, type KassaProduct } from '@/config/kass-catalog'

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name'

export interface FilterState {
  brands: Set<string>
  types: Set<string>
  hasAcquiring: boolean
  inStockOnly: boolean
  search: string
  sort: SortOption
}

interface Props {
  state: FilterState
  onChange: (next: FilterState) => void
  resultsCount: number
}

export const ALL_BRANDS = Array.from(new Set(KASSA_CATALOG.map(k => k.brand))).sort()
export const ALL_TYPES = [
  { id: 'smart', label: 'Смарт-терминалы' },
  { id: 'autonomous', label: 'Автономные' },
  { id: 'register', label: 'Фискальные регистраторы' },
  { id: 'mobile', label: 'Мобильные' },
]

export const DEFAULT_FILTER: FilterState = {
  brands: new Set(),
  types: new Set(),
  hasAcquiring: false,
  inStockOnly: false,
  search: '',
  sort: 'popular',
}

export const SORT_LABELS: Record<SortOption, string> = {
  'popular': 'Сначала популярные',
  'price-asc': 'Сначала дешёвые',
  'price-desc': 'Сначала дорогие',
  'name': 'По названию (А-Я)',
}

export function CatalogFilters({ state, onChange, resultsCount }: Props) {
  const toggleBrand = (b: string) => {
    const next = new Set(state.brands)
    if (next.has(b)) next.delete(b)
    else next.add(b)
    onChange({ ...state, brands: next })
  }

  const toggleType = (t: string) => {
    const next = new Set(state.types)
    if (next.has(t)) next.delete(t)
    else next.add(t)
    onChange({ ...state, types: next })
  }

  const reset = () => onChange({ ...DEFAULT_FILTER, brands: new Set(), types: new Set() })

  const hasActiveFilters = state.brands.size > 0 || state.types.size > 0 || state.hasAcquiring || state.inStockOnly || state.search

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 mb-5">
      {/* Поиск + сортировка (всегда видны) */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по названию, описанию..."
            value={state.search}
            onChange={e => onChange({ ...state, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#163A5F]/30 focus:border-[#163A5F]"
          />
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={state.sort}
            onChange={e => onChange({ ...state, sort: e.target.value as SortOption })}
            className="appearance-none pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#163A5F]/30 focus:border-[#163A5F] bg-white cursor-pointer min-w-[180px]"
          >
            {Object.entries(SORT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Бренды */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 mr-1">Бренд:</span>
        {ALL_BRANDS.map(b => {
          const active = state.brands.has(b)
          return (
            <button
              key={b}
              onClick={() => toggleBrand(b)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                active
                  ? 'bg-[#163A5F] text-white border-[#163A5F]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {b}
            </button>
          )
        })}
      </div>

      {/* Тип + чекбоксы */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 mr-1">Тип:</span>
        {ALL_TYPES.map(t => {
          const active = state.types.has(t.id)
          return (
            <button
              key={t.id}
              onClick={() => toggleType(t.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                active
                  ? 'bg-[#163A5F] text-white border-[#163A5F]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={state.hasAcquiring}
            onChange={e => onChange({ ...state, hasAcquiring: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-slate-300 text-[#163A5F] focus:ring-[#163A5F]/30"
          />
          <span className="text-slate-600">💳 С эквайрингом</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={state.inStockOnly}
            onChange={e => onChange({ ...state, inStockOnly: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-slate-300 text-[#163A5F] focus:ring-[#163A5F]/30"
          />
          <span className="text-slate-600">✅ В наличии</span>
        </label>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-slate-500">
            Найдено: <b className="text-[#163A5F]">{resultsCount}</b>
          </span>
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
            >
              <X className="w-3 h-3" />
              Сбросить
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Утилита для фильтрации и сортировки — экспортируется для использования в page.tsx
export function applyFilters(catalog: KassaProduct[], state: FilterState): KassaProduct[] {
  let result = catalog.filter(k => {
    // Бренд
    if (state.brands.size > 0 && !state.brands.has(k.brand)) return false
    // Тип
    if (state.types.size > 0 && !state.types.has(k.type)) return false
    // Эквайринг
    if (state.hasAcquiring && !k.hasAcquiring) return false
    // В наличии
    if (state.inStockOnly && !k.inStock) return false
    // Поиск
    if (state.search.trim()) {
      const q = state.search.toLowerCase().trim()
      const haystack = `${k.name} ${k.brand} ${k.model} ${k.shortDesc} ${k.features.join(' ')}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  // Сортировка
  result = [...result].sort((a, b) => {
    switch (state.sort) {
      case 'price-asc': return a.price - b.price
      case 'price-desc': return b.price - a.price
      case 'name': return a.name.localeCompare(b.name, 'ru')
      case 'popular':
      default:
        // Сортировка по "весу" — сначала ХИТ, потом NEW, потом -17%, потом остальные
        const weight = (k: KassaProduct) => {
          if (k.badge === 'ХИТ') return 0
          if (k.badge === 'NEW') return 1
          if (k.badge?.includes('%')) return 2
          return 3
        }
        return weight(a) - weight(b)
    }
  })

  return result
}
