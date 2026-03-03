/**
 * ORI APP — Shop Product Detail
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShoppingBag, Minus, Plus, Tag } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NotificationBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { useShopProduct } from '@/hooks/useShop';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/utils/formatting';
import { trackAddToCart } from '@/lib/analytics';
import { PLACEHOLDER_IMAGES } from '@/utils/constants';
import type { ProductVariant } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ShopProductDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const toast    = useToast();
  const { colors, fontFamilies, gold, semantic } = useTheme();

  const { data: product, isLoading } = useShopProduct(id);
  const addItem    = useCartStore((s) => s.addItem);
  const cartCount  = useCartStore((s) => s.getItemCount());
  const isInCart   = useCartStore((s) => s.hasItem(id));

  const [quantity, setQuantity]   = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Partial<ProductVariant> | null>(null);

  if (isLoading) return <LoadingSpinner full />;
  if (!product)  return null;

  // Group variants by size/color
  const sizes  = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  const colors2 = [...new Set(
    product.variants
      .filter((v) => !selectedVariant?.size || v.size === selectedVariant.size)
      .map((v) => v.color)
      .filter(Boolean)
  )];

  const resolvedVariant = product.variants.find(
    (v) =>
      (!selectedVariant?.size  || v.size  === selectedVariant.size)  &&
      (!selectedVariant?.color || v.color === selectedVariant.color)
  ) ?? null;

  const unitPrice = product.price + (resolvedVariant?.price_modifier ?? 0);
  const inStock   = resolvedVariant ? resolvedVariant.inventory > 0 : product.total_inventory > 0;

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const handleAddToCart = () => {
    if (!inStock) return;
    const variantToUse = resolvedVariant
      ? { size: resolvedVariant.size, color: resolvedVariant.color, sku: resolvedVariant.sku, inventory: resolvedVariant.inventory }
      : null;
    addItem(product, variantToUse, quantity);
    trackAddToCart(product.id, product.name, unitPrice);
    toast.success('Added to Cart', `${product.name}${resolvedVariant?.size ? ` — ${resolvedVariant.size}` : ''}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* ── Hero Image ────────────────────────────────────── */}
        <View style={{ height: SCREEN_WIDTH, position: 'relative', backgroundColor: colors.surfaceAlt }}>
          <Image
            source={{ uri: product.images?.[0] ?? PLACEHOLDER_IMAGES.product }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(13,27,18,0.85)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' }}
          />

          {/* Back + Cart buttons */}
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }} edges={['top']}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/shop/cart')}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              >
                <ShoppingBag size={22} color="#FFFFFF" />
                {cartCount > 0 && <NotificationBadge count={cartCount} />}
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Discount badge */}
          {discount && (
            <View style={{ position: 'absolute', bottom: 60, left: 20 }}>
              <Badge label={`Save ${discount}%`} variant="error" />
            </View>
          )}
        </View>

        {/* ── Content ───────────────────────────────────────── */}
        <View style={{ padding: 20, gap: 24 }}>

          {/* Name + Category */}
          <View style={{ gap: 8 }}>
            {product.category?.name && (
              <Badge label={product.category.name} variant="neutral" />
            )}
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 26, color: colors.textPrimary, letterSpacing: -0.5, lineHeight: 34 }}>
              {product.name}
            </Text>
          </View>

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 30, color: gold[400] }}>
              {formatCurrency(unitPrice)}
            </Text>
            {product.compare_at_price && (
              <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 18, color: colors.textTertiary, textDecorationLine: 'line-through' }}>
                {formatCurrency(product.compare_at_price)}
              </Text>
            )}
          </View>

          {/* Size Selector */}
          {sizes.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: 0.5 }}>
                SIZE{selectedVariant?.size ? ` — ${selectedVariant.size}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {sizes.map((size) => {
                  const isSelected = selectedVariant?.size === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedVariant((prev) => ({ ...prev, size }))}
                      style={{
                        minWidth: 48, paddingHorizontal: 16, paddingVertical: 10,
                        borderRadius: 10,
                        backgroundColor: isSelected ? gold[400] : colors.surfaceAlt,
                        borderWidth: 1.5,
                        borderColor: isSelected ? gold[400] : colors.border,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: isSelected ? '#ffffff' : colors.textPrimary }}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Color Selector */}
          {colors2.length > 1 && (
            <View style={{ gap: 10 }}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: 0.5 }}>
                COLOR{selectedVariant?.color ? ` — ${selectedVariant.color}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {colors2.map((color) => {
                  const isSelected = selectedVariant?.color === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedVariant((prev) => ({ ...prev, color }))}
                      style={{
                        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                        backgroundColor: isSelected ? gold[400] : colors.surfaceAlt,
                        borderWidth: 1.5, borderColor: isSelected ? gold[400] : colors.border,
                      }}
                    >
                      <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: isSelected ? '#ffffff' : colors.textPrimary }}>
                        {color}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Stock status */}
          {!inStock && (
            <Badge label="Out of Stock" variant="error" dot />
          )}

          {/* Description */}
          {product.description && (
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: 0.5 }}>
                DETAILS
              </Text>
              <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 15, color: colors.textPrimary, lineHeight: 24 }}>
                {product.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky Add to Cart ────────────────────────────── */}
      <View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: colors.background,
          borderTopWidth: 1, borderTopColor: colors.border,
          padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}
      >
        {/* Quantity stepper */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 14, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={{ width: 44, height: 52, alignItems: 'center', justifyContent: 'center' }}
          >
            <Minus size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fontFamilies.bodyBold, fontSize: 18, color: colors.textPrimary, width: 36, textAlign: 'center' }}>
            {quantity}
          </Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={{ width: 44, height: 52, alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Button
          label={`Add to Cart — ${formatCurrency(unitPrice * quantity)}`}
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          disabled={!inStock}
          onPress={handleAddToCart}
        />
      </View>
    </View>
  );
}
