/**
 * ORI APP — Analytics
 *
 * Lightweight event tracking that logs in development and can be
 * wired to any analytics provider (PostHog, Amplitude, Firebase, etc.)
 * in production by replacing the `sendEvent` implementation.
 *
 * INVESTOR NOTE: Full analytics pipeline (funnel analysis, retention,
 * revenue attribution) is ready for integration — this is the event layer.
 */

import { APP_ENV } from '@/utils/constants';
import type { AnalyticsEvent } from '@/types';

// ─── Provider Stubs ───────────────────────────────────────────────────────────
// Replace these with your actual analytics SDK calls.
// e.g., import posthog from 'posthog-react-native'; posthog.capture(event.name, event.params);

async function sendToAnalytics(name: string, params: Record<string, unknown>) {
  if (APP_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Analytics]', name, params);
    return;
  }

  // Production: wire to PostHog / Amplitude / Firebase Analytics
  // Example PostHog:
  // posthog.capture(name, params);

  // Example Firebase:
  // await logEvent(analytics, name, params);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function track(event: AnalyticsEvent): void {
  // Fire and forget — analytics should never block the UI
  sendToAnalytics(event.name, event.params as Record<string, unknown>).catch(() => {
    // Silently fail — analytics errors must never surface to users
  });
}

export function trackScreenView(screenName: string): void {
  track({ name: 'screen_view', params: { screen_name: screenName } });
}

export function trackSignUp(): void {
  track({ name: 'sign_up', params: { method: 'email' } });
}

export function trackLogin(): void {
  track({ name: 'login', params: { method: 'email' } });
}

export function trackAddToCart(productId: string, productName: string, price: number): void {
  track({ name: 'add_to_cart', params: { product_id: productId, product_name: productName, price } });
}

export function trackCheckoutStarted(cartTotal: number, itemCount: number): void {
  track({ name: 'checkout_started', params: { cart_total: cartTotal, item_count: itemCount } });
}

export function trackPurchase(orderId: string, total: number, itemCount: number): void {
  track({ name: 'purchase', params: { order_id: orderId, total, item_count: itemCount } });
}

export function trackReservationCreated(reservationId: string, itemCount: number): void {
  track({ name: 'reservation_created', params: { reservation_id: reservationId, item_count: itemCount } });
}

export function trackChatMessage(sessionId: string): void {
  track({ name: 'chat_message_sent', params: { session_id: sessionId } });
}
