/**
 * ORI APP — Menu Product Detail
 */

import React from 'react';
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
import {
  ArrowLeft,
  ShoppingBasket,
  Leaf,
  Droplet,
  Wind,
  AlertTriangle,
  Plus,
  Minus,
  Check,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/theme';
import { useMenuProduct } from '@/hooks/useMenu';
import { useReservationStore } from '@/stores/reservationStore';
import {
  formatCurrency,
  formatStrainType,
  getStrainColor,
  formatPercentage,
} from '@/utils/formatting';
import { COMPLIANCE, PLACEHOLDER_IMAGES } from '@/utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MenuProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { colors, fontFamilies, gold, forest, warm, semantic } = useTheme();

  const { data: product, isLoading } = useMenuProduct(id);
  const addItem    = useReservationStore((s) => s.addItem);
  const updateQty  = useReservationStore((s) => s.updateQty);
  const items      = useReservationStore((s) => s.items);
  const itemCount  = useReservationStore((s) => s.getItemCount());

  const reservationItem = items.find((i) => i.product.id === id);
  const qty = reservationItem?.quantity ?? 0;

  if (isLoading) return <LoadingSpinner full />;
  if (!product)  return null;

  const strainColor = getStrainColor(product.strain_type ?? null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── Hero Image ──────────────────────────────────────── */}
        <View style={{ height: SCREEN_WIDTH * 0.75, position: 'relative' }}>
          <Image
            source={{ uri: product.image_url ?? PLACEHOLDER_IMAGES.landscape }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.0)', 'rgba(13,27,18,0.92)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' }}
          />

          {/* Back Button */}
          <SafeAreaView
            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
            edges={['top']}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width:           44,
                  height:          44,
                  borderRadius:    22,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  alignItems:      'center',
                  justifyContent:  'center',
                }}
              >
                <ArrowLeft size={22} color="#FFFFFF" />
              </TouchableOpacity>

              {itemCount > 0 && (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/menu/reservation')}
                  style={{
                    flexDirection:   'row',
                    alignItems:      'center',
                    gap:             6,
                    backgroundColor: gold[500],
                    paddingHorizontal: 14,
                    paddingVertical:   8,
                    borderRadius:    20,
                  }}
                >
                  <ShoppingBasket size={16} color="#0D1B12" />
                  <Text style={{ fontFamily: fontFamilies.bodyBold, fontSize: 14, color: '#0D1B12' }}>
                    {itemCount}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>

          {/* Product name overlaid on image */}
          <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20, gap: 8 }}>
            {/* Badges */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {product.category?.name && (
                <Badge label={product.category.name} variant="neutral" />
              )}
              {product.strain_type && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical:   4,
                    borderRadius:      20,
                    backgroundColor:   `${strainColor}33`,
                  }}
                >
                  <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: strainColor }}>
                    {formatStrainType(product.strain_type)}
                  </Text>
                </View>
              )}
              {product.featured && <Badge label="Featured" variant="accent" />}
            </View>

            <Text
              style={{
                fontFamily:    fontFamilies.headingBold,
                fontSize:      26,
                color:         warm[100],
                letterSpacing: -0.5,
                lineHeight:    34,
              }}
            >
              {product.name}
            </Text>
          </View>
        </View>

        {/* ── Content ─────────────────────────────────────────── */}
        <View style={{ padding: 20, gap: 24 }}>

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 30, color: gold[400] }}>
              {formatCurrency(product.price)}
            </Text>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 16, color: colors.textSecondary }}>
              / {product.unit}
            </Text>
          </View>

          {/* Cannabinoid Profile */}
          {(product.thc_percentage != null || product.cbd_percentage != null) && (
            <View
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius:    16,
                padding:         16,
                gap:             12,
              }}
            >
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: 0.5 }}>
                CANNABINOID PROFILE
              </Text>
              <View style={{ flexDirection: 'row', gap: 20 }}>
                {product.thc_percentage != null && (
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 24, color: strainColor }}>
                      {product.thc_percentage.toFixed(1)}%
                    </Text>
                    <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textSecondary }}>
                      THC
                    </Text>
                  </View>
                )}
                {product.cbd_percentage != null && (
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 24, color: '#3B82F6' }}>
                      {product.cbd_percentage.toFixed(1)}%
                    </Text>
                    <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textSecondary }}>
                      CBD
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: 0.5 }}>
                ABOUT THIS PRODUCT
              </Text>
              <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 15, color: colors.textPrimary, lineHeight: 24 }}>
                {product.description}
              </Text>
            </View>
          )}

          {/* Effects */}
          {product.effects && product.effects.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: 0.5 }}>
                EFFECTS
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {product.effects.map((effect) => (
                  <Badge key={effect} label={effect} variant="primary" />
                ))}
              </View>
            </View>
          )}

          {/* Terpenes */}
          {product.terpenes && product.terpenes.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: 0.5 }}>
                TERPENES
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {product.terpenes.map((t) => (
                  <Badge key={t} label={t} variant="neutral" />
                ))}
              </View>
            </View>
          )}

          {/* Medical Disclaimer */}
          <View
            style={{
              backgroundColor: `${gold[500]}10`,
              borderWidth:     1,
              borderColor:     `${gold[500]}30`,
              borderRadius:    12,
              padding:         14,
              gap:             6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} color={gold[400]} />
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 13, color: gold[400] }}>
                Medical Disclaimer
              </Text>
            </View>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: gold[300], lineHeight: 18 }}>
              {COMPLIANCE.medicalDisclaimer}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky Add to Reservation ─────────────────────────── */}
      <View
        style={{
          position:          'absolute',
          bottom:            0,
          left:              0,
          right:             0,
          backgroundColor:   colors.background,
          borderTopWidth:    1,
          borderTopColor:    colors.border,
          padding:           20,
          paddingBottom:     Platform.OS === 'ios' ? 36 : 20,
          flexDirection:     'row',
          alignItems:        'center',
          gap:               12,
        }}
      >
        {qty > 0 ? (
          <>
            {/* Qty controls */}
            <View
              style={{
                flexDirection:   'row',
                alignItems:      'center',
                gap:             0,
                backgroundColor: colors.surfaceAlt,
                borderRadius:    14,
                overflow:        'hidden',
              }}
            >
              <TouchableOpacity
                onPress={() => updateQty(product.id, qty - 1)}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={{ fontFamily: fontFamilies.bodyBold, fontSize: 18, color: colors.textPrimary, width: 40, textAlign: 'center' }}>
                {qty}
              </Text>
              <TouchableOpacity
                onPress={() => updateQty(product.id, qty + 1)}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Button
              label="View Reservation"
              variant="primary"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => router.push('/(tabs)/menu/reservation')}
            />
          </>
        ) : (
          <Button
            label="Add to Reservation"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!product.available}
            onPress={() => addItem(product, 1)}
          />
        )}
      </View>
    </View>
  );
}
