/**
 * ORI APP — Menu Hooks (React Query)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { invokeFunction } from '@/lib/supabase';
import { QUERY_KEYS, BUSINESS } from '@/utils/constants';
import { generateReservationCode } from '@/utils/formatting';
import { trackReservationCreated } from '@/lib/analytics';
import { useAuthStore } from '@/stores/authStore';
import { useReservationStore } from '@/stores/reservationStore';
import type { MenuCategory, MenuProduct, Reservation, ReservationItem } from '@/types';

// ─── Fetch Menu Categories ────────────────────────────────────────────────────
export function useMenuCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.menuCategories,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');
      if (error) throw error;
      return data as MenuCategory[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ─── Fetch Menu Products ──────────────────────────────────────────────────────
export function useMenuProducts(categoryId?: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.menuProducts, categoryId],
    queryFn:  async () => {
      let query = supabase
        .from('menu_products')
        .select('*, category:menu_categories(*)')
        .eq('available', true)
        .order('sort_order');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MenuProduct[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Fetch Single Menu Product ────────────────────────────────────────────────
export function useMenuProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.menuProduct(id),
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('menu_products')
        .select('*, category:menu_categories(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as MenuProduct;
    },
    enabled: !!id,
  });
}

// ─── Fetch Featured Products ──────────────────────────────────────────────────
export function useFeaturedMenuProducts() {
  return useQuery({
    queryKey: [...QUERY_KEYS.menuProducts, 'featured'],
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('menu_products')
        .select('*, category:menu_categories(*)')
        .eq('featured', true)
        .eq('available', true)
        .order('sort_order')
        .limit(6);
      if (error) throw error;
      return data as MenuProduct[];
    },
  });
}

// ─── User Reservations ────────────────────────────────────────────────────────
export function useReservations() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: QUERY_KEYS.reservations,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, items:reservation_items(*, product:menu_products(*))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Reservation[];
    },
    enabled: !!user,
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reservation(id),
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, items:reservation_items(*, product:menu_products(*))')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Reservation;
    },
    enabled: !!id,
  });
}

// ─── Create Reservation ───────────────────────────────────────────────────────
interface CreateReservationInput {
  userId:     string;
  pickupDate: string;
  pickupTime: string;
  notes:      string;
  items:      Array<{ productId: string; productName: string; productUnit: string; quantity: number; unitPrice: number }>;
}

export function useCreateReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReservationInput) => {
      const code = generateReservationCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + BUSINESS.reservationWindowHours);

      // 1. Create reservation record
      const { data: reservation, error: resError } = await supabase
        .from('reservations')
        .insert({
          user_id:          input.userId,
          status:           'pending',
          pickup_date:      input.pickupDate,
          pickup_time:      input.pickupTime,
          notes:            input.notes || null,
          reservation_code: code,
          qr_data:          JSON.stringify({ code, userId: input.userId }),
          expires_at:       expiresAt.toISOString(),
        })
        .select()
        .single();

      if (resError) throw resError;

      // 2. Insert reservation items
      const itemRows = input.items.map((item) => ({
        reservation_id: reservation.id,
        product_id:     item.productId,
        product_name:   item.productName,
        product_unit:   item.productUnit,
        quantity:       item.quantity,
        unit_price:     item.unitPrice,
      }));

      const { error: itemError } = await supabase
        .from('reservation_items')
        .insert(itemRows);

      if (itemError) throw itemError;

      // 3. Trigger confirmation email (edge function, non-blocking)
      invokeFunction('reservation-confirm', { reservation_id: reservation.id }).catch(
        (err) => console.warn('[useCreateReservation] email send failed:', err)
      );

      trackReservationCreated(reservation.id, input.items.length);
      return reservation as Reservation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reservations });
    },
  });
}

// ─── Cancel Reservation ────────────────────────────────────────────────────────
export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reservationId: string) => {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', reservationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reservations });
    },
  });
}
