import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { T } from '../../theme/tokens';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'default';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { bg: T.greenSoft,   text: T.success, border: `${T.success}40` },
  warning: { bg: T.warningBg,   text: T.warning, border: `${T.warning}40` },
  danger:  { bg: T.errorBg,     text: T.error,   border: `${T.error}40`   },
  info:    { bg: T.blueSoft,    text: T.blue,    border: `${T.blue}40`    },
  ai:      { bg: '#7C3AED14',   text: '#7C3AED', border: '#7C3AED40'      },
  default: { bg: T.blueSoft,    text: T.textSecondary, border: T.strokeBlue },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Badge({ label, variant = 'default', size = 'md', icon }: BadgeProps) {
  const v = VARIANT_STYLES[variant];
  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: v.bg, borderColor: v.border },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.label,
          size === 'sm' && styles.labelSm,
          { color: v.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 2 },
  label: { fontSize: 12, fontWeight: '500', letterSpacing: 0.1 },
  labelSm: { fontSize: 10 },
});
