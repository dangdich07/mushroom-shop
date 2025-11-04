'use client';

import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { CartContext, type CartItem, type CartContextValue } from '../../hooks/useCart';

type CartState = {
  items: CartItem[];
};

type Action =
  | { type: 'INIT'; payload: CartItem[] }
  | { type: 'ADD'; payload: CartItem }                // gộp theo SKU, cộng dồn qty, GHI ĐÈ metadata
  | { type: 'SET_QTY'; payload: { sku: string; qty: number } }
  | { type: 'REMOVE'; payload: { sku: string } }
  | { type: 'CLEAR' };

const STORAGE_KEY = 'cart:v1';

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'INIT': {
      return { items: action.payload };
    }

    case 'ADD': {
      const incoming = action.payload;
      const idx = state.items.findIndex((it) => it.sku === incoming.sku);

      if (idx === -1) {
        // Thêm mới
        return { items: [...state.items, { ...incoming, qty: Math.max(1, incoming.qty) }] };
      }

      // ĐÃ CÓ SKU → CỘNG DỒN QTY & GHI ĐÈ METADATA MỚI
      const existing = state.items[idx];
      const merged: CartItem = {
        sku: existing.sku,
        qty: Math.max(1, existing.qty + Math.max(1, incoming.qty)),
        // GHI ĐÈ metadata theo lần thêm mới
        name: incoming.name ?? existing.name,
        image: incoming.image ?? existing.image,
        price: typeof incoming.price === 'number' ? incoming.price : existing.price,
        productSlug: incoming.productSlug ?? existing.productSlug,
        weight: typeof incoming.weight === 'number' ? incoming.weight : existing.weight,
      };

      const next = [...state.items];
      next[idx] = merged;
      return { items: next };
    }

    case 'SET_QTY': {
      const { sku, qty } = action.payload;
      const nextQty = Math.max(1, qty | 0);
      const next = state.items.map((it) => (it.sku === sku ? { ...it, qty: nextQty } : it));
      return { items: next };
    }

    case 'REMOVE': {
      return { items: state.items.filter((it) => it.sku !== action.payload.sku) };
    }

    case 'CLEAR': {
      return { items: [] };
    }

    default:
      return state;
  }
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Khởi tạo từ localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: 'INIT', payload: parsed.filter(Boolean) });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Lưu lại localStorage khi thay đổi
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      }
    } catch {
      // ignore
    }
  }, [state.items]);

  // Tính toán tổng
  const totalQty = useMemo(
    () => state.items.reduce((sum, it) => sum + (it.qty || 0), 0),
    [state.items],
  );

  const subtotal = useMemo(
    () => state.items.reduce((sum, it) => sum + (it.qty || 0) * (it.price || 0), 0),
    [state.items],
  );

  // API thao tác giỏ
  const addItem = useCallback((item: CartItem) => dispatch({ type: 'ADD', payload: item }), []);
  const setQty = useCallback((sku: string, qty: number) => {
    dispatch({ type: 'SET_QTY', payload: { sku, qty } });
  }, []);
  const removeItem = useCallback((sku: string) => dispatch({ type: 'REMOVE', payload: { sku } }), []);
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const value = useMemo<CartContextValue>(
    () => ({ items: state.items, totalQty, subtotal, addItem, setQty, removeItem, clear }),
    [state.items, totalQty, subtotal, addItem, setQty, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
