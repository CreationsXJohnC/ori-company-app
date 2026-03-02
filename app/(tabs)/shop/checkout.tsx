/**
 * ORI APP — Checkout Screen
 * Stripe payment flow: collect shipping → create order → PaymentSheet → confirm
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStripe } from '@stripe/stripe-react-native';
import { ArrowLeft, MapPin, CreditCard, Package, Lock } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useCreateOrder } from '@/hooks/useShop';
import { createPaymentIntent, toCents } from '@/lib/stripe';
import { shippingAddressSchema, type ShippingAddressFormData } from '@/utils/validation';
import { formatCurrency } from '@/utils/formatting';
import { trackPurchase } from '@/lib/analytics';

export default function CheckoutScreen() {
  const router     = useRouter();
  const toast      = useToast();
  const { colors, fontFamilies, gold, semantic } = useTheme();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const user       = useAuthStore((s) => s.user);
  const profile    = useAuthStore((s) => s.profile);
  const items      = useCartStore((s) => s.items);
  const getSummary = useCartStore((s) => s.getSummary);
  const clearCart  = useCartStore((s) => s.clearCart);
  const summary    = getSummary();

  const { mutateAsync: createOrder } = useCreateOrder();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: profile?.full_name ?? '',
      line1: '', line2: '', city: '', state: 'DC', zip: '', country: 'US',
    },
  });

  const onSubmit = async (addressData: ShippingAddressFormData) => {
    if (!user || items.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Create pending order in DB
      const order = await createOrder({
        userId:   user.id,
        items:    items.map((i) => ({
          productId:    i.product.id,
          productName:  i.product.name,
          productImage: i.product.images?.[0] ?? null,
          quantity:     i.quantity,
          unitPrice:    i.unitPrice,
          variantInfo:  i.selectedVariant
            ? { size: i.selectedVariant.size ?? '', color: i.selectedVariant.color ?? '' }
            : null,
        })),
        subtotal:        summary.subtotal,
        tax:             summary.tax,
        shipping:        summary.shipping,
        total:           summary.total,
        shippingAddress: addressData as Record<string, string>,
      });

      // 2. Create Stripe PaymentIntent
      const { clientSecret } = await createPaymentIntent({
        orderId:        order.id,
        amountCents:    toCents(summary.total),
        customerEmail:  user.email ?? undefined,
      });

      // 3. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName:       'Ori Company',
        allowsDelayedPaymentMethods: false,
        appearance: {
          colors: {
            primary:          '#C8922A',
            background:       '#1A2E1F',
            componentBackground: '#243425',
            componentBorder:  '#2A4A35',
            componentDivider: '#2A4A35',
            primaryText:      '#F5F0E8',
            secondaryText:    '#8FAF96',
            componentText:    '#F5F0E8',
            placeholderText:  '#5F8A6A',
            icon:             '#8FAF96',
            error:            '#EF4444',
          },
        },
      });

      if (initError) throw new Error(initError.message);

      // 4. Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          // User dismissed — not an error
          setIsProcessing(false);
          return;
        }
        throw new Error(presentError.message);
      }

      // 5. Payment succeeded — Stripe webhook will update order status to 'paid'
      trackPurchase(order.id, summary.total, summary.itemCount);
      clearCart();

      toast.success('Order Placed!', 'Check your email for your receipt.');
      router.replace('/(tabs)/shop/orders');

    } catch (err: any) {
      toast.error('Payment Failed', err.message ?? 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>Checkout</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">

          {/* ── Order Summary ──────────────────────────────── */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Package size={16} color={colors.textSecondary} />
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 16, color: colors.textPrimary }}>Order Summary</Text>
            </View>

            {items.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ flex: 1, fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textPrimary }} numberOfLines={1}>
                  {item.product.name} × {item.quantity}
                  {item.selectedVariant?.size ? ` (${item.selectedVariant.size})` : ''}
                </Text>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: gold[400] }}>
                  {formatCurrency(item.unitPrice * item.quantity)}
                </Text>
              </View>
            ))}

            <Divider />

            <View style={{ marginTop: 10, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: colors.textSecondary }}>Subtotal</Text>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: colors.textPrimary }}>{formatCurrency(summary.subtotal)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: colors.textSecondary }}>Tax</Text>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: colors.textPrimary }}>{formatCurrency(summary.tax)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: colors.textSecondary }}>Shipping</Text>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: summary.shipping === 0 ? semantic.success : colors.textPrimary }}>
                  {summary.shipping === 0 ? 'FREE' : formatCurrency(summary.shipping)}
                </Text>
              </View>
              <Divider />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 17, color: colors.textPrimary }}>Total</Text>
                <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 17, color: gold[400] }}>{formatCurrency(summary.total)}</Text>
              </View>
            </View>
          </Card>

          {/* ── Shipping Address ───────────────────────────── */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 16, color: colors.textPrimary }}>Shipping Address</Text>
            </View>

            <View style={{ gap: 14 }}>
              <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
                <Input label="Full Name" required placeholder="Jane Smith" autoCapitalize="words" value={value} onChangeText={onChange} error={errors.fullName?.message} />
              )} />
              <Controller control={control} name="line1" render={({ field: { onChange, value } }) => (
                <Input label="Street Address" required placeholder="1234 Main St NW" value={value} onChangeText={onChange} error={errors.line1?.message} />
              )} />
              <Controller control={control} name="line2" render={({ field: { onChange, value } }) => (
                <Input label="Apt / Suite (Optional)" placeholder="Apt 2B" value={value ?? ''} onChangeText={onChange} />
              )} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 2 }}>
                  <Controller control={control} name="city" render={({ field: { onChange, value } }) => (
                    <Input label="City" required placeholder="Washington" value={value} onChangeText={onChange} error={errors.city?.message} />
                  )} />
                </View>
                <View style={{ flex: 1 }}>
                  <Controller control={control} name="state" render={({ field: { onChange, value } }) => (
                    <Input label="State" required placeholder="DC" autoCapitalize="characters" maxLength={2} value={value} onChangeText={onChange} error={errors.state?.message} />
                  )} />
                </View>
              </View>
              <Controller control={control} name="zip" render={({ field: { onChange, value } }) => (
                <Input label="ZIP Code" required placeholder="20001" keyboardType="numeric" maxLength={5} value={value} onChangeText={onChange} error={errors.zip?.message} />
              )} />
            </View>
          </Card>

          {/* ── Payment note ───────────────────────────────── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Lock size={14} color={colors.textTertiary} />
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textTertiary }}>
              Payments are secured by Stripe. Ori never stores your card details.
            </Text>
          </View>

          {/* ── Place Order Button ─────────────────────────── */}
          <Button
            label={isProcessing ? 'Processing...' : `Pay ${formatCurrency(summary.total)}`}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isProcessing}
            leftIcon={<CreditCard size={18} color="#0D1B12" />}
            onPress={handleSubmit(onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
