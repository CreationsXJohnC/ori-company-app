/**
 * ORI APP — Reservation Confirmation Screen
 * Shows QR code, reservation code, and pickup details.
 */

import React from 'react';
import { View, Text, ScrollView, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { CheckCircle, Calendar, Clock, MapPin, Share2, Home } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/theme';
import { useReservation } from '@/hooks/useMenu';
import { formatPickupDateTime, formatCurrency } from '@/utils/formatting';
import { BUSINESS } from '@/utils/constants';
import { useEffect } from 'react';

export default function ReservationConfirmationScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const router  = useRouter();
  const { colors, fontFamilies, gold, forest, semantic } = useTheme();

  const { data: reservation, isLoading } = useReservation(reservationId ?? '');

  useEffect(() => {
    if (reservation) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [reservation]);

  const handleShare = async () => {
    if (!reservation) return;
    try {
      await Share.share({
        message: `My Ori Company reservation is ready!\nCode: ${reservation.reservation_code}\nPickup: ${formatPickupDateTime(reservation.pickup_date, reservation.pickup_time)}`,
        title:   'Ori Company Reservation',
      });
    } catch {}
  };

  if (isLoading) return <LoadingSpinner full />;
  if (!reservation) return null;

  const subtotal = reservation.items?.reduce(
    (sum, item) => sum + item.unit_price * item.quantity, 0
  ) ?? 0;

  const pickupLabel = formatPickupDateTime(reservation.pickup_date, reservation.pickup_time);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Success Header ─────────────────────────────────── */}
        <View style={{ alignItems: 'center', gap: 16, paddingTop: 16 }}>
          <View
            style={{
              width:           88,
              height:          88,
              borderRadius:    44,
              backgroundColor: `${semantic.success}18`,
              borderWidth:     2,
              borderColor:     `${semantic.success}44`,
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            <CheckCircle size={44} color={semantic.success} />
          </View>

          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 28, color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 }}>
              Reservation Confirmed!
            </Text>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
              Your order is reserved. A confirmation email is on its way.
            </Text>
          </View>
        </View>

        {/* ── QR Code ────────────────────────────────────────── */}
        <Card elevated style={{ alignItems: 'center', gap: 16 }}>
          <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: 0.5 }}>
            SCAN AT PICKUP
          </Text>

          <View
            style={{
              padding:         20,
              backgroundColor: '#FFFFFF',
              borderRadius:    16,
            }}
          >
            <QRCode
              value={reservation.qr_data ?? reservation.reservation_code}
              size={200}
              color="#7EBF94"
              backgroundColor="#FFFFFF"
            />
          </View>

          {/* Reservation Code */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textTertiary }}>
              Reservation Code
            </Text>
            <Text
              style={{
                fontFamily:    'Courier New',
                fontSize:      22,
                color:         gold[400],
                letterSpacing: 3,
                fontWeight:    'bold',
              }}
            >
              {reservation.reservation_code}
            </Text>
          </View>
        </Card>

        {/* ── Pickup Details ─────────────────────────────────── */}
        <Card>
          <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 16 }}>
            Pickup Details
          </Text>

          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${gold[400]}18`, alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color={gold[400]} />
              </View>
              <View>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textTertiary }}>Date & Time</Text>
                <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 15, color: colors.textPrimary }}>{pickupLabel}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${gold[400]}18`, alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color={gold[400]} />
              </View>
              <View>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textTertiary }}>Location</Text>
                <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 15, color: colors.textPrimary }}>{BUSINESS.pickupAddress}</Text>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textSecondary }}>Show QR code or reservation code</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* ── Order Summary ──────────────────────────────────── */}
        {reservation.items && reservation.items.length > 0 && (
          <Card>
            <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 14 }}>
              Order Summary
            </Text>
            {reservation.items.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textPrimary, flex: 1 }}>
                  {item.product_name} × {item.quantity}
                </Text>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: gold[400] }}>
                  {formatCurrency(item.unit_price * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 15, color: colors.textPrimary }}>Estimated Total</Text>
              <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 17, color: gold[400] }}>{formatCurrency(subtotal)}</Text>
            </View>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 11, color: colors.textTertiary, marginTop: 8 }}>
              * Final pricing confirmed at time of pickup. Payment is due onsite.
            </Text>
          </Card>
        )}

        {/* ── Actions ────────────────────────────────────────── */}
        <View style={{ gap: 12 }}>
          <Button
            label="Share Confirmation"
            variant="secondary"
            size="lg"
            fullWidth
            leftIcon={<Share2 size={16} color={gold[400]} />}
            onPress={handleShare}
          />
          <Button
            label="Return to Menu"
            variant="ghost"
            size="lg"
            fullWidth
            leftIcon={<Home size={16} color={colors.textSecondary} />}
            onPress={() => router.replace('/(tabs)/menu')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
