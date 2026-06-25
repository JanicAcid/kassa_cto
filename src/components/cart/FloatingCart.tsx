'use client'

// ============================================================================
// FloatingCart.tsx — плавающая кнопка корзины справа снизу с бейджем количества
// ============================================================================

import { ShoppingCart } from 'lucide-react'
import { useCart } from './CartContext'

export function FloatingCart() {
  const { totalCount, openCart } = useCart()

  if (totalCount === 0) return null

  return (
    <button
      onClick={openCart}
      aria-label="Открыть корзину"
      className="fixed bottom-5 right-5 z-40 w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 transition-all hover:scale-105 flex items-center justify-center"
    >
      <ShoppingCart className="w-7 h-7" />
      <span className="absolute -top-1 -right-1 min-w-[24px] h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
        {totalCount > 99 ? '99+' : totalCount}
      </span>
    </button>
  )
}
