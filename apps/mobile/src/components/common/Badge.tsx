import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@vozpe/shared';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'default';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { bg: COLORS.successMuted, text: COLORS.success,       border: `${COLORS.success}40` },
  warning: { bg: COLORS.warningMuted, text: COLORS.warning,       border: `${COLORS.warning}40` },
  danger:  { bg: COLORS.errorMuted,   text: COLORS.error,         border: `${COLORS.error}40`   },
  info:    { bg: '#0A1A2D',           text: '#60A5FA',             border: '#60A5FA40'             },
  ai:      { bg: COLORS.aiMuted,      text: COLORS.ai,             border: `${COLORS.ai}40`       },
  default: { bg: COLORS.bgElevated,   text: COLORS.textSecondary,  border: COLORS.borderDefault   },
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
