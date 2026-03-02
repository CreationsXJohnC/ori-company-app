/**
 * ORI APP — Order History Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Package, ChevronDown, ChevronUp } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/theme';
import { useOrders } from '@/hooks/useShop';
import { formatCurrency, formatDate, formatOrderStatus, getOrderStatusColor } from '@/utils/formatting';
import type { Order } from '@/types';

function OrderCard({ order }: { order: Order }) {
  const { colors, fontFamilies, gold } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const statusColor = getOrderStatusColor(order.status);

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 42, height: 42, borderRadius: 21,
            backgroundColor: `${statusColor}22`,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Package size={20} color={statusColor} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: colors.textTertiary }}>
              #{order.id.slice(-8).toUpperCase()}
            </Text>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 16, color: gold[400] }}>
              {formatCurrency(order.total)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textTertiary }}>
              {formatDate(order.created_at)}
            </Text>
            <View
              style={{
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
                backgroundColor: `${statusColor}22`,
              }}
            >
              <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 11, color: statusColor }}>
                {formatOrderStatus(order.status)}
              </Text>
            </View>
          </View>
          {order.items && (
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textSecondary }}>
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {expanded
          ? <ChevronUp size={18} color={colors.textTertiary} />
          : <ChevronDown size={18} color={colors.textTertiary} />
        }
      </TouchableOpacity>

      {/* Expanded items */}
      {expanded && order.items && (
        <>
          <Divider />
          <View style={{ padding: 16, gap: 10 }}>
            {order.items.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: colors.textPrimary }} numberOfLines={1}>
                    {item.product_name} × {item.quantity}
                  </Text>
                  {item.variant_info && (item.variant_info.size || item.variant_info.color) && (
                    <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 11, color: colors.textTertiary }}>
                      {[item.variant_info.size, item.variant_info.color].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: gold[400] }}>
                  {formatCurrency(item.unit_price * item.quantity)}
                </Text>
              </View>
            ))}

            <Divider />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 4 }}>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textSecondary }}>
                  Subtotal: {formatCurrency(order.subtotal)}
                </Text>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textSecondary }}>
                  Tax: {formatCurrency(order.tax)} · Shipping: {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
                </Text>
              </View>
              <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 15, color: gold[400] }}>
                {formatCurrency(order.total)}
              </Text>
            </View>

            {order.tracking_number && (
              <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 10 }}>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textSecondary }}>
                  Tracking: {order.tracking_number}
                </Text>
              </View>
            )}

            {order.shipping_address && (
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textTertiary }}>
                  SHIP TO
                </Text>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textSecondary }}>
                  {order.shipping_address.full_name}{'\n'}
                  {order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''}{'\n'}
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </Card>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { colors, fontFamilies, gold } = useTheme();
  const { data: orders, isLoading, refetch, isRefetching } = useOrders();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>Order History</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner full />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={gold[500]} colors={[gold[500]]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Package size={36} color={colors.textTertiary} />}
              title="No Orders Yet"
              description="Your Ori Clothing & Co orders will appear here."
              actionLabel="Shop Now"
              onAction={() => router.replace('/(tabs)/shop')}
            />
          }
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      )}
    </SafeAreaView>
  );
}
