import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';

interface DividerProps {
  label?: string;
  color?: string;
}

export function Divider({ label, color }: DividerProps) {
  const { colors, fontFamilies } = useTheme();
  const lineColor = color ?? colors.border;

  if (label) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
        <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: colors.textTertiary }}>
          {label}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
      </View>
    );
  }

  return <View style={{ height: 1, backgroundColor: lineColor }} />;
}

export default Divider;
