/**
 * ORI APP — Main Tab Navigation
 * 4 tabs: Menu, Shop, About, Chat (Ori AI)
 * Custom tab bar includes Sign Out on every screen.
 */

import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Leaf, ShoppingBag, Building2, Bot, LogOut } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

import { NotificationBadge } from '@/components/ui/Badge';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { dark, light } from '@/theme/colors';
import { fontFamilies } from '@/theme/typography';

// ─── Tab Icon ─────────────────────────────────────────────────────────────────
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

// ─── Tab config (order must match Tabs.Screen order below) ────────────────────
const TAB_CONFIG = [
  { icon: Leaf,        label: 'Menu'  },
  { icon: ShoppingBag, label: 'Shop'  },
  { icon: Bot,         label: 'Ori AI' },
  { icon: Building2,   label: 'About' },
];

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  const scheme    = useColorScheme();
  const colors    = scheme === 'dark' ? dark : light;
  const cartCount = useCartStore((s) => s.getItemCount());
  const signOut   = useAuthStore((s) => s.signOut);
  const router    = useRouter();

  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : 72;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  const barContent = (
    <View
      style={{
        flexDirection:   'row',
        height:          TAB_BAR_HEIGHT,
        alignItems:      'center',
        borderTopWidth:  1,
        borderTopColor:  colors.tabBarBorder,
        paddingBottom:   Platform.OS === 'ios' ? 28 : 8,
        paddingTop:      4,
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.tabBar,
      }}
    >
      {/* ── 4 navigation tabs ─────────────────────────────────── */}
      {state.routes.map((route: any, index: number) => {
        const config  = TAB_CONFIG[index];
        if (!config) return null;
        const focused = state.index === index;
        const badge   = index === 1 ? cartCount : undefined;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.7}
          >
            <TabIcon
              Icon={config.icon as typeof Leaf}
              focused={focused}
              label={config.label}
              badge={badge}
            />
          </TouchableOpacity>
        );
      })}

      {/* ── Sign Out ──────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{
          width:          56,
          alignItems:     'center',
          justifyContent: 'center',
          paddingTop:     6,
          gap:            3,
          borderLeftWidth: 1,
          borderLeftColor: colors.tabBarBorder,
        }}
        activeOpacity={0.7}
      >
        <LogOut size={22} color={colors.tabInactive} strokeWidth={1.8} />
        <Text
          style={{
            fontFamily: fontFamilies.bodyRegular,
            fontSize:   9,
            color:      colors.tabInactive,
          }}
        >
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );

  // iOS: absolute position with blur background
  if (Platform.OS === 'ios') {
    return (
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <BlurView
          intensity={80}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={{ position: 'absolute', inset: 0 }}
        />
        {barContent}
      </View>
    );
  }

  return barContent;
}

// ─── Tabs Layout ──────────────────────────────────────────────────────────────
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="menu"  />
      <Tabs.Screen name="shop"  />
      <Tabs.Screen name="about" />
      <Tabs.Screen name="chat"  />
    </Tabs>
  );
}
