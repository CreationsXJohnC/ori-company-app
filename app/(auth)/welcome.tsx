/**
 * ORI APP — Welcome / Splash Screen
 * First screen new users see. Dark, premium feel matching oricompanydc.com aesthetic.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useTheme } from '@/theme';
import { COMPLIANCE } from '@/utils/constants';

// Assets
const BG_IMAGE    = require('../../assets/images/Asset 192.png');
const LOGO_ORANGE = require('../../assets/brand/ORI Logo-09.png');  // orange "Ori" wordmark

export default function WelcomeScreen() {
  const router = useRouter();
  const { fontFamilies, gold } = useTheme();

  // Staggered entrance animations
  const logoOpacity    = useSharedValue(0);
  const logoY          = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const taglineY       = useSharedValue(20);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY       = useSharedValue(20);

  useEffect(() => {
    logoOpacity.value    = withDelay(200, withTiming(1, { duration: 700 }));
    logoY.value          = withDelay(200, withSpring(0, { damping: 14 }));
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 700 }));
    taglineY.value       = withDelay(500, withSpring(0, { damping: 14 }));
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    buttonsY.value       = withDelay(800, withSpring(0, { damping: 14 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity:   logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity:   taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity:   buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Background image — bottommost layer */}
      <Image
        source={BG_IMAGE}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      {/* Semi-transparent gradient overlay */}
      <LinearGradient
        colors={['rgba(255,255,255,0.70)', 'rgba(244,234,169,0.90)']}
        style={{ position: 'absolute', inset: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'space-between', paddingVertical: 24 }}>

          {/* ── Logo + Tagline Section ──────────────────────────────── */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 28 }}>

            <Animated.View style={[logoStyle, { alignItems: 'center', gap: 20 }]}>
              {/* Orange "Ori" wordmark */}
              <Image
                source={LOGO_ORANGE}
                style={{ width: 140, height: 48 }}
                resizeMode="contain"
              />
              <View
                style={{
                  height:          1.5,
                  width:           60,
                  backgroundColor: gold[400],
                  marginTop:       4,
                }}
              />
            </Animated.View>

            <Animated.View style={[taglineStyle, { alignItems: 'center', gap: 20 }]}>
              <Text
                style={{
                  fontFamily:  fontFamilies.headingItalic,
                  fontSize:    22,
                  color:       gold[400],
                  textAlign:   'center',
                  letterSpacing: 0.2,
                }}
              >
                Flourish Naturally, Live Better
              </Text>

              <Text
                style={{
                  fontFamily: fontFamilies.bodyRegular,
                  fontSize:   15,
                  color:      '#7EBF94',
                  textAlign:  'center',
                  lineHeight: 24,
                  maxWidth:   280,
                }}
              >
                Medical cannabis for Washington, DC — educational guidance, premium quality, community care.
              </Text>

              {/* Value pillars */}
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                {['Innovation', 'Integrity', 'Well-being', 'Community'].map((v) => (
                  <View
                    key={v}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical:   6,
                      borderRadius:      20,
                      borderWidth:       1,
                      borderColor:       `${gold[400]}44`,
                      backgroundColor:   `${gold[400]}11`,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily:    fontFamilies.bodyMedium,
                        fontSize:      12,
                        color:         gold[400],
                        letterSpacing: 0.5,
                      }}
                    >
                      {v}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>

          {/* ── CTA Buttons ─────────────────────────────────────────── */}
          <Animated.View style={[buttonsStyle, { gap: 12 }]}>
            <Button
              label="Get Started"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.push('/(auth)/sign-up')}
            />
            <Button
              label="Sign In"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => router.push('/(auth)/sign-in')}
            />

            <Divider label="or" />

            {/* Compliance copy */}
            <Text
              style={{
                fontFamily: fontFamilies.bodyRegular,
                fontSize:   11,
                color:      '#7EBF94',
                textAlign:  'center',
                lineHeight: 17,
              }}
            >
              {COMPLIANCE.ageGate} Medical patients only.{'\n'}
              Washington, DC medical cannabis regulations apply.
            </Text>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
}
