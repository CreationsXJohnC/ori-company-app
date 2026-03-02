/**
 * ORI APP — Reservation Screen
 * User selects pickup date/time and confirms their reservation.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, FileText, Minus, Plus, Trash2 } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addHours } from 'date-fns';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { useReservationStore } from '@/stores/reservationStore';
import { useAuthStore } from '@/stores/authStore';
import { useCreateReservation } from '@/hooks/useMenu';
import { formatCurrency, formatTimeSlot, generatePickupTimeSlots } from '@/utils/formatting';
import { BUSINESS, COMPLIANCE } from '@/utils/constants';

const TIME_SLOTS = generatePickupTimeSlots();

export default function ReservationScreen() {
  const router = useRouter();
  const { colors, fontFamilies, gold } = useTheme();
  const toast  = useToast();
  const user   = useAuthStore((s) => s.user);

  const items      = useReservationStore((s) => s.items);
  const pickupDate = useReservationStore((s) => s.pickupDate);
  const pickupTime = useReservationStore((s) => s.pickupTime);
  const notes      = useReservationStore((s) => s.notes);
  const updateQty  = useReservationStore((s) => s.updateQty);
  const removeItem = useReservationStore((s) => s.removeItem);
  const setDate    = useReservationStore((s) => s.setPickupDate);
  const setTime    = useReservationStore((s) => s.setPickupTime);
  const setNotes   = useReservationStore((s) => s.setNotes);
  const clearDraft = useReservationStore((s) => s.clearDraft);
  const subtotal   = useReservationStore((s) => s.getSubtotal());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const { mutateAsync: createReservation, isPending } = useCreateReservation();

  const minDate = new Date();
  const maxDate = addHours(new Date(), BUSINESS.reservationWindowHours);

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!pickupDate || !pickupTime) {
      toast.error('Pickup Required', 'Please select a pickup date and time.');
      return;
    }
    if (items.length === 0) {
      toast.error('Empty Reservation', 'Add at least one item.');
      return;
    }

    try {
      const reservation = await createReservation({
        userId:     user.id,
        pickupDate,
        pickupTime: `${pickupTime}:00`,
        notes,
        items: items.map((i) => ({
          productId:   i.product.id,
          productName: i.product.name,
          productUnit: i.product.unit,
          quantity:    i.quantity,
          unitPrice:   i.product.price,
        })),
      });

      clearDraft();
      router.replace({
        pathname: '/(tabs)/menu/confirmation',
        params:   { reservationId: reservation.id },
      });
    } catch (err: any) {
      toast.error('Reservation Failed', err.message ?? 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection:     'row',
          alignItems:        'center',
          paddingHorizontal: 20,
          paddingVertical:   12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap:               12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>
          Your Reservation
        </Text>
      </View>

      {items.length === 0 ? (
        <EmptyState
          title="Reservation is Empty"
          description="Browse the menu and add products to your reservation."
          actionLabel="Browse Menu"
          onAction={() => router.back()}
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Reservation Items ──────────────────────────────── */}
            <Card padding={0} style={{ overflow: 'hidden' }}>
              {items.map((item, index) => (
                <View key={item.product.id}>
                  {index > 0 && <Divider />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 15, color: colors.textPrimary }} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: colors.textSecondary }}>
                        {formatCurrency(item.product.price)} / {item.product.unit}
                      </Text>
                    </View>

                    {/* Qty controls */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0, backgroundColor: colors.surfaceAlt, borderRadius: 10, overflow: 'hidden' }}>
                      <TouchableOpacity
                        onPress={() => updateQty(item.product.id, item.quantity - 1)}
                        style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={15} color={colors.textSecondary} />
                        ) : (
                          <Minus size={15} color={colors.textSecondary} />
                        )}
                      </TouchableOpacity>
                      <Text style={{ fontFamily: fontFamilies.bodyBold, fontSize: 15, color: colors.textPrimary, width: 32, textAlign: 'center' }}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateQty(item.product.id, item.quantity + 1)}
                        style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={15} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    <Text style={{ fontFamily: fontFamilies.bodyBold, fontSize: 15, color: gold[400], width: 64, textAlign: 'right' }}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Subtotal */}
              <View style={{ backgroundColor: colors.surfaceAlt, padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 15, color: colors.textSecondary }}>
                  Estimated Total
                </Text>
                <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 17, color: gold[400] }}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>
            </Card>

            {/* Pay onsite notice */}
            <View style={{ backgroundColor: `${gold[500]}12`, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: `${gold[500]}30`, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16 }}>💳</Text>
              <Text style={{ flex: 1, fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: gold[300], lineHeight: 19 }}>
                {COMPLIANCE.reservationNote}
              </Text>
            </View>

            {/* ── Pickup Date ────────────────────────────────────── */}
            <Card>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 12 }}>
                Pickup Date
              </Text>

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  flexDirection:   'row',
                  alignItems:      'center',
                  gap:             10,
                  backgroundColor: colors.surfaceAlt,
                  borderRadius:    12,
                  padding:         14,
                  borderWidth:     1.5,
                  borderColor:     pickupDate ? gold[500] : colors.border,
                }}
              >
                <Calendar size={18} color={pickupDate ? gold[500] : colors.textTertiary} />
                <Text style={{ flex: 1, fontFamily: fontFamilies.bodyRegular, fontSize: 16, color: pickupDate ? colors.textPrimary : colors.textTertiary }}>
                  {pickupDate ? format(new Date(pickupDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy') : 'Select date (within 24 hours)'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={pickupDate ? new Date(pickupDate + 'T12:00:00') : new Date()}
                  mode="date"
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  onChange={handleDateChange}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                />
              )}

              <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 11, color: colors.textTertiary, marginTop: 8 }}>
                Reservations are held for 24 hours from the time of booking.
              </Text>
            </Card>

            {/* ── Pickup Time ────────────────────────────────────── */}
            <Card>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 12 }}>
                Pickup Time
              </Text>
              <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textTertiary, marginBottom: 12 }}>
                Store hours: 10:00 AM – 8:00 PM
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setTime(slot)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical:   8,
                      borderRadius:      10,
                      backgroundColor:   pickupTime === slot ? gold[500] : colors.surfaceAlt,
                      borderWidth:       1,
                      borderColor:       pickupTime === slot ? gold[500] : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamilies.bodyMedium,
                        fontSize:   13,
                        color:      pickupTime === slot ? '#0D1B12' : colors.textSecondary,
                      }}
                    >
                      {formatTimeSlot(slot)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* ── Notes ─────────────────────────────────────────── */}
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FileText size={16} color={colors.textSecondary} />
                <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 16, color: colors.textPrimary }}>
                  Notes (Optional)
                </Text>
              </View>
              <TextInput
                style={{
                  fontFamily:      fontFamilies.bodyRegular,
                  fontSize:        15,
                  color:           colors.textPrimary,
                  backgroundColor: colors.surfaceAlt,
                  borderRadius:    12,
                  padding:         14,
                  minHeight:       80,
                  textAlignVertical: 'top',
                  borderWidth:     1.5,
                  borderColor:     colors.border,
                } as any}
                placeholder="Any notes for your budtender? (optional)"
                placeholderTextColor={colors.textTertiary}
                multiline
                maxLength={500}
                value={notes}
                onChangeText={setNotes}
              />
            </Card>
          </ScrollView>

          {/* ── Sticky Submit ─────────────────────────────────── */}
          <View
            style={{
              position:        'absolute',
              bottom:          0,
              left:            0,
              right:           0,
              backgroundColor: colors.background,
              borderTopWidth:  1,
              borderTopColor:  colors.border,
              padding:         20,
              paddingBottom:   Platform.OS === 'ios' ? 36 : 20,
            }}
          >
            <Button
              label={`Reserve ${items.length} Item${items.length > 1 ? 's' : ''} · ${formatCurrency(subtotal)}`}
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isPending}
              disabled={!pickupDate || !pickupTime}
              onPress={handleSubmit}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
