'use client'

// ============================================================================
// CartContext.tsx — глобальное состояние корзины с localStorage
// ----------------------------------------------------------------------------
// Ключ: kassa_cart_v1
// Структура CartItem:
//   { kassaId, name, price, image, qty, fn, ofd, services[], extras[], total, addedAt }
// total = price + fn.price + ofd.price + sum(services) + sum(extras)
// (БЕЗ скидки 5% — пользователь просил убрать)
// ============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ConfiguratorOption } from '@/config/kass-catalog'

const STORAGE_KEY = 'kassa_cart_v1'

export interface CartItem {
  id: string              // уникальный = kassaId + JSON-хэш конфигурации
  kassaId: string
  name: string
  price: number
  image: string
  qty: number
  fn?: ConfiguratorOption
  ofd?: ConfiguratorOption
  services: ConfiguratorOption[]
  extras: ConfiguratorOption[]
  total: number           // за 1 шт
  addedAt: number
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  totalCount: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

function makeId(kassaId: string, fn?: ConfiguratorOption, ofd?: ConfiguratorOption, services: ConfiguratorOption[] = [], extras: ConfiguratorOption[] = []) {
  const parts = [
    kassaId,
    fn?.id ?? '',
    ofd?.id ?? '',
    services.map(s => s.id).sort().join(','),
    extras.map(e => e.id).sort().join(','),
  ]
  return parts.join('|')
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // загрузка из localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      // битый — игнорируем
    }
    setHydrated(true)
  }, [])

  // сохранение в localStorage
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'addedAt'>) => {
    const id = makeId(item.kassaId, item.fn, item.ofd, item.services, item.extras)
    setItems(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, qty: i.qty + item.qty } : i)
      }
      return [...prev, { ...item, id, addedAt: Date.now() }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(v => !v), [])

  const totalCount = items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = items.reduce((s, i) => s + i.total * i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, isOpen, openCart, closeCart, toggleCart,
      addItem, removeItem, updateQty, clearCart,
      totalCount, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}
