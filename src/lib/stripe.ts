/**
 * ORI APP — Stripe Integration
 * Uses @stripe/stripe-react-native for iOS/Android
 * Uses @stripe/stripe-js for Web (via stripe-react-native's web support)
 *
 * Payment flow:
 * 1. Client calls our Supabase Edge Function: create-payment-intent
 * 2. Edge function creates PaymentIntent server-side and returns clientSecret
 * 3. Client presents Stripe payment sheet
 * 4. Stripe webhook confirms payment → updates order status
 */

import { STRIPE_PUBLISHABLE_KEY } from '@/utils/constants';
import { invokeFunction } from './supabase';

export { STRIPE_PUBLISHABLE_KEY };

// ─── Create Payment Intent ────────────────────────────────────────────────────
export interface CreatePaymentIntentParams {
  orderId:         string;
  amountCents:     number;   // amount in cents (e.g., $29.99 = 2999)
  currency?:       string;   // default 'usd'
  customerEmail?:  string;
}

export interface CreatePaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<CreatePaymentIntentResult> {
  const { data, error } = await invokeFunction<CreatePaymentIntentResult>(
    'create-payment-intent',
    {
      order_id:      params.orderId,
      amount:        params.amountCents,
      currency:      params.currency ?? 'usd',
      customer_email: params.customerEmail,
    }
  );

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create payment intent');
  }

  return data;
}

// ─── Format Amount for Stripe ────────────────────────────────────────────────
// Stripe amounts are in smallest currency unit (cents for USD)
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}
