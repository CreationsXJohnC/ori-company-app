/**
 * ORI APP — Empty State Component
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?:       React.ReactNode;
  title:       string;
  description?: string;
  actionLabel?: string;
  onAction?:   () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, fontFamilies } = useTheme();

  return (
    <View
      style={{
        flex:           1,
        alignItems:     'center',
        justifyContent: 'center',
        padding:        32,
        gap:            16,
      }}
    >
      {icon && (
        <View
          style={{
            width:           80,
            height:          80,
            borderRadius:    40,
            backgroundColor: colors.surfaceAlt,
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          {icon}
        </View>
      )}

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontFamily:  fontFamilies.headingBold,
            fontSize:    20,
            color:       colors.textPrimary,
            textAlign:   'center',
          }}
        >
          {title}
        </Text>

        {description && (
          <Text
            style={{
              fontFamily: fontFamilies.bodyRegular,
              fontSize:   15,
              color:      colors.textSecondary,
              textAlign:  'center',
              lineHeight: 22,
            }}
          >
            {description}
          </Text>
        )}
      </View>

      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
        />
      )}
    </View>
  );
}

export default EmptyState;
