'use client';

import { createContext, useContext } from 'react';

export type CartItem = {
  sku: string;
  name?: string;
  image?: string;
  price: number;     // đơn giá VND
  qty: number;       // số lượng
  productSlug?: string;
  weight?: number;
};

export type CartContextValue = {
  items: CartItem[];
  totalQty: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  setQty: (sku: string, qty: number) => void;
  removeItem: (sku: string) => void;
  clear: () => void;
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);

/** Hook công khai cho toàn app */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
