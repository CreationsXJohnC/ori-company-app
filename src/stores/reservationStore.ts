/**
 * ORI APP — Reservation Draft Store (Zustand)
 * Manages the in-progress reservation (menu items before confirmed booking).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, BUSINESS } from '@/utils/constants';
import type { ReservationCartItem, MenuProduct } from '@/types';

interface ReservationStore {
  items:       ReservationCartItem[];
  pickupDate:  string | null;   // ISO date string YYYY-MM-DD
  pickupTime:  string | null;   // HH:MM
  notes:       string;

  // Actions
  addItem:         (product: MenuProduct, quantity?: number) => void;
  removeItem:      (productId: string) => void;
  updateQty:       (productId: string, quantity: number) => void;
  setPickupDate:   (date: string) => void;
  setPickupTime:   (time: string) => void;
  setNotes:        (notes: string) => void;
  clearDraft:      () => void;

  // Computed
  getItemCount:    () => number;
  getSubtotal:     () => number;
  isReadyToSubmit: () => boolean;
}

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      items:      [],
      pickupDate: null,
      pickupTime: null,
      notes:      '',

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, BUSINESS.maxReservationItems);
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: newQty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { product, quantity: Math.min(quantity, BUSINESS.maxReservationItems) },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQty: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.min(quantity, BUSINESS.maxReservationItems) }
              : i
          ),
        }));
      },

      setPickupDate: (date) => set({ pickupDate: date }),
      setPickupTime: (time) => set({ pickupTime: time }),
      setNotes:      (notes) => set({ notes }),

      clearDraft: () => set({
        items:      [],
        pickupDate: null,
        pickupTime: null,
        notes:      '',
      }),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      isReadyToSubmit: () => {
        const { items, pickupDate, pickupTime } = get();
        return items.length > 0 && !!pickupDate && !!pickupTime;
      },
    }),
    {
      name:       STORAGE_KEYS.reservationDraft,
      storage:    createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items:      state.items,
        pickupDate: state.pickupDate,
        pickupTime: state.pickupTime,
        notes:      state.notes,
      }),
    }
  )
);
