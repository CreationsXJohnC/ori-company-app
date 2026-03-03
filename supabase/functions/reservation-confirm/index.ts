/**
 * ORI APP — Supabase Edge Function: reservation-confirm
 * Sends a confirmation email with reservation code and details.
 * Called after a reservation is created (non-blocking — fire & forget).
 *
 * Email includes:
 *   - Reservation code (monospace)
 *   - Pickup date & time
 *   - Itemized list
 *   - 21+ compliance reminder
 *   - "Pay onsite" reminder (no payment link)
 *
 * Environment variables:
 *   RESEND_API_KEY          — from resend.com (free tier: 3k emails/mo)
 *   FROM_EMAIL              — e.g. noreply@oricompanydc.com
 *   SUPABASE_URL            — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-name',
};

// ── Email HTML builder ─────────────────────────────────────────────────────────
function buildEmailHtml(params: {
  fullName: string;
  reservationCode: string;
  pickupDate: string;
  pickupTime: string;
  items: Array<{ product_name: string; quantity: number; unit_price: number; product_unit: string }>;
  notes?: string | null;
}): string {
  const { fullName, reservationCode, pickupDate, pickupTime, items, notes } = params;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; color: #2D5016; font-size: 14px;">
          ${item.product_name} (${item.product_unit})
        </td>
        <td style="padding: 8px 0; color: #2D5016; font-size: 14px; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 8px 0; color: #C8922A; font-size: 14px; text-align: right; font-weight: 600;">
          $${(item.unit_price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join('');

  const notesRow = notes
    ? `<p style="margin: 0 0 8px; color: #6B7280; font-size: 13px;"><strong>Notes:</strong> ${notes}</p>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ori Reservation Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F0E8; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F0E8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: #0D1B12; border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #C8922A; font-size: 32px; letter-spacing: 3px; font-family: Georgia, serif;">
                ORI
              </h1>
              <p style="margin: 4px 0 0; color: #8BAF78; font-size: 12px; letter-spacing: 1px; font-family: Arial, sans-serif;">
                CANNABIS DISPENSARY · WASHINGTON, DC
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 32px;">

              <h2 style="margin: 0 0 8px; color: #0D1B12; font-size: 22px; font-family: Georgia, serif;">
                Reservation Confirmed ✓
              </h2>
              <p style="margin: 0 0 24px; color: #6B7280; font-size: 14px; font-family: Arial, sans-serif;">
                Hi ${fullName}, your pickup reservation is confirmed.
              </p>

              <!-- Reservation Code -->
              <div style="background-color: #F5F0E8; border: 2px dashed #C8922A; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; color: #6B7280; font-size: 11px; letter-spacing: 2px; font-family: Arial, sans-serif;">
                  RESERVATION CODE
                </p>
                <p style="margin: 0; color: #0D1B12; font-size: 28px; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 4px;">
                  ${reservationCode}
                </p>
                <p style="margin: 8px 0 0; color: #6B7280; font-size: 11px; font-family: Arial, sans-serif;">
                  Show this code at pickup
                </p>
              </div>

              <!-- Pickup Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #F9F7F4; border-radius: 8px; padding: 16px;" width="48%">
                    <p style="margin: 0 0 4px; color: #6B7280; font-size: 11px; letter-spacing: 1px; font-family: Arial, sans-serif;">DATE</p>
                    <p style="margin: 0; color: #0D1B12; font-size: 15px; font-weight: 600; font-family: Arial, sans-serif;">${pickupDate}</p>
                  </td>
                  <td width="4%"></td>
                  <td style="background-color: #F9F7F4; border-radius: 8px; padding: 16px;" width="48%">
                    <p style="margin: 0 0 4px; color: #6B7280; font-size: 11px; letter-spacing: 1px; font-family: Arial, sans-serif;">TIME</p>
                    <p style="margin: 0; color: #0D1B12; font-size: 15px; font-weight: 600; font-family: Arial, sans-serif;">${pickupTime}</p>
                  </td>
                </tr>
              </table>

              <!-- Items -->
              <h3 style="margin: 0 0 12px; color: #0D1B12; font-size: 14px; letter-spacing: 1px; font-family: Arial, sans-serif;">
                RESERVED ITEMS
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-top: 1px solid #E5E7EB;">
                <tr>
                  <th style="padding: 8px 0; color: #6B7280; font-size: 11px; text-align: left; font-weight: 400; font-family: Arial, sans-serif;">PRODUCT</th>
                  <th style="padding: 8px 0; color: #6B7280; font-size: 11px; text-align: center; font-weight: 400; font-family: Arial, sans-serif;">QTY</th>
                  <th style="padding: 8px 0; color: #6B7280; font-size: 11px; text-align: right; font-weight: 400; font-family: Arial, sans-serif;">PRICE</th>
                </tr>
                ${itemRows}
              </table>

              ${notesRow}

              <!-- Pay Onsite Notice -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #C8922A; border-radius: 4px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400E; font-size: 13px; font-family: Arial, sans-serif;">
                  <strong>Payment due at pickup.</strong> We accept cash and debit. No in-app payment for cannabis products.
                </p>
              </div>

              <!-- Location -->
              <h3 style="margin: 0 0 8px; color: #0D1B12; font-size: 14px; letter-spacing: 1px; font-family: Arial, sans-serif;">
                PICKUP LOCATION
              </h3>
              <p style="margin: 0 0 4px; color: #374151; font-size: 14px; font-family: Arial, sans-serif;">Ori Company DC</p>
              <p style="margin: 0 0 4px; color: #6B7280; font-size: 13px; font-family: Arial, sans-serif;">Washington, DC</p>
              <p style="margin: 0 0 24px; color: #6B7280; font-size: 13px; font-family: Arial, sans-serif;">Hours: Mon–Sat 10:00 AM – 8:00 PM</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0D1B12; border-radius: 0 0 16px 16px; padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px; color: #8BAF78; font-size: 11px; font-family: Arial, sans-serif; letter-spacing: 1px;">
                FOR ADULTS 21+ ONLY · EDUCATIONAL AND WELLNESS USE
              </p>
              <p style="margin: 0; color: #4A6741; font-size: 11px; font-family: Arial, sans-serif;">
                This is not a receipt or proof of purchase. Cannabis products are reserved for pickup only.
                Ori Company DC is not responsible for cancellations due to product availability.
              </p>
              <p style="margin: 12px 0 0; color: #4A6741; font-size: 11px; font-family: Arial, sans-serif;">
                © ${new Date().getFullYear()} Ori Company DC · oricompanydc.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { reservationId } = await req.json();
    if (!reservationId) {
      return new Response(JSON.stringify({ error: 'reservationId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch reservation with items and user profile
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select(`
        *,
        reservation_items (*),
        profiles: user_id (full_name, id)
      `)
      .eq('id', reservationId)
      .single();

    if (resError || !reservation) {
      console.error('[reservation-confirm] Reservation not found:', resError);
      return new Response(JSON.stringify({ error: 'Reservation not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user email from auth.users via service role
    const { data: userData } = await supabase.auth.admin.getUserById(reservation.user_id);
    const userEmail = userData?.user?.email;

    if (!userEmail) {
      console.error('[reservation-confirm] No email found for user', reservation.user_id);
      return new Response(JSON.stringify({ error: 'User email not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const profile = reservation.profiles as { full_name: string; id: string } | null;
    const fullName = profile?.full_name ?? 'Valued Customer';

    // Format date/time for display
    const pickupDate = new Date(reservation.pickup_date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format time (stored as "HH:MM:SS")
    const [hours, minutes] = reservation.pickup_time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const pickupTime = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;

    const emailHtml = buildEmailHtml({
      fullName,
      reservationCode: reservation.reservation_code,
      pickupDate,
      pickupTime,
      items: reservation.reservation_items ?? [],
      notes: reservation.notes,
    });

    // Send via Resend API
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@oricompanydc.com';

    if (!resendKey) {
      // Dev mode: log instead of send
      console.log('[reservation-confirm] RESEND_API_KEY not set — email not sent (dev mode)');
      console.log(`Would send to: ${userEmail}`);
      console.log(`Subject: Your Ori Reservation is Confirmed — ${reservation.reservation_code}`);

      // Mark email as sent anyway in dev
      await supabase.from('reservations').update({ email_sent: true }).eq('id', reservationId);

      return new Response(JSON.stringify({ sent: false, dev: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Ori Company DC <${fromEmail}>`,
        to: [userEmail],
        subject: `Your Ori Reservation is Confirmed — ${reservation.reservation_code}`,
        html: emailHtml,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('[reservation-confirm] Resend error:', errText);
      return new Response(JSON.stringify({ error: 'Failed to send email', detail: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark email as sent
    await supabase
      .from('reservations')
      .update({ email_sent: true })
      .eq('id', reservationId);

    console.log(`[reservation-confirm] Email sent to ${userEmail} for reservation ${reservation.reservation_code}`);

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('[reservation-confirm] Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
