/**
 * ORI APP — Shop Screen (Ori Clothing & Co)
 * Non-cannabis merch — full in-app purchase allowed.
 */

import React, { useState } from 'react';
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
import { ShoppingBag, Star } from 'lucide-react-native';
import { Image } from 'expo-image';

import { PressableCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NotificationBadge } from '@/components/ui/Badge';
import { LoadingSpinner, ProductCardSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { useShopCategories, useShopProducts } from '@/hooks/useShop';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/utils/formatting';
import { PLACEHOLDER_IMAGES } from '@/utils/constants';
import type { ShopProduct } from '@/types';

function ShopProductCard({ product, onPress }: { product: ShopProduct; onPress: () => void }) {
  const { colors, fontFamilies, gold } = useTheme();
  const addItem = useCartStore((s) => s.addItem);
  const toast   = useToast();
  const isInCart = useCartStore((s) => s.hasItem(product.id));

  const handleQuickAdd = () => {
    if (!product.available || product.variants.length > 0) {
      onPress(); // Go to detail to select variant
      return;
    }
    addItem(product, null, 1);
    toast.success('Added to Cart', product.name);
  };

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  return (
    <PressableCard onPress={onPress} padding={0} style={{ overflow: 'hidden', flex: 1 }}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: product.images?.[0] ?? PLACEHOLDER_IMAGES.product }}
          style={{ width: '100%', height: 175, backgroundColor: colors.surfaceAlt }}
          contentFit="cover"
          transition={300}
        />
        {discount && (
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <Badge label={`-${discount}%`} variant="error" size="sm" />
          </View>
        )}
        {product.featured && (
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <Badge label="New" variant="accent" size="sm" />
          </View>
        )}
      </View>

      <View style={{ padding: 12, gap: 6 }}>
        {product.category?.name && (
          <Badge label={product.category.name} variant="neutral" size="sm" />
        )}

        <Text
          style={{ fontFamily: fontFamilies.bodyBold, fontSize: 14, color: colors.textPrimary, lineHeight: 20 }}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 17, color: gold[400] }}>
            {formatCurrency(product.price)}
          </Text>
          {product.compare_at_price && (
            <Text
              style={{
                fontFamily:         fontFamilies.bodyRegular,
                fontSize:           13,
                color:              colors.textTertiary,
                textDecorationLine: 'line-through',
              }}
            >
              {formatCurrency(product.compare_at_price)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleQuickAdd}
          disabled={!product.available}
          style={{
            backgroundColor: isInCart ? `${gold[500]}22` : gold[500],
            borderRadius:    10,
            paddingVertical: 8,
            alignItems:      'center',
            borderWidth:     1.5,
            borderColor:     gold[500],
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.bodySemiBold,
              fontSize:   13,
              color:      isInCart ? gold[400] : '#0D1B12',
            }}
          >
            {isInCart
              ? '✓ In Cart'
              : product.variants.length > 0
              ? 'Select Options'
              : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </PressableCard>
  );
}

export default function ShopScreen() {
  const router = useRouter();
  const { colors, fontFamilies, gold } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories, isLoading: catLoading } = useShopCategories();
  const { data: products, isLoading: prodLoading, refetch, isRefetching } = useShopProducts(selectedCategory);
  const cartCount = useCartStore((s) => s.getItemCount());

  const isLoading = catLoading || prodLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
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
            Ori Clothing & Co
          </Text>
          <Text style={{ fontFamily: fontFamilies.headingItalic, fontSize: 13, color: gold[400] }}>
            Wearables, Accessories & More
          </Text>
        </View>

        {/* Cart Button */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/shop/cart')}
          style={{
            width:           44,
            height:          44,
            borderRadius:    22,
            backgroundColor: colors.surfaceAlt,
            alignItems:      'center',
            justifyContent:  'center',
            position:        'relative',
          }}
        >
          <ShoppingBag size={22} color={colors.textPrimary} />
          {cartCount > 0 && <NotificationBadge count={cartCount} />}
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {!catLoading && categories && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={{
              paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
              backgroundColor:   !selectedCategory ? gold[500] : colors.surface,
              borderWidth: 1, borderColor: !selectedCategory ? gold[500] : colors.border,
            }}
          >
            <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: !selectedCategory ? '#0D1B12' : colors.textSecondary }}>
              All
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor:   selectedCategory === cat.id ? gold[500] : colors.surface,
                borderWidth: 1, borderColor: selectedCategory === cat.id ? gold[500] : colors.border,
              }}
            >
              <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: selectedCategory === cat.id ? '#0D1B12' : colors.textSecondary }}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {isLoading ? (
        <View style={{ flex: 1, padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[0, 1].map((i) => <View key={i} style={{ flex: 1 }}><ProductCardSkeleton /></View>)}
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
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={gold[500]} colors={[gold[500]]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<ShoppingBag size={36} color={colors.textTertiary} />}
              title="No Products"
              description="No merch available in this category right now. Check back soon!"
            />
          }
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ShopProductCard
                product={item}
                onPress={() => router.push(`/(tabs)/shop/${item.id}`)}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
