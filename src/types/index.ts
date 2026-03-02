/**
 * ORI APP — Shared Application Types
 */

export * from './database';

// ─── Cart ─────────────────────────────────────────────────────────────────────
import type { ShopProduct, ProductVariant, ShippingAddress } from './database';

export interface CartItem {
  id: string;                     // product id
  product: ShopProduct;
  quantity: number;
  selectedVariant: Partial<ProductVariant> | null;
  unitPrice: number;              // resolved price (base + variant modifier)
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

// ─── Reservation Cart ─────────────────────────────────────────────────────────
import type { MenuProduct } from './database';

export interface ReservationCartItem {
  product: MenuProduct;
  quantity: number;
}

export interface ReservationDraft {
  items: ReservationCartItem[];
  pickupDate: Date | null;
  pickupTime: string | null;      // 'HH:MM'
  notes: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  patientId?: string;
  patientState?: string;
  is21Plus: boolean;
  agreeToTerms: boolean;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  'welcome': undefined;
  'sign-in': undefined;
  'sign-up': undefined;
  'verify-email': { email: string };
  'forgot-password': undefined;
};

export type TabParamList = {
  'menu': undefined;
  'shop': undefined;
  'about': undefined;
  'chat': undefined;
};

// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

// ─── Analytics Events ─────────────────────────────────────────────────────────
export type AnalyticsEvent =
  | { name: 'screen_view';           params: { screen_name: string } }
  | { name: 'sign_up';               params: { method: string } }
  | { name: 'login';                 params: { method: string } }
  | { name: 'menu_product_viewed';   params: { product_id: string; product_name: string } }
  | { name: 'reservation_started';   params: { product_count: number } }
  | { name: 'reservation_created';   params: { reservation_id: string; item_count: number } }
  | { name: 'shop_product_viewed';   params: { product_id: string; product_name: string } }
  | { name: 'add_to_cart';           params: { product_id: string; product_name: string; price: number } }
  | { name: 'remove_from_cart';      params: { product_id: string } }
  | { name: 'checkout_started';      params: { cart_total: number; item_count: number } }
  | { name: 'purchase';              params: { order_id: string; total: number; item_count: number } }
  | { name: 'chat_message_sent';     params: { session_id: string } }
  | { name: 'about_video_played';    params: { video_type: 'company' | 'founder' } }
  | { name: 'social_link_tapped';    params: { platform: string } };

// ─── Utility Types ────────────────────────────────────────────────────────────
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ValueOf<T> = T[keyof T];

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
