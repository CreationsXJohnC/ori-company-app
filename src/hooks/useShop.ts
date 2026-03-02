/**
 * ORI APP — Shop Hooks (React Query)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';
import type { ShopCategory, ShopProduct, Order } from '@/types';
import { useAuthStore } from '@/stores/authStore';

// ─── Shop Categories ──────────────────────────────────────────────────────────
export function useShopCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.shopCategories,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('shop_categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');
      if (error) throw error;
      return data as ShopCategory[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Shop Products ────────────────────────────────────────────────────────────
export function useShopProducts(categoryId?: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.shopProducts, categoryId],
    queryFn:  async () => {
      let query = supabase
        .from('shop_products')
        .select('*, category:shop_categories(*)')
        .eq('available', true)
        .order('sort_order');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShopProduct[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useShopProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.shopProduct(id),
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('shop_products')
        .select('*, category:shop_categories(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ShopProduct;
    },
    enabled: !!id,
  });
}

export function useFeaturedShopProducts() {
  return useQuery({
    queryKey: [...QUERY_KEYS.shopProducts, 'featured'],
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('shop_products')
        .select('*, category:shop_categories(*)')
        .eq('featured', true)
        .eq('available', true)
        .order('sort_order')
        .limit(8);
      if (error) throw error;
      return data as ShopProduct[];
    },
  });
}

// ─── Create Order (before Stripe payment) ─────────────────────────────────────
interface CreateOrderInput {
  userId:          string;
  items:           Array<{
    productId:    string;
    productName:  string;
    productImage: string | null;
    quantity:     number;
    unitPrice:    number;
    variantInfo:  Record<string, string> | null;
  }>;
  subtotal:        number;
  tax:             number;
  shipping:        number;
  total:           number;
  shippingAddress: Record<string, string>;
}

export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      // Create pending order — will be updated to 'paid' by Stripe webhook
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id:          input.userId,
          status:           'pending',
          subtotal:         input.subtotal,
          tax:              input.tax,
          shipping:         input.shipping,
          total:            input.total,
          shipping_address: input.shippingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemRows = input.items.map((item) => ({
        order_id:      order.id,
        product_id:    item.productId,
        product_name:  item.productName,
        product_image: item.productImage,
        quantity:      item.quantity,
        unit_price:    item.unitPrice,
        variant_info:  item.variantInfo,
      }));

      const { error: itemError } = await supabase
        .from('order_items')
        .insert(itemRows);

      if (itemError) throw itemError;

      return order as Order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
}

// ─── User Orders ──────────────────────────────────────────────────────────────
export function useOrders() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });
}
