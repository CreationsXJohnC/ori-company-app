/**
 * ORI APP — Menu Screen (Cannabis Products)
 * Reservation-only. No in-app cannabis payment.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBasket, Search, AlertTriangle, Leaf } from 'lucide-react-native';
import { Image } from 'expo-image';

import { PressableCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, ProductCardSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/theme';
import { useMenuCategories, useMenuProducts } from '@/hooks/useMenu';
import { useReservationStore } from '@/stores/reservationStore';
import { formatCurrency, formatStrainType, getStrainColor } from '@/utils/formatting';
import { COMPLIANCE, PLACEHOLDER_IMAGES } from '@/utils/constants';
import type { MenuProduct } from '@/types';

// ─── Product Card ─────────────────────────────────────────────────────────────
function MenuProductCard({
  product,
  onPress,
  onAddToReservation,
}: {
  product: MenuProduct;
  onPress: () => void;
  onAddToReservation: () => void;
}) {
  const { colors, fontFamilies, gold } = useTheme();
  const reservationItems = useReservationStore((s) => s.items);
  const isInReservation  = reservationItems.some((i) => i.product.id === product.id);

  return (
    <PressableCard onPress={onPress} padding={0} style={{ overflow: 'hidden', flex: 1 }}>
      {/* Product Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: product.image_url ?? PLACEHOLDER_IMAGES.product }}
          style={{ width: '100%', height: 160, backgroundColor: colors.surfaceAlt }}
          contentFit="cover"
          transition={300}
        />
        {product.featured && (
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <Badge label="Featured" variant="accent" size="sm" />
          </View>
        )}
        {!product.available && (
          <View
            style={{
              position:        'absolute',
              inset:           0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 13, color: '#fff' }}>
              Out of Stock
            </Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={{ padding: 12, gap: 6 }}>
        {/* Category + Strain */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {product.category?.name && (
            <Badge label={product.category.name} variant="neutral" size="sm" />
          )}
          {product.strain_type && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical:   2,
                borderRadius:      20,
                backgroundColor:   `${getStrainColor(product.strain_type)}22`,
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.bodyMedium,
                  fontSize:   10,
                  color:      getStrainColor(product.strain_type),
                  letterSpacing: 0.3,
                }}
              >
                {formatStrainType(product.strain_type)}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontFamily: fontFamilies.bodyBold,
            fontSize:   15,
            color:      colors.textPrimary,
            lineHeight: 21,
          }}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* THC/CBD */}
        {(product.thc_percentage || product.cbd_percentage) && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {product.thc_percentage != null && (
              <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 11, color: colors.textSecondary }}>
                THC {product.thc_percentage.toFixed(1)}%
              </Text>
            )}
            {product.cbd_percentage != null && (
              <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 11, color: colors.textSecondary }}>
                CBD {product.cbd_percentage.toFixed(1)}%
              </Text>
            )}
          </View>
        )}

        {/* Price + Unit */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 17, color: gold[400] }}>
              {formatCurrency(product.price)}
            </Text>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 11, color: colors.textTertiary }}>
              per {product.unit}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onAddToReservation}
            disabled={!product.available}
            style={{
              width:           36,
              height:          36,
              borderRadius:    18,
              backgroundColor: isInReservation ? gold[500] : `${gold[500]}22`,
              borderWidth:     1.5,
              borderColor:     gold[500],
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            <Text
              style={{
                fontFamily: fontFamilies.bodyBold,
                fontSize:   18,
                color:      isInReservation ? '#0D1B12' : gold[400],
                lineHeight: 22,
              }}
            >
              {isInReservation ? '✓' : '+'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PressableCard>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MenuScreen() {
  const router = useRouter();
  const { colors, fontFamilies, gold, forest, warm } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories, isLoading: catLoading } = useMenuCategories();
  const { data: products, isLoading: prodLoading, refetch, isRefetching } = useMenuProducts(selectedCategory);

  const addItem   = useReservationStore((s) => s.addItem);
  const itemCount = useReservationStore((s) => s.getItemCount());

  const handleAddToReservation = useCallback((product: MenuProduct) => {
    if (!product.available) return;
    addItem(product, 1);
  }, [addItem]);

  const isLoading = catLoading || prodLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical:   16,
          flexDirection:     'row',
          alignItems:        'center',
          justifyContent:    'space-between',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View>
          <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 26, color: colors.textPrimary }}>
            Ori Menu
          </Text>
          <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: colors.textSecondary }}>
            Reserve for pickup · Pay onsite
          </Text>
        </View>

        {/* Reservation Basket */}
        {itemCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/menu/reservation')}
            style={{
              flexDirection:  'row',
              alignItems:     'center',
              gap:            6,
              backgroundColor: gold[500],
              paddingHorizontal: 14,
              paddingVertical:   8,
              borderRadius:   20,
            }}
          >
            <ShoppingBasket size={16} color="#0D1B12" />
            <Text style={{ fontFamily: fontFamilies.bodyBold, fontSize: 14, color: '#0D1B12' }}>
              {itemCount}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Compliance Banner ────────────────────────────────────── */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop:        12,
          backgroundColor: `${gold[500]}12`,
          borderRadius:    10,
          padding:         10,
          flexDirection:   'row',
          alignItems:      'center',
          gap:             8,
        }}
      >
        <AlertTriangle size={14} color={gold[400]} />
        <Text style={{ flex: 1, fontFamily: fontFamilies.bodyRegular, fontSize: 11, color: gold[400], lineHeight: 16 }}>
          {COMPLIANCE.reservationNote}
        </Text>
      </View>

      {/* ── Category Filter ──────────────────────────────────────── */}
      {!catLoading && categories && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        >
          {/* All */}
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={{
              paddingHorizontal: 16,
              paddingVertical:   8,
              borderRadius:      20,
              backgroundColor:   !selectedCategory ? gold[500] : colors.surface,
              borderWidth:       1,
              borderColor:       !selectedCategory ? gold[500] : colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: fontFamilies.bodyMedium,
                fontSize:   13,
                color:      !selectedCategory ? '#0D1B12' : colors.textSecondary,
              }}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical:   8,
                borderRadius:      20,
                backgroundColor:   selectedCategory === cat.id ? gold[500] : colors.surface,
                borderWidth:       1,
                borderColor:       selectedCategory === cat.id ? gold[500] : colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.bodyMedium,
                  fontSize:   13,
                  color:      selectedCategory === cat.id ? '#0D1B12' : colors.textSecondary,
                }}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Product Grid ─────────────────────────────────────────── */}
      {isLoading ? (
        <View style={{ flex: 1, padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ flex: 1 }}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={gold[500]}
              colors={[gold[500]]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Leaf size={36} color={colors.textTertiary} />}
              title="No Products"
              description="No menu items available in this category right now."
            />
          }
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <MenuProductCard
                product={item}
                onPress={() => router.push(`/(tabs)/menu/${item.id}`)}
                onAddToReservation={() => handleAddToReservation(item)}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
