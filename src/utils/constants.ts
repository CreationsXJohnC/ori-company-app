/**
 * ORI APP — App Constants
 * Update social URLs after confirming actual handles.
 */

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// ─── App Info ─────────────────────────────────────────────────────────────────
export const APP_NAME = 'Ori App';
export const COMPANY_NAME = 'Ori Company';
export const COMPANY_CITY = 'Washington, DC';
export const APP_ENV = (extra.EXPO_PUBLIC_APP_ENV ?? 'development') as 'development' | 'staging' | 'production';

// ─── External Links ───────────────────────────────────────────────────────────
export const LINKS = {
  website:   process.env.EXPO_PUBLIC_WEBSITE_URL   ?? 'https://www.oricompanydc.com',
  youtube:   process.env.EXPO_PUBLIC_YOUTUBE_URL   ?? 'https://www.youtube.com/@OriCompanyDC',
  instagram: process.env.EXPO_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/oricompanydc',
  privacy:   'https://www.oricompanydc.com/privacy',
  terms:     'https://www.oricompanydc.com/terms',
  contact:   'https://www.oricompanydc.com/contact',
} as const;

// ─── Compliance Copy ──────────────────────────────────────────────────────────
export const COMPLIANCE = {
  ageGate:       'You must be 21 years of age or older to access this application.',
  ageConfirm:    'I confirm that I am 21 years of age or older.',
  educationalDisclaimer: 'Ori AI provides educational information only. This is not medical advice. Always consult a licensed healthcare provider for medical decisions.',
  medicalDisclaimer: 'Cannabis affects everyone differently. Consult your licensed physician before use, especially if you have a medical condition or take prescription medications.',
  reservationNote: 'Cannabis products are for pickup and onsite purchase only. No in-app cannabis transactions are processed. Valid medical patient ID required at time of pickup.',
  dcCompliance:  'For use by verified medical cannabis patients only. Must comply with DC medical cannabis regulations. For adults 21+ only.',
} as const;

// ─── Business Rules ───────────────────────────────────────────────────────────
export const BUSINESS = {
  reservationWindowHours: 24,
  reservationCodePrefix:  'ORI',
  shopTaxRate:            0.10,   // 10% DC sales tax placeholder
  shopFreeShippingOver:   50,     // Free shipping on orders over $50
  shopShippingFlat:       8.99,   // Flat rate shipping
  pickupWindowStart:      '10:00', // Store open time
  pickupWindowEnd:        '20:00', // Store close time
  pickupAddress:          'Washington, DC', // Update with actual store address
  maxCartItems:           20,
  maxReservationItems:    10,
} as const;

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  profile:         ['profile'] as const,
  menuCategories:  ['menu', 'categories'] as const,
  menuProducts:    ['menu', 'products'] as const,
  menuProduct:     (id: string) => ['menu', 'products', id] as const,
  reservations:    ['reservations'] as const,
  reservation:     (id: string) => ['reservations', id] as const,
  shopCategories:  ['shop', 'categories'] as const,
  shopProducts:    ['shop', 'products'] as const,
  shopProduct:     (id: string) => ['shop', 'products', id] as const,
  orders:          ['orders'] as const,
  order:           (id: string) => ['orders', id] as const,
  events:          ['events'] as const,
  contentBlocks:   ['content', 'blocks'] as const,
  contentSection:  (section: string) => ['content', section] as const,
  chatSessions:    ['chat', 'sessions'] as const,
  chatSession:     (id: string) => ['chat', 'sessions', id] as const,
} as const;

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  authToken:        'ori_auth_token',
  colorScheme:      'ori_color_scheme',
  onboardingDone:   'ori_onboarding_done',
  cartData:         'ori_cart_data',
  reservationDraft: 'ori_reservation_draft',
} as const;

// ─── Supabase Config ──────────────────────────────────────────────────────────
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// ─── Stripe Config ────────────────────────────────────────────────────────────
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// ─── Image Placeholders ───────────────────────────────────────────────────────
export const PLACEHOLDER_IMAGES = {
  product:   'https://placehold.co/400x400/1A2E1F/C8922A?text=Ori',
  avatar:    'https://placehold.co/100x100/1A2E1F/C8922A?text=ORI',
  banner:    'https://placehold.co/800x400/0D1B12/C8922A?text=Ori+Company',
  landscape: 'https://placehold.co/800x600/1A2E1F/F5F0E8?text=Ori+Company',
} as const;

// ─── US States (for patient state select) ────────────────────────────────────
export const US_STATES = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'District of Columbia', value: 'DC' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
] as const;
