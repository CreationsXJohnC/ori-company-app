/**
 * ORI APP — Checkbox Component
 * Used for 21+ confirmation and terms agreement.
 */

import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';

interface CheckboxProps {
  checked:    boolean;
  onChange:   (checked: boolean) => void;
  label?:     string | React.ReactNode;
  error?:     string;
  disabled?:  boolean;
}

export function Checkbox({ checked, onChange, label, error, disabled }: CheckboxProps) {
  const { colors, fontFamilies } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.selectionAsync();
    scale.value = withSpring(0.85, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
    onChange(!checked);
  };

  return (
    <View style={{ gap: 4 }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={disabled}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
      >
        <Animated.View
          style={[
            animStyle,
            {
              width:           22,
              height:          22,
              borderRadius:    6,
              borderWidth:     2,
              borderColor:     error ? '#EF4444' : checked ? colors.accent : colors.border,
              backgroundColor: checked ? colors.accent : 'transparent',
              alignItems:      'center',
              justifyContent:  'center',
              marginTop:       1,
              flexShrink:      0,
            },
          ]}
        >
          {checked && <Check size={13} color={colors.accentText} strokeWidth={3} />}
        </Animated.View>

        {label && (
          <View style={{ flex: 1 }}>
            {typeof label === 'string' ? (
              <Text
                style={{
                  fontFamily: fontFamilies.bodyRegular,
                  fontSize:   14,
                  color:      disabled ? colors.textDisabled : colors.textPrimary,
                  lineHeight: 21,
                }}
              >
                {label}
              </Text>
            ) : (
              label
            )}
          </View>
        )}
      </TouchableOpacity>

      {error && (
        <Text
          style={{
            fontFamily:  fontFamilies.bodyRegular,
            fontSize:    12,
            color:       '#EF4444',
            paddingLeft: 34,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export default Checkbox;
