/**
 * ORI APP — Cart Screen
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Truck } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/theme';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/utils/formatting';
import { BUSINESS, PLACEHOLDER_IMAGES } from '@/utils/constants';
import type { CartItem } from '@/types';
import { trackCheckoutStarted } from '@/lib/analytics';

function CartItemRow({ item }: { item: CartItem }) {
  const { colors, fontFamilies, gold } = useTheme();
  const updateQty  = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <Image
        source={{ uri: item.product.images?.[0] ?? PLACEHOLDER_IMAGES.product }}
        style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: colors.surfaceAlt }}
        contentFit="cover"
      />

      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textPrimary, lineHeight: 20 }} numberOfLines={2}>
          {item.product.name}
        </Text>
        {item.selectedVariant && (item.selectedVariant.size || item.selectedVariant.color) && (
          <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textTertiary }}>
            {[item.selectedVariant.size, item.selectedVariant.color].filter(Boolean).join(' · ')}
          </Text>
        )}
        <Text style={{ fontFamily: fontFamilies.bodyBold, fontSize: 15, color: gold[400] }}>
          {formatCurrency(item.unitPrice * item.quantity)}
        </Text>

        {/* Qty controls + remove */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 8, overflow: 'hidden' }}>
            <TouchableOpacity
              onPress={() => updateQty(item.id, item.quantity - 1)}
              style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
            >
              <Minus size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={{ fontFamily: fontFamilies.bodyBold, fontSize: 14, color: colors.textPrimary, width: 28, textAlign: 'center' }}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => updateQty(item.id, item.quantity + 1)}
              style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            style={{ padding: 6 }}
            hitSlop={8}
          >
            <Trash2 size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const router  = useRouter();
  const { colors, fontFamilies, gold, semantic } = useTheme();
  const items        = useCartStore((s) => s.items);
  const getSummary   = useCartStore((s) => s.getSummary);
  const clearCart    = useCartStore((s) => s.clearCart);

  const summary = getSummary();
  const freeShippingRemaining = Math.max(0, BUSINESS.shopFreeShippingOver - summary.subtotal);

  const handleCheckout = () => {
    trackCheckoutStarted(summary.total, summary.itemCount);
    router.push('/(tabs)/shop/checkout');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>
            Your Cart
          </Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart} hitSlop={8}>
            <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: colors.textTertiary }}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={36} color={colors.textTertiary} />}
          title="Your Cart is Empty"
          description="Browse Ori Clothing & Co and add some items."
          actionLabel="Shop Now"
          onAction={() => router.back()}
        />
      ) : (
        <>
          {/* Free shipping progress */}
          {freeShippingRemaining > 0 && (
            <View
              style={{
                marginHorizontal: 16, marginTop: 12,
                backgroundColor: `${gold[500]}12`,
                borderRadius: 10, padding: 12,
                flexDirection: 'row', alignItems: 'center', gap: 8,
              }}
            >
              <Truck size={16} color={gold[400]} />
              <Text style={{ flex: 1, fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: gold[300] }}>
                Add {formatCurrency(freeShippingRemaining)} more for free shipping!
              </Text>
            </View>
          )}
          {freeShippingRemaining === 0 && (
            <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: `${semantic.success}15`, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Truck size={16} color={semantic.success} />
              <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: semantic.success }}>
                You qualify for free shipping!
              </Text>
            </View>
          )}

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 250 }}
            ItemSeparatorComponent={() => <Divider />}
            renderItem={({ item }) => <CartItemRow item={item} />}
          />

          {/* Order Summary + Checkout */}
          <View
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              backgroundColor: colors.surface,
              borderTopWidth: 1, borderTopColor: colors.border,
              padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
              gap: 12,
            }}
          >
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textSecondary }}>Subtotal</Text>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: colors.textPrimary }}>{formatCurrency(summary.subtotal)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textSecondary }}>Tax (10%)</Text>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: colors.textPrimary }}>{formatCurrency(summary.tax)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textSecondary }}>
                  Shipping{summary.shipping === 0 ? ' (Free!)' : ''}
                </Text>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: summary.shipping === 0 ? semantic.success : colors.textPrimary }}>
                  {summary.shipping === 0 ? 'FREE' : formatCurrency(summary.shipping)}
                </Text>
              </View>
              <Divider />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 17, color: colors.textPrimary }}>Total</Text>
                <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 17, color: gold[400] }}>{formatCurrency(summary.total)}</Text>
              </View>
            </View>

            <Button
              label={`Checkout — ${formatCurrency(summary.total)}`}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleCheckout}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
