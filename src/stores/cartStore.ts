/**
 * ORI APP — Cart Store (Zustand)
 * Manages the merch shopping cart state.
 * Persisted to AsyncStorage so cart survives app restarts.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, BUSINESS } from '@/utils/constants';
import { calculateOrderTotals } from '@/utils/formatting';
import { trackAddToCart } from '@/lib/analytics';
import type { CartItem, CartSummary, ShopProduct, ProductVariant } from '@/types';

interface CartStore {
  // State
  items: CartItem[];

  // Actions
  addItem:      (product: ShopProduct, variant: Partial<ProductVariant> | null, quantity?: number) => void;
  removeItem:   (cartItemId: string) => void;
  updateQty:    (cartItemId: string, quantity: number) => void;
  clearCart:    () => void;

  // Computed
  getSummary:   () => CartSummary;
  getItemCount: () => number;
  hasItem:      (productId: string, variantSku?: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // ── Add Item ────────────────────────────────────────────────────────────
      addItem: (product, variant, quantity = 1) => {
        const variantSku = variant?.sku;
        const cartItemId = variantSku ? `${product.id}::${variantSku}` : product.id;
        const priceModifier = variant?.price_modifier ?? 0;
        const unitPrice = product.price + priceModifier;

        set((state) => {
          const existing = state.items.find((i) => i.id === cartItemId);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, BUSINESS.maxCartItems);
            return {
              items: state.items.map((i) =>
                i.id === cartItemId ? { ...i, quantity: newQty } : i
              ),
            };
          }
          trackAddToCart(product.id, product.name, unitPrice);
          return {
            items: [
              ...state.items,
              {
                id:              cartItemId,
                product,
                quantity:        Math.min(quantity, BUSINESS.maxCartItems),
                selectedVariant: variant,
                unitPrice,
              } satisfies CartItem,
            ],
          };
        });
      },

      // ── Remove Item ─────────────────────────────────────────────────────────
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== cartItemId),
        }));
      },

      // ── Update Quantity ─────────────────────────────────────────────────────
      updateQty: (cartItemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === cartItemId
              ? { ...i, quantity: Math.min(quantity, BUSINESS.maxCartItems) }
              : i
          ),
        }));
      },

      // ── Clear Cart ──────────────────────────────────────────────────────────
      clearCart: () => set({ items: [] }),

      // ── Computed: Summary ───────────────────────────────────────────────────
      getSummary: (): CartSummary => {
        const { items } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
        const { tax, shipping, total } = calculateOrderTotals(subtotal);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        return { items, subtotal, tax, shipping, total, itemCount };
      },

      // ── Computed: Item Count ────────────────────────────────────────────────
      getItemCount: (): number => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // ── Computed: Has Item ──────────────────────────────────────────────────
      hasItem: (productId, variantSku) => {
        const id = variantSku ? `${productId}::${variantSku}` : productId;
        return get().items.some((i) => i.id === id);
      },
    }),
    {
      name:    STORAGE_KEYS.cartData,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist items array — functions are not serializable
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── Convenience Selectors ────────────────────────────────────────────────────
export const selectCartItems     = (s: CartStore) => s.items;
export const selectCartItemCount = (s: CartStore) => s.getItemCount();
