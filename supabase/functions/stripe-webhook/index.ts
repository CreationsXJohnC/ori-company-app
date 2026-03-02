/**
 * ORI APP — Supabase Edge Function: stripe-webhook
 * Handles Stripe webhook events to keep order status in sync.
 *
 * Stripe events handled:
 *   payment_intent.succeeded      → order status: 'paid'
 *   payment_intent.payment_failed → order status: 'pending' (allow retry)
 *   charge.refunded               → order status: 'refunded'
 *
 * Environment variables:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   — whsec_... from Stripe Dashboard → Webhooks
 *   SUPABASE_URL            — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *
 * Stripe CLI (dev testing):
 *   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-12-18.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    console.error('[stripe-webhook] Missing signature or webhook secret');
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('[stripe-webhook] Signature verification failed:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log(`[stripe-webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      // ── Payment succeeded ────────────────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (!orderId) {
          console.warn('[stripe-webhook] payment_intent.succeeded missing order_id metadata');
          break;
        }

        const { error } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq('id', orderId)
          .eq('status', 'pending'); // idempotent guard

        if (error) {
          console.error('[stripe-webhook] Failed to update order to paid:', error);
          // Return 200 anyway — Stripe will not retry 2xx
        } else {
          console.log(`[stripe-webhook] Order ${orderId} marked as paid`);
        }
        break;
      }

      // ── Payment failed ───────────────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await supabase
            .from('orders')
            .update({ status: 'pending' })
            .eq('id', orderId);

          console.log(`[stripe-webhook] Order ${orderId} payment failed — reset to pending`);
        }
        break;
      }

      // ── Refund issued ────────────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (paymentIntentId) {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', paymentIntentId);

          if (!error) {
            console.log(`[stripe-webhook] Order with PI ${paymentIntentId} marked refunded`);
          }
        }
        break;
      }

      // ── Checkout session (if using Stripe Checkout in web flow) ───────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

        if (paymentIntentId && session.payment_status === 'paid') {
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              stripe_checkout_session_id: session.id,
            })
            .eq('stripe_payment_intent_id', paymentIntentId)
            .eq('status', 'pending');

          console.log(`[stripe-webhook] Checkout session ${session.id} completed`);
        }
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('[stripe-webhook] Handler error:', message);
    // Still return 200 to prevent Stripe retries for non-transient errors
    return new Response(JSON.stringify({ received: true, warning: message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
