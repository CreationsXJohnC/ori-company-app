/**
 * ORI APP — Main Tab Navigation
 * 4 tabs: Menu, Shop, About, Chat (Ori AI)
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, useColorScheme } from 'react-native';
import { Leaf, ShoppingBag, Info, MessageCircle } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

import { NotificationBadge } from '@/components/ui/Badge';
import { useCartStore } from '@/stores/cartStore';
import { dark, light, gold, forest } from '@/theme/colors';
import { fontFamilies } from '@/theme/typography';

function TabIcon({
  Icon,
  focused,
  label,
  badge,
}: {
  Icon: typeof Leaf;
  focused: boolean;
  label: string;
  badge?: number;
}) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? dark : light;
  const color  = focused ? colors.tabActive : colors.tabInactive;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 6, position: 'relative' }}>
      <View style={{ position: 'relative' }}>
        <Icon
          size={24}
          color={color}
          strokeWidth={focused ? 2.2 : 1.8}
          fill={focused ? `${color}22` : 'none'}
        />
        {!!badge && badge > 0 && <NotificationBadge count={badge} />}
      </View>
      <Text
        style={{
          fontFamily:    focused ? fontFamilies.bodySemiBold : fontFamilies.bodyRegular,
          fontSize:      10,
          color,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const scheme     = useColorScheme();
  const colors     = scheme === 'dark' ? dark : light;
  const cartCount  = useCartStore((s) => s.getItemCount());

  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : 72;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor:  Platform.OS === 'ios' ? 'transparent' : colors.tabBar,
          borderTopColor:   colors.tabBarBorder,
          borderTopWidth:   1,
          height:           TAB_BAR_HEIGHT,
          paddingBottom:    Platform.OS === 'ios' ? 28 : 8,
          paddingTop:       4,
          elevation:        0,
          position:         Platform.OS === 'ios' ? 'absolute' : 'relative',
        },
        tabBarBackground: Platform.OS === 'ios'
          ? () => (
              <BlurView
                intensity={80}
                tint={scheme === 'dark' ? 'dark' : 'light'}
                style={{ position: 'absolute', inset: 0 }}
              />
            )
          : undefined,
      }}
    >
      {/* ── Menu Tab ──────────────────────────────────────────── */}
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Leaf} focused={focused} label="Menu" />
          ),
        }}
      />

      {/* ── Shop Tab ──────────────────────────────────────────── */}
      <Tabs.Screen
        name="shop"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={ShoppingBag} focused={focused} label="Shop" badge={cartCount} />
          ),
        }}
      />

      {/* ── About Tab ─────────────────────────────────────────── */}
      <Tabs.Screen
        name="about"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Info} focused={focused} label="About" />
          ),
        }}
      />

      {/* ── Chat Tab ──────────────────────────────────────────── */}
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={MessageCircle} focused={focused} label="Ori AI" />
          ),
        }}
      />
    </Tabs>
  );
}
