/**
 * ORI APP — Database Type Definitions
 * Auto-sync these with your Supabase schema.
 * Run `npx supabase gen types typescript --local > src/types/database.ts`
 * to regenerate from your actual schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ────────────────────────────────────────────────────────────────────
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type ChatRole = 'user' | 'assistant' | 'system';
export type ContentSection =
  | 'company_overview'
  | 'company_video'
  | 'founder_video'
  | 'values'
  | 'community'
  | 'social_links'
  | 'mission';

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  patient_id: string | null;
  patient_state: string | null;
  is_21_plus: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  active: boolean;
}

export type StrainType = 'indica' | 'sativa' | 'hybrid' | 'cbd' | 'balanced';

export interface MenuProduct {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;           // '3.5g', '7g', '14g', '28g', 'each', '8-pack', etc.
  image_url: string | null;
  strain_type: StrainType | null;
  thc_percentage: number | null;
  cbd_percentage: number | null;
  effects: string[] | null;
  terpenes: string[] | null;
  available: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joined
  category?: MenuCategory;
}

// ─── Reservations ─────────────────────────────────────────────────────────────
export interface Reservation {
  id: string;
  user_id: string;
  status: ReservationStatus;
  pickup_date: string;    // YYYY-MM-DD
  pickup_time: string;    // HH:MM:SS
  notes: string | null;
  reservation_code: string;
  qr_data: string | null;
  expires_at: string;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
  // joined
  items?: ReservationItem[];
  profile?: Profile;
}

export interface ReservationItem {
  id: string;
  reservation_id: string;
  product_id: string;
  product_name: string;
  product_unit: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  // joined
  product?: MenuProduct;
}

// ─── Shop ─────────────────────────────────────────────────────────────────────
export interface ShopCategory {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  active: boolean;
}

export interface ProductVariant {
  size?: string;
  color?: string;
  sku: string;
  inventory: number;
  price_modifier?: number; // add/subtract from base price
}

export interface ShopProduct {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  variants: ProductVariant[];
  total_inventory: number;
  available: boolean;
  featured: boolean;
  weight_grams: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joined
  category?: ShopCategory;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export interface ShippingAddress {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: ShippingAddress | null;
  tracking_number: string | null;
  email_receipt_sent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  variant_info: Partial<ProductVariant> | null;
  created_at: string;
  // joined
  product?: ShopProduct;
}

// ─── Events ───────────────────────────────────────────────────────────────────
export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;           // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  address: string | null;
  external_url: string | null;
  image_url: string | null;
  is_free: boolean;
  ticket_url: string | null;
  active: boolean;
  created_at: string;
}

// ─── CMS / Content Blocks ─────────────────────────────────────────────────────
export interface ContentBlock {
  id: string;
  section: ContentSection;
  key: string;
  value: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  // joined
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  token_count: number | null;
  created_at: string;
}

// ─── Knowledge Docs (RAG) ─────────────────────────────────────────────────────
export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
